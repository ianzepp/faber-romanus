# Verba - Faber Reserved Keywords

Consolidated reference for all reserved words in the Faber language. This document is the authoritative source; compiler implementations must stay synchronized.

**Implementation files:**
- `fons/faber/lexicon/keywords.ts` - TypeScript compiler
- `fons/rivus/lexicon/verba.fab` - Bootstrap compiler

---

## Control Flow (Imperium)

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `si` | if | Conditional branch |
| `sin` | else if | Chained conditional |
| `secus` | else | Default branch; also `:` in ternary |
| `dum` | while | Loop while condition holds |
| `fac` | do | Do-while loop prefix |
| `pro` | for | Loop variable binding (with `ex`/`de`) |
| `elige` | switch | Value-based branching |
| `casu` | case | Branch within `elige` |
| `ceterum` | default | Fallback branch in `elige` |
| `ergo` | then | Consequence marker |
| `rumpe` | break | Exit loop |
| `perge` | continue | Skip to next iteration |
| `redde` | return | Return value from function |
| `reddit` | then return | Sugar for `ergo redde` |
| `custodi` | guard | Early-exit guard clause |
| `adfirma` | assert | Runtime assertion |
| `discerne` | match | Pattern matching on `discretio` |
| `incipit` | main | Program entry point |
| `incipiet` | async main | Async program entry point |

---

## Testing (Proba)

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `probandum` | describe | Test suite declaration (gerundive) |
| `proba` | test/it | Individual test case (imperative) |
| `praepara` | beforeEach | Test setup |
| `praeparabit` | async beforeEach | Async test setup |
| `postpara` | afterEach | Test teardown |
| `postparabit` | async afterEach | Async test teardown |
| `omitte` | skip | Skip this test |
| `futurum` | todo | Pending/todo test |
| `omnia` | all | With `praepara`/`postpara` for beforeAll/afterAll |

---

## Error Handling (Errores)

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `tempta` | try | Begin error-handling block |
| `cape` | catch | Handle error |
| `demum` | finally | Cleanup block |
| `iace` | throw | Throw recoverable error |
| `mori` | panic | Fatal/unrecoverable error |

---

## Resource Management (Cura)

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `cura` | care | Scoped resource management |
| `arena` | arena | Arena allocator kind |
| `page` | page | Page allocator kind |

---

## I/O and Debug

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `scribe` | print | Write to stdout |
| `vide` | debug | Debug output |
| `mone` | warn | Warning output |
| `lege` | read | Read input |
| `lineam` | line | With `lege`: read one line |
| `scriptum` | format | Create formatted string |
| `cede` | await/yield | Await promise or yield value |

---

## Declarations (Declaratio)

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `varia` | let | Mutable binding |
| `fixum` | const | Immutable binding |
| `figendum` | const await | Immutable async binding |
| `variandum` | let await | Mutable async binding |
| `functio` | function | Function declaration |
| `novum` | new | Object instantiation |
| `finge` | form | Construct `discretio` variant |
| `importa` | import | Import from module |
| `exporta` | export | Export from module |
| `typus` | type | Type alias |
| `genus` | class/struct | Data structure with methods |
| `pactum` | interface/trait | Contract/interface |
| `ordo` | enum | Enumeration |
| `discretio` | tagged union | Discriminated union type |

---

## Modifiers (Modificator)

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `futura` | async | Async function modifier |
| `prae` | comptime | Compile-time type parameter |
| `praefixum` | comptime block | Compile-time evaluation |
| `cursor` | generator | Generator function modifier |
| `curata` | managed | Function receives allocator |
| `publicus` | public | Public visibility |
| `privatus` | private | Private visibility |
| `protectus` | protected | Protected visibility (TS/Py/C++ only) |
| `generis` | static | Type-level/static member |
| `implet` | implements | Implement interface |
| `sub` | extends | Class inheritance (TS/Py/C++ only) |
| `abstractus` | abstract | Abstract class/method (TS/Py/C++ only) |
| `nexum` | reactive | Reactive field binding |

---

## Operators (Operator)

### Logical

| Verbum | Meaning | Symbol |
|--------|---------|--------|
| `et` | and | `&&` |
| `aut` | or | `\|\|` |
| `non` | not | `!` |
| `vel` | nullish or | `??` |

### Comparison

| Verbum | Meaning | Symbol |
|--------|---------|--------|
| `est` | equals | `===` |

### Null/Empty Checks

| Verbum | Meaning | Generated |
|--------|---------|-----------|
| `nihil` | is null | `x == null` |
| `nonnihil` | is not null | `x != null` |
| `nulla` | is empty | length/size check |
| `nonnulla` | has content | length/size check |
| `negativum` | less than zero | `x < 0` |
| `positivum` | greater than zero | `x > 0` |

### Ternary

| Verbum | Meaning | Symbol |
|--------|---------|--------|
| `sic` | then (ternary) | `?` |
| `secus` | else (ternary) | `:` |

### Return Type (fio conjugation)

| Verbum | Async | Generator | Meaning |
|--------|:-----:|:---------:|---------|
| `fit` | no | no | "it becomes" |
| `fiet` | yes | no | "it will become" |
| `fiunt` | no | yes | "they become" |
| `fient` | yes | yes | "they will become" |

### Range

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `ante` | before | Exclusive range (`0 ante 10` = 0-9) |
| `usque` | up to | Inclusive range (`0 usque 10` = 0-10) |
| `intra` | within | Range containment check |
| `inter` | among | Set membership check |

### Spread/Rest

| Verbum | Meaning | Symbol |
|--------|---------|--------|
| `sparge` | spread | `...` |
| `ceteri` | rest | `...rest` |

---

## Literal Values (Valor)

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `verum` | true | Boolean true |
| `falsum` | false | Boolean false |
| `nihil` | null | Null value (also unary operator) |
| `ego` | this/self | Self-reference in methods |

---

## Prepositions (Praepositio)

| Verbum | Meaning | Usage |
|--------|---------|-------|
| `de` | from/of | Key iteration; borrowed reference |
| `in` | in/into | Membership; mutable reference |
| `ex` | from | Value iteration; destructuring; import |
| `ad` | to | Target/destination |
| `per` | through | Iteration step |
| `qua` | as (type) | Type cast |
| `ut` | as (alias) | Rename in import/destructure |

---

## Collection DSL

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `ab` | filter from | DSL entry point |
| `ubi` | where | Filter condition |
| `prima` | first n | Take first n elements |
| `ultima` | last n | Take last n elements |
| `summa` | sum | Reduce to sum |
| `ordina` | sort | Sort collection |
| `collige` | pluck | Extract field values |
| `grupa` | group by | Group by key |

---

## Regex DSL

| Verbum | Meaning | Notes |
|--------|---------|-------|
| `sed` | regex | Pattern matching (Unix `sed` reference) |

---

## Planned (Not Yet Implemented)

| Verbum | Meaning | Status |
|--------|---------|--------|
| `solum` | only | Test modifier (run only this test) |

---

## Synchronization Checklist

When adding a new keyword:

1. Add to `fons/faber/lexicon/keywords.ts` with category and meaning
2. Add to `fons/rivus/lexicon/verba.fab` in `estVerbum()`
3. If statement-starting, add to `estVerbumSententiae()`
4. If genus member, add to `estVerbumGeneris()`
5. Update this document
6. Update `fons/grammatica/` if it affects documented syntax
