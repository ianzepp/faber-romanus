# Rivus Exempla Failures

Status: 65/82 exempla compile successfully with rivus. 17 failures in 3 categories.

## Category A: tabula construction (11 files)

**Root cause**: No syntax exists to construct native builtin types. The rivus source uses `{} qua tabula<K,V>` but `qua` is a cast, not a constructor. Casting `{}` to Map doesn't give it Map methods.

**Solution**: Add `innatum` keyword for native type construction.

```fab
# Old (broken) - cast doesn't construct
varia agri = {} qua tabula<textus, SemanticTypus>

# New - innatum constructs native type
varia agri = {} innatum tabula<textus, SemanticTypus>
```

**Codegen output by target**:

| Target | `{} innatum tabula<K,V>` |
|--------|--------------------------|
| TypeScript | `new Map<K, V>()` |
| Python | `{}` (dict) |
| Rust | `HashMap::new()` |
| Zig | `std.AutoHashMap(K, V).init(allocator)` |
| C++ | `std::map<K, V>{}` |

**Implementation steps**:
1. Add `innatum` to lexer keywords
2. Parse `expression 'innatum' typeAnnotation` as new AST node (e.g., `InnatumExpression`)
3. Semantic: validate literal matches target type (empty object for tabula, empty array for lista)
4. Codegen: emit native constructor per target
5. Update rivus source: change `qua` to `innatum` for tabula/lista construction

**Affected exempla** (any file using genus/discretio/ordo/pactum triggers this in rivus semantic analyzer):
- statements/genus/basic.fab
- statements/genus/creo.fab
- statements/genus/methods.fab
- statements/ordo/basic.fab
- statements/discretio/basic.fab
- statements/discerne/basic.fab
- statements/pactum/basic.fab
- statements/importa-local/utils.fab
- expressions/novum.fab
- expressions/finge.fab
- expressions/call.fab

**Error pattern**:
```
TypeError: agri.set is not a function
TypeError: campi.set is not a function
TypeError: membra.set is not a function
TypeError: methodi.set is not a function
```

## Category B: rivus parser gaps (5 files)

### B1: `si ... ergo` single-line conditionals (2 files)

**Root cause**: Rivus parser expects `{` after condition, doesn't support `si cond ergo stmt`.

**Fix location**: `fons/rivus/parser/` - add ergo handling.

- statements/si.fab
- statements/si/ergo.fab

**Error**: `Expected '{': got 'scribe'`

### B2: `est verum` / `est falsum` (3 files)

**Root cause**: Rivus parser expects type name after `est`, doesn't recognize `verum`/`falsum` as valid.

**Fix location**: `fons/rivus/parser/` - handle boolean literals in `est` expressions.

- expressions/est.fab
- statements/si/est.fab
- statements/si.fab (also has B1 issues)

**Error**: `Expected type name: got 'verum'`

### B3: Bitwise operators (1 file)

**Root cause**: Rivus parser doesn't support `&`, `|`, `^`, `<<`, `>>`.

**Fix location**: `fons/rivus/parser/` - add bitwise operator precedence.

- expressions/binary.fab

**Error**: `Expected expression: got '&'`

## Category C: rivus semantic gaps (1 file)

### C1: Import resolution

**Root cause**: Rivus semantic analyzer doesn't resolve symbols from imports.

**Fix location**: `fons/rivus/semantic/` - implement import symbol resolution.

- statements/importa-local/main.fab

**Error**: `Undefined variable 'greet'`, `Undefined variable 'ANSWER'`

## Priority

1. **A (tabula codegen)** - Highest priority. Blocks 11/17 failures. Single fix in faber.
2. **B1 (si...ergo)** - Medium. Common syntax pattern.
3. **B2 (est verum/falsum)** - Medium. Common pattern for boolean checks.
4. **B3 (bitwise)** - Low. Rarely used.
5. **C1 (imports)** - Low. Only affects multi-file exempla.

## Verification

After fixes, run:
```
bun run build:exempla
```

Target: 82/82 exempla compile and typecheck.
