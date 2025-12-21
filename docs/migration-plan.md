# Type-First Syntax Migration Plan

Hard migration to new syntax. No backward compatibility.

## Syntax Changes

```faber
// OLD                                    // NEW
fixum nomen: Textus = "x"                 fixum Textus nomen = "x"
esto count: Numerus = 0                   esto Numerus count = 0
functio greet(name: Textus) -> Textus     functio Textus greet(Textus name)
(x: Numerus) => x * 2                     (Numerus x) => x * 2
```

## Parallel Work Streams

### Stream A: Tokenizer + Lexicon
**Files**: `src/tokenizer/`, `src/lexicon/`
**Changes**:
1. Add `typus` keyword to `lexicon/keywords.ts`
2. Expand `lexicon/types-builtin.ts` with new types:
   - Fractus, Decimus (numeric)
   - Forsitan, Fors (optional/result)
   - FuturaCursor, FuturusFluxus (async iteration)
   - Pars, Totum, Lectum, Registrum (utility - TS only)
   - Selectum, Omissum, Extractum, Exclusum (utility - TS only)
   - NonNihil, Reditus, Parametra (utility - TS only)
   - Indicium, Refera (pointers - systems only)
3. Add type modifier constants: `Naturalis`, `Proprius`, `Alienus`, `Mutabilis`

**No dependencies** - can start immediately.

### Stream B: AST Definitions
**Files**: `src/parser/ast.ts`
**Changes**:
1. Add `TypeAliasDeclaration` node type:
   ```typescript
   interface TypeAliasDeclaration extends BaseNode {
     type: "TypeAliasDeclaration"
     name: Identifier
     typeAnnotation: TypeAnnotation
   }
   ```
2. Enhance `TypeAnnotation` to support modifiers:
   ```typescript
   interface TypeAnnotation extends BaseNode {
     type: "TypeAnnotation"
     name: string
     typeParameters?: TypeParameter[]  // Changed from TypeAnnotation[]
     nullable?: boolean
     union?: TypeAnnotation[]
   }

   type TypeParameter =
     | TypeAnnotation           // Lista<Textus>
     | NumericLiteral           // Numerus<32>
     | ModifierParameter        // Numerus<Naturalis>

   interface ModifierParameter extends BaseNode {
     type: "ModifierParameter"
     name: "Naturalis" | "Proprius" | "Alienus" | "Mutabilis"
   }
   ```
3. Add `TypeAliasDeclaration` to Statement union

**No dependencies** - can start immediately.

### Stream C: Parser Implementation
**Files**: `src/parser/index.ts`
**Depends on**: Stream B (AST definitions)
**Changes**:

1. **Variable declarations** - rewrite `parseVariableDeclaration()`:
   ```typescript
   // Parse: fixum Textus nomen = "value"
   // Or:    fixum nomen = "value" (inferred)
   function parseVariableDeclaration(): VariableDeclaration {
     const kind = advance().keyword  // esto | fixum

     // Check if next token is a known type
     if (isTypeName(peek())) {
       const typeAnnotation = parseTypeAnnotation()
       const name = parseIdentifier()
       // ...
     } else {
       // Type inference - just identifier
       const name = parseIdentifier()
       // ...
     }
   }
   ```

2. **Function declarations** - rewrite `parseFunctionDeclaration()`:
   ```typescript
   // Parse: functio Textus greet(Textus name) { ... }
   function parseFunctionDeclaration(): FunctionDeclaration {
     expectKeyword("functio")

     // Return type comes first (optional)
     let returnType: TypeAnnotation | undefined
     if (isTypeName(peek())) {
       returnType = parseTypeAnnotation()
     }

     const name = parseIdentifier()
     const params = parseParameterList()  // Now type-first
     const body = parseBlock()
     // ...
   }
   ```

3. **Parameters** - rewrite `parseParameter()`:
   ```typescript
   // Parse: Textus name  OR  ad Textus recipientem
   function parseParameter(): Parameter {
     let preposition: string | undefined
     if (isPreposition(peek())) {
       preposition = advance().keyword
     }

     // Type first (optional)
     let typeAnnotation: TypeAnnotation | undefined
     if (isTypeName(peek())) {
       typeAnnotation = parseTypeAnnotation()
     }

     const name = parseIdentifier()
     // ...
   }
   ```

4. **Arrow functions** - update parameter parsing:
   ```typescript
   // Parse: (Numerus x) => x * 2
   function parseArrowParams(): Parameter[] {
     // Same type-first logic
   }
   ```

5. **Type annotations** - enhance `parseTypeAnnotation()`:
   ```typescript
   // Handle: Numerus<32, Naturalis>, Lista<Textus>, Textus?
   function parseTypeAnnotation(): TypeAnnotation {
     const name = parseIdentifier().name

     let typeParameters: TypeParameter[] | undefined
     if (match("LESS_THAN")) {
       typeParameters = []
       do {
         if (peek().type === "NUMBER") {
           // Numeric parameter: Numerus<32>
           typeParameters.push(parseNumericLiteral())
         } else if (isModifier(peek())) {
           // Modifier: Numerus<Naturalis>
           typeParameters.push(parseModifierParameter())
         } else {
           // Type parameter: Lista<Textus>
           typeParameters.push(parseTypeAnnotation())
         }
       } while (match("COMMA"))
       expect("GREATER_THAN")
     }
     // ... nullable, union handling
   }
   ```

6. **Type alias** - add `parseTypeAliasDeclaration()`:
   ```typescript
   // Parse: typus ID = Textus
   function parseTypeAliasDeclaration(): TypeAliasDeclaration {
     expectKeyword("typus")
     const name = parseIdentifier()
     expect("EQUAL")
     const typeAnnotation = parseTypeAnnotation()
     return { type: "TypeAliasDeclaration", name, typeAnnotation, ... }
   }
   ```

7. **Helper function** - add `isTypeName()`:
   ```typescript
   function isTypeName(token: Token): boolean {
     if (token.type !== "IDENTIFIER") return false
     return BUILTIN_TYPE_NAMES.has(token.value)
   }

   const BUILTIN_TYPE_NAMES = new Set([
     "Textus", "Numerus", "Bivalens", "Fractus", "Decimus",
     "Lista", "Tabula", "Copia", "Promissum", "Forsitan", "Fors",
     "Cursor", "Fluxus", "FuturaCursor", "FuturusFluxus",
     "Res", "Functio", "Tempus", "Erratum", "Vacuum",
     "Nihil", "Incertum", "Signum", "Quodlibet", "Ignotum",
     "Pars", "Totum", "Lectum", "Registrum",
     "Selectum", "Omissum", "Extractum", "Exclusum",
     "NonNihil", "Reditus", "Parametra",
     "Indicium", "Refera"
   ])
   ```

### Stream D: Semantic Analyzer
**Files**: `src/semantic/`
**Depends on**: Stream B (AST), Stream C (Parser - for testing)
**Changes**:

1. **Type definitions** - update `src/semantic/types.ts`:
   ```typescript
   // Add type parameter support to primitives
   interface ParameterizedPrimitiveType {
     kind: "parameterized-primitive"
     name: string
     size?: number           // Numerus<32>
     unsigned?: boolean      // Numerus<Naturalis>
     ownership?: "owned" | "borrowed"  // Textus<Proprius>
     nullable?: boolean
   }
   ```

2. **Type resolution** - update `resolveTypeAnnotation()`:
   - Handle numeric type parameters
   - Handle modifier parameters
   - Validate parameter combinations

3. **Type alias support** - add to scope/symbol table:
   ```typescript
   // In scope.ts
   interface TypeAliasSymbol {
     kind: "type-alias"
     name: string
     resolvedType: SemanticType
   }
   ```

4. **Expand LATIN_TYPE_MAP** with all new types

### Stream E: TypeScript Codegen
**Files**: `src/codegen/ts.ts`
**Depends on**: Stream C (Parser), Stream D (Semantic)
**Changes**:

1. **Expand type map**:
   ```typescript
   const typeMap: Record<string, string> = {
     // Existing
     Textus: "string",
     Numerus: "number",
     Bivalens: "boolean",
     // New primitives
     Fractus: "number",
     Decimus: "Decimal",  // or BigNumber
     Vacuum: "void",
     Nihil: "null",
     Incertum: "undefined",
     Signum: "symbol",
     Quodlibet: "any",
     Ignotum: "unknown",
     // Structural
     Res: "object",
     Functio: "Function",
     Tempus: "Date",
     // Utility types
     Pars: "Partial",
     Totum: "Required",
     Lectum: "Readonly",
     Registrum: "Record",
     Selectum: "Pick",
     Omissum: "Omit",
     // ...
   }
   ```

2. **Handle parameterized types**:
   - `Numerus<32>` → `number`
   - `Forsitan<T>` → `T | null`
   - `Fors<T>` → `T` (TypeScript uses exceptions)

3. **Generate type aliases**:
   ```typescript
   // typus ID = Textus  →  type ID = string
   function genTypeAliasDeclaration(node: TypeAliasDeclaration): string {
     return `type ${node.name.name} = ${genTypeAnnotation(node.typeAnnotation)};`
   }
   ```

### Stream F: Zig Codegen
**Files**: `src/codegen/zig.ts`
**Depends on**: Stream C (Parser), Stream D (Semantic)
**Changes**:

1. **Parameterized type resolution**:
   ```typescript
   function zigType(semType: SemanticType): string {
     if (semType.kind === "parameterized-primitive") {
       if (semType.name === "Numerus") {
         const prefix = semType.unsigned ? "u" : "i"
         const size = semType.size ?? 64
         return `${prefix}${size}`
       }
       if (semType.name === "Fractus") {
         return `f${semType.size ?? 64}`
       }
       if (semType.name === "Textus") {
         return semType.ownership === "borrowed"
           ? "[]const u8"
           : "[]u8"
       }
     }
     // ...
   }
   ```

2. **Pointer types**:
   - `Indicium<T>` → `*T`
   - `Indicium<T, Mutabilis>` → `*T`

### Stream G: Test Updates
**Files**: All `*.test.ts` files
**Depends on**: All other streams
**Changes**:

1. Update all test cases to new syntax
2. Add new test cases for:
   - Type parameters with modifiers
   - Type aliases
   - New types

## Execution Order

```
Phase 1 (Parallel):
├── Stream A: Tokenizer + Lexicon
└── Stream B: AST Definitions

Phase 2 (After Phase 1):
└── Stream C: Parser Implementation

Phase 3 (After Phase 2, Parallel):
├── Stream D: Semantic Analyzer
├── Stream E: TypeScript Codegen
└── Stream F: Zig Codegen

Phase 4 (After Phase 3):
└── Stream G: Test Updates + Integration
```

## Validation

After all streams complete:
1. Run `bun test` - expect failures initially
2. Fix integration issues
3. Run ts2fab round-trip tests
4. Manual smoke test with example programs
