# Importa

Module system: imports and exports.

## Exempla

- `exempla/importa/`

---

## Syntax

### Import Declaration

```ebnf
importDecl := 'ex' (STRING | IDENTIFIER) 'importa' (identifierList | '*')
identifierList := IDENTIFIER (',' IDENTIFIER)*
```

**Examples:**

```fab
ex norma importa scribe, lege
ex "norma/tempus" importa nunc, dormi
ex norma importa *
```

### Export Declaration

```ebnf
exportDecl := 'exporta' (identifierList | inlineDecl)
identifierList := IDENTIFIER (',' IDENTIFIER)*
inlineDecl := funcDecl | genusDecl | varDecl | typeAliasDecl
```

> Named exports only. No default exports — TS `export default` migrates to named export.

**Examples:**

```fab
exporta foo, bar
exporta functio greet(textus name) -> textus { redde "Hello, " + name }
exporta genus User { textus nomen }
exporta fixum VERSION = "1.0.0"
```

### Dynamic Import

```ebnf
dynamicImport := 'ex' (STRING | expression) 'importabit' IDENTIFIER
```

> Async import using future tense `importabit` ("will import").

**Examples:**

```fab
ex "./heavy" importabit modulus
ex pathVariable importabit modulus
```

---

