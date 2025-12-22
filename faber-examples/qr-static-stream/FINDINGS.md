# QR Static Stream - Compiler Findings

Attempt to port `qr-static-stream` Python project to Faber Romanus.

## Goal

Stress-test the compiler with a real algorithm to find breaking points.

## Blockers Found

### 1. Array Literals Not Implemented (Critical)

The parser has no handler for `[` in expressions. Array literals like `[1, 2, 3]` or `[]` fail with "Unexpected token: [".

**Location:** `src/parser/index.ts` - `parsePrimary()` function has no `LBRACKET` case.

**Impact:** Cannot express the QR static algorithm at all. The algorithm requires:
- Creating empty arrays: `esto frame = []`
- Nested arrays: `[[1, 0], [0, 1]]`
- Array accumulation via loops

**Fix needed:** Add array literal parsing to `parsePrimary()`:
```typescript
if (match('LBRACKET')) {
    // Parse array elements
    const elements: Expression[] = [];
    if (!check('RBRACKET')) {
        do {
            elements.push(parseExpression());
        } while (match('COMMA'));
    }
    expect('RBRACKET', "Expected ']'");
    return { type: 'ArrayExpression', elements, position };
}
```

### 2. No Runtime Array Constructors

Even without literals, there's no way to create arrays. `Array()`, `Lista()`, and `novum Lista()` all fail.

**Impact:** No workaround for blocker #1.

## Other Issues Found

### 3. Functions Default to Vacuum Return Type

Functions without explicit return type annotation are inferred as `Vacuum` (void). Then `redde` with a value fails semantic analysis.

**Example that fails:**
```la
functio add(a, b) {
  redde a + b  // Error: Numerus not assignable to Vacuum
}
```

**Workaround:** Always specify return type with arrow syntax:
```la
functio add(a, b) -> Numerus {
  redde a + b
}
```

**Consider:** Perhaps infer return type from `redde` expressions?

### 5. Type Aliases Not Recognized in Parameters

User-defined `typus` aliases like `typus Matrix = Lista<Lista<Numerus>>` are not recognized in parameter position. Only builtin types (in `BUILTIN_TYPE_NAMES` set) work.

**Location:** `src/parser/index.ts` - `isTypeName()` only checks builtins.

## What Works

- Variable declarations (`esto`, `fixum`)
- Functions with explicit return types
- Control flow (`si`, `aliter`, `dum`, `pro...in`)
- Basic arithmetic and comparison operators
- Member access (`obj.prop`, `arr[i]`)
- Method calls (`arr.push(x)`, `str.length`)
- Logical operators (`et`, `aut`, `non`)
- Error handling (`tempta`/`cape`/`demum`, `iace`)

## Minimal Working Example

```la
functio salve(nomen) -> Textus {
  redde "Salve, " + nomen + "!"
}

functio add(a, b) -> Numerus {
  redde a + b
}

fixum greeting = salve("Mundus")
scribe(greeting)
scribe(add(2, 3))
```

Compiles to:
```typescript
function salve(nomen): string {
  return (("Salve, " + nomen) + "!");
}
function add(a, b): number {
  return (a + b);
}
const greeting = salve("Mundus");
console.log(greeting);
console.log(add(2, 3));
```

## Next Steps

1. **Add array literal parsing** - This unblocks the entire use case
2. **Add ArrayExpression to AST types** - New node type needed
3. **Add array codegen** - Emit `[]` in TypeScript output
4. **Update examples** - Fix syntax to match actual parser
5. **Consider return type inference** - Would improve ergonomics
