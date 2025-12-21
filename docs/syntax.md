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

**Conditionals:**
```fab
si conditio {
  // if
}
aliter si alia {
  // else if
}
aliter {
  // else
}
```

**Loops:**
```fab
dum conditio {
  // while
}

fac {
  // do...while
} dum conditio

pro usuario in usuarios {
  // for...in
}

pro numero ex numeris {
  // for...of
}

pro (esto i = 0; i < 10; i++) {
  // traditional for (available but rare)
}
```

**Loop control:**
```fab
rumpe       // break
perge       // continue
```

**Switch / Pattern matching:**
```fab
elige valor {
  quando 1 => scribe("unum")
  quando 2 => scribe("duo")
  aliter => scribe("ignotum")
}
```

**Error handling — `cape` blocks:**

Any `{ }` block can have an optional `cape` clause. No special `tempta` required.

```fab
// If with catch
si fetch(url) {
  process()
} cape erratum {
  handleError(erratum)
}

// With binding
si fixum data = fetch(url) {
  process(data)
} cape erratum {
  fallback()
}

// Full chain
si conditio {
  doThing()
} cape erratum {
  handleError()
} aliter {
  // condition was falsy (no error)
  useFallback()
}

// While with catch
dum stream.legit() {
  process(stream.data)
} cape erratum {
  closeStream()
}

// For with catch
pro item in items {
  process(item)
} cape erratum {
  logFailure(erratum)
}

// Bare block with catch
{
  riskyOperation()
} cape erratum {
  recover()
}
```

**Explicit try (optional, for emphasis or `demum`):**
```fab
tempta {
  veryDangerousStuff()
} cape erratum {
  panic()
} demum {
  cleanup()  // finally — always runs
}
```

**Throw:**
```fab
iace novum Erratum("Something went wrong")
```

**Await:**
```fab
fixum data = exspecta fetch(url)
```

**Keywords summary:**

| JS | Latin | Meaning |
|----|-------|---------|
| `if` | `si` | "if" |
| `else` | `aliter` | "otherwise" |
| `switch` | `elige` | "choose" |
| `case` | `quando` | "when" |
| `default` | `aliter` | "otherwise" |
| `while` | `dum` | "while" |
| `do` | `fac` | "do" |
| `for...in` | `pro...in` | "for...in" |
| `for...of` | `pro...ex` | "for...from" |
| `break` | `rumpe` | "break" |
| `continue` | `perge` | "proceed" |
| `try` | `tempta` | "try" (optional) |
| `catch` | `cape` | "catch" |
| `finally` | `demum` | "finally" |
| `throw` | `iace` | "throw" |
| `await` | `exspecta` | "await" |
| `new` | `novum` | "new" |

---

### Closures / Arrow functions

```fab
// Arrow syntax (familiar)
fixum duplex = (x) => x * 2

// Block form
fixum processare = (x) => {
  fixum result = x * 2
  redde result
}

// With types
fixum saluta = (nomen: Textus) => `Salve, ${nomen}!`

// As callback
usuarios.filter((u) => u.activa)
numeros.map((n) => n * 2)
```

Arrow syntax unchanged from JS — `=>` is universal enough.

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
