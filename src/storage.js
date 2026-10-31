
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import {
    encryptNote,
    decryptNote,
    SCRYPT_PARAMS
} from './crypto.js';

// ========================================
// CONFIGURATION
// ========================================

const DATA_DIR = path.resolve('data');
const NOTES_DIR = path.join(DATA_DIR, 'notes');
const VAULT_FILE = path.join(DATA_DIR, 'vault.json');

const VERIFIER = 'SECURE-STUDENT-NOTES-VAULT-CHECK-v1';

const ID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ========================================
// VALIDATE NOTE ID
// ========================================

function validateId(id) {
    if (
        typeof id !== 'string' ||
        !ID_PATTERN.test(id)
    ) {
        throw new Error('Invalid note ID.');
    }
}

// ========================================
// VALIDATE BASE64 DATA
// ========================================

function decodeBase64(value, expectedLength) {
    if (
        typeof value !== 'string' ||
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
    ) {
        throw new Error('Invalid encrypted metadata.');
    }

    const result = Buffer.from(value, 'base64');

    if (
        result.toString('base64') !== value ||
        (
            expectedLength !== undefined &&
            result.length !== expectedLength
        )
    ) {
        throw new Error('Invalid encrypted metadata.');
    }

    return result;
}

// ========================================
// CREATE PRIVATE DIRECTORIES
// ========================================

async function prepareDirectories() {
    await fs.mkdir(NOTES_DIR, {
        recursive: true,
        mode: 0o700
    });

    await fs.chmod(DATA_DIR, 0o700);
    await fs.chmod(NOTES_DIR, 0o700);
}

// ========================================
// WRITE FILES PRIVATELY
// ========================================

async function writePrivateFile(
    filePath,
    content,
    exclusive = false
) {
    const tempPath = path.join(
        path.dirname(filePath),
        `.${crypto.randomUUID()}.tmp`
    );

    let handle;

    try {
        handle = await fs.open(tempPath, 'wx', 0o600);

        await handle.writeFile(content, 'utf8');
        await handle.sync();

        await handle.close();
        handle = null;

        if (exclusive) {
            await fs.link(tempPath, filePath);
            await fs.unlink(tempPath);
        } else {
            await fs.rename(tempPath, filePath);
        }

        await fs.chmod(filePath, 0o600);

    } catch (error) {
        if (handle) {
            await handle.close();
        }

        await fs.rm(tempPath, { force: true });

        throw error;
    }
}

// ========================================
// 1. INITIALIZE NEW VAULT
// ========================================


export async function initializeVault(password) {
    if (
        typeof password !== 'string' ||
        password.length < 12
    ) {
        throw new Error(
            'Master password must contain at least 12 characters.'
        );
    }

    await prepareDirectories();

    // Never overwrite an existing vault.
    try {
        await fs.access(VAULT_FILE);

        throw new Error(
            'A vault already exists. Refusing to overwrite it.'
        );

    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    const salt = crypto.randomBytes(16);

    const verifier = await encryptNote(
        VERIFIER,
        password,
        salt
    );

    const vault = {
        version: 1,
        algorithm: 'aes-256-gcm',
        kdf: 'scrypt',
        scrypt: SCRYPT_PARAMS,
        salt: salt.toString('base64'),
        verifier
    };

    await writePrivateFile(
        VAULT_FILE,
        JSON.stringify(vault, null, 2),
        true
    );

    return true;
}


// ========================================
// 2. LOAD VAULT METADATA
// ========================================

export async function loadVault() {
    const raw = await fs.readFile(
        VAULT_FILE,
        'utf8'
    );

    const vault = JSON.parse(raw);

    if (
        vault.version !== 1 ||
        vault.algorithm !== 'aes-256-gcm' ||
        vault.kdf !== 'scrypt' ||
        vault.scrypt?.N !== SCRYPT_PARAMS.N ||
        vault.scrypt?.r !== SCRYPT_PARAMS.r ||
        vault.scrypt?.p !== SCRYPT_PARAMS.p
    ) {
        throw new Error(
            'Unsupported or invalid vault format.'
        );
    }

    const salt = decodeBase64(vault.salt, 16);

    if (!vault.verifier) {
        throw new Error('Invalid vault verifier.');
    }

    return { vault, salt };
}

// ========================================
// 3. UNLOCK VAULT
// ========================================

export async function unlockVault(password) {
    const { vault, salt } = await loadVault();

    try {
        const result = await decryptNote(
            vault.verifier,
            password,
            salt
        );

        if (result !== VERIFIER) {
            throw new Error();
        }

        return { vault, salt };

    } catch {
        throw new Error(
            'Incorrect password or invalid vault.'
        );
    }
}

// ========================================
// 4. SAVE ENCRYPTED NOTE
// ========================================

export async function saveEncryptedNote(
    id,
    encryptedRecord
) {
    validateId(id);

    if (
        !encryptedRecord ||
        typeof encryptedRecord !== 'object'
    ) {
        throw new Error('Invalid encrypted record.');
    }

    await prepareDirectories();

    const record = {
        version: 1,
        id,
        iv: encryptedRecord.iv,
        ciphertext: encryptedRecord.ciphertext,
        authTag: encryptedRecord.authTag
    };

    // Validate encrypted fields.
    decodeBase64(record.iv, 12);
    decodeBase64(record.authTag, 16);
    decodeBase64(record.ciphertext);

    const filePath = path.join(
        NOTES_DIR,
        `note-${id}.json`
    );

    await writePrivateFile(
        filePath,
        JSON.stringify(record, null, 2),
        true
    );

    return id;
}

// ========================================
// 5. RETRIEVE ENCRYPTED NOTE
// ========================================

export async function getEncryptedNote(id) {
    validateId(id);

    const filePath = path.join(
        NOTES_DIR,
        `note-${id}.json`
    );

    const raw = await fs.readFile(
        filePath,
        'utf8'
    );

    const record = JSON.parse(raw);

    if (
        record.version !== 1 ||
        record.id !== id
    ) {
        throw new Error('Invalid note record.');
    }

    decodeBase64(record.iv, 12);
    decodeBase64(record.authTag, 16);
    decodeBase64(record.ciphertext);

    return record;
}

// ========================================
// 6. LIST NOTE IDENTIFIERS
// ========================================

export async function listNoteIds() {
    await prepareDirectories();

    const files = await fs.readdir(NOTES_DIR);

    return files
        .filter(file =>
            /^note-[0-9a-f-]{36}\.json$/i.test(file)
        )
        .map(file => file.slice(5, -5));
}

// ========================================
// 7. DELETE ENCRYPTED NOTE
// ========================================

export async function deleteEncryptedNote(id) {
    validateId(id);

    const filePath = path.join(
        NOTES_DIR,
        `note-${id}.json`
    );

    await fs.unlink(filePath);

    return true;
}
