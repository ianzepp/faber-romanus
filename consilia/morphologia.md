# Morphologia - Verb Conjugation as Semantic Dispatch

Latin verb morphology encodes semantic information. Rather than duplicating methods for each variant (`adde`/`addita`/`addet`/`additura`), the compiler parses the conjugation ending to derive behavior flags and dispatches to a single stem implementation.

**Status:** Design proposal

---

## Motivation

Current approach duplicates method entries:

```typescript
// fons/faber/codegen/lista.ts - 60+ methods
adde:     { ts: 'push', ... }           // mutates
addita:   { ts: (obj, args) => `[...${obj}, ${args}]`, ... }  // returns new
filtra:   { ... }                        // mutates
filtrata: { ts: 'filter', ... }          // returns new
ordina:   { ts: 'sort', ... }            // mutates
ordinata: { ts: (obj) => `[...${obj}].sort()`, ... }  // returns new
```

Each verb has 2-4 variants. Adding async support doubles this again.

Proposed approach:

```typescript
// One entry per stem, flags derived from morphology
add:    { gen: (obj, args, flags) => flags.mutates ? `${obj}.push(...)` : `[...${obj}, ...]` }
filtr:  { gen: (obj, args, flags) => flags.mutates ? inPlaceFilter : `${obj}.filter(...)` }
ordin:  { gen: (obj, args, flags) => flags.mutates ? `${obj}.sort()` : `[...${obj}].sort()` }
```

---

## Latin Verb Morphology

### Conjugation Forms

| Form | Latin Name | Ending Pattern | Example | Meaning |
|------|------------|----------------|---------|---------|
| Imperative | Imperativus | `-a`, `-e`, `-i` | `adde` | "add!" (command) |
| Perfect Passive Participle | Participium Perfectum | `-ata`, `-ita`, `-ta` | `addita` | "having been added" |
| Future Active Participle | Participium Futurum | `-atura`, `-itura` | `additura` | "about to add" |
| Future Indicative | Futurum Indicativum | `-abit`, `-ebit`, `-iet` | `addet` | "it will add" |

### Semantic Mapping

| Form | mutates | async | returnsNew | needsAlloc |
|------|:-------:|:-----:|:----------:|:----------:|
| Imperative | yes | no | no | no |
| Perfect Passive Participle | no | no | yes | yes |
| Future Active Participle | no | yes | yes | yes |
| Future Indicative | yes | yes | no | no |

### Gender Agreement

Participle forms agree with the collection type (all feminine):
- `lista` (f.) → `filtrata`, `additura`
- `tabula` (f.) → `filtrata`, `additura`
- `copia` (f.) → `filtrata`, `additura`

The masculine/neuter forms (`filtratus`, `filtratum`) are not used.

---

## Morphology Parser

Parse method name to extract stem and flags:

```typescript
interface CollectionMethodFlags {
    mutates: boolean;      // Modifies receiver in place
    async: boolean;        // Returns Promise
    returnsNew: boolean;   // Allocates new collection
    needsAlloc: boolean;   // Requires allocator (Zig target)
}

function parseCollectionMethod(name: string): { stem: string, flags: CollectionMethodFlags } | null {
    // Longest endings first to avoid partial matches

    // Future active participle: -atura, -itura
    if (name.endsWith('atura') || name.endsWith('itura')) {
        return {
            stem: name.slice(0, -5),
            flags: { mutates: false, async: true, returnsNew: true, needsAlloc: true }
        };
    }

    // Future indicative: -abit, -ebit, -iet
    if (name.endsWith('abit') || name.endsWith('ebit') || name.endsWith('iet')) {
        return {
            stem: name.slice(0, -4),
            flags: { mutates: true, async: true, returnsNew: false, needsAlloc: false }
        };
    }

    // Perfect passive participle: -ata, -ita, -ta
    if (name.endsWith('ata') || name.endsWith('ita') || name.endsWith('ta')) {
        return {
            stem: name.slice(0, -3),
            flags: { mutates: false, async: false, returnsNew: true, needsAlloc: true }
        };
    }

    // Imperative: -a, -e, -i (check last - shortest match)
    if (name.endsWith('a') || name.endsWith('e') || name.endsWith('i')) {
        return {
            stem: name.slice(0, -1),
            flags: { mutates: true, async: false, returnsNew: false, needsAlloc: false }
        };
    }

    return null;
}
```

---

## Stem Dictionary

### Lista Verb Stems

| Stem | Conjugation | Meaning | Imperative | Participle |
|------|-------------|---------|------------|------------|
| `add` | 3rd (-ere) | add element | `adde` | `addita` |
| `praepone` | 3rd (-ere) | prepend | `praepone` | `praeposita` |
| `remov` | 2nd (-ēre) | remove last | `remove` | `remota` |
| `decapit` | 1st (-are) | remove first | `decapita` | `decapitata` |
| `filtr` | 1st (-are) | filter | `filtra` | `filtrata` |
| `mapp` | 1st (-are) | map/transform | `mappa` | `mappata` |
| `ordin` | 1st (-are) | sort | `ordina` | `ordinata` |
| `invert` | 3rd (-ere) | reverse | `inverte` | `inversa` |

### Read-Only Methods (No Conjugation)

These don't participate in the morphology system:

| Method | Type | Meaning |
|--------|------|---------|
| `longitudo` | noun | length/count |
| `primus` | adjective | first element |
| `ultimus` | adjective | last element |
| `continet` | verb (3rd sg.) | contains element |
| `vacua` | adjective | is empty |

---

## Codegen Architecture

### Stem Entry Structure

```typescript
interface CollectionStem {
    stem: string;
    meaning: string;
    gen: {
        ts: (obj: string, args: string[], flags: CollectionMethodFlags) => string;
        py?: (obj: string, args: string[], flags: CollectionMethodFlags) => string;
        rs?: (obj: string, args: string[], flags: CollectionMethodFlags) => string;
        zig?: (obj: string, args: string[], flags: CollectionMethodFlags, alloc: string) => string;
    };
}
```

### Example: Filter Stem

```typescript
const filtrStem: CollectionStem = {
    stem: 'filtr',
    meaning: 'filter elements',
    gen: {
        ts: (obj, args, flags) => {
            if (flags.async && flags.mutates) {
                // filtrabit - async in-place
                return `await (async () => { for (let i = ${obj}.length - 1; i >= 0; i--) { if (!(await (${args[0]})(${obj}[i]))) ${obj}.splice(i, 1); } })()`;
            }
            if (flags.async) {
                // filtratura - async returns new
                return `await Promise.all(${obj}.map(async x => ({ x, keep: await (${args[0]})(x) }))).then(r => r.filter(o => o.keep).map(o => o.x))`;
            }
            if (flags.mutates) {
                // filtra - sync in-place
                return `(() => { for (let i = ${obj}.length - 1; i >= 0; i--) { if (!(${args[0]})(${obj}[i])) ${obj}.splice(i, 1); } })()`;
            }
            // filtrata - sync returns new
            return `${obj}.filter(${args[0]})`;
        },
    },
};
```

---

## Call Expression Dispatch

```typescript
function genCallExpression(node: CallExpression, g: Generator): string {
    if (node.callee.type === 'MemberExpression' && !node.callee.computed) {
        const methodName = (node.callee.property as Identifier).name;
        const objType = node.callee.object.resolvedType;

        if (objType?.kind === 'generic' && objType.name === 'lista') {
            // Try morphology parsing
            const parsed = parseCollectionMethod(methodName);

            if (parsed) {
                const stem = LISTA_STEMS[parsed.stem];
                if (stem) {
                    const obj = g.genExpression(node.callee.object);
                    const args = node.arguments.map(a => g.genExpression(a));
                    return stem.gen.ts(obj, args, parsed.flags);
                }
            }

            // Fall back to read-only methods
            const readonly = LISTA_READONLY[methodName];
            if (readonly) {
                return readonly.gen.ts(g.genExpression(node.callee.object), []);
            }
        }
    }

    // Default call handling...
}
```

---

## Usage Examples

```faber
fixum items = [1, 2, 3, 4, 5]

# Imperative - mutates in place
items.filtra(pro x: x > 2)
# TS: (() => { for (let i = items.length - 1; i >= 0; i--) { ... } })()

# Perfect passive participle - returns new list
fixum evens = items.filtrata(pro x: x % 2 == 0)
# TS: const evens = items.filter((x) => x % 2 === 0)

# Future active participle - async, returns new
figendum result = items.filtratura(asyncPredicate)
# TS: const result = await Promise.all(...).then(...)

# Future indicative - async, mutates
cede items.filtrabit(asyncPredicate)
# TS: await (async () => { ... in-place async filter ... })()
```

---

## Implementation Plan

### Phase 1: Rivus Prototype

1. Add `fons/rivus/parser/morphologia.fab` - parsing logic
2. Add `fons/rivus/codegen/radices.fab` - stem dictionary (TS only)
3. Modify `fons/rivus/codegen/ts/expressia/vocatio.fab` to dispatch via morphology
4. Test with basic lista methods: `filtr-`, `ordin-`, `add-`

### Phase 2: Faber Migration

1. Create `fons/faber/codegen/morphology.ts` - parsing logic
2. Create `fons/faber/codegen/stems/lista.ts` - stem dictionary
3. Migrate existing lista.ts entries to stem format
4. Update call.ts to use morphology dispatch
5. Remove duplicated method entries

### Phase 3: Full Async Support

1. Add `-atura`/`-itura` codegen for all applicable stems
2. Add `-abit`/`-ebit` codegen for mutating async
3. Test with async predicates and transforms

---

## Benefits

1. **Reduced duplication**: ~15 stems vs ~60 methods
2. **Latin grammar is load-bearing**: Morphology determines behavior
3. **Scales cleanly**: Adding async requires no new entries
4. **Consistent patterns**: All collections use same morphology rules
5. **Dogfooding**: Rivus tests the design in Faber itself

---

## Open Questions

1. **Irregular verbs**: Some Latin verbs have irregular participles (e.g., `fero` → `latus`). Do we need to handle these, or restrict to regular verbs?

2. **Tabula/Copia differences**: Maps and sets have different semantics. Does the same morphology apply? (Probably yes - mutation vs copy is universal.)

3. **Error messages**: When a stem isn't found, should the error mention the parsed stem or the original method name?

4. **Property access**: `items.longitudo` (without parens) doesn't go through call dispatch. The member.ts bug still applies - need type info to translate properties.
