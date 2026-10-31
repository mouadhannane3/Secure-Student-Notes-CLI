import crypto from 'node:crypto';

import {
    encryptNote,
    decryptNote
} from './crypto.js';

import {
    unlockVault,
    saveEncryptedNote,
    getEncryptedNote,
    listNoteIds,
    deleteEncryptedNote
} from './storage.js';

// Add a new note.
export async function addNote(title, content, password) {
    if (
        typeof title !== 'string' ||
        !title.trim() ||
        typeof content !== 'string' ||
        !content.trim()
    ) {
        throw new Error('Title and content are required.');
    }

    const { salt } = await unlockVault(password);

    const note = {
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString()
    };

    const plaintext = JSON.stringify(note);

    const encrypted = await encryptNote(
        plaintext,
        password,
        salt
    );

    const id = crypto.randomUUID();

    await saveEncryptedNote(id, encrypted);

    return id;
}

// Read and decrypt a note.
export async function readNote(id, password) {
    const { salt } = await unlockVault(password);

    const encrypted = await getEncryptedNote(id);

    const plaintext = await decryptNote(
        encrypted,
        password,
        salt
    );

    const note = JSON.parse(plaintext);

    if (
        typeof note.title !== 'string' ||
        typeof note.content !== 'string' ||
        typeof note.createdAt !== 'string'
    ) {
        throw new Error('Invalid decrypted note.');
    }

    return note;
}

// List notes without revealing their contents.
export async function listNotes() {
    return listNoteIds();
}

// Search decrypted notes in application memory.
export async function searchNotes(keyword, password) {
    if (typeof keyword !== 'string' || !keyword.trim()) {
        throw new Error('Search keyword is required.');
    }

    const { salt } = await unlockVault(password);

    const ids = await listNoteIds();

    const matches = [];

    for (const id of ids) {
        try {
            const encrypted = await getEncryptedNote(id);

            const plaintext = await decryptNote(
                encrypted,
                password,
                salt
            );

            const note = JSON.parse(plaintext);

            if (
                typeof note.title !== 'string' ||
                typeof note.content !== 'string'
            ) {
                throw new Error('Invalid note.');
            }

            const searchableText =
                `${note.title} ${note.content}`.toLowerCase();

            if (
                searchableText.includes(keyword.trim().toLowerCase())
            ) {
                matches.push({
                    id,
                    title: note.title
                });
            }
        } catch {
            // Do not silently ignore corrupted or unauthenticated notes.
            throw new Error(
                `Unable to verify note ${id}. Search stopped.`
            );
        }
    }

    return matches;
}

// Delete a note.
export async function removeNote(id, password) {
    await unlockVault(password);

    await deleteEncryptedNote(id);

    return true;
}