# Publicus for Module Exports

Add `publicus` modifier to top-level declarations to control module exports.

## Rationale

Currently, the Faber compiler generates TypeScript without `export` keywords, making all declarations module-private. We need a way to mark declarations as exported.

### Design Decision

Reuse `publicus` (already used for class member visibility) at the module level:

- `publicus genus Foo` → `export class Foo`
- `publicus functio bar()` → `export function bar()`
- `genus Internal` → `class Internal` (not exported)

This matches Rust/Zig where `pub` serves both purposes (visibility = export). TypeScript is the outlier with separate `export` and `public/private/protected` concepts, but that's a TS-ism we don't need to replicate.

## Syntax

```fab
// Exported
publicus genus Locus {
    numerus linea
    numerus columna
}

publicus functio resolvere(lista<Symbolum> symbola) -> ParserResultatum {
    // ...
}

publicus ordo Color { Ruber, Viridis, Caeruleus }

publicus pactum Iterabilis<T> {
    functio sequens() -> T?
}

// Not exported (module-private)
genus InternaRes { ... }
functio auxilium() -> vacuum { ... }
```

## Implementation

### 1. Parser Changes (`fons/parser/index.ts`)

Before parsing top-level declarations, check for `publicus`:

```typescript
function parseTopLevelDeclaration(): Statement {
    let visibility: Visibility | undefined;

    if (checkKeyword('publicus')) {
        advance();
        visibility = 'public';
    }

    // Parse the declaration (functio, genus, pactum, ordo, discretio, typus)
    const decl = parseDeclaration();

    // Attach visibility to declaration
    if (visibility && 'visibility' in decl) {
        decl.visibility = visibility;
    }

    return decl;
}
```

### 2. AST Changes (`fons/parser/ast.ts`)

Add `visibility?: Visibility` to declarations that don't have it:

- `GenusDeclaration` — needs adding
- `PactumDeclaration` — needs adding
- `OrdoDeclaration` — needs adding
- `DiscretioDeclaration` — needs adding
- `TypeAliasDeclaration` — needs adding
- `FunctioDeclaration` — already has it
- `VariaDeclaration` — needs adding (for top-level constants)

### 3. Codegen Changes (`fons/codegen/ts/`)

For each declaration type, prepend `export` when `visibility === 'public'`:

```typescript
// In genGenusDeclaration
const exportKeyword = node.visibility === 'public' ? 'export ' : '';
return `${exportKeyword}class ${node.name.name} { ... }`;
```

Files to update:

- `statements/genus.ts`
- `statements/functio.ts`
- `statements/pactum.ts`
- `statements/ordo.ts`
- `statements/discretio.ts`
- `statements/typus.ts`
- `statements/varia.ts`

### 4. Other Targets

- **Python**: No direct equivalent; all top-level is public. Could use `__all__` list.
- **Rust**: `pub` prefix
- **Zig**: `pub` prefix
- **C++**: Header vs implementation file (out of scope)

## Test Cases

```yaml
# proba/codegen/statements/publicus.yaml
cases:
    - name: exported genus
      input: |
          publicus genus Foo { numerus x }
      ts: |
          export class Foo { x: number; }

    - name: non-exported genus
      input: |
          genus Foo { numerus x }
      ts: |
          class Foo { x: number; }

    - name: exported function
      input: |
          publicus functio greet() -> textus { redde "hello" }
      ts: |
          export function greet(): string { return "hello"; }
```

## Migration

The bootstrap compiler (`fons-fab/`) will need `publicus` on all its public APIs once this is implemented.
