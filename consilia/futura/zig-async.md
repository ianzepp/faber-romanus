# Zig Async via Responsum State Machines

Zig removed native async/await in version 0.11. This document describes Faber's approach to async and generators for Zig targets using the Responsum protocol and compiled state machines.

## Syntax Split

Faber has two syntax systems for async/generators. Only verb syntax is supported for Zig:

| Syntax | Zig Support | Notes |
|--------|-------------|-------|
| `futura`/`cursor` + `->` | **Error** | TS/Python only |
| `fit`/`fiet`/`fiunt`/`fient` | **Supported** | Compiles to state machine |

```fab
// Error on Zig target:
futura functio fetch() -> textus { ... }
cursor functio items() -> numerus { ... }

// Supported on all targets including Zig:
functio fetch() fiet textus { ... }
functio items() fiunt numerus { ... }
```

## Responsum Protocol

All verb-syntax functions use the Responsum protocol. Emitted in Zig preamble:

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

| Faber | Responsum Variant | Terminal |
|-------|-------------------|----------|
| `redde x` (in `fit`/`fiet`) | `.ok` | yes |
| `cede x` (in `fiunt`/`fient`) | `.item` | no |
| end of `fiunt`/`fient` | `.done` | yes |
| `iace err` | `.err` | yes |
| suspend point | `.pending` | no |

## State Machine Compilation

Each `fiet`/`fient` function compiles to:
1. A state `union(enum)` capturing locals across suspend points
2. A `poll` function that advances the state machine

### Example

```fab
functio fetchUser(textus url) fiet User {
    fixum resp = cede http.get(url)
    fixum json = cede resp.json()
    redde User.parse(json)
}
```

Compiles to:

```zig
const FetchUserState = union(enum) {
    start: struct { url: []const u8 },
    awaiting_get: struct { url: []const u8 },
    awaiting_json: struct { resp: Response },
};

const FetchUserFuture = struct {
    state: FetchUserState,

    pub fn init(url: []const u8) FetchUserFuture {
        return .{ .state = .{ .start = .{ .url = url } } };
    }

    pub fn poll(self: *FetchUserFuture, ctx: *AsyncContext) Responsum(User) {
        switch (self.state) {
            .start => |s| {
                ctx.submit_io(http.get(s.url));
                self.state = .{ .awaiting_get = .{ .url = s.url } };
                return .pending;
            },
            .awaiting_get => |s| {
                const resp = ctx.get_result(Response);
                ctx.submit_io(resp.json());
                self.state = .{ .awaiting_json = .{ .resp = resp } };
                return .pending;
            },
            .awaiting_json => |s| {
                const json = ctx.get_result(Json);
                return .{ .ok = User.parse(json) };
            },
        }
    }
};

pub fn fetchUser(url: []const u8) FetchUserFuture {
    return FetchUserFuture.init(url);
}
```

## State Variants

Each state variant captures the variables live at that suspend point:

| Suspend Point | Captured Variables |
|---------------|-------------------|
| `start` | function parameters |
| after `cede` N | params + locals assigned before suspend N |

The compiler performs liveness analysis to minimize captured state.

## Generators (`fiunt`/`fient`)

Generators follow the same pattern but yield `.item` multiple times:

```fab
functio range(numerus n) fiunt numerus {
    varia i = 0
    dum i < n {
        cede i
        i = i + 1
    }
}
```

```zig
const RangeState = union(enum) {
    init: struct { n: i64 },
    yielding: struct { n: i64, i: i64 },
    done,
};

const RangeIterator = struct {
    state: RangeState,

    pub fn next(self: *RangeIterator) Responsum(i64) {
        switch (self.state) {
            .init => |s| {
                self.state = .{ .yielding = .{ .n = s.n, .i = 0 } };
                return self.next();
            },
            .yielding => |s| {
                if (s.i < s.n) {
                    const value = s.i;
                    self.state = .{ .yielding = .{ .n = s.n, .i = s.i + 1 } };
                    return .{ .item = value };
                }
                self.state = .done;
                return .done;
            },
            .done => return .done,
        }
    }
};
```

## Async Context

The `AsyncContext` provides I/O scheduling. Options for implementation:

| Approach | Library | Notes |
|----------|---------|-------|
| `std.io.poll` | stdlib | Basic, limited |
| `libxev` | external | Production-quality event loop |
| `zig-aio` | external | io_uring focused |
| Custom | — | Faber-specific minimal executor |

Minimal interface:

```zig
const AsyncContext = struct {
    pub fn submit_io(self: *AsyncContext, op: IoOp) void { ... }
    pub fn get_result(self: *AsyncContext, comptime T: type) T { ... }
    pub fn wait_for_io(self: *AsyncContext) void { ... }
};
```

## Executor

Simple executor for running futures:

```zig
pub fn block_on(comptime T: type, future: anytype) !T {
    var ctx = AsyncContext.init();
    defer ctx.deinit();

    var f = future;
    while (true) {
        switch (f.poll(&ctx)) {
            .pending => ctx.wait_for_io(),
            .ok => |v| return v,
            .err => |e| return error.FaberError,
            .item => unreachable, // single-value future
            .done => unreachable,
        }
    }
}
```

## Relationship to discretio

The state machine `union(enum)` is structurally identical to `discretio`:

```fab
// User-defined discretio
discretio Event {
    Click { numerus x, numerus y }
    Quit
}

// Compiler-generated for async
discretio FetchState {
    Start { textus url }
    AwaitingGet { textus url }
    Done { User result }
}
```

Both compile to Zig `union(enum)`. The async codegen can reuse `discretio` infrastructure.

## Error Handling

| Faber | State Machine Behavior |
|-------|----------------------|
| `iace err` | Return `.{ .err = .{ .code = ..., .message = ... } }` |
| `mori err` | `@panic(...)` (immediate, no state transition) |
| Called function errors | Propagate via Responsum |

## Implementation Plan

1. **Preamble**: Add `Responsum(T)` and `AsyncContext` to Zig preamble
2. **AST**: Identify `fiet`/`fient` functions for state machine transform
3. **Analysis**: Compute suspend points and liveness for each
4. **Codegen**: Emit state union + poll function per async function
5. **Executor**: Provide minimal `block_on` in stdlib or preamble
6. **I/O**: Integrate with chosen event loop library

## Target Validation

At semantic analysis, reject arrow-syntax async for Zig:

```
Error P192: `futura` with `->` not supported for Zig target. Use `fiet` instead.
Error P193: `cursor` with `->` not supported for Zig target. Use `fiunt` instead.
```

## References

- `flumina.md` — Responsum protocol design (TS implementation)
- `unio.md` — `discretio` to `union(enum)` compilation
- `two-pass.md` — Liveness analysis for captured variables
