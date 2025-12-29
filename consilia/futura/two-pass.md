---
status: planned
note: Architectural design for forward references and throwability propagation; not yet implemented
updated: 2024-12
---

# Two-Pass Semantic Analysis

The current semantic analyzer uses a single pass over the AST. This works for simple cases but fails when analysis of one construct depends on information from another construct that hasn't been visited yet.

## Problems Requiring Two-Pass

### 1. Forward References

```
functio b() { a() }  // calls a, but a not yet defined
functio a() { redde 1 }
```

Single-pass fails: when analyzing `b`, `a` isn't in the symbol table yet.

### 2. Throwability Propagation

```
functio a() { iace "error" }     // throws directly
functio b() { a() }              // throws because calls a
functio c() { b() }              // throws because calls b
```

For Zig codegen, functions that can throw need `!T` return types. We must know if `a` throws before we can determine if `b` throws.

### 3. Mutual Recursion

```
functio ping() { pong() }
functio pong() { ping() }
```

Neither function is defined when the other's body is analyzed.

### 4. Type Inference Across Functions

```
functio getUser() { redde { nomen: "X" } }
functio getName() { redde getUser().nomen }  // need getUser's return type
```

If `getUser` is defined after `getName`, we can't infer the type of `getUser().nomen`.

## Proposed Architecture

### Pass 1: Declaration Collection

Walk all top-level declarations. Register signatures without analyzing bodies.

**Collected information:**

- Function names, parameter types, return types
- Type aliases
- Enum declarations
- Genus (struct) declarations with field types
- Pactum (interface) declarations with method signatures

**Not analyzed:**

- Function bodies
- Initializer expressions (beyond type inference)
- Control flow

After Pass 1, all names are known. Forward references resolve.

### Pass 2: Body Analysis

Walk all statements and expressions. All declarations are now available.

**Performed analysis:**

- Type checking in function bodies
- Expression type resolution
- Variable scope validation
- Property propagation (throwability, purity, async)

### Pass 2 Sub-Phases

Some properties require multiple iterations within Pass 2.

#### 2a: Direct Property Detection

Walk each function body once. Mark direct properties:

- `canThrow: true` if body contains `iace`
- `isAsync: true` if body contains `cede` (already tracked via `futura`)
- `isPure: true` if no side effects (future)

#### 2b: Transitive Propagation (Fixed-Point)

Propagate properties through call graph until stable:

```
repeat:
    changed = false
    for each function f:
        for each call to g in f.body:
            if g.canThrow and not f.canThrow:
                f.canThrow = true
                changed = true
until not changed
```

This handles mutual recursion. If `a` calls `b` and `b` calls `a`, and either contains `iace`, both eventually get `canThrow = true`.

## Implementation

### Changes to AST

Add optional properties to `FunctionDeclaration`:

```typescript
export interface FunctionDeclaration extends BaseNode {
    type: 'FunctionDeclaration';
    name: Identifier;
    params: Parameter[];
    returnType?: TypeAnnotation;
    body: BlockStatement;
    async: boolean;
    generator: boolean;
    isConstructor?: boolean;
    // New: set by semantic analyzer
    canThrow?: boolean;
}
```

### Changes to Semantic Analyzer

Restructure `analyzeProgram`:

```typescript
function analyzeProgram(node: Program): SemanticResult {
    // Pass 1: Collect declarations
    for (const stmt of node.body) {
        if (isDeclaration(stmt)) {
            collectDeclaration(stmt);
        }
    }

    // Pass 2a: Analyze bodies, detect direct properties
    for (const stmt of node.body) {
        analyzeStatement(stmt);
    }

    // Pass 2b: Propagate transitive properties
    propagateThrowability();

    return { program: node, errors };
}

function collectDeclaration(node: Statement): void {
    switch (node.type) {
        case 'FunctionDeclaration':
            // Register name and signature, don't analyze body
            const fnType = buildFunctionType(node);
            define({ name: node.name.name, type: fnType, kind: 'function' });
            break;
        case 'GenusDeclaration':
            // Register struct type with fields
            break;
        case 'PactumDeclaration':
            // Register interface type with methods
            break;
        case 'TypeAliasDeclaration':
            // Register type alias
            break;
        case 'EnumDeclaration':
            // Register enum type
            break;
    }
}

function propagateThrowability(): void {
    let changed = true;
    while (changed) {
        changed = false;
        for (const fn of allFunctions) {
            if (fn.canThrow) continue;
            for (const call of callsInBody(fn)) {
                const callee = lookupFunction(call);
                if (callee?.canThrow) {
                    fn.canThrow = true;
                    changed = true;
                    break;
                }
            }
        }
    }
}
```

### Call Graph Construction

During body analysis, record which functions each function calls:

```typescript
const callGraph = new Map<string, Set<string>>();

function analyzeCallExpression(node: CallExpression): void {
    // existing analysis...

    // Record call relationship
    if (currentFunction && node.callee.type === 'Identifier') {
        const calleeName = node.callee.name;
        if (!callGraph.has(currentFunction)) {
            callGraph.set(currentFunction, new Set());
        }
        callGraph.get(currentFunction)!.add(calleeName);
    }
}
```

## Impact on Codegen

### Zig

With `canThrow` available on function nodes:

```typescript
function genFunctionDeclaration(node: FunctionDeclaration): string {
    const returnType = node.returnType ? genType(node.returnType) : 'void';

    // Add error union if function can throw
    const retType = node.canThrow ? `!${returnType}` : returnType;

    // ... rest of generation
}

function genCallExpression(node: CallExpression): string {
    const callee = genExpression(node.callee);
    const args = node.arguments.map(genExpression).join(', ');

    // Insert try if calling a throwing function
    const calleeSymbol = lookupSymbol(node.callee);
    if (calleeSymbol?.canThrow) {
        return `try ${callee}(${args})`;
    }

    return `${callee}(${args})`;
}

function genThrowStatement(node: ThrowStatement): string {
    if (node.fatal) {
        // mori -> @panic (unchanged)
        return `${ind()}@panic(${genExpression(node.argument)});`;
    }

    // iace -> return error
    // Convert string to error name: "timeout" -> error.Timeout
    const errorName = deriveErrorName(node.argument);
    return `${ind()}return error.${errorName};`;
}

function deriveErrorName(expr: Expression): string {
    if (expr.type === 'Literal' && typeof expr.value === 'string') {
        // "not found" -> NotFound
        // "timeout" -> Timeout
        return toPascalCase(expr.value);
    }
    // Generic fallback
    return 'FaberError';
}
```

### Error Set Generation

Functions that throw need an error set. Options:

**Option A: Global error set**

Generate one error set containing all possible errors:

```zig
const FaberError = error{
    Timeout,
    NotFound,
    ValidationFailed,
    // ... all errors from all iace statements
};
```

Simple but loses specificity.

**Option B: Per-function error sets**

Each function declares its own errors:

```zig
const FetchError = error{ Timeout, NetworkError };
fn fetch() FetchError![]const u8 { ... }
```

More precise but complex to implement (need to track which errors each function can produce).

**Recommendation:** Start with Option A (global set). Refine later if needed.

### Rust

Same pattern applies. `canThrow` determines whether return type is `T` or `Result<T, FaberError>`.

### C++

With `std::expected`, same pattern: `canThrow` determines `T` vs `std::expected<T, FaberError>`.

## Future Properties

The two-pass architecture enables other transitive analyses:

| Property         | Direct Detection | Propagation               |
| ---------------- | ---------------- | ------------------------- |
| `canThrow`       | Contains `iace`  | Calls throwing function   |
| `isAsync`        | Contains `cede`  | Calls async function      |
| `isPure`         | No side effects  | Only calls pure functions |
| `needsAllocator` | Allocates memory | Calls allocating function |

## Scope

This design focuses on top-level functions. Nested functions (lambdas, closures) need additional handling:

- Lambdas inherit throwability from their containing function
- Or: analyze lambdas as separate units with their own properties

For now, treat lambdas conservatively (assume they can throw if parent can).

## Testing

Add tests for:

1. Forward reference resolution
2. Direct throw detection
3. Single-level propagation (a calls b, b throws)
4. Multi-level propagation (a calls b calls c, c throws)
5. Mutual recursion (a calls b, b calls a, one throws)
6. Diamond patterns (a calls b and c, both call d, d throws)

## Migration

This is a significant change to the semantic analyzer. Approach:

1. Add `canThrow` field to AST (backward compatible, optional)
2. Implement Pass 1 collection alongside existing single-pass
3. Refactor existing analysis into Pass 2
4. Add propagation phase
5. Update Zig codegen to use `canThrow`
6. Test thoroughly before enabling by default
