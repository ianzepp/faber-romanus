---
status: historical
note: Deprecated designs kept for reference; do not implement
updated: 2024-12
---

# Obsoleta - Deprecated Designs

Design concepts that were considered but superseded by other approaches.

---

## fors<T> — Result Type

**Status:** Obsolete

**What it was:** A result type similar to Rust's `Result<T, E>`, referenced in early stdlib docs (caelum.md, codex.md) as "the standard `fors` result type."

**Why obsolete:** The `iace`/`mori`/`cape` error model supersedes this:

| Keyword | Meaning              | TS/Python        | Rust/Zig                             |
| ------- | -------------------- | ---------------- | ------------------------------------ |
| `iace`  | Recoverable error    | `throw`          | `return Err(...)` / `return error.X` |
| `mori`  | Fatal, unrecoverable | N/A (or `throw`) | `panic!` / `@panic`                  |
| `cape`  | Catch errors         | `catch`          | `match` / `catch \|err\|`            |

The compiler handles the translation:

- **TypeScript/Python:** `iace` compiles to `throw`, `cape` to `catch`
- **Rust:** Functions with `iace` return `Result<T, FaberError>`, call sites get `?` inserted
- **Zig:** Functions with `iace` return `!T` error union, call sites get `try` inserted

Since error semantics are encoded in the keywords (`iace` vs `mori`) and the compiler generates appropriate target code, an explicit `fors<T>` type annotation is unnecessary.

**References removed from:**

- caelum.md
- codex.md
