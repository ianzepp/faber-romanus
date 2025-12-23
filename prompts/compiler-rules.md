# Compiler Code Style

Code should be both rigorous and beautiful. The `.fab` source is delightful to read; the TypeScript that compiles it should aspire to the same elegance.

## Visual Rhythm

### Vertical Spacing

Blank lines separate logical units. Declaration, then space, then logic:

```typescript
// Optional type parameters: genus Arca<T, U>
let typeParameters: Identifier[] | undefined;

if (match(TokenType.Less)) {
    typeParameters = [];

    do {
        typeParameters.push(parseIdentifier());
    } while (match(TokenType.Comma));

    expect(TokenType.Greater, "Expected '>' after type parameters");
}
```

Not:

```typescript
let typeParameters: Identifier[] | undefined;
if (match(TokenType.Less)) {
```

### Section Comments

Brief comments serve two purposes: explain flow and create visual breaks.

```typescript
// Capture position before consuming tokens for error reporting
const position = peek().position;

expectKeyword('genus', "Expected 'genus'");
const name = parseIdentifier();

// Optional type parameters: genus Arca<T, U>
let typeParameters: Identifier[] | undefined;

if (match(TokenType.Less)) { ... }

// Optional interface implementation: genus Canis implet Animal
let impletList: Identifier[] | undefined;

if (matchKeyword('implet')) { ... }

// Begin body - collect members by kind
expect(TokenType.LBrace, "Expected '{'");
```

One or two lines. Show syntax examples when helpful. Explain "why" only when non-obvious.

## Implementation Rigor

### Grammar Documentation

Parser functions begin with their grammar rule:

```typescript
// GRAMMAR: genus_decl    = 'genus' IDENT type_params? implet_clause? '{' member* '}'
// GRAMMAR: type_params   = '<' IDENT (',' IDENT)* '>'
// GRAMMAR: implet_clause = 'implet' IDENT (',' IDENT)*
function parseGenusDeclaration(): GenusDeclaration {
```

### Exhaustive Dispatch

Use switches with exhaustiveness checks. Never let unknown cases fall through silently:

```typescript
switch (member.type) {
    case 'FieldDeclaration':
        fields.push(member);
        break;
    case 'ComputedFieldDeclaration':
        computedFields.push(member);
        break;
    case 'ConstructorDeclaration':
        if (constructor) {
            error(member.position, "Genus may only have one faber");
        }
        constructor = member;
        break;
    case 'FunctionDeclaration':
        methods.push(member);
        break;
    default:
        const _exhaustive: never = member;
        throw new Error(`Unknown member type: ${(_exhaustive as any).type}`);
}
```

### Guard Clauses

Check constraints explicitly and fail clearly:

```typescript
// Only one faber allowed - Latin has no constructor overloading
if (constructor) {
    error(member.position, "Genus may only have one constructor (faber)");
}
constructor = member;
```

### Loop Condition Closures

Negated conditions like `!check(X) && !isAtEnd()` are easy to misread. Extract them into a commented closure:

```typescript
// True while there are unparsed members (not at '}' or EOF)
const hasMoreMembers = () => !check(TokenType.RBrace) && !isAtEnd();

while (hasMoreMembers()) {
    const member = parseGenusMember();
    ...
}
```

The closure:
- Names the condition positively
- Keeps the negation logic in one place
- Scopes to the function (no namespace pollution)
- Gets a comment explaining what "true" means

### Enums Over Strings

Token types, AST node kinds, and other finite sets use enums:

```typescript
// Good - typos caught at compile time
if (match(TokenType.Less)) { ... }
expect(TokenType.Greater, "...");

// Bad - typos caught at runtime (or never)
if (match('LESS')) { ... }
expect('GREATOR', "...");  // oops
```

### Position Capture

Capture source position before consuming tokens:

```typescript
// Capture position before consuming tokens for accurate error reporting
const position = peek().position;

expectKeyword('genus', "Expected 'genus'");
```

Not after, where `position` would point to wherever we ended up.

## Error Handling

### Error Catalog Structure

Each compiler phase has its own `errors.ts` file with an enum and catalog:

```
fons/
├── parser/
│   ├── index.ts
│   └── errors.ts      # Parser error catalog
├── semantic/
│   ├── index.ts
│   └── errors.ts      # Semantic error catalog
└── lexer/
    ├── index.ts
    └── errors.ts      # Lexer error catalog
```

### Error Codes

Prefix codes by phase for easy identification:

```typescript
// fons/parser/errors.ts
export enum ParserErrorCode {
    ExpectedClosingParen = 'P001',
    ExpectedClosingBrace = 'P002',
    ExpectedClosingAngle = 'P003',
    InvalidAssignmentTarget = 'P004',
    DuplicateConstructor = 'P005',
}
```

```typescript
// fons/semantic/errors.ts
export enum SemanticErrorCode {
    UndefinedVariable = 'S001',
    ImmutableAssignment = 'S002',
    NotExported = 'S003',
}
```

### Error Catalog

Define errors with structured fields:

```typescript
// fons/parser/errors.ts
export const PARSER_ERRORS = {
    [ParserErrorCode.ExpectedClosingAngle]: {
        text: "Expected '>'",
        help: "Type parameters must be closed (exempli gratia: genus Arca<T>)",
    },
    [ParserErrorCode.DuplicateConstructor]: {
        text: "Duplicate constructor",
        help: "A genus may only have one faber (constructor)",
    },
} as const;
```

### Usage

```typescript
import { ParserErrorCode, PARSER_ERRORS } from './errors';

function expectToken(type: TokenType, code: ParserErrorCode): void {
    if (!check(type)) {
        const { text, help } = PARSER_ERRORS[code];

        errors.push({
            code,
            text,
            help,
            position: peek().position,
        });
    }
    // ...
}

// Call site is terse - details live in the catalog
expectToken(TokenType.Greater, ParserErrorCode.ExpectedClosingAngle);
```

### Benefits

- **Testable**: Assert on codes, not brittle strings
- **Reviewable**: All messages for a phase in one file
- **Consistent**: Forced structure for text + help
- **Tooling-ready**: IDEs can show text inline, help in hover

## Testability

All logical paths must be reachable by tests:

- Each case in a switch
- Each branch of an if/else
- Each error condition
- Each guard clause

If code can't be reached by tests, it either shouldn't exist or the function needs restructuring.

## Discriminated Unions

AST node types should be discriminated unions, enabling exhaustive matching:

```typescript
type GenusMember =
    | FieldDeclaration
    | ComputedFieldDeclaration
    | ConstructorDeclaration
    | FunctionDeclaration;
```

Don't use boolean flags to distinguish fundamentally different node types:

```typescript
// Bad - constructor is a FunctionDeclaration with a flag
interface FunctionDeclaration {
    isConstructor?: boolean;
}

// Good - constructor is its own type
interface ConstructorDeclaration {
    type: 'ConstructorDeclaration';
    ...
}
```

## Summary

Solid code is:
- **Explicit** — types, enums, exhaustive checks
- **Defensive** — guard clauses, loop bounds, position capture
- **Testable** — all paths reachable, clear error conditions
- **Beautiful** — consistent spacing, section comments, visual rhythm
