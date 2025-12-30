# Nucleus: Faber's Micro-Kernel Runtime

A minimal kernel layer providing unified I/O dispatch, message-passing protocol, and async execution across all targets.

## Status

| Feature | Status | Notes |
|---------|--------|-------|
| Responsum protocol | Partial | TS has it; Zig/Rust/C++/Py need it |
| Syscall dispatch (`ad`) | Design only | See `ad.md` |
| Request correlation | Not started | IDs for concurrent ops |
| Handle abstraction | Not started | Unified I/O interface |
| AsyncContext | Not started | Executor for state machines |
| Target runtimes | TS only | Zig is next priority |

## Motivation

Faber targets multiple backends (TS, Python, Zig, Rust, C++). Each has different async primitives:

| Target | Native Async | Native Generators |
|--------|--------------|-------------------|
| TypeScript | `async`/`await` | `function*` |
| Python | `async`/`await` | `yield` |
| Zig | Removed in 0.11 | None |
| Rust | `async`/`.await` | Unstable |
| C++ | Coroutines (C++20) | None |

Rather than emit target-native async everywhere (impossible for Zig), Faber provides a **unified runtime protocol** that compiles to:
- Native async where available (TS, Python)
- State machines where not (Zig, Rust, C++)

The `ad` dispatch system routes all I/O through this protocol.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Faber Source Code                                          │
│  ad "fasciculus:lege" ("file.txt") fiet textus pro content  │
├─────────────────────────────────────────────────────────────┤
│  Compiler (semantic analysis, codegen)                      │
├─────────────────────────────────────────────────────────────┤
│  Nucleus Runtime (per-target implementation)                │
│  ├── Dispatcher (syscall routing)                           │
│  ├── Responsum (message protocol)                           │
│  ├── Handle (unified I/O interface)                         │
│  └── Executor (async scheduling)                            │
├─────────────────────────────────────────────────────────────┤
│  Target Runtime (Bun, Python, Zig std, etc.)                │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Responsum Protocol

All syscalls return `Responsum<T>` — a tagged union describing the result:

```
┌─────────────┬──────────────────────────────────────────┐
│ Variant     │ Meaning                                  │
├─────────────┼──────────────────────────────────────────┤
│ .pending    │ Operation in progress, poll again       │
│ .ok(T)      │ Single value, terminal                  │
│ .item(T)    │ One of many values, non-terminal        │
│ .done       │ Stream complete, terminal               │
│ .err(E)     │ Error, terminal                         │
└─────────────┴──────────────────────────────────────────┘
```

**TypeScript:**
```typescript
type Responsum<T> =
  | { op: 'pending' }
  | { op: 'ok'; data: T }
  | { op: 'item'; data: T }
  | { op: 'done' }
  | { op: 'err'; code: string; message: string };
```

**Zig:**
```zig
fn Responsum(comptime T: type) type {
    return union(enum) {
        pending,
        ok: T,
        item: T,
        done,
        err: struct { code: []const u8, message: []const u8 },
    };
}
```

### 2. Handle Abstraction

All I/O sources implement a common interface:

```
Handle
├── id: RequestId
├── type: HandleType (file, socket, channel, timer, ...)
├── exec(msg: Message) → Stream<Responsum<T>>
└── close() → void
```

**Message:**
```
Message
├── op: string        // "read", "write", "get", "query", ...
├── data: any         // Operation-specific payload
└── id: RequestId     // For correlating responses
```

This mirrors Monk's `Handle.exec(msg): AsyncIterable<Response>` pattern.

**Zig:**
```zig
const Handle = struct {
    id: u64,
    handle_type: HandleType,
    vtable: *const HandleVTable,

    pub fn exec(self: *Handle, msg: Message) Responsum(ResultType) {
        return self.vtable.exec(self, msg);
    }

    pub fn close(self: *Handle) void {
        self.vtable.close(self);
    }
};

const HandleVTable = struct {
    exec: *const fn (*Handle, Message) Responsum(ResultType),
    close: *const fn (*Handle) void,
};
```

### 3. Dispatcher (Syscall Table)

Routes `ad` calls to handlers based on target pattern:

```
┌──────────────────────┬─────────────────────┬─────────────────┐
│ Pattern              │ Handler             │ Returns         │
├──────────────────────┼─────────────────────┼─────────────────┤
│ fasciculus:lege      │ FileReadHandler     │ Responsum<text> │
│ fasciculus:scribe    │ FileWriteHandler    │ Responsum<void> │
│ caelum:request       │ HttpHandler         │ Responsum<Resp> │
│ caelum:websocket     │ WebSocketHandler    │ Stream<Message> │
│ tempus:dormi         │ SleepHandler        │ Responsum<void> │
│ https://*            │ → caelum:request    │ (rewrite)       │
│ file://*             │ → fasciculus:lege   │ (rewrite)       │
└──────────────────────┴─────────────────────┴─────────────────┘
```

**Compile-time dispatch (Zig):**
```zig
pub fn dispatch(comptime target: []const u8, args: anytype) Responsum(ReturnType(target)) {
    if (comptime std.mem.startsWith(u8, target, "fasciculus:")) {
        return fasciculus.dispatch(target, args);
    } else if (comptime std.mem.startsWith(u8, target, "caelum:")) {
        return caelum.dispatch(target, args);
    } else {
        @compileError("Unknown syscall: " ++ target);
    }
}
```

**Runtime dispatch (TypeScript):**
```typescript
const dispatcher: Record<string, Handler> = {
  'fasciculus:lege': fileReadHandler,
  'fasciculus:scribe': fileWriteHandler,
  'caelum:request': httpHandler,
  // ...
};

async function* dispatch(target: string, ...args: unknown[]): AsyncIterable<Responsum<unknown>> {
  const handler = dispatcher[target] ?? resolvePattern(target);
  yield* handler(...args);
}
```

### 4. Request Correlation

For concurrent operations, every request gets an ID:

```
┌────────────────────────────────────────────────────────────┐
│ Request                                                    │
│ ├── id: u64                                                │
│ ├── target: "caelum:request"                               │
│ └── args: ("https://api.example.com", "GET")               │
├────────────────────────────────────────────────────────────┤
│ Response                                                   │
│ ├── id: u64  (same as request)                             │
│ └── result: Responsum<T>                                   │
└────────────────────────────────────────────────────────────┘
```

The executor tracks pending requests by ID. When I/O completes, the result is routed to the correct waiting state machine.

### 5. Executor

Drives state machines and manages I/O:

**Single-threaded poll loop (Zig):**
```zig
pub fn run(comptime T: type, future: *Future(T)) !T {
    var ctx = ExecutorContext.init();
    defer ctx.deinit();

    while (true) {
        switch (future.poll(&ctx)) {
            .pending => {
                // Wait for any I/O to complete
                const completed = ctx.wait_for_io();
                // Route result to waiting future
                ctx.deliver_result(completed.id, completed.result);
            },
            .ok => |value| return value,
            .err => |e| return error.FaberError,
            .item, .done => unreachable, // single-value future
        }
    }
}
```

**Async wrapper (TypeScript):**
```typescript
async function run<T>(gen: AsyncIterable<Responsum<T>>): Promise<T> {
    for await (const resp of gen) {
        switch (resp.op) {
            case 'ok': return resp.data;
            case 'err': throw new FaberError(resp.code, resp.message);
            case 'pending': continue; // implicit in async iteration
            case 'item': continue;    // collect or ignore
            case 'done': throw new Error('Unexpected done in single-value context');
        }
    }
    throw new Error('Generator ended without result');
}
```

## Compilation Strategy

### TypeScript / Python

Use native async. The nucleus is a thin wrapper:

```fab
ad "fasciculus:lege" ("file.txt") fiet textus pro content { ... }
```

Becomes:
```typescript
const content = await run(dispatch('fasciculus:lege', 'file.txt'));
```

Or with direct codegen (preferred):
```typescript
const content = await fs.readFile('file.txt', 'utf-8');
```

The dispatcher exists for uniformity but can be bypassed for performance.

### Zig / Rust / C++

Compile to state machines. Each `fiet`/`fient` function becomes:

1. **State union** — captures locals at each suspend point
2. **Poll function** — advances state machine, returns `Responsum<T>`
3. **Wrapper function** — returns the future

```fab
functio fetch(textus url) fiet Response {
    ad "caelum:request" (url, "GET") fiet Response pro resp
    redde resp
}
```

Becomes (Zig):
```zig
const FetchState = union(enum) {
    start: struct { url: []const u8 },
    awaiting_request: struct { request_id: u64 },
};

const FetchFuture = struct {
    state: FetchState,

    pub fn poll(self: *FetchFuture, ctx: *ExecutorContext) Responsum(Response) {
        switch (self.state) {
            .start => |s| {
                const id = ctx.submit("caelum:request", .{ s.url, "GET" });
                self.state = .{ .awaiting_request = .{ .request_id = id } };
                return .pending;
            },
            .awaiting_request => |s| {
                if (ctx.get_result(s.request_id, Response)) |resp| {
                    return .{ .ok = resp };
                }
                return .pending;
            },
        }
    }
};

pub fn fetch(url: []const u8) FetchFuture {
    return FetchFuture{ .state = .{ .start = .{ .url = url } } };
}
```

## Syscall Namespaces

Latin names for stdlib modules (matching `ad.md`):

| Namespace | Domain | Example Syscalls |
|-----------|--------|------------------|
| `fasciculus` | Files | `lege`, `scribe`, `tolle`, `movere` |
| `caelum` | Network | `request`, `websocket`, `listen` |
| `tempus` | Time | `dormi`, `nunc`, `intervallum` |
| `memoria` | Memory | `alloca`, `libera` (Zig/Rust/C++) |
| `processus` | Process | `genera`, `occide`, `expecta` |
| `canalis` | Channels | `crea`, `mitte`, `recipe` |
| `aleator` | Random | `numerus`, `bytes`, `uuid` |
| `crypto` | Crypto | `hash`, `signa`, `verifica` |

## Backpressure

For streaming syscalls (`fiunt`/`fient`), the executor implements flow control:

| Constant | Value | Purpose |
|----------|-------|---------|
| `AQUA_ALTA` | 1000 | Pause producing |
| `AQUA_BASSA` | 100 | Resume producing |
| `PULSUS_INTERVALLUM` | 100ms | Consumer liveness check |
| `MORA_MAXIMUM` | 5000ms | Abort if consumer dead |

(Latin: aqua alta = high water, aqua bassa = low water, pulsus = pulse/ping, mora = delay)

## Error Handling

Errors flow through Responsum:

```fab
ad "fasciculus:lege" ("missing.txt") fiet textus pro content {
    scribe content
} cape err {
    scribe "Error: " + err.message
}
```

The `cape` clause catches `.err` responses. Without it, errors propagate to caller.

**Zig codegen:**
```zig
switch (future.poll(&ctx)) {
    .ok => |content| { ... },
    .err => |e| {
        // cape block
        std.debug.print("Error: {s}\n", .{e.message});
    },
    // ...
}
```

## Relationship to Existing Designs

| Document | Relationship |
|----------|--------------|
| `ad.md` | Nucleus provides the runtime that `ad` dispatches to |
| `zig-async.md` | State machine compilation is one strategy within Nucleus |
| `flumina.md` | Responsum protocol originated here; Nucleus generalizes it |
| `two-pass.md` | Liveness analysis feeds into state machine generation |

## Implementation Plan

### Phase 1: Protocol Unification
1. Define `Responsum<T>` for all targets in preamble
2. Standardize syscall table schema
3. Add request ID generation

### Phase 2: TypeScript Runtime
1. Implement dispatcher with pattern matching
2. Wire `ad` codegen to dispatcher
3. Test with file/http syscalls

### Phase 3: Zig Runtime
1. Implement `Handle` vtable pattern
2. Implement `ExecutorContext` with I/O polling
3. State machine codegen for `fiet`/`fient`
4. Syscall handlers for `fasciculus`, `caelum`, `tempus`

### Phase 4: Other Targets
1. Python — similar to TypeScript
2. Rust — state machines like Zig, or native async
3. C++ — coroutines or callback-based

## Open Questions

1. **Allocator threading** — How does Zig's allocator flow through the executor? Per-request? Global?

2. **Cancellation** — When a future is dropped, how do we cancel pending I/O? Add `.cancelled` to Responsum?

3. **Nested composition** — State machine A calls state machine B. Does A store B inline or by pointer?

4. **User-defined syscalls** — Can users register custom handlers in the syscall table?

5. **Direct codegen escape hatch** — For performance-critical paths, bypass the dispatcher entirely?

## References

- `ad.md` — Dispatch syntax design
- `zig-async.md` — Zig-specific state machine details
- `flumina.md` — Original Responsum protocol (TypeScript)
- `two-pass.md` — Semantic analysis for liveness
- Monk OS `AGENTS.md` — Inspiration for Handle/Message/Response patterns
