# 🔐 Secure Student Notes CLI

A command-line application for securely storing student notes using AES-256-GCM authenticated encryption and Scrypt key derivation.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)
![Platform](https://img.shields.io/badge/Platform-Ubuntu%20%7C%20WSL-blue)
![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-red)
![KDF](https://img.shields.io/badge/KDF-Scrypt-purple)
![Status](https://img.shields.io/badge/Status-Educational-orange)

## 📌 1. Project Overview

**Secure Student Notes CLI** is an educational cybersecurity project developed using Node.js. Its primary objective is to demonstrate how cryptographic algorithms can protect sensitive information stored locally on a computer. Users can create a secure vault, add notes, encrypt their contents, retrieve and decrypt them, search through saved notes, and delete them. Unlike a conventional notes application, the plaintext content is encrypted before being written to local storage.

### Main Objectives

- Understand symmetric encryption.
- Implement AES-256-GCM.
- Understand password-based key derivation using Scrypt.
- Protect sensitive information using authenticated encryption.
- Learn secure local file storage.
- Develop a modular command-line application.
- Practice cryptographic testing and security validation.

## 🛠️ 2. Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| JavaScript | Application development |
| AES-256-GCM | Authenticated encryption |
| Scrypt | Password-based key derivation |
| Node.js Crypto API | Cryptographic operations |
| JSON | Encrypted record serialization |
| Ubuntu Linux | Development environment |
| WSL | Linux environment on Windows |
| Node.js Test Runner | Automated testing |
| Git | Version control |

## 🔐 3. Cryptographic Architecture

The application uses two main cryptographic components.

### 3.1 AES-256-GCM

AES stands for **Advanced Encryption Standard**. It is a symmetric encryption algorithm, meaning the same secret key is used for encryption and decryption. The project uses AES with:

- **Key size:** 256 bits.
- **Mode:** Galois/Counter Mode.
- **IV:** 96 bits (12 bytes).
- **Authentication tag:** 128 bits (16 bytes).

GCM provides two important security properties:

- **Confidentiality:** Protects the original information.
- **Integrity and authenticity:** Detects unauthorized modifications to encrypted data.

### 3.2 Scrypt

Scrypt is a password-based key derivation function. It transforms the user's master password into a cryptographic key. It uses a random salt and configurable computational and memory parameters.

**Conceptual process:**

```text
Master Password
       |
       v
   Random Salt
       |
       v
     Scrypt
       |
       v
256-bit Secret Key
       |
       v
  AES-256-GCM

  # 🔄 4. Encryption and Decryption Workflow

  ##         ORIGINAL NOTE
              |
              v
     JSON Serialization
              |
              v
    Master Password + Salt
              |
              v
       Scrypt Derivation
              |
              v
       256-bit AES Key
              |
              v
       AES-256-GCM
              |
              v
     Encrypted Record
       /     |      \
      /      |       \
  Ciphertext IV   Auth Tag
      \      |       /
       \     |      /
              |
              v
      Local JSON Storage

# Decryption
       Encrypted Record
              |
              v
    Master Password + Salt
              |
              v
       Scrypt Derivation
              |
              v
       256-bit AES Key
              |
              v
     AES-256-GCM Authentication
              |
              v
          Decryption
              |
              v
       JSON Deserialization
              |
              v
       ORIGINAL NOTE

# 📁 5. Project Structure

secure-student-notes/
│
├── src/
│   ├── cli.js
│   ├── crypto.js
│   ├── storage.js
│   └── notes.js
│
├── tests/
│   └── crypto.test.js
│
├── data/
│   ├── vault.json
│   └── notes/
│
├── doc/
│   └── developementLog.md
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore

## Module Descriptions

![
       
](image.png)

## Usage
.1 Initialize a vault

`npm start -- init`
The application requests a master password and confirmation. The password must contain at least 12 characters. A vault metadata file is created locally.


## Add a note
`npm start -- add`

## List saved notes

`npm start -- list`

``
##  Read and decrypt a note

`npm start -- read NOTE_ID`

## Search notes

`npm start -- search`

## Delete a note

`npm start -- delete NOTE_ID`

## Cryptographic Testing

`npm test`

