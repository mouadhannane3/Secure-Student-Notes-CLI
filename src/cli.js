import {
    input,
    password,
    confirm
} from '@inquirer/prompts';

import {
    initializeVault,
    unlockVault
} from './storage.js';

import {
    addNote,
    readNote,
    listNotes,
    searchNotes,
    removeNote
} from './notes.js';

function showHelp() {
    console.log(`
========================================
       SECURE STUDENT NOTES CLI
========================================

Commands:

  init             Create a secure vault
  add              Add and encrypt a note
  list             List saved note IDs
  read <ID>        Read and decrypt a note
  search           Search notes
  delete <ID>      Delete a note
  help             Show this help message

Security:
  Encryption: AES-256-GCM
  Key derivation: scrypt
  Storage: Local encrypted JSON files

========================================
`);
}

async function askPassword() {
    return password({
        message: 'Enter master password:',
        mask: '*'
    });
}

async function initCommand() {
    console.log('\n=== CREATE SECURE VAULT ===\n');

    const firstPassword = await askPassword();

    if (firstPassword.length < 12) {
        throw new Error(
            'Password must contain at least 12 characters.'
        );
    }

    const secondPassword = await password({
        message: 'Confirm master password:',
        mask: '*'
    });

    if (firstPassword !== secondPassword) {
        throw new Error('Passwords do not match.');
    }

    await initializeVault(firstPassword);

    console.log('\nVault created successfully!');
    console.log('Your master password is not stored.');
}

async function addCommand() {
    console.log('\n=== ADD NEW NOTE ===\n');

    const masterPassword = await askPassword();

    await unlockVault(masterPassword);

    const title = await input({
        message: 'Enter note title:',
        validate: value =>
            value.trim().length > 0 || 'Title is required.'
    });

    const content = await input({
        message: 'Enter note content:',
        validate: value =>
            value.trim().length > 0 || 'Content is required.'
    });

    const id = await addNote(
        title,
        content,
        masterPassword
    );

    console.log('\nNote encrypted and saved successfully!');
    console.log('Note ID:', id);
}

async function listCommand() {
    console.log('\n=== SAVED NOTES ===\n');

    const notes = await listNotes();

    if (notes.length === 0) {
        console.log('No notes found.');
        return;
    }

    for (const id of notes) {
        console.log(`ID: ${id}`);
    }

    console.log(`\nTotal notes: ${notes.length}`);
}

async function readCommand(id) {
    console.log('\n=== READ NOTE ===\n');

    if (!id) {
        id = await input({
            message: 'Enter note ID:'
        });
    }

    const masterPassword = await askPassword();

    const note = await readNote(id, masterPassword);

    console.log('\n================================');
    console.log('TITLE:', note.title);
    console.log('================================');
    console.log('\nCONTENT:\n');
    console.log(note.content);
    console.log('\nCreated:', note.createdAt);
}

async function searchCommand() {
    console.log('\n=== SEARCH NOTES ===\n');

    const masterPassword = await askPassword();

    const keyword = await input({
        message: 'Enter search keyword:',
        validate: value =>
            value.trim().length > 0 || 'Keyword is required.'
    });

    const results = await searchNotes(
        keyword,
        masterPassword
    );

    if (results.length === 0) {
        console.log('\nNo matching notes found.');
        return;
    }

    console.log('\nMatching notes:\n');

    for (const note of results) {
        console.log(`ID: ${note.id}`);
        console.log(`Title: ${note.title}`);
        console.log('--------------------------');
    }

    console.log(`Matches: ${results.length}`);
}

async function deleteCommand(id) {
    console.log('\n=== DELETE NOTE ===\n');

    if (!id) {
        id = await input({
            message: 'Enter note ID:'
        });
    }

    const masterPassword = await askPassword();

    await unlockVault(masterPassword);

    const approved = await confirm({
        message: 'Are you sure you want to delete this note?',
        default: false
    });

    if (!approved) {
        console.log('Deletion cancelled.');
        return;
    }

    await removeNote(id, masterPassword);

    console.log('Encrypted note deleted.');
}

async function main() {
    const command = process.argv[2];
    const argument = process.argv[3];

    try {
        switch (command) {
            case 'init':
                await initCommand();
                break;

            case 'add':
                await addCommand();
                break;

            case 'list':
                await listCommand();
                break;

            case 'read':
                await readCommand(argument);
                break;

            case 'search':
                await searchCommand();
                break;

            case 'delete':
                await deleteCommand(argument);
                break;

            case 'help':
            case undefined:
                showHelp();
                break;

            default:
                console.log('Unknown command.');
                showHelp();
        }
    } catch (error) {
        console.error('\nError:', error.message);
        process.exitCode = 1;
    }
}

main();