import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);

export const SCRYPT_PARAMS = Object.freeze({
    N: 32768,
    r: 8,
    p: 1
});

const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;

// Derive a 256-bit encryption key from the master password.
export async function deriveKey(password, salt) {
    if (typeof password !== 'string' || !password) {
        throw new Error('Password is required.');
    }

    if (!Buffer.isBuffer(salt) || salt.length !== SALT_LENGTH) {
        throw new Error('Invalid salt.');
    }

    return scrypt(password, salt, KEY_LENGTH, {
        ...SCRYPT_PARAMS,
        maxmem: 64 * 1024 * 1024
    });
}

// Encrypt plaintext using AES-256-GCM.
export async function encryptNote(plaintext, password, salt) {
    if (typeof plaintext !== 'string') {
        throw new Error('Plaintext must be a string.');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const key = await deriveKey(password, salt);

    try {
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            key,
            iv
        );

        const ciphertext = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final()
        ]);

        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString('base64'),
            ciphertext: ciphertext.toString('base64'),
            authTag: authTag.toString('base64')
        };
    } finally {
        key.fill(0);
    }
}

// Decrypt and authenticate an encrypted record.
export async function decryptNote(data, password, salt) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid encrypted record.');
    }

    const iv = Buffer.from(data.iv, 'base64');
    const ciphertext = Buffer.from(data.ciphertext, 'base64');
    const authTag = Buffer.from(data.authTag, 'base64');

    if (
        iv.length !== IV_LENGTH ||
        authTag.length !== TAG_LENGTH ||
        typeof data.iv !== 'string' ||
        typeof data.ciphertext !== 'string' ||
        typeof data.authTag !== 'string'
    ) {
        throw new Error('Invalid encrypted record.');
    }

    const key = await deriveKey(password, salt);

    try {
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            iv
        );

        decipher.setAuthTag(authTag);

        const plaintext = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]);

        return plaintext.toString('utf8');
    } finally {
        key.fill(0);
    }
}