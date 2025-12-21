# Lexicon Module TODOs

Gap analysis for transitioning from PoC to production compiler.

## Decisions

### 2nd Conjugation Semantic Mapping (2024-12-21)

2nd conjugation (-ēre verbs) reserved for **stateful operations**, distinct from
1st/3rd conjugation transformations:

| Verb | Imperative | Present 3sg | Future 3sg | Maps To |
|------|------------|-------------|------------|---------|
| videre | vide | videt | videbit | console.debug |
| habere | habe | habet | habebit | .has() / .includes() |
| tenere | tene | tenet | tenebit | loop variable binding |
| monere | mone | monet | monebit | console.warn |
| respondere | responde | respondet | respondebit | yield |

Rationale:
- `scribe` (3rd conj) = user output, `vide` (2nd conj) = dev/debug output
- `videt` could be async background logging (fire-and-forget)
- `habet` for containment: `si lista habet numerum` → `if (list.includes(number))`
- `tene` for iterator binding in loops
- `responde` for generator yields, `respondet` for pipeline yields

## High Priority (Blocking Features)

### Verb Conjugations
- [x] Add 2nd conjugation (-ēre verbs: videre, habere, tenere)
- [ ] Add 4th conjugation (-ire verbs: audire, venire, scire)

### Keywords for OOP/Modules
- [ ] `classis` or `genus` → class
- [ ] `forma` → interface
- [ ] `extendit` → extends
- [ ] `implet` → implements
- [ ] `exporta` → export
- [ ] `praefinitum` → default
- [ ] `ab` → from (imports)

### Access Modifiers
- [ ] `privatus` → private
- [ ] `publicus` → public
- [ ] `protectus` → protected
- [ ] `stabilis` → static

### Error Diagnostics
- [ ] Return structured errors instead of `null`
- [ ] Distinguish unknown stem vs invalid ending
- [ ] Add position information for error messages
- [ ] "Did you mean?" suggestions for near-misses

### Fix Incorrect Latin
- [ ] `Res` stem is "R" but should be "re-" (5th declension irregular)
- [ ] `Functio` stem "Function" isn't Latin - consider "Actio" or "Operatio"
- [ ] Add 3rd declension neuter variant (tempus/temporis pattern)

## Medium Priority (Correctness)

### 5th Declension
- [ ] Add declension5Endings table
- [ ] Support res, dies, spes patterns
- [ ] Update getEndingsForDeclension()

### Verb Forms
- [ ] Infinitive forms (-re) for function references
- [ ] Present participle (-ns/-ntis) for callbacks/closures
- [ ] Past participle (-tus/-ta/-tum) for completed state

### Type System
- [ ] Tuple type (Iunctum?)
- [ ] Union type syntax
- [ ] Intersection type syntax
- [ ] Literal types
- [ ] Actually parse type modifiers (Naturalis, Proprius, etc.)

### Performance
- [ ] Replace linear array scan with trie structure
- [ ] Longest-match-first for stem disambiguation
- [ ] Cache parsed results for repeated identifiers

### Additional Keywords
- [ ] `ut` → as (type casting, import aliases)
- [ ] `genus` → typeof
- [ ] `cede` → yield (generators)

## Low Priority (Polish)

### Past Tenses
- [ ] Imperfect (-bam, -bas, etc.) - "was doing"
- [ ] Perfect (-i, -isti, etc.) - "did"
- [ ] Pluperfect (-eram, -eras, etc.) - "had done"

### Passive Voice
- [ ] Present passive (-or, -ris, -tur, etc.)
- [ ] Map to different code patterns (event handlers?)

### Subjunctive Mood
- [ ] Present subjunctive
- [ ] Imperfect subjunctive
- [ ] Use for conditionals, wishes, purpose clauses

### Vocative Case
- [ ] Add to declension tables
- [ ] Use for REPL/interactive commands

### Infrastructure
- [ ] Vocabulary registration API for user-defined words
- [ ] Declension/conjugation inference from principal parts
- [ ] Form generation (reverse of parsing)
- [ ] Compound word decomposition

## Test Coverage Gaps

- [ ] 1st declension nouns (Lista, Tabula patterns)
- [ ] 3rd declension nominative singular (Cursor pattern)
- [ ] 4th declension full paradigm (Textus)
- [ ] All neuter patterns systematically
- [ ] Plural forms for each declension
- [ ] Type modifier parsing
- [ ] Edge cases: empty strings, long words, Unicode
- [ ] All verb persons/numbers for each conjugation
