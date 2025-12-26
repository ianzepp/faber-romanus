# Bitwise Operators

## Implementation Status

### Not Yet Implemented

- Tokenizer: `&`, `|`, `^`, `~`, `<<`, `>>`
- Parser: bitwise precedence levels
- Codegen: all targets

**Note:** The `|` symbol is exclusively bitwise OR. Union types use `unio<A, B>` syntax instead. See `unio.md`.

---

## Operators

| Symbol | Operation | Latin | Etymology |
|--------|-----------|-------|-----------|
| `&` | AND | `et` (existing) | "and" — shared bits |
| `\|` | OR | `vel` (existing) | "or" — combined bits |
| `^` | XOR | `aut` | "either/or" — exclusive |
| `~` | NOT | `non` (existing) | "not" — inverted bits |
| `<<` | Left shift | `sinister` | "left" |
| `>>` | Right shift | `dexter` | "right" |

**Note:** `et`, `vel`, `non` already exist as logical operators. Context (operand types) determines logical vs bitwise interpretation — same as Rust's `!` operator.

---

## Precedence

Following C/Rust/Zig precedence (highest to lowest):

| Level | Operators | Associativity |
|-------|-----------|---------------|
| 1 | `~` (unary) | Right |
| 2 | `<<` `>>` | Left |
| 3 | `&` | Left |
| 4 | `^` | Left |
| 5 | `\|` | Left |

**Relative to existing operators:**

```
unary (!, -, ~)
  ↓
multiplicative (*, /, %)
  ↓
additive (+, -)
  ↓
shift (<<, >>)
  ↓
bitwise AND (&)
  ↓
bitwise XOR (^)
  ↓
bitwise OR (|)
  ↓
comparison (<, >, <=, >=)
  ↓
equality (==, !=)
  ↓
logical AND (&&, et)
  ↓
logical OR (||, aut)
  ↓
nullish (vel, ??)
  ↓
ternary (?:)
  ↓
assignment (=)
```

---

## Target Mappings

All targets use identical syntax:

| Faber | TS | Python | Zig | Rust | C++ |
|-------|----|----|-----|------|-----|
| `a & b` | `a & b` | `a & b` | `a & b` | `a & b` | `a & b` |
| `a \| b` | `a \| b` | `a \| b` | `a \| b` | `a \| b` | `a \| b` |
| `a ^ b` | `a ^ b` | `a ^ b` | `a ^ b` | `a ^ b` | `a ^ b` |
| `~a` | `~a` | `~a` | `~a` | `!a` | `~a` |
| `a << b` | `a << b` | `a << b` | `a << b` | `a << b` | `a << b` |
| `a >> b` | `a >> b` | `a >> b` | `a >> b` | `a >> b` | `a >> b` |

**Rust exception:** Bitwise NOT uses `!` instead of `~`. Codegen must transform.

---

## Examples

```
// Masking
fixum masked = value & 0xFF

// Setting flags
fixum flags = READ | WRITE | EXECUTE

// Toggling bits
fixum toggled = flags ^ WRITE

// Inverting
fixum inverted = ~mask

// Shifting
fixum doubled = value << 1
fixum halved = value >> 1

// Combining
fixum result = (a & 0x0F) | ((b & 0x0F) << 4)
```

---

## Implementation Notes

### Tokenizer

New token types needed:

```typescript
| 'AMPERSAND'      // &
| 'CARET'          // ^
| 'TILDE'          // ~
| 'LEFT_SHIFT'     // <<
| 'RIGHT_SHIFT'    // >>
```

Note: `PIPE` already exists and becomes purely bitwise OR. No disambiguation needed — union types use `unio<A, B>` generic syntax.

### Parser

New precedence levels between additive and comparison:

```
fixum flags = READ | WRITE | EXECUTE
fixum masked = value & 0xFF
fixum shifted = bits << 4
```

### Semantic Analysis

Type checking:
- Operands must be integer types (`numerus`, `magnus`)
- Shift amount must be non-negative integer
- Result type matches operand type

### Codegen

Direct passthrough for all targets except:
- **Rust:** Transform `~` to `!`

---

## Open Questions

1. **Compound assignment:** Should `&=`, `|=`, `^=`, `<<=`, `>>=` be supported?
2. **Unsigned shift:** TypeScript has `>>>` for unsigned right shift. Needed?
3. **Latin keywords:** Should `sinister`/`dexter` be added as shift alternatives, or keep symbols only?
