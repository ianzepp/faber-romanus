# Reserved Keyword Conflicts

## Problem

The Faber lexer treats keywords as globally reserved, rejecting them as identifiers even in unambiguous contexts. This forces awkward workarounds in user code and the bootstrap compiler.

Example failures:

```fab
// All of these fail to parse:
genus Foo {
    CapeClausula? cape       // "Expected identifier, got 'cape'"
    MassaSententia? demum    // "Expected identifier, got 'demum'"
    Sententia? ergo          // "Expected identifier, got 'ergo'"
    TypusAdnotatio? typus    // "Expected identifier, got 'typus'"
    bivalens omnia           // "Expected identifier, got 'omnia'"
    lista<Nomen>? implet     // "Expected identifier, got 'implet'"
}
```

## Analysis

Keywords are only syntactically significant in specific positions. In other positions, they can safely be used as identifiers.

### Safe Contexts (should allow keywords)

| Context                   | Example                    | Why Safe                      |
| ------------------------- | -------------------------- | ----------------------------- |
| Field name after type     | `CapeClausula? cape`       | Type annotation disambiguates |
| Variable name after type  | `fixum textus cape = ...`  | Type annotation disambiguates |
| Parameter name after type | `functio foo(textus cape)` | Type annotation disambiguates |
| Property access           | `obj.cape`                 | Dot disambiguates             |
| Object literal key        | `{ cape: value }`          | Brace context disambiguates   |

### Ambiguous Contexts (must stay reserved)

| Context            | Example             | Why Ambiguous                         |
| ------------------ | ------------------- | ------------------------------------- |
| Statement start    | `cape err { }`      | Could be keyword or assignment target |
| After `tempta { }` | `tempta { } cape`   | Must be catch clause                  |
| Loop binding       | `ex items pro cape` | Could be keyword or identifier        |

## Affected Keywords

From bootstrap AST work, these keywords caused field name conflicts:

- `cape` - catch clause
- `demum` - finally clause
- `ergo` - therefore/chain
- `typus` - type keyword
- `omnia` - all (in `ante omnia`)
- `implet` - implements
- `alias` - alias keyword

## Proposed Solution

Modify the parser to use contextual keyword resolution:

1. **Lexer**: Tokenize keywords as `Keyword` type but preserve the text
2. **Parser**: In identifier-expecting positions (after type annotation, after dot, etc.), accept keyword tokens as identifiers
3. **Lookahead**: For truly ambiguous positions, use lookahead to determine intent

### Implementation Sketch

```typescript
// In parser
function parseIdentifier(): Identifier {
    const token = current();

    // Accept both regular identifiers and keywords in identifier position
    if (token.type === 'Identifier' || token.type === 'Keyword') {
        advance();
        return { type: 'Identifier', name: token.value, ... };
    }

    throw error('Expected identifier');
}

// For ambiguous positions, keep strict checking
function parseStatementStart(): Statement {
    const token = current();

    // Only check for actual keywords at statement start
    if (token.type === 'Keyword') {
        switch (token.value) {
            case 'cape': return parseCatchClause();
            case 'si': return parseSiStatement();
            // ...
        }
    }

    // Otherwise parse as expression statement
    return parseExpressionStatement();
}
```

## Workarounds

Until fixed, use compound names for fields that conflict with keywords:

| Keyword  | Workaround       |
| -------- | ---------------- |
| `cape`   | `capeClausula`   |
| `demum`  | `demumCorpus`    |
| `ergo`   | `ergoSententia`  |
| `typus`  | `typusAdnotatio` |
| `omnia`  | `proOmnibus`     |
| `implet` | `impletLista`    |
| `alias`  | `aliasNomen`     |

## References

- Bootstrap AST: `fons-fab/ast/sententia/*.fab`
- Parser: `fons/parser/index.ts`
- Lexer: `fons/tokenizer/index.ts`
