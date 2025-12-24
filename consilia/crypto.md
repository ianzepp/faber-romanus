# Crypto - Cryptographic Operations

## Overview

Cryptographic primitives for hashing, encryption, and secure random generation.

## Etymology

- `crypto` - "hidden, secret" (from Greek kryptos)
- `digere` - "digest!" (imperative of digerere) - hashing
- `cifra` - "cipher" (medieval Latin from Arabic)
- `clavis` - "key" - encryption key
- `sal` - "salt" - cryptographic salt
- `fortuita` - "random" (from fortuna) - secure random bytes

---

## Hashing

### Basic Hash

```
ex "norma/crypto" importa { digere }

fixum hash = digere("hello", "sha256")
fixum hash = digere(octeti, "sha512")
```

### Supported Algorithms

| Faber | Description |
|-------|-------------|
| `"md5"` | MD5 (legacy, insecure) |
| `"sha1"` | SHA-1 (legacy) |
| `"sha256"` | SHA-256 |
| `"sha512"` | SHA-512 |
| `"blake2b"` | BLAKE2b |
| `"blake3"` | BLAKE3 |

### HMAC

```
ex "norma/crypto" importa { hmac }

fixum mac = hmac("message", clavis, "sha256")
```

---

## Encryption

### Symmetric (AES)

```
ex "norma/crypto" importa { cifra, decifra }

fixum encrypted = cifra(data, clavis, "aes-256-gcm")
fixum decrypted = decifra(encrypted, clavis, "aes-256-gcm")
```

### Modes

| Faber | Description |
|-------|-------------|
| `"aes-128-gcm"` | AES-128 with GCM |
| `"aes-256-gcm"` | AES-256 with GCM (recommended) |
| `"chacha20-poly1305"` | ChaCha20-Poly1305 |

---

## Random

### Secure Random Bytes

```
ex "norma/crypto" importa { fortuita }

fixum bytes = fortuita(32)          // 32 random bytes
fixum uuid = fortuita_uuid()        // UUID v4
```

---

## Key Derivation

```
ex "norma/crypto" importa { deriva }

fixum clavis = deriva("password", sal, {
    algorithmus: "argon2id",
    memoria: 65536,
    iterationes: 3,
    longitudo: 32
})
```

### Algorithms

| Faber | Description |
|-------|-------------|
| `"pbkdf2"` | PBKDF2 (legacy) |
| `"scrypt"` | scrypt |
| `"argon2id"` | Argon2id (recommended) |

---

## Target Mappings

### TypeScript (Node.js)

```typescript
import { createHash, createHmac, randomBytes } from 'crypto';
import { scrypt, argon2 } from 'crypto';  // or external libs

// digere("hello", "sha256")
createHash('sha256').update('hello').digest()

// fortuita(32)
randomBytes(32)
```

### Python

```python
import hashlib
import secrets
from argon2 import PasswordHasher

# digere("hello", "sha256")
hashlib.sha256(b"hello").digest()

# fortuita(32)
secrets.token_bytes(32)
```

### Rust

```rust
use ring::digest;
use ring::rand::SecureRandom;

// digere("hello", "sha256")
digest::digest(&digest::SHA256, b"hello")

// fortuita(32)
let mut bytes = [0u8; 32];
ring::rand::SystemRandom::new().fill(&mut bytes)
```

### Zig

```zig
const std = @import("std");
const crypto = std.crypto;

// digere("hello", "sha256")
var hash: [32]u8 = undefined;
crypto.hash.sha2.Sha256.hash("hello", &hash, .{});

// fortuita(32)
var bytes: [32]u8 = undefined;
crypto.random.bytes(&bytes);
```

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| `digere` (hashing) | Not Done | SHA-256, SHA-512, BLAKE |
| `hmac` | Not Done | HMAC with any hash |
| `cifra`/`decifra` | Not Done | AES-GCM, ChaCha20 |
| `fortuita` | Not Done | Secure random bytes |
| `deriva` | Not Done | Key derivation |

---

## Design Decisions

### Why stdlib over external?

Crypto is security-critical. Providing a stdlib:
1. Ensures consistent, audited implementations
2. Avoids users choosing weak algorithms
3. Maps to platform-native crypto (faster, FIPS-compliant)

### Why string-based algorithm selection?

Explicit algorithm names are clearer than constants and allow runtime selection when needed. The compiler can validate known strings at compile time.

### Why octeti for all outputs?

Crypto operations produce raw bytes, not text. Using `octeti` makes this explicit and avoids encoding confusion.
