# Fasciculus - File I/O

## Overview

Faber provides two tiers of file I/O:
- **High-level**: Convenience operations for reading/writing files with optional parsing
- **Low-level**: File descriptors and byte-level operations for systems programming

## Etymology

- `fasciculus` - "small bundle, packet" (diminutive of fascis) - a file as a bundle of data
- `lege` - "read!" (imperative of legere)
- `inscribe` - "write into!" (imperative of inscribere)
- `appone` - "add to!" (imperative of apponere)
- `aperi` - "open!" (imperative of aperire)
- `claude` - "close!" (imperative of claudere)
- `ut` - "as" (conjunction) - format specifier

---

## High-Level API

### Reading Files

**Syntax:**
```
lege <path>
lege <path> ut <format>
```

**Examples:**
```
// Read as text (default)
fixum readme = lege "README.md"

// Read with format parsing
fixum config = lege "config.json" ut json
fixum settings = lege "settings.toml" ut toml
fixum records = lege "data.csv" ut csv

// Destructure after reading
fixum config = lege "~/.config/app.json" ut json
ex config fixum { routes, parsers, database }
```

**Supported formats:**
| Format | Description | Returns |
|--------|-------------|---------|
| (none) | Raw text | `textus` |
| `json` | JSON parsing | object/array |
| `toml` | TOML parsing | object |
| `csv` | CSV parsing | `lista<lista<textus>>` or `lista<object>` |
| `bytes` | Raw bytes | `lista<numerus>` or target-specific buffer |

### Formatter Interface

Formats are types implementing the `Formator` interface. All formatters work on bytes - text is just UTF-8 encoded bytes.

```
pactum Formator<T> {
    functio verte(T data) -> bytes       // turn data into bytes
    functio reverte(bytes input) -> T    // turn bytes back into data
}
```

**Etymology:**
- `verte` - "turn!" (imperative of vertere) - turn data into bytes
- `reverte` - "turn back!" - turn bytes back into data

**Standard formatters:**

```
// Text formats (UTF-8 bytes)
genus JSON implet Formator<object> { }
genus TOML implet Formator<object> { }
genus CSV implet Formator<lista<object>> { }

// Binary formats
genus MessagePack implet Formator<object> { }
genus PNG implet Formator<Image> { }
genus ZIP implet Formator<Archivum> { }
```

**How `ut` expands:**

```
// lege "config.json" ut json
// expands to:
fixum raw = lege "config.json" ut bytes
fixum config = json.reverte(raw)

// inscribe "out.json" ut json, data
// expands to:
fixum serialized = json.verte(data)
inscribe "out.json" ut bytes, serialized
```

**Custom formatters:**

```
genus MyFormat implet Formator<MyData> {
    functio verte(MyData data) -> bytes {
        // serialize to bytes
    }

    functio reverte(bytes input) -> MyData {
        // parse from bytes
    }
}

fixum formatter = novum MyFormat()
fixum data = lege "data.custom" ut formatter
```

### Writing Files

**Syntax:**
```
inscribe <path>, <data>
inscribe <path> ut <format>, <data>
```

**Examples:**
```
// Write text
inscribe "output.txt", "Hello, world!"

// Write with format serialization
inscribe "config.json" ut json, { version: 1, debug: verum }
inscribe "data.csv" ut csv, rows

// Variable content
fixum report = generateReport()
inscribe "report.md", report
```

### Appending

**Syntax:**
```
appone <path>, <data>
```

**Examples:**
```
appone "log.txt", "[INFO] Server started\n"
appone "events.jsonl", JSON.stringify(event) + "\n"
```

### File Existence

**Syntax:**
```
exstat <path>
```

**Returns:** `bivalens` (true/false)

**Examples:**
```
si exstat "config.json" {
    fixum config = lege "config.json" ut json
} aliter {
    fixum config = defaultConfig
}
```

### Deletion

**Syntax:**
```
dele <path>
```

**Examples:**
```
dele "temp.txt"

si exstat "cache.json" {
    dele "cache.json"
}
```

---

## Low-Level API

For systems programming: file descriptors, byte buffers, seeking.

### Opening Files

**Syntax:**
```
aperi <path>
aperi <path>, <options>
```

**Options:**
```
{
    modus: "r" | "w" | "rw" | "a",  // read/write/readwrite/append
    crea: bivalens,                  // create if missing
    trunca: bivalens                 // truncate existing
}
```

**Examples:**
```
fixum fd = aperi "data.bin"
fixum fd = aperi "output.bin", { modus: "w", crea: verum }
```

### Reading from Descriptor

**Syntax:**
```
lege <fd>, <buffer>
lege <fd>, <count>
```

**Returns:** Number of bytes read

**Examples:**
```
fixum fd = aperi "data.bin"
fixum buffer = crea bytes(1024)
fixum n = lege fd, buffer

// Or read into new buffer
fixum data = lege fd, 1024
```

### Writing to Descriptor

**Syntax:**
```
inscribe <fd>, <buffer>
```

**Returns:** Number of bytes written

**Examples:**
```
fixum fd = aperi "output.bin", { modus: "w" }
inscribe fd, buffer
claude fd
```

### Seeking

**Syntax:**
```
quaere <fd>, <position>
quaere <fd>, <offset>, <origin>
```

**Origins:**
- `initium` - from start (SEEK_SET)
- `hic` - from current position (SEEK_CUR)
- `finis` - from end (SEEK_END)

**Examples:**
```
quaere fd, 0                    // seek to start
quaere fd, 100                  // seek to position 100
quaere fd, -10, finis           // 10 bytes before end
```

### Closing

**Syntax:**
```
claude <fd>
```

**Examples:**
```
fixum fd = aperi "file.bin"
// ... operations ...
claude fd
```

### Context Manager Pattern

Use `cum` (with) for automatic cleanup:

```
cum aperi "data.bin" fit fd {
    fixum data = lege fd, 1024
    process(data)
}
// fd automatically closed
```

**With error handling:**
```
cum aperi "data.bin" fit fd {
    inscribe fd, data
} cape err {
    mone "Write failed:", err
}
// fd still closed even on error
```

---

## Async Considerations

### High-Level

High-level operations are async by default on async-capable targets:

```
// In async function
futura functio loadConfig() -> object {
    fixum config = cede lege "config.json" ut json
    redde config
}
```

Or implicit await for convenience (target-dependent):
```
// May be sync or async depending on target
fixum config = lege "config.json" ut json
```

### Low-Level

Low-level operations are sync by default:

```
fixum fd = aperi "file.bin"    // sync open
fixum data = lege fd, 1024     // sync read
claude fd                       // sync close
```

Async low-level via explicit wrapping (future consideration).

---

## Target Mappings

### TypeScript (Node.js)

```typescript
// lege "config.json" ut json
JSON.parse(await fs.promises.readFile("config.json", "utf-8"))

// inscribe "out.json" ut json, data
await fs.promises.writeFile("out.json", JSON.stringify(data))

// aperi "file.bin"
await fs.promises.open("file.bin", "r")
```

### Python

```python
# lege "config.json" ut json
import json
with open("config.json") as f:
    json.load(f)

# inscribe "out.json" ut json, data
with open("out.json", "w") as f:
    json.dump(data, f)
```

### Zig

```zig
// lege "file.txt"
const file = try std.fs.cwd().openFile("file.txt", .{});
defer file.close();
const content = try file.readToEndAlloc(allocator, max_size);

// inscribe "file.txt", data
const file = try std.fs.cwd().createFile("file.txt", .{});
defer file.close();
try file.writeAll(data);
```

---

## Path Handling

### Home Directory

`~` expands to user home directory:

```
fixum config = lege "~/.config/app.json" ut json
```

### Path Joining

Use `/` operator or stdlib:

```
fixum path = baseDir + "/" + filename
// or
fixum path = Via.iunge(baseDir, filename)
```

### Path Type

Future consideration: `via` (path/way) as a dedicated path type:

```
fixum configPath: via = "~/.config/app.json"
si exstat configPath {
    fixum config = lege configPath ut json
}
```

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| `lege` (text) | Not Done | High-level read |
| `lege` ut format | Not Done | With parsing |
| `inscribe` | Not Done | High-level write |
| `appone` | Not Done | Append |
| `exstat` | Not Done | File existence |
| `dele` | Not Done | Delete |
| `aperi`/`claude` | Not Done | Low-level open/close |
| Low-level `lege` | Not Done | Read to buffer |
| Low-level `inscribe` | Not Done | Write buffer |
| `quaere` | Not Done | Seek |
| `cum` cleanup | Not Done | Context manager pattern |
| `~` expansion | Not Done | Home directory |

---

## Design Decisions

### Why keywords over stdlib?

File I/O is fundamental. Making it keyword-based (like `scribe`):
1. Keeps operations concise
2. Enables target-specific optimization
3. Feels natural in Latin syntax

### Why `ut` for format?

- Already exists as "as" preposition
- Natural reading: "read file.json as json"
- Consistent with destructuring renames
- Formatters are first-class: `pactum Formator<T>` with `decode`/`encode`
- Users can define custom formatters, not limited to builtins

### Why separate high/low level?

- High-level for 90% of use cases (scripts, apps)
- Low-level for systems work (OS, VM, binary formats)
- Different users, different needs

### Sync vs Async?

- High-level: Target decides (async for Node, sync for Zig)
- Low-level: Sync by default (explicit control)
- User can force async with `cede` where needed

---

## Future Considerations

1. **Streaming**: Read large files in chunks via `ausculta`?
   ```
   ex ausculta lege "large.csv" fiet chunk {
       processChunk(chunk)
   }
   ```

2. **Glob patterns**: Read multiple files
   ```
   fixum files = lege "src/**/*.fab"
   ```

3. **Watching**: File change notifications
   ```
   ex vigila "config.json" fiet change {
       reloadConfig()
   }
   ```

4. **Permissions**: Mode/permission setting on create

5. **Temporary files**: `crea temporarium` for temp file handling
