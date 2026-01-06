# norma-faber - Standard Library in Faber Source

Define the standard library as Faber source files with codegen annotations, replacing scattered TypeScript registries.

## Problem

Current stdlib implementation:

1. **Scattered registries**: `fons/faber/codegen/lista.ts`, `tabula.ts`, etc. define method translations
2. **Not self-documenting**: The API lives in TypeScript, not Faber
3. **Morphology is ad-hoc**: No formal declaration of valid verb forms
4. **N x M sprawl**: Each method needs entries for each target

## Solution

Define stdlib in `fons/norma/*.fab` files with annotations:

| Annotation | Purpose |
|------------|---------|
| `@ innatum` | Maps genus to native types per target |
| `@ subsidia` | External implementation file for complex cases |
| `@ radix` | Declares morphology stem and valid forms |
| `@ verte` | Codegen transformation per target |

---

## Morphology Split: Fake vs Real

**Collections (lista, tabula, copia)**: Fake morphology
- All method variants defined explicitly
- `@ radix` declares valid forms for validation only
- Compiler does NOT generate variants
- Different implementations for `filtra` vs `filtrata`

**IO (solum, caelum, arca)**: Real morphology
- Base form defined (async generator)
- Compiler generates derived forms
- `leget()` = collect `legens()`
- `lege()` = await collect `legens()`

```
Collections:  filtra ≠ filtrata  (different algorithms)
IO:           lege = await(leget()) = await(collect(legens()))
```

---

## Annotation Syntax

### `@ innatum` - Native Type Mapping

```faber
@ innatum ts "Array", py "list", rs "Vec", cpp "std::vector", zig "Lista"
genus lista<T> { }
```

### `@ subsidia` - External Implementation

```faber
@ subsidia zig "subsidia/zig/lista.zig"
@ subsidia rs "subsidia/rs/lista.rs"
genus lista<T> { }
```

When a method has no `@ verte` for a target, compiler:
1. Includes the subsidia file in preamble/imports
2. Emits direct method call to the implementation

### `@ radix` - Morphology Declaration

```faber
@ radix filtr, imperativus, perfectum
functio filtra<T>(...) fit vacuum
functio filtrata<T>(...) fit lista<T>
```

For collections: validation only (rejects undefined forms like `filtratura`).
For IO: compiler generates derived forms from base.

### `@ verte` - Codegen Transformation

Simple method rename:
```faber
@ verte ts "push"
@ verte py "append"
```

Template with `§` placeholders (positional):
```faber
@ verte ts (ego, elem) -> "[...§, §]"
@ verte py (ego, pred) -> "list(filter(§, §))"
```

Zig with allocator (always last parameter when present):
```faber
@ verte zig (ego) -> "§.longitudo()"           # no alloc
@ verte zig (ego, elem, alloc) -> "§.adde(§, §)"    # with alloc
@ verte zig (ego, pred, alloc) -> "§.filtrata(§, §)"
```

---

## Example: lista.fab

```faber
# fons/norma/lista.fab
# Standard library lista<T> definition

# ============================================================================
# TYPE & EXTERNAL IMPLEMENTATIONS
# ============================================================================

@ innatum ts "Array", py "list", rs "Vec", cpp "std::vector", zig "Lista"
@ subsidia zig "subsidia/zig/lista.zig"
genus lista<T> { }

# ============================================================================
# ADDING ELEMENTS
# ============================================================================

@ radix add, imperativus, perfectum
@ verte ts "push"
@ verte py "append"
@ verte rs "push"
@ verte cpp "push_back"
@ verte zig (ego, elem, alloc) -> "§.adde(§, §)"
functio adde<T>(ego lista<T>, elem: T) fit vacuum

@ verte ts (ego, elem) -> "[...§, §]"
@ verte py (ego, elem) -> "[*§, §]"
@ verte rs (ego, elem) -> "{ let mut v = §.clone(); v.push(§); v }"
@ verte cpp (ego, elem) -> "[&]{ auto v = §; v.push_back(§); return v; }()"
@ verte zig (ego, elem, alloc) -> "§.addita(§, §)"
functio addita<T>(ego lista<T>, elem: T) fit lista<T>

# ============================================================================
# REMOVING ELEMENTS
# ============================================================================

@ radix remov, imperativus, perfectum
@ verte ts "pop"
@ verte py "pop"
@ verte rs (ego) -> "§.pop()"
@ verte cpp (ego) -> "[&]{ auto v = §.back(); §.pop_back(); return v; }()"
@ verte zig (ego) -> "§.remove()"
functio remove<T>(ego lista<T>) fit T?

@ verte ts (ego) -> "§.slice(0, -1)"
@ verte py (ego) -> "§[:-1]"
@ verte rs (ego) -> "§[..§.len().saturating_sub(1)].to_vec()"
@ verte zig (ego, alloc) -> "§.remota(§)"
functio remota<T>(ego lista<T>) fit lista<T>

# ============================================================================
# FUNCTIONAL METHODS
# ============================================================================

@ radix filtr, imperativus, perfectum
@ verte ts (ego, pred) -> "(() => { for (let i = §.length - 1; i >= 0; i--) { if (!(§)(§[i])) §.splice(i, 1); } })()"
@ verte py (ego, pred) -> "§[:] = [x for x in § if (§)(x)]"
@ verte cpp (ego, pred) -> "§.erase(std::remove_if(§.begin(), §.end(), [&](auto& x) { return !(§)(x); }), §.end())"
functio filtra<T>(ego lista<T>, praedicatum: functio(T) fit bivalens) fit vacuum

@ verte ts "filter"
@ verte py (ego, pred) -> "list(filter(§, §))"
@ verte rs (ego, pred) -> "§.iter().filter(§).cloned().collect::<Vec<_>>()"
@ verte cpp (ego, pred) -> "(§ | std::views::filter(§) | std::ranges::to<std::vector>())"
@ verte zig (ego, pred, alloc) -> "§.filtrata(§, §)"
functio filtrata<T>(ego lista<T>, praedicatum: functio(T) fit bivalens) fit lista<T>

@ radix ordin, imperativus, perfectum
@ verte ts "sort"
@ verte py "sort"
@ verte rs "sort"
@ verte cpp (ego) -> "std::ranges::sort(§)"
@ verte zig (ego) -> "§.ordina()"
functio ordina<T>(ego lista<T>) fit vacuum

@ verte ts (ego) -> "[...§].sort()"
@ verte py (ego) -> "sorted(§)"
@ verte rs (ego) -> "{ let mut v = §.clone(); v.sort(); v }"
@ verte cpp (ego) -> "[&]{ auto v = §; std::ranges::sort(v); return v; }()"
@ verte zig (ego, alloc) -> "§.ordinata(§)"
functio ordinata<T>(ego lista<T>) fit lista<T>

# ============================================================================
# PROPERTIES (no morphology)
# ============================================================================

@ verte ts (ego) -> "§.length"
@ verte py (ego) -> "len(§)"
@ verte rs (ego) -> "§.len()"
@ verte cpp (ego) -> "§.size()"
@ verte zig (ego) -> "§.longitudo()"
functio longitudo<T>(ego lista<T>) fit numerus

@ verte ts (ego) -> "§.length === 0"
@ verte py (ego) -> "len(§) == 0"
@ verte rs (ego) -> "§.is_empty()"
@ verte cpp (ego) -> "§.empty()"
@ verte zig (ego) -> "§.vacua()"
functio vacua<T>(ego lista<T>) fit bivalens

# ============================================================================
# AGGREGATION
# ============================================================================

@ verte ts (ego) -> "§.reduce((a, b) => a + b, 0)"
@ verte py (ego) -> "sum(§)"
@ verte rs (ego) -> "§.iter().sum::<i64>()"
@ verte cpp (ego) -> "std::accumulate(§.begin(), §.end(), decltype(§[0]){})"
@ verte zig (ego) -> "§.summa()"
functio summa<T>(ego lista<T>) fit T
```

---

## File Structure

```
fons/
  norma/
    lista.fab        # lista<T> definition + codegen
    tabula.fab       # tabula<K,V> definition + codegen
    copia.fab        # copia<T> definition + codegen
    solum.fab        # Filesystem IO (real morphology)
    caelum.fab       # Network IO (real morphology)
    arca.fab         # Database IO (real morphology)

  subsidia/
    zig/
      lista.zig      # Zig implementation (Latin-named wrapper)
      tabula.zig
      copia.zig
    rs/
      lista.rs       # Future: Rust implementation
```

---

## Compiler Flow

```
fons/norma/lista.fab
        │
        ▼
   Parse annotations
        │
        ├── @ innatum  → type registry
        ├── @ subsidia → preamble/import registry
        ├── @ radix    → morphology registry (validation)
        └── @ verte    → codegen registry

At call site:

    items.filtrata(pred)
           │
           ▼
    Validate: "filtrata" is valid form for radix "filtr" ✓
           │
           ▼
    Look up @ verte for target
           │
           ▼
    Emit: items.filter(pred)           // ts
    Emit: list(filter(pred, items))    // py
    Emit: items.filtrata(alloc, pred)  // zig
```

---

## Implementation Plan

Both compilers (Faber and Rivus) implement support in parallel phases.

### Phase 1: Annotation Parsing

| Faber | Rivus |
|-------|-------|
| Parse `@ innatum`, `@ subsidia`, `@ radix`, `@ verte` | Same |
| Store in AST annotation nodes | Same |
| Add to existing annotation infrastructure | Add to existing annotation infrastructure |

**Deliverable:** Both compilers parse all four annotation types without errors.

### Phase 2: Write norma/*.fab Files

Shared work (not compiler-specific):

- Create `fons/norma/lista.fab` with full annotation coverage
- Create `fons/norma/tabula.fab`
- Create `fons/norma/copia.fab`
- Validate syntax parses in both compilers

**Deliverable:** Complete stdlib definitions in Faber source.

### Phase 3: Registry Loading

| Faber | Rivus |
|-------|-------|
| Load `norma/*.fab` at startup | Same |
| Build `@ innatum` → type registry | Same |
| Build `@ subsidia` → preamble registry | Same |
| Build `@ verte` → codegen registry | Same |
| Build `@ radix` → morphology registry | Integrate with existing `morphologia.fab` |

**Deliverable:** Both compilers build internal registries from norma files.

### Phase 4: Codegen Integration

| Faber | Rivus |
|-------|-------|
| Replace `fons/faber/codegen/lista.ts` with registry lookups | Wire codegen to use registries |
| Replace `tabula.ts`, `copia.ts` similarly | Same |
| Delete old TypeScript registry files | N/A (no TS registries) |
| All targets: ts, py, rs, cpp, zig | Start with ts, expand |

**Deliverable:** Method calls use `@ verte` templates from norma files.

### Phase 5: Morphology Validation

| Faber | Rivus |
|-------|-------|
| Add `@ radix` validation at call sites | Already has `parseMethodum()` - integrate |
| Error on undefined forms | Same |
| Port morphology logic from Rivus? | Morphology is source of truth |

**Deliverable:** `items.filtratura(pred)` errors if `futurum_activum` not in `@ radix`.

### Phase 6: Subsidia Fallback

| Faber | Rivus |
|-------|-------|
| When no `@ verte` for target, check `@ subsidia` | Same |
| Include subsidia file in preamble | Same |
| Emit direct method call | Same |

**Deliverable:** Complex methods delegate to target-language implementations.

### Phase 7: Real Morphology (IO) - Future

| Faber | Rivus |
|-------|-------|
| Async generator support all targets | Same |
| Compiler generates derived forms from base | Same |
| `leget()` = collect `legens()` | Same |
| `lege()` = await collect | Same |

**Prerequisite:** `fient` (async generator return) working across all targets.

**Deliverable:** IO stdlib (solum, caelum, arca) with real morphology.

---

## Progress

### Completed

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Annotation Parsing | ✅ Complete | Both Faber and Rivus parse all four annotations |
| Vertical Slice | ✅ Complete | `adde`/`addita` working via norma registry |

### Vertical Slice Details (commit b5f9ef7)

Proved architecture end-to-end:

1. **`fons/norma/lista.fab`** - Annotation source (currently minimal)
2. **`fons/faber/codegen/norma-registry.ts`** - Hardcoded registry (avoids circular dep with parser)
3. **`fons/faber/codegen/ts/expressions/call.ts`** - Checks norma first, falls back to LISTA_METHODS

Verified output:
```
items.adde(4)   → items.push(4)      # ts
                → items.append(4)    # py

items.addita(4) → [...items, 4]      # ts
                → [*items, 4]        # py
```

### Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ fons/norma/lista.fab          (source of truth - annotations)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (manual sync for now)
┌─────────────────────────────────────────────────────────────────┐
│ fons/faber/codegen/norma-registry.ts    (hardcoded registry)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ fons/faber/codegen/*/expressions/call.ts  (codegen lookup)     │
│   - Check norma registry first                                  │
│   - Fall back to LISTA_METHODS (hardcoded TypeScript)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current State

| Component | Faber | Rivus |
|-----------|-------|-------|
| Annotation parsing | ✅ Yes | ✅ Yes |
| Morphology parsing | No | Yes (`morphologia.fab`) |
| Codegen registries | Hybrid (norma + TS fallback) | Basic |
| Multi-target codegen | ts, py, rs, cpp, zig | ts |
| subsidia/zig/*.zig | Yes | No |
| norma-registry wired | ts only | No |

---

## Next: Full lista<> Migration

Migrate all 53 lista methods from hardcoded `lista.ts` to annotation-driven `norma-registry.ts`.

### Approach

**Option A: Continue hardcoding** (chosen for now)
- Manually add each method to `norma-registry.ts`
- Tedious but straightforward, no new tooling
- Can parallelize: registry expansion + target wiring

**Option B: Build-time generation** (future)
- Script parses `norma/lista.fab` → generates `norma-registry.ts`
- Cleaner long-term, but adds build complexity
- Blocked by: need to avoid circular dependency with parser

### Tasks

#### 1. Expand norma-registry.ts (~53 methods)

Group methods by category for systematic migration:

| Category | Methods | Count |
|----------|---------|-------|
| Adding | adde, addita, praepone, praeposita | 4 |
| Removing | remove, remota, decapita, decapitata, purga | 5 |
| Accessing | primus, ultimus, accipe, toSlice | 4 |
| Properties | longitudo, vacua | 2 |
| Searching | continet, indiceDe, inveni, inveniIndicem | 4 |
| Predicates | omnes, aliquis | 2 |
| Functional | filtrata, mappata, reducta, explanata, plana, inversa, ordinata, sectio, prima, ultima, omitte | 11 |
| Mutating | filtra, ordina, inverte | 3 |
| Iteration | perambula, coniunge | 2 |
| Aggregation | summa, medium, minimus, maximus, minimusPer, maximusPer, numera | 7 |
| Lodash-style | congrega, unica, planaOmnia, fragmenta, densa, partire, misce, specimen, specimina | 9 |
| **Total** | | **53** |

#### 2. Wire remaining targets

Currently only `ts/expressions/call.ts` checks norma registry. Add same pattern to:

- [ ] `py/expressions/call.ts`
- [ ] `rs/expressions/call.ts`
- [ ] `cpp/expressions/call.ts`
- [ ] `zig/expressions/call.ts`

#### 3. Test coverage

For each method, verify:
- Simple form works (method rename)
- Template form works (§ substitution)
- All 5 targets produce valid code

#### 4. Deprecate lista.ts

Once all methods are in norma-registry:
- Remove fallback to `LISTA_METHODS` in call.ts files
- Delete or archive `fons/faber/codegen/lista.ts`

### Execution Strategy

**Parallel workstreams:**

```
Stream A: Registry expansion          Stream B: Target wiring
─────────────────────────────         ────────────────────────
Add methods to norma-registry.ts      Wire py/call.ts
  (batch by category)                 Wire rs/call.ts
                                      Wire cpp/call.ts
                                      Wire zig/call.ts
```

**Suggested order:**
1. Wire all 5 targets with current 2 methods (adde, addita)
2. Expand registry one category at a time
3. Test each category across all targets before moving on

---

## Open Questions

1. **Error messages**: When `@ verte` missing for a target, what error? Suggest adding annotation?

2. **Variadic args**: How to handle methods with optional/variadic parameters in templates?

3. **Generic transforms**: Can `@ verte` templates reference type parameters? `"Vec<§T>()"` ?

4. **Inheritance**: If `tabula` extends `lista` behavior, can annotations be inherited?

5. **Testing**: How to test that `@ verte` templates produce valid target code?

---

## Related Documents

- `consilia/morphologia.md` - Verb conjugation as semantic dispatch
- `consilia/futura/stdlib-refactor.md` - Current refactor status
- `consilia/futura/innatum.md` - Native type construction keyword
