import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import {
    encryptNote,
    decryptNote
} from '../src/crypto.js';

const password = 'UniversityPassword2026!';
const salt = crypto.randomBytes(16);

test('Encrypt and decrypt a note successfully', async() => {
    const original = 'My examination grade is 17/20';

    const encrypted = await encryptNote(
        original,
        password,
        salt
    );

    const decrypted = await decryptNote(
        encrypted,
        password,
        salt
    );

    assert.equal(decrypted, original);
});

test('Wrong password must fail', async() => {
    const encrypted = await encryptNote(
        'Secret student information',
        password,
        salt
    );

    await assert.rejects(
        decryptNote(
            encrypted,
            'WrongPassword2026!',
            salt
        )
    );
});

test('Modified ciphertext must fail authentication', async() => {
    const encrypted = await encryptNote(
        'Sensitive academic record',
        password,
        salt
    );

    const modified = {
        ...encrypted,
        ciphertext: Buffer.from(
                encrypted.ciphertext,
                'base64'
            )
            .map((byte, index) => index === 0 ? byte ^ 1 : byte)
            .toString('base64')
    };

    await assert.rejects(
        decryptNote(modified, password, salt)
    );
});

test('Different salt must fail decryption', async() => {
    const encrypted = await encryptNote(
        'Private note',
        password,
        salt
    );

    const differentSalt = crypto.randomBytes(16);

    await assert.rejects(
        decryptNote(encrypted, password, differentSalt)
    );
});

test('Each encryption should generate a different IV', async() => {
    const first = await encryptNote(
        'Same message',
        password,
        salt
    );

    const second = await encryptNote(
        'Same message',
        password,
        salt
    );

    assert.notEqual(first.iv, second.iv);
});