# Known Issues & Future Work

## Zig Codegen

### String Concatenation

Zig doesn't support `+` for string concatenation. It uses:
- `++` for comptime string concatenation
- `std.mem.concat` or allocators for runtime concatenation

Without type information at codegen time, we can't distinguish string `+` from numeric `+`. Code like `"Salve, " + nomen` will generate invalid Zig.

**Workaround:** Use `std.fmt` for string formatting instead of concatenation.

**Fix:** Add type tracking to the codegen phase.

### Print Format Specifiers

`scribe()` maps to `std.debug.print()` with `{any}` format. This works but:
- Strings display as byte arrays: `{ 72, 101, 108, 108, 111 }` instead of `Hello`
- Proper string display needs `{s}` format specifier

**Fix:** Track variable types to emit correct format specifiers.

## Parser

### Array Literals

Array literal syntax `[1, 2, 3]` is not yet implemented.

### Return Type Annotations

Function return type syntax `functio f(): Textus` is not yet implemented.

### Generic Type Parameters

Generic syntax like `Lista<Textus>` parses but `Tabula<Textus, Numerus>` (multiple params) needs testing.
