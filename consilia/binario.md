# Bitwise Operators

## Implementation Status

### Not Yet Implemented

- Tokenizer: `&`, `|`, `^`, `~`, `<<`, `>>`
- Parser: bitwise precedence levels
- Codegen: all targets

**Note:** The `|` symbol is exclusively bitwise OR. Union types use `unio<A, B>` syntax instead. See `unio.md`.

---

## Design Decisions

1. **Symbols only** — no Latin keywords for bitwise ops. `et`/`vel`/`aut`/`non` remain purely logical.
2. **`&` is bitwise AND only** — no reference/address-of semantics (handled by `de`/`in` prepositions).
3. **No compound assignment** — no `&=`, `|=`, `^=`, `<<=`, `>>=`. Consistent with no `+=`, `-=`.
4. **No unsigned shift** — no `>>>`. Faber isn't a systems language.
5. **Bitwise precedence above comparison** — breaks from C tradition, matches Python/Ruby/JS. See Precedence section.

---

## Operators

| Symbol | Operation   |
| ------ | ----------- |
| `&`    | AND         |
| `\|`   | OR          |
| `^`    | XOR         |
| `~`    | NOT (unary) |
| `<<`   | Left shift  |
| `>>`   | Right shift |

---

## Precedence

Bitwise operators are placed **above** comparison operators, breaking from C tradition. This means `flags & MASK == 0` parses as `(flags & MASK) == 0`, which matches intuition.

WHY: C's precedence is a historical accident. Before `&&` existed, `&` was used for logical AND, so `a > 0 & b > 0` needed to work. When `&&` was added, `&` precedence was frozen. Ritchie admitted this was a mistake. Python, Ruby, and JS all fixed it. Faber has no legacy to maintain.

**Bitwise precedence (highest to lowest):**

| Level | Operators   | Associativity |
| ----- | ----------- | ------------- |
| 1     | `~` (unary) | Right         |
| 2     | `<<` `>>`   | Left          |
| 3     | `&`         | Left          |
| 4     | `^`         | Left          |
| 5     | `\|`        | Left          |

**Full precedence table:**

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
equality (==, !=, ===, !==)
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

unary (!, -, ~)
↓
multiplicative (\*, /, %)
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

| Faber    | TS       | Python   | Zig      | Rust     | C++      |
| -------- | -------- | -------- | -------- | -------- | -------- |
| `a & b`  | `a & b`  | `a & b`  | `a & b`  | `a & b`  | `a & b`  |
| `a \| b` | `a \| b` | `a \| b` | `a \| b` | `a \| b` | `a \| b` |
| `a ^ b`  | `a ^ b`  | `a ^ b`  | `a ^ b`  | `a ^ b`  | `a ^ b`  |
| `~a`     | `~a`     | `~a`     | `~a`     | `!a`     | `~a`     |
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

````

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
````

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

## Resolved Questions

1. **Compound assignment:** No. Consistent with no `+=`, `-=`.
2. **Unsigned shift:** No. Not a systems language.
3. **Latin keywords:** No. Symbols only for bitwise.
