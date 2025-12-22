# Faber Romanus: Statement of Purpose

*"The Roman Craftsman"*

## Core Thesis

**Latin as a vehicle for making implicit programming concepts explicit.**

Programming and natural language share fundamental structures. By mapping Latin's morphological system to code semantics, Faber Romanus makes visible what other languages hide: the roles that values play, the flow of data, the relationship between caller and callee.

This is not a novelty language. It is an experiment in whether linguistic structure can scaffold understanding of computation.

## Three Pillars

### 1. Compiler as Tutor

Error messages teach Latin grammar in context. No lectures, no curriculum—just "you wrote X, did you mean Y?" with brief explanation.

The compiler never crashes on malformed input. It collects errors and continues, showing multiple issues at once. Each error is an opportunity to teach.

### 2. Accessibility Over Purity

Pragmatism beats philological correctness. The goal is to lower barriers, not gatekeep.

You don't need to know Latin case declensions to write code. The syntax prioritizes readability for programmers, not historical accuracy for classicists. When Latin conventions conflict with programming conventions, we ask: which choice helps more people understand?

### 3. Incremental Discovery

Architecture emerges from decisions, not upfront planning. Features are added when needed, tested in real examples, refined based on what feels right.

No grand design spec. Just small, documented decisions that accumulate into a coherent whole.

---

## The Lexicon

### Organizing Principles

**Types are nouns.** They name what something is.
- `textus` (string) — from "woven, texture"
- `numerus` (number) — count, quantity
- `bivalens` (boolean) — two-valued
- `lista` (array) — list, border
- `tabula` (map) — tablet, table
- `copia` (set) — abundance, supply

**Collections are feminine.** Containers that hold things follow the Latin pattern where abstract containers tend toward feminine gender: `lista`, `tabula`, `copia`.

**Verbs follow Unix philosophy.** If it feels like a shell command, it's a verb:
- `legere` (read) — file/stream input
- `scribere` (write) — output
- `aperire` (open) — open resource
- `finire` (close) — cleanup
- `dormire` (sleep) — delay

**Conjugation maps to sync/async.** Present tense for synchronous operations, future tense for async (returns Promise).

**Case endings carry semantic weight.** Nominative for subjects/returns, accusative for objects/arguments. This isn't enforced rigidly, but the grammar is case-aware.

### Case Convention

Classical Latin had no distinction between uppercase and lowercase. Inscriptions were capitals; manuscripts varied by scribe. `MARCVS` and `marcus` are the same word.

Modern programming conventions use TitleCase for types (`String`, `Array`). This creates a hybrid that feels inconsistent with Latin's nature.

**Decision (2024-12):** Faber's internal style uses lowercase for types.

```
fixum textus nomen = "Marcus"
functio salve(textus nomen) -> textus { ... }
```

The parser is case-insensitive—`textus`, `Textus`, and `TEXTUS` all work. But the canonical style is lowercase.

Exceptions:
- **Constants:** `PI`, `MAX_VALUE` (universal convention)
- **Generic parameters:** `<T>`, `<K, V>` (universal convention)

External code can use whatever case the author prefers. The parser doesn't judge.

---

## What Was Approved

- **`.fab` extension** — over `.fr`, `.lat`, `.ls`
- **Hand-rolled recursive descent parser** — rejected parser generators (PEG.js, nearley) for control and educational error messages
- **Custom AST with estree transform** — keeps Latin semantics separate from JavaScript representation
- **Type-first syntax** — `fixum textus nomen` not `const nomen: string`
- **Source-first loops** — `ex items pro item` reads like Latin: "out of items, for each item"
- **Lowercase type convention** — faithful to Latin's case-insensitivity

## What Was Discarded

- **Irregular verbs** — too complex for no pedagogical payoff; only regular conjugations (1st-4th)
- **Full morphological parsing** — simplified to case-aware but practical
- **Method verbs** (`habere`, `tenere`) — didn't fit Unix philosophy; moved to dot notation
- **Union types with `|`** — abandoned early; nullable types use `?` suffix instead
- **TitleCase as requirement** — demoted to optional style preference

---

## The Deeper Insight

Case systems aren't a gimmick. They scaffold understanding of semantic roles—who does what to whom, what flows where.

English hides this. "The dog bit the man" vs "The man bit the dog"—only word order distinguishes subject from object. Latin makes the roles explicit in the words themselves: *canis* (subject) vs *canem* (object).

Programming has the same structures, just less visible. A function's parameters are objects (accusative). Its return value is a subject (nominative). Callbacks receive data (dative).

By writing code in Latin, you're not just learning a quirky syntax. You're learning how semantic roles work in any language—natural or artificial.

---

## Why "Faber Romanus"?

*Faber*: craftsman, artisan, maker. One who builds with skill and care.

*Romanus*: Roman. Of the tradition that gave us law, engineering, and a language that shaped Western civilization.

The Roman craftsman built aqueducts that still stand. He worked with precision, understanding that good foundations matter. He created things meant to last.

That's the aspiration here: craft something careful, something that teaches, something worth building.
