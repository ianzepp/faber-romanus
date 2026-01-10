# Compiler Streaming API (JSONL)

A streaming JSONL protocol for compiler input/output, enabling persistent compiler processes and batch compilation.

## Motivation

Current compiler invocation is one-shot: spawn process, compile one file, exit. This has costs:

1. **Process overhead** — Each file requires a new process spawn.
2. **No state reuse** — AST infrastructure rebuilds every invocation.
3. **Rivus limitation** — The rivus compiler uses stdin/stdout but only handles one file per execution.

A streaming protocol allows:

- Single long-lived process compiling many files
- Reuse of internal state (reset AST, keep process warm)
- Natural fit for rivus's stdin/stdout model
- Easy integration with build tools and test harnesses

## Goals

- JSONL protocol over stdin/stdout (one JSON object per line)
- Per-line target specification
- Pass-through of unknown fields for correlation
- Synchronous output (one output per input, in order)
- Clean error reporting with structured diagnostics

## Non-Goals

- Cross-file dependencies (each line is independent)
- Multi-target expansion from single input (future extension)
- Binary protocol or custom framing
- Async/parallel processing within a single stream (use multiple processes)

## Protocol

### Input (stdin)

Each line is a JSON object:

```jsonl
{"path": "src/main.fab", "source": "fixum x = 1", "target": "ts"}
{"path": "src/util.fab", "source": "functio add(numerus a, b) -> numerus { redde a + b }", "target": "ts"}
{"path": "src/config.fab", "source": "...", "target": "py", "meta": {"priority": 1}}
```

**Required fields:**
- `path` — Source file path (used for error reporting and output path derivation)
- `source` — Faber source code to compile
- `target` — Target language (`ts`, `py`, `rs`, `cpp`, `zig`, `fab`)

**Optional fields:**
- `id` — Caller-provided correlation ID (echoed in response)
- Any additional fields pass through to output unchanged

### Output (stdout)

Each line is a JSON object, output in the same order as input:

**Success:**
```jsonl
{"path": "src/main.ts", "target": "ts", "ok": true, "codegen": "const x = 1;"}
{"path": "src/util.ts", "target": "ts", "ok": true, "codegen": "function add(a: number, b: number): number { return (a + b); }"}
{"path": "src/config.py", "target": "py", "ok": true, "codegen": "...", "meta": {"priority": 1}}
```

**Failure:**
```jsonl
{"path": "src/bad.fab", "target": "ts", "ok": false, "errors": [{"code": "P104", "message": "Unexpected token", "line": 3, "col": 5, "phase": "parser"}]}
```

**Output fields:**
- `path` — Target file path (extension transformed: `.fab` → `.ts`, `.py`, etc.)
- `target` — Echo of input target
- `ok` — Boolean success indicator
- `codegen` — Generated code (present when `ok: true`)
- `errors` — Array of diagnostics (present when `ok: false`)
- `id` — Echo of input `id` if provided
- Pass-through fields from input

### Error Diagnostics

```json
{
  "code": "P104",
  "message": "Unexpected token 'functio'",
  "line": 3,
  "col": 5,
  "phase": "parser"
}
```

- `code` — Error code using existing prefixes: `L` (lexer), `P` (parser), `S` (semantic), `G` (codegen), `STREAM` (protocol)
- `message` — Human-readable message
- `line`, `col` — 1-indexed position in source
- `phase` — Required: `lexer`, `parser`, `semantic`, `codegen`

**Protocol-level error codes:**

| Code | Meaning |
|------|---------|
| `STREAM001` | Invalid JSON (malformed line) |
| `STREAM002` | Missing required field |
| `STREAM003` | Invalid target value |
| `STREAM004` | Empty source |

## CLI Interface

### Faber

```bash
# Enter streaming mode
bun run faber stream

# With source echo (include source in output for debugging)
bun run faber stream --include-source

# Pipe from file
cat requests.jsonl | bun run faber stream > results.jsonl
```

### Rivus (future)

```bash
# Same protocol
bun run rivus stream < requests.jsonl > results.jsonl
```

## Behavior

1. **Startup** — Process enters streaming mode, reads stdin line by line.
2. **Per-line processing:**
   - Parse JSON
   - Validate required fields
   - Compile source to target
   - Write result JSON to stdout (flush immediately)
   - Reset internal state for next compilation
3. **Shutdown** — On EOF, exit with code 0.

**Guarantee:** One output line per input line, in order. This simplifies correlation — the Nth output corresponds to the Nth input.

**Empty lines:** Ignored (no output produced).

**Invalid JSON handling:**
```jsonl
{"path": null, "ok": false, "errors": [{"code": "STREAM001", "message": "Invalid JSON: Unexpected token at position 15", "line": 1, "col": 1, "phase": "protocol"}]}
```

**Missing required field:**
```jsonl
{"path": "unknown", "ok": false, "errors": [{"code": "STREAM002", "message": "Missing required field: source", "line": 1, "col": 1, "phase": "protocol"}]}
```

**Note:** Protocol errors use `phase: "protocol"` and position `line: 1, col: 1` since the error is in the JSON structure, not the Faber source.

## Path Transformation

Output path derived from input path by replacing extension:

| Input | Target | Output |
|-------|--------|--------|
| `src/main.fab` | `ts` | `src/main.ts` |
| `src/main.fab` | `py` | `src/main.py` |
| `src/main.fab` | `rs` | `src/main.rs` |
| `src/main.fab` | `cpp` | `src/main.cpp` |
| `src/main.fab` | `zig` | `src/main.zig` |
| `src/main.fab` | `fab` | `src/main.fab` |

If input path doesn't end in `.fab`, append target extension.

**Edge case:** If `path` is empty string or contains only whitespace, use `"<stdin>"` for error reporting and omit path transformation in output.

## Implementation Notes

### Faber (TypeScript)

The `stream` command will be added to `fons/faber/cli.ts`:

```ts
async function streamMode(options: { includeSource: boolean }) {
  const reader = Bun.stdin.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const result = processLine(line, options);
      console.log(JSON.stringify(result));
    }
  }
}

function processLine(line: string, options: { includeSource: boolean }): StreamResult {
  // 1. Parse JSON
  let request: unknown;
  try {
    request = JSON.parse(line);
  }
  catch (e) {
    return {
      path: null,
      ok: false,
      errors: [{
        code: 'STREAM001',
        message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
        line: 1,
        col: 1,
        phase: 'protocol',
      }],
    };
  }

  // 2. Validate required fields
  // 3. Call tokenize/parse/analyze/generate
  // 4. Collect errors or return codegen
  // ...
}
```

**Key implementation details:**

1. Use `console.log` (not `process.stdout.write`) to ensure newline and flush
2. Errors from any phase are collected into the `errors` array
3. The existing `compile()` function in `shared.ts` handles tokenize/parse/analyze/generate but currently throws on errors — refactor to return structured result
4. No global state between compilations (already true for faber)

### Rivus (Faber)

Rivus currently has no JSON support. This protocol is a forcing function for implementing:

1. **JSON parsing** — New stdlib module `fons/norma/json.fab` with:
   - `functio parseJSON(textus input) -> ignotum` — Parse JSON string to dynamic value
   - Error handling via `tempta/cape` for malformed JSON

2. **JSON serialization** — Same module:
   - `functio stringifyJSON(ignotum value) -> textus` — Serialize value to JSON string
   - Must handle: `textus`, `numerus`, `fractus`, `bivalens`, `nihil`, `lista`, `tabula`

3. **Object iteration** — The `de tabula pro key` loop already exists but needs testing with dynamic objects

**Minimum viable JSON for rivus:**

The protocol only requires:
- Parsing: Extract string values from flat object (`path`, `source`, `target`)
- Serialization: Emit flat object with strings, boolean, and array of objects

Nested objects in pass-through fields (`meta`) can be treated as opaque — parse as `textus` and emit unchanged.

**Rivus CLI changes:**

Current `fons/rivus/cli.fab` reads:
1. First line as file path
2. Rest as source

New streaming mode would replace this with JSONL parsing. The existing structure already handles stdin reading and compilation — the change is primarily in input/output format.

## Integration with Test Harness

The `fons/proba/harness/runner.ts` currently calls `compile()` from `shared.ts` directly. Streaming mode offers an alternative:

```ts
// Current approach (direct function call)
const result = compile(source, target);

// Streaming approach (subprocess)
const proc = Bun.spawn(['bun', 'run', 'faber', 'stream'], {
  stdin: 'pipe',
  stdout: 'pipe',
});

for (const testCase of testCases) {
  proc.stdin.write(JSON.stringify({
    path: testCase.file,
    source: testCase.source,
    target: testCase.target,
  }) + '\n');
}

proc.stdin.end();

// Read results line by line, correlate by order
```

**When to use streaming vs direct:**

| Approach | Use when |
|----------|----------|
| Direct (`compile()`) | Testing faber itself, need direct access to AST/errors |
| Streaming | Testing rivus, benchmarking, external tool integration |

**Benefits of streaming for test harness:**

- Single process startup for entire test suite
- Same protocol works for both faber and rivus testing
- Enables future parallel worker pools

**Consideration:** The harness currently uses `compileStrict()` for errata tests (expects compilation to fail). Streaming mode handles this naturally — errors are returned in the `errors` array.

## Consequence Chain

Implementation of this protocol triggers changes across the codebase:

### 1. Faber CLI (`fons/faber/cli.ts`)

- Add `stream` command to switch statement
- Add `--include-source` flag parsing
- Implement `streamMode()` function
- Refactor error collection to avoid `process.exit()` mid-stream

### 2. Shared utilities (`fons/proba/shared.ts`)

- The `compile()` and `compileStrict()` functions currently return `CompileResult` with `success`, `output`, `error`
- Consider adding `errors: Diagnostic[]` field for structured error array
- Or keep as-is and map in stream handler

### 3. Rivus stdlib (`fons/norma/`)

- New `json.fab` module needed
- Requires implementing:
  - String escape handling (`\"`, `\\`, `\n`, etc.)
  - Number parsing (integers and floats)
  - Array and object parsing
  - Recursion for nested structures

### 4. Rivus CLI (`fons/rivus/cli.fab`)

- Add `stream` command handling
- Replace current "first line is path" protocol
- Implement JSONL read/write loop

### 5. Test harness (optional)

- `fons/proba/harness/runner.ts` could add `--stream` mode
- Would spawn compiler process and pipe JSONL
- Enables testing rivus with same harness

## Error Handling Edge Cases

### Compilation errors

Errors are collected per-phase and returned in the `errors` array:

```jsonl
{"path": "bad.fab", "target": "ts", "ok": false, "errors": [
  {"code": "L001", "message": "Unterminated string", "line": 5, "col": 12, "phase": "lexer"},
  {"code": "P010", "message": "Expected identifier", "line": 7, "col": 1, "phase": "parser"}
]}
```

**Note:** The current compiler exits on first error phase. Streaming mode should collect all errors from a single phase, but not continue to later phases after errors.

### Codegen exceptions

If codegen throws (e.g., unsupported feature for target), catch and return as error:

```jsonl
{"path": "async.fab", "target": "zig", "ok": false, "errors": [
  {"code": "G001", "message": "Async not supported for Zig target", "line": 1, "col": 1, "phase": "codegen"}
]}
```

**Note:** Codegen errors currently don't have codes. This protocol would benefit from adding `G`-prefixed codes in `fons/faber/codegen/errors.ts`.

### Very long source

Lines with megabytes of source code are valid but may cause memory pressure. No special handling needed — Bun/Node can handle large strings. Document that extremely large files should use file-based compilation instead.

### Unicode in source

JSON requires UTF-8. Faber source is UTF-8. No special handling needed, but ensure JSON serialization escapes non-ASCII correctly (Bun's `JSON.stringify` handles this).

### Backpressure

If stdout buffer fills (consumer not reading), writes will block. This is correct behavior — natural backpressure. Document that consumers should read stdout continuously to avoid deadlock.

## Future Extensions

1. **Multi-target expansion** — `"target": ["ts", "py"]` emits multiple output lines per input.

2. **Incremental compilation** — Include file hash, skip unchanged files.

3. **Watch mode** — Keep process alive, accept new inputs after initial batch.

4. **Parallel workers** — Multiple compiler processes reading from shared queue.

5. **Semantic-only mode** — Return AST or type info instead of codegen.

## Resolved Questions

**Q: Should there be a "batch complete" signal, or is EOF sufficient?**

A: EOF is sufficient. The guarantee of one-output-per-input means the consumer knows exactly how many responses to expect. A batch signal adds complexity without benefit.

**Q: Should the protocol version be negotiated at startup?**

A: No. Version the protocol via CLI flag if needed (e.g., `--protocol-version 2`). Startup negotiation adds round-trip latency and complexity. For now, assume v1.

**Q: For rivus: what's the minimal JSON subset needed?**

A: Full JSON parsing is required for robustness (pass-through fields may contain nested objects). However, initial implementation can:
1. Parse flat objects only
2. Treat unknown fields as opaque strings
3. Add nested object support incrementally

## Implementation Order

Recommended sequence:

1. **Faber stream command** — Add to CLI, use existing compile infrastructure
2. **Test harness integration** — Optional, validates protocol with existing tests
3. **Rivus JSON parsing** — Minimal subset: flat objects with string/number/boolean/null
4. **Rivus JSON serialization** — Same subset
5. **Rivus stream command** — Wire up to existing compiler
6. **Full JSON support** — Nested objects, arrays, proper escaping
