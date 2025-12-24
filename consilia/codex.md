# Codex - Encoding

## Overview

Text and binary encoding/decoding for data interchange formats.

## Etymology

- `codex` - "book, code, tablet" - an encoding system
- `coda` - "encode" (Latinized from code)
- `decoda` - "decode"

---

## Basic API

```
ex "norma/codex" importa { coda, decoda }

// Encode octeti to textus
fixum encoded = coda(octeti, "base64")

// Decode textus to octeti
fixum decoded = decoda(encoded, "base64")
```

---

## Encodings

### Binary-to-Text

| Faber | Description | Use case |
|-------|-------------|----------|
| `"base64"` | Base64 (standard) | Email, JSON, general |
| `"base64url"` | Base64 URL-safe | URLs, JWT |
| `"hex"` | Hexadecimal | Debugging, hashes |
| `"base32"` | Base32 | Case-insensitive contexts |

```
ex "norma/codex" importa { coda, decoda }

fixum bytes = fortuita(16)

fixum b64 = coda(bytes, "base64")       // "SGVsbG8gV29ybGQ="
fixum hex = coda(bytes, "hex")          // "48656c6c6f"
fixum b64url = coda(bytes, "base64url") // "SGVsbG8tV29ybGQ"
```

### URL Encoding

| Faber | Description |
|-------|-------------|
| `"url"` | Percent-encoding for URLs |
| `"url_component"` | Encode path/query components |

```
ex "norma/codex" importa { coda, decoda }

fixum safe = coda("hello world!", "url")           // "hello%20world%21"
fixum original = decoda("hello%20world%21", "url") // "hello world!"
```

### HTML Entities

| Faber | Description |
|-------|-------------|
| `"html"` | HTML entity encoding |

```
ex "norma/codex" importa { coda, decoda }

fixum safe = coda("<script>", "html")    // "&lt;script&gt;"
fixum original = decoda("&lt;", "html")  // "<"
```

---

## Type Signatures

Encodings have different input/output types:

| Encoding | `coda` | `decoda` |
|----------|--------|----------|
| `"base64"` | `octeti -> textus` | `textus -> octeti` |
| `"hex"` | `octeti -> textus` | `textus -> octeti` |
| `"url"` | `textus -> textus` | `textus -> textus` |
| `"html"` | `textus -> textus` | `textus -> textus` |

Binary-to-text encodings convert between `octeti` and `textus`.
Text-to-text encodings (URL, HTML) work on `textus` only.

---

## Target Mappings

### TypeScript (Node.js)

```typescript
// coda(bytes, "base64")
Buffer.from(bytes).toString('base64')

// decoda(str, "base64")
Buffer.from(str, 'base64')

// coda(str, "url")
encodeURIComponent(str)

// decoda(str, "url")
decodeURIComponent(str)
```

### Python

```python
import base64
import urllib.parse
import html

# coda(bytes, "base64")
base64.b64encode(bytes).decode('ascii')

# decoda(str, "base64")
base64.b64decode(str)

# coda(str, "url")
urllib.parse.quote(str)

# coda(str, "html")
html.escape(str)
```

### Rust

```rust
use base64::{Engine, engine::general_purpose};
use urlencoding;

// coda(bytes, "base64")
general_purpose::STANDARD.encode(bytes)

// decoda(str, "base64")
general_purpose::STANDARD.decode(str)?

// coda(str, "url")
urlencoding::encode(str)
```

### Zig

```zig
const std = @import("std");
const base64 = std.base64;

// coda(bytes, "base64")
var buf: [256]u8 = undefined;
const encoded = base64.standard.Encoder.encode(&buf, bytes);

// decoda(str, "base64")
var decoded: [256]u8 = undefined;
try base64.standard.Decoder.decode(&decoded, str);
```

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| `coda` | Not Done | Encode |
| `decoda` | Not Done | Decode |
| base64 | Not Done | Standard + URL-safe |
| hex | Not Done | Hexadecimal |
| url | Not Done | Percent-encoding |
| html | Not Done | Entity encoding |

---

## Design Decisions

### Why not use formator?

The `formator` interface (`verte`/`reverte`) is for file I/O serialization. Encoding is a different concern — transforming representation without changing structure. Keeping them separate avoids confusion.

### Why octeti for binary encodings?

Base64 and hex encode raw bytes to text. The input must be `octeti`, and decode returns `octeti`. This makes the byte/text distinction explicit.

### Error handling?

Invalid input (e.g., bad base64 string) throws a recoverable error via `iace`:

```
figendum result = decoda("invalid!!!", "base64")  // may iace on invalid input
```

Use `cape` to handle decoding errors, or let them propagate.
