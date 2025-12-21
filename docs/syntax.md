# Faber Romanus Syntax Sketch

Working document. Nothing here is final.

---

## Basic Structure

### Function declaration

**Option A: Latin keyword, familiar structure**
```fab
functio salve(nomen: Textus) -> Textus {
  redde "Salve, " + nomen
}
```

**Option B: Verb-first (Latin word order)**
```fab
salve(nomen: Textus) -> Textus functio {
  redde "Salve, " + nomen
}
```

**Option C: Minimal keywords**
```fab
salve(nomen: Textus) -> Textus {
  redde "Salve, " + nomen
}
```

**Current lean**: Option A — familiar enough to onboard, Latin keywords for flavor.

---

### Variables

```fab
esto nomen = "Marcus"           // mutable (let) — "let it be"
fixum nomen = "Marcus"          // immutable (const) — "fixed"

esto numerus: Numerus = 42      // with type annotation
fixum PI: Numerus = 3.14159     // constant with type
```

- `esto` = "let it be" → JS `let`
- `fixum` = "fixed" → JS `const`

---

### Case endings in action

The interesting part. How do semantic roles appear?

**Function with accusative (direct object) and dative (recipient):**
```fab
functio mitte(nuntium: Textus, recipienti: Usuario) {
  // nuntium (-um ending) = accusative = the thing being sent
  // recipienti (-i ending) = dative = the recipient
  recipienti.accepta(nuntium)
}
```

**Ablative for "using/with" (dependency injection?):**
```fab
functio salva(datum: Textus, cum conexione: Conexio) {
  // cum + ablative = "with" = instrument/means
  conexione.scribe(datum)
}
```

**Genitive for property access?**
```fab
esto nomen = usuarii.nomen    // usuarii = genitive = "of the user"
// or maybe just: usuario.nomen (keep it simple?)
```

---

### Control flow

```fab
si conditio {
  // if
}
aliter {
  // else
}

dum conditio {
  // while
}

pro usuario in usuarii {
  // for...in
}
```

---

### Types

**Convention**: TitleCase for all types. Use familiar symbols for generics, unions, nullable, tuples.

**Primitives:**
```fab
Textus          // String
Numerus         // Number (covers all numeric types)
Bivalens        // Boolean (true/false: verum/falsum)
Nihil           // null
Incertum        // undefined
Signum          // Symbol
```

**Collections:**
```fab
Lista<T>        // Array
Tabula<K, V>    // Map
Copia<T>        // Set
```

**Structural:**
```fab
Res             // Object (generic)
Functio         // Function
Promissum       // Promise
Tempus          // Date
Erratum         // Error
Vacuum          // void
Quodlibet       // any
Ignotum         // unknown
```

**Iteration & Streaming:**
```fab
Cursor<T>       // Iterator (pull-based) — "runner", you ask for next
Fluxus<T>       // Stream (push-based) — "flow", values come to you

FuturaCursor<T> // AsyncIterator
FuturusFluxus<T> // AsyncStream / Observable
```

Semantic distinction: `Cursor` runs through data (active consumer), `Fluxus` flows past you (passive receiver).

**Type syntax (familiar symbols):**
```fab
Lista<Numerus>          // generics
Textus | Nihil          // union
Textus?                 // nullable (sugar for T | Nihil)
[Textus, Numerus]       // tuple
```

---

## Open Syntax Questions

1. ~~Case endings~~ — **Required**. The compiler is a nun with a ruler.
2. ~~Prepositions~~ — **Ablative requires preposition** (`cum`, `in`, `ex`). Dative/accusative prepositions optional.
3. ~~Verb conjugation~~ — Future tense verb names imply `Promissum` return. Explicit `futura functio` also valid.
4. ~~Property access~~ — Dot notation. Keep it simple.
5. ~~Operators~~ — Both valid. `et`/`aut` allowed alongside `&&`/`||`. Prefer `!` for negation (tight binding). Style: use Latin operators when mixed with symbols for readability.
6. ~~String interpolation~~ — JS style: backticks + `${expr}`
7. ~~Comments~~ — `//` and `/* */` (standard, no change)

---

## Example Program

Putting it together (aspirational):

```fab
// A simple greeting service

functio salve(nomen: Textus) -> Textus {
  si nomen.vacuum {
    redde "Salve, hospes"
  }
  redde "Salve, " + nomen
}

functio mitte(nuntium: Textus, ad recipientem: Textus, cum cliente: HttpCliens) {
  esto responsum = cliente.posta(recipientem, nuntium)
  si responsum.successum {
    scribe("Missum est!")  // "It was sent!"
  }
  aliter {
    scribe("Error: " + responsum.error)
  }
}

// Entry point
esto nomen = lege("Quid est nomen tuum? ")  // "What is your name?"
scribe(salve(nomen))
```
