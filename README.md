🔐 Secure Student Notes CLI

A command-line application for securely storing student notes using AES-256-GCM authenticated encryption and Scrypt key derivation.

!Node.js !Platform !Encryption !KDF !Status

📌 1. Project Overview

Secure Student Notes CLI is an educational cybersecurity project developed using Node.js.

Its primary objective is to demonstrate how cryptographic algorithms can protect sensitive information stored locally on a computer.

Users can create a secure vault, add notes, encrypt their contents, retrieve and decrypt them, search through saved notes, and delete them.

Unlike a conventional notes application, the plaintext content is encrypted before being written to local storage.

Main objectives
Understand symmetric encryption.
Implement AES-256-GCM.
Understand password-based key derivation using Scrypt.
Protect sensitive information using authenticated encryption.
Learn secure local file storage.
Develop a modular command-line application.
Practice cryptographic testing and security validation.
🛠️ 2. Technologies Used
Technology	Purpose
Node.js	JavaScript runtime
JavaScript	Application development
AES-256-GCM	Authenticated encryption
Scrypt	Password-based key derivation
Node.js Crypto API	Cryptographic operations
JSON	Encrypted record serialization
Ubuntu Linux	Development environment
WSL	Linux environment on Windows
Node.js Test Runner	Automated testing
Git	Version control
🔒 3. Cryptographic Architecture

The application uses two main cryptographic components.

3.1 AES-256-GCM

AES stands for Advanced Encryption Standard.

It is a symmetric encryption algorithm, meaning the same secret key is used for encryption and decryption.

The project uses AES with:

Key size: 256 bits.
Mode: Galois/Counter Mode.
IV: 96 bits (12 bytes).
Authentication tag: 128 bits (16 bytes).

GCM provides two important security properties:

Confidentiality: Protects the original information.
Integrity and authenticity: Detects unauthorized modifications to encrypted data.
3.2 Scrypt

Scrypt is a password-based key derivation function.

It transforms the user's master password into a cryptographic key.

It uses a random salt and configurable computational and memory parameters.

Conceptual process:

text
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


The application does not directly use the user's password as an AES encryption key.

🔄 4. Encryption and Decryption Workflow
Encryption
text
        ORIGINAL NOTE
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

Decryption
text
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


If authentication fails, the application must reject the encrypted record.

📁 5. Project Structure
text
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

Module descriptions
File	Description
cli.js	Handles user commands and interaction.
crypto.js	Implements encryption, decryption and key derivation.
storage.js	Manages vault metadata and encrypted note files.
notes.js	Implements note creation, reading, searching and deletion.
crypto.test.js	Tests the cryptographic functionality.
package.json	Defines dependencies and execution scripts.
README.md	Project documentation.
💻 6. Installation
Requirements
Ubuntu Linux or WSL.
Node.js 20 or later (Node.js 26 was used during development).
npm.
Git.
Step 1: Clone the repository
bash
git clone YOUR_GITHUB_REPOSITORY_URL

Step 2: Enter the project directory
bash
cd secure-student-notes

Step 3: Install dependencies
bash
npm install

Step 4: Verify Node.js
bash
node --version
npm --version

Step 5: Display available commands
bash
npm start -- help

🚀 7. Usage
7.1 Initialize a vault
bash
npm start -- init


The application requests a master password and confirmation.

The password must contain at least 12 characters.

A vault metadata file is created locally.

7.2 Add a note
bash
npm start -- add


Example:

text
=== ADD NEW NOTE ===

Enter master password: ************

Enter note title:
Cryptography Laboratory

Enter note content:
AES-256-GCM provides authenticated encryption.

Note encrypted and saved successfully!

7.3 List saved notes
bash
npm start -- list


Example:

text
=== SAVED NOTES ===

ID: fdbd38a7-81fe-410e-a2aa-4b5e83842000

Total notes: 1

7.4 Read and decrypt a note
bash
npm start -- read NOTE_ID


Example:

bash
npm start -- read fdbd38a7-81fe-410e-a2aa-4b5e83842000


The application requests the master password and decrypts the selected note.

7.5 Search notes
bash
npm start -- search


The application searches decrypted note contents in memory.

7.6 Delete a note
bash
npm start -- delete NOTE_ID


The selected encrypted note file is removed.

The vault remains intact.

🧪 8. Cryptographic Testing

The project uses the built-in Node.js test runner.

Run:

bash
npm test

Implemented tests
Test	Expected result
Successful encryption/decryption	PASS
Incorrect password	PASS
Modified ciphertext	PASS
Different salt	PASS
Different IV for repeated encryption	PASS
Recorded test results
text
tests 5
pass 5
fail 0


These results represent the five cryptographic tests successfully executed during development.

They do not establish that the entire application has undergone a security audit.

🛡️ 9. Security Features

The project incorporates the following security mechanisms:

AES-256-GCM authenticated encryption.
Scrypt password-based key derivation.
Random salt generation.
Unique IV generation for encryption operations.
Authentication tag verification.
Local encrypted note storage.
Input validation for note identifiers.
Restricted local file permissions.
Protection against accidental vault overwriting.
Security limitations

This is an educational cybersecurity project, not an independently audited production password manager or secure storage system.

Before production use, additional work is necessary:

Review cryptographic parameter choices.
Add comprehensive storage tests.
Improve recovery from corrupted files.
Review concurrent file operations.
Improve secret and password handling.
Review metadata leakage.
Implement reliable backup and recovery.
Obtain independent security review.

Deleting a file does not guarantee secure physical erasure.

📚 10. What I Learned

This project provides practical experience with:

Cryptography
Symmetric encryption.
AES-256.
Galois/Counter Mode.
Authenticated encryption.
Scrypt.
Random salts.
Initialization vectors.
Authentication tags.
Ciphertext integrity.
Software development
Node.js.
JavaScript ES modules.
Async/await.
File system operations.
JSON serialization.
CLI application development.
Error handling.
Automated testing.
Git and GitHub.
Cybersecurity
Confidentiality.
Integrity.
Authentication.
Password-based key derivation.
Secure file permissions.
Threat modeling.
Security testing.
🗺️ 11. Development Roadmap
Phase 1 – Core functionality
AES-256-GCM encryption.
Scrypt key derivation.
Vault initialization.
Encrypted note storage.
Note retrieval and decryption.
Note deletion.
Initial cryptographic tests.
Phase 2 – CLI improvements
Interactive menu.
Improved note management.
Better error handling.
Password change functionality.
Improved search experience.
Phase 3 – Security improvements
Comprehensive storage testing.
Corrupted file recovery.
Backup and restore.
Stronger input validation.
Independent security review.
Phase 4 – Public release
Complete documentation.
Add project screenshots.
Publish on GitHub.
Add contribution guidelines.
Prepare version 1.0.0.
👨‍💻 12. Educational Purpose

This project was developed as a practical laboratory for learning applied cryptography and secure software development.

Its main purpose is to demonstrate how cryptographic primitives can be integrated into a real command-line application.

The project is suitable for students interested in:

Cybersecurity.
Applied cryptography.
Secure software development.
Linux.

