---
status: planned
note: Stdlib design; not yet implemented
updated: 2024-12
---

# Comprimo - Compression

## Overview

Compression and decompression for data storage and transfer.

## Etymology

- `comprimo` - "compress, squeeze together" (from com + premere)
- `laxo` - "loosen, release" - decompress
- `gradus` - "level, step" - compression level

---

## Basic API

```
ex "norma/comprimo" importa { comprimo, laxo }

// Compress
fixum compressed = comprimo(data, "gzip")
fixum compressed = comprimo(data, "zstd", { gradus: 9 })

// Decompress
fixum original = laxo(compressed, "gzip")
```

---

## Algorithms

| Faber       | Description            | Use case         |
| ----------- | ---------------------- | ---------------- |
| `"deflate"` | Raw DEFLATE            | Low-level        |
| `"gzip"`    | DEFLATE + headers      | Files, HTTP      |
| `"zlib"`    | DEFLATE + zlib headers | General          |
| `"brotli"`  | Brotli                 | Web, HTTP        |
| `"zstd"`    | Zstandard              | Fast, high ratio |
| `"lz4"`     | LZ4                    | Very fast        |
| `"snappy"`  | Snappy                 | Speed over ratio |

---

## Options

```
{
    gradus: numerus,    // 1-9 (or algorithm-specific max)
    memoria: numerus,   // memory limit (bytes)
}
```

### Compression Levels

| Level | Speed    | Ratio              |
| ----- | -------- | ------------------ |
| 1     | Fastest  | Lowest             |
| 6     | Balanced | Moderate (default) |
| 9     | Slowest  | Highest            |

---

## Streaming

For large data, use streaming compression:

```
ex "norma/comprimo" importa { compressor, laxator }

// Compress stream
fixum stream = compressor("gzip")
stream.inscribe(chunk1)
stream.inscribe(chunk2)
fixum result = stream.fini()

// Decompress stream
fixum stream = laxator("gzip")
stream.inscribe(compressed_chunk)
fixum result = stream.fini()
```

---

## Target Mappings

### TypeScript (Node.js)

```typescript
import { gzipSync, gunzipSync, createGzip } from 'zlib';
import { brotliCompressSync } from 'zlib';

// comprimo(data, "gzip")
gzipSync(data);

// laxo(compressed, "gzip")
gunzipSync(compressed);

// Streaming
const gzip = createGzip();
gzip.write(chunk);
gzip.end();
```

### Python

```python
import gzip
import zlib
import lzma
import brotli  # external

# comprimo(data, "gzip")
gzip.compress(data)

# laxo(compressed, "gzip")
gzip.decompress(compressed)

# comprimo(data, "zstd")
import zstandard
zstandard.compress(data)
```

### Rust

```rust
use flate2::Compression;
use flate2::write::GzEncoder;
use std::io::Write;

// comprimo(data, "gzip")
let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
encoder.write_all(data)?;
encoder.finish()?

// zstd
use zstd::encode_all;
encode_all(data, 3)?
```

### Zig

```zig
const std = @import("std");
const deflate = std.compress.deflate;
const gzip = std.compress.gzip;

// comprimo(data, "gzip")
var compressed = std.ArrayList(u8).init(allocator);
var compressor = try gzip.compressor(compressed.writer(), .{});
try compressor.write(data);
try compressor.finish();

// laxo(compressed, "gzip")
var decompressor = try gzip.decompressor(reader);
const result = try decompressor.reader().readAllAlloc(allocator, max_size);
```

---

## Implementation Status

| Feature               | Status   | Notes                    |
| --------------------- | -------- | ------------------------ |
| `comprimo` (sync)     | Not Done | All algorithms           |
| `laxo` (sync)         | Not Done | All algorithms           |
| `compressor` (stream) | Not Done | Streaming compress       |
| `laxator` (stream)    | Not Done | Streaming decompress     |
| gzip                  | Not Done | Most common              |
| zstd                  | Not Done | Recommended for new code |
| brotli                | Not Done | Web/HTTP                 |
| lz4                   | Not Done | Speed-critical           |

---

## Design Decisions

### Why algorithm as string parameter?

Same as crypto: explicit, runtime-selectable, compile-time validatable for literals.

### Why octeti in/out?

Compression operates on raw bytes. Text should be encoded to `octeti` first via `textus.verte()`.

### Default algorithm?

No default. Explicit algorithm selection prevents accidental compatibility issues. If you don't know what to use, use `"gzip"` for compatibility or `"zstd"` for performance.

### Streaming vs sync?

Both APIs provided. Sync is simpler for small data. Streaming is necessary for large files or network streams to avoid memory exhaustion.
