/**
 * Rust Code Generator - Emit Rust source code
 *
 * COMPILER PHASE
 * ==============
 * codegen
 *
 * ARCHITECTURE
 * ============
 * This module transforms a validated Latin AST into Rust source code.
 * Rust is a systems programming language focused on safety, concurrency,
 * and performance through ownership and borrowing.
 *
 * Key transformations:
 * - varia -> let mut
 * - fixum -> let (immutable by default)
 * - functio -> fn
 * - genus -> struct + impl
 * - pactum -> trait
 * - si/aliter -> if/else if/else
 * - elige -> match
 * - ex...pro -> for...in
 * - scribe -> println!/print!
 * - ego -> self
 * - novum -> StructName { } or StructName::new()
 *
 * INPUT/OUTPUT CONTRACT
 * =====================
 * INPUT:  Program AST node with Latin keywords and type names
 * OUTPUT: Valid Rust source code string
 * ERRORS: Throws on unsupported AST node types
 *
 * TARGET DIFFERENCES
 * ==================
 * Rust characteristics:
 * - Ownership and borrowing (& for references, &mut for mutable refs)
 * - No null - uses Option<T> and Result<T, E>
 * - Pattern matching is exhaustive
 * - Traits for polymorphism (no inheritance)
 * - Macros for metaprogramming (println!, vec!, etc.)
 * - Lifetimes for reference validity
 * - No exceptions - Result<T, E> and ? operator
 * - Iterators are lazy and composable
 *
 * INVARIANTS
 * ==========
 * INV-1: Generated code is syntactically valid Rust
 * INV-2: Indentation is consistently 4 spaces per level (Rust convention)
 * INV-3: Uses idiomatic Rust patterns (ownership, Result, Option)
 */

import type {
    Program,
    Statement,
    Expression,
    ImportaDeclaration,
    ImportSpecifier,
    DestructureDeclaration,
    VariaDeclaration,
    FunctioDeclaration,
    GenusDeclaration,
    FieldDeclaration,
    PactumDeclaration,
    PactumMethod,
    TypeAliasDeclaration,
    SiStatement,
    DumStatement,
    IteratioStatement,
    InStatement,
    EligeStatement,
    DiscerneStatement,
    DiscretioDeclaration,
    VariantDeclaration,
    VariantField,
    CustodiStatement,
    AdfirmaStatement,
    ReddeStatement,
    BlockStatement,
    OrdoDeclaration,
    IaceStatement,
    ScribeStatement,
    TemptaStatement,
    ExpressionStatement,
    ArrayExpression,
    ObjectExpression,
    RangeExpression,
    BinaryExpression,
    UnaryExpression,
    CallExpression,
    MemberExpression,
    ArrowFunctionExpression,
    AssignmentExpression,
    NovumExpression,
    Identifier,
    Literal,
    Parameter,
    TypeAnnotation,
    TypeParameter,
    TypeParameterDeclaration,
    SpreadElement,
    FacBlockStatement,
    LambdaExpression,
    QuaExpression,
    EstExpression,
    ProbandumStatement,
    ProbaStatement,
    CuraBlock,
    CuraStatement,
    PraefixumExpression,
} from '../../parser/ast';
import type { CodegenOptions } from '../types';

// =============================================================================
// TYPE MAPPING
// =============================================================================

/**
 * Map Latin type names to Rust type names.
 *
 * TARGET MAPPING:
 * | Latin      | Rust           |
 * |------------|----------------|
 * | textus     | String         |
 * | numerus    | f64            |
 * | bivalens   | bool           |
 * | nihil      | ()             |
 * | lista      | Vec<T>         |
 * | tabula     | HashMap<K, V>  |
 * | copia      | HashSet<T>     |
 */
const typeMap: Record<string, string> = {
    textus: 'String',
    numerus: 'f64',
    fractus: 'f64',
    magnus: 'i128',
    bivalens: 'bool',
    nihil: '()',
    vacuum: '()',
    lista: 'Vec',
    tabula: 'HashMap',
    copia: 'HashSet',
    promissum: 'Future',
    octeti: 'Vec<u8>',
};

// =============================================================================
// MAIN GENERATOR
// =============================================================================

/**
 * Generate Rust source code from a Latin AST.
 *
 * TRANSFORMS:
 *   Program AST -> Rust source code string
 *
 * @param program - Validated AST from parser
 * @param options - Formatting configuration
 * @returns Rust source code
 */
export function generateRs(program: Program, options: CodegenOptions = {}): string {
    // WHY: 4 spaces is Rust community standard (rustfmt default)
    const indent = options.indent ?? '    ';

    // Track indentation depth
    let depth = 0;

    /**
     * Generate indentation for current depth.
     */
    function ind(): string {
        return indent.repeat(depth);
    }

    // ---------------------------------------------------------------------------
    // Top-level
    // ---------------------------------------------------------------------------

    function genProgram(node: Program): string {
        return node.body.map(genStatement).join('\n');
    }

    // ---------------------------------------------------------------------------
    // Statements
    // ---------------------------------------------------------------------------

    /**
     * Generate code for any statement type.
     */
    function genStatement(node: Statement): string {
        switch (node.type) {
            case 'ImportaDeclaration':
                return genImportaDeclaration(node);
            case 'DestructureDeclaration':
                return genDestructureDeclaration(node);
            case 'VariaDeclaration':
                return genVariaDeclaration(node);
            case 'FunctioDeclaration':
                return genFunctioDeclaration(node);
            case 'GenusDeclaration':
                return genGenusDeclaration(node);
            case 'PactumDeclaration':
                return genPactumDeclaration(node);
            case 'TypeAliasDeclaration':
                return genTypeAliasDeclaration(node);
            case 'OrdoDeclaration':
                return genOrdoDeclaration(node);
            case 'DiscretioDeclaration':
                return genDiscretioDeclaration(node);
            case 'SiStatement':
                return genSiStatement(node);
            case 'DumStatement':
                return genDumStatement(node);
            case 'IteratioStatement':
                return genIteratioStatement(node);
            case 'InStatement':
                return genInStatement(node);
            case 'EligeStatement':
                return genEligeStatement(node);
            case 'DiscerneStatement':
                return genDiscerneStatement(node);
            case 'CustodiStatement':
                return genCustodiStatement(node);
            case 'AdfirmaStatement':
                return genAdfirmaStatement(node);
            case 'ReddeStatement':
                return genReddeStatement(node);
            case 'RumpeStatement':
                return `${ind()}break;`;
            case 'PergeStatement':
                return `${ind()}continue;`;
            case 'IaceStatement':
                return genIaceStatement(node);
            case 'ScribeStatement':
                return genScribeStatement(node);
            case 'TemptaStatement':
                return genTemptaStatement(node);
            case 'BlockStatement':
                return genBlockStatement(node);
            case 'FacBlockStatement':
                return genFacBlockStatement(node);
            case 'ExpressionStatement':
                return genExpressionStatement(node);
            case 'ProbandumStatement':
                return genProbandumStatement(node);
            case 'ProbaStatement':
                return genProbaStatement(node);
            case 'CuraBlock':
                return genCuraBlock(node);
            case 'CuraStatement':
                return genCuraStatement(node);
            default:
                throw new Error(`Unknown statement type: ${(node as any).type}`);
        }
    }

    /**
     * Generate import declaration.
     *
     * TRANSFORMS:
     *   ex "std::collections" importa HashMap -> use std::collections::HashMap;
     *   ex "std::io" importa Read, Write -> use std::io::{Read, Write};
     *   ex "crate::utils" importa helper ut h -> use crate::utils::helper as h;
     */
    function genImportaDeclaration(node: ImportaDeclaration): string {
        const source = node.source;

        // Skip norma imports - handled via intrinsics
        if (source === 'norma' || source.startsWith('norma/')) {
            return '';
        }

        if (node.wildcard) {
            return `${ind()}use ${source}::*;`;
        }

        // WHY: ImportSpecifier has imported/local - emit "imported as local" when different
        if (node.specifiers.length === 1) {
            const s = node.specifiers[0]!;
            if (s.imported.name === s.local.name) {
                return `${ind()}use ${source}::${s.imported.name};`;
            }
            return `${ind()}use ${source}::${s.imported.name} as ${s.local.name};`;
        }

        // Multiple specifiers: use braces
        const names = node.specifiers
            .map(s => {
                if (s.imported.name === s.local.name) {
                    return s.imported.name;
                }
                return `${s.imported.name} as ${s.local.name}`;
            })
            .join(', ');

        return `${ind()}use ${source}::{${names}};`;
    }

    /**
     * Generate variable declaration.
     *
     * TRANSFORMS:
     *   varia x: numerus = 5 -> let mut x: f64 = 5;
     *   fixum y: textus = "hello" -> let y: String = "hello";
     *   fixum [a, b, c] = coords -> let [a, b, c] = coords;
     *   figendum data = fetch() -> let data = fetch().await;
     *
     * NOTE: Object destructuring uses DestructureDeclaration with ex-prefix.
     */
    function genVariaDeclaration(node: VariaDeclaration): string {
        const isAsync = node.kind === 'figendum' || node.kind === 'variandum';
        const mutKeyword = node.kind === 'varia' || node.kind === 'variandum' ? 'mut ' : '';

        let name: string;

        if (node.name.type === 'ArrayPattern') {
            // Generate array destructuring pattern
            const elems = node.name.elements.map(elem => {
                if (elem.skip) {
                    return '_';
                }
                if (elem.rest) {
                    return `${elem.name.name}@..`;
                }
                return elem.name.name;
            });
            name = `[${elems.join(', ')}]`;
        } else {
            name = node.name.name;
        }

        const typeAnno = node.typeAnnotation ? `: ${genType(node.typeAnnotation)}` : '';

        let init = '';
        if (node.init) {
            const expr = genExpression(node.init);
            init = isAsync ? ` = ${expr}.await` : ` = ${expr}`;
        }

        return `${ind()}let ${mutKeyword}${name}${typeAnno}${init};`;
    }

    /**
     * Generate object destructuring declaration.
     *
     * TRANSFORMS:
     *   ex persona fixum nomen, aetas -> let Persona { nomen, aetas, .. } = persona;
     *   ex persona fixum nomen ut n -> let Persona { nomen: n, .. } = persona;
     *   ex promise figendum result -> let { result, .. } = promise.await;
     *
     * WHY: Rust struct destructuring requires type name or field access.
     *      Since we don't always have type info, we emit field access as fallback.
     */
    function genDestructureDeclaration(node: DestructureDeclaration): string {
        const isAsync = node.kind === 'figendum' || node.kind === 'variandum';
        const mutKeyword = node.kind === 'varia' || node.kind === 'variandum' ? 'mut ' : '';
        const source = isAsync ? `${genExpression(node.source)}.await` : genExpression(node.source);

        // Check if source has resolved type info for struct name
        const structName = node.source.resolvedType?.kind === 'generic' ? node.source.resolvedType.name : null;

        if (structName) {
            // Full struct destructuring: let StructName { field, .. } = source;
            const props = node.specifiers.map(spec => {
                if (spec.rest) {
                    return '..';
                }
                if (spec.imported.name !== spec.local.name) {
                    return `${spec.imported.name}: ${mutKeyword}${spec.local.name}`;
                }
                return `${mutKeyword}${spec.imported.name}`;
            });

            // Add .. if no rest specifier to ignore other fields
            const hasRest = node.specifiers.some(s => s.rest);
            const pattern = hasRest ? props.join(', ') : `${props.join(', ')}, ..`;

            return `${ind()}let ${structName} { ${pattern} } = ${source};`;
        }

        // Fallback: emit individual field bindings
        const lines: string[] = [];
        for (const spec of node.specifiers) {
            if (spec.rest) {
                // Can't easily express rest in Rust without type info
                lines.push(`${ind()}// TODO: rest pattern requires type info`);
                continue;
            }
            const fieldName = spec.imported.name;
            const localName = spec.local.name;
            if (fieldName === localName) {
                lines.push(`${ind()}let ${mutKeyword}${localName} = ${source}.${fieldName};`);
            } else {
                lines.push(`${ind()}let ${mutKeyword}${localName} = ${source}.${fieldName};`);
            }
        }
        return lines.join('\n');
    }

    /**
     * Generate function declaration.
     *
     * TRANSFORMS:
     *   functio greet(textus name) -> textus { } -> fn greet(name: String) -> String { }
     *   futura functio fetch() -> textus { } -> async fn fetch() -> String { }
     */
    function genFunctioDeclaration(node: FunctioDeclaration): string {
        const asyncMod = node.async ? 'async ' : '';
        const name = node.name.name;
        const params = node.params.map(genParameter).join(', ');
        const typeParams = node.typeParams ? `<${node.typeParams.map(tp => tp.name.name).join(', ')}>` : '';

        let returnType = '';
        if (node.returnType) {
            returnType = ` -> ${genType(node.returnType)}`;
        }

        const body = genBlockStatement(node.body);

        return `${ind()}${asyncMod}fn ${name}${typeParams}(${params})${returnType} ${body}`;
    }

    /**
     * Generate function parameter.
     */
    function genParameter(node: Parameter): string {
        const name = node.name.name;
        const typeAnno = node.typeAnnotation ? genType(node.typeAnnotation) : '_';

        // Handle prepositions for ownership semantics
        if (node.preposition === 'de') {
            // Borrowed/read-only
            return `${name}: &${typeAnno}`;
        }
        if (node.preposition === 'in') {
            // Mutable borrow
            return `${name}: &mut ${typeAnno}`;
        }

        return `${name}: ${typeAnno}`;
    }

    /**
     * Generate genus (struct) declaration.
     *
     * TRANSFORMS:
     *   genus Persona { textus nomen, numerus aetas }
     *   -> struct Persona { nomen: String, aetas: f64 }
     *      impl Persona { ... methods ... }
     */
    function genGenusDeclaration(node: GenusDeclaration): string {
        const name = node.name.name;
        const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => p.name).join(', ')}>` : '';

        const lines: string[] = [];

        // Struct definition
        lines.push(`${ind()}struct ${name}${typeParams} {`);
        depth++;

        for (const field of node.fields) {
            lines.push(genFieldDeclaration(field));
        }

        depth--;
        lines.push(`${ind()}}`);

        // Impl block for methods
        if (node.methods.length > 0 || node.constructor) {
            lines.push('');
            lines.push(`${ind()}impl${typeParams} ${name}${typeParams} {`);
            depth++;

            // Constructor as new() if defined
            if (node.constructor) {
                lines.push(genConstructorAsNew(node));
            }

            for (const method of node.methods) {
                lines.push(genMethodDeclaration(method));
            }

            depth--;
            lines.push(`${ind()}}`);
        }

        return lines.join('\n');
    }

    /**
     * Generate field declaration within a struct.
     */
    function genFieldDeclaration(node: FieldDeclaration): string {
        const visibility = node.isPrivate ? '' : 'pub ';
        const name = node.name.name;
        const type = genType(node.fieldType);

        return `${ind()}${visibility}${name}: ${type},`;
    }

    /**
     * Generate constructor as Rust new() method.
     */
    function genConstructorAsNew(node: GenusDeclaration): string {
        const lines: string[] = [];
        const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => p.name).join(', ')}>` : '';
        const name = node.name.name;

        lines.push(`${ind()}pub fn new() -> ${name}${typeParams} {`);
        depth++;

        // Initialize fields with defaults
        lines.push(`${ind()}${name} {`);
        depth++;

        for (const field of node.fields) {
            const fieldName = field.name.name;
            if (field.init) {
                lines.push(`${ind()}${fieldName}: ${genExpression(field.init)},`);
            } else {
                lines.push(`${ind()}${fieldName}: Default::default(),`);
            }
        }

        depth--;
        lines.push(`${ind()}}`);

        depth--;
        lines.push(`${ind()}}`);

        return lines.join('\n');
    }

    /**
     * Generate method declaration within an impl block.
     */
    function genMethodDeclaration(node: FunctioDeclaration): string {
        const asyncMod = node.async ? 'async ' : '';
        const name = node.name.name;
        const params = ['&self', ...node.params.map(genParameter)].join(', ');

        let returnType = '';
        if (node.returnType) {
            returnType = ` -> ${genType(node.returnType)}`;
        }

        const body = genBlockStatement(node.body);

        return `${ind()}${asyncMod}fn ${name}(${params})${returnType} ${body}`;
    }

    /**
     * Generate pactum (trait) declaration.
     */
    function genPactumDeclaration(node: PactumDeclaration): string {
        const name = node.name.name;
        const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => p.name).join(', ')}>` : '';
        const lines: string[] = [];

        lines.push(`${ind()}trait ${name}${typeParams} {`);
        depth++;

        for (const method of node.methods) {
            lines.push(genPactumMethod(method));
        }

        depth--;
        lines.push(`${ind()}}`);

        return lines.join('\n');
    }

    function genPactumMethod(node: PactumMethod): string {
        const asyncMod = node.async ? 'async ' : '';
        const name = node.name.name;
        const params = ['&self', ...node.params.map(genParameter)].join(', ');
        let returnType = node.returnType ? ` -> ${genType(node.returnType)}` : '';

        return `${ind()}${asyncMod}fn ${name}(${params})${returnType};`;
    }

    /**
     * Generate type alias declaration.
     */
    function genTypeAliasDeclaration(node: TypeAliasDeclaration): string {
        const name = node.name.name;
        const typeAnno = genType(node.typeAnnotation);

        return `${ind()}type ${name} = ${typeAnno};`;
    }

    /**
     * Generate enum declaration.
     */
    function genOrdoDeclaration(node: OrdoDeclaration): string {
        const name = node.name.name;
        const lines: string[] = [];

        lines.push(`${ind()}enum ${name} {`);
        depth++;

        for (const member of node.members) {
            const memberName = member.name.name;
            if (member.value !== undefined) {
                const value = typeof member.value.value === 'string' ? `= "${member.value.value}"` : `= ${member.value.value}`;
                lines.push(`${ind()}${memberName} ${value},`);
            } else {
                lines.push(`${ind()}${memberName},`);
            }
        }

        depth--;
        lines.push(`${ind()}}`);

        return lines.join('\n');
    }

    /**
     * Generate discretio (enum with variants) declaration.
     *
     * TRANSFORMS:
     *   discretio Event { Click { numerus x }, Quit }
     *   -> enum Event { Click { x: f64 }, Quit }
     */
    function genDiscretioDeclaration(node: DiscretioDeclaration): string {
        const name = node.name.name;
        const typeParams = node.typeParameters ? `<${node.typeParameters.map(p => p.name).join(', ')}>` : '';
        const lines: string[] = [];

        lines.push(`${ind()}enum ${name}${typeParams} {`);
        depth++;

        for (const variant of node.variants) {
            lines.push(genVariantDeclaration(variant));
        }

        depth--;
        lines.push(`${ind()}}`);

        return lines.join('\n');
    }

    function genVariantDeclaration(node: VariantDeclaration): string {
        const name = node.name.name;

        if (node.fields.length === 0) {
            return `${ind()}${name},`;
        }

        const fields = node.fields.map(f => `${f.name.name}: ${genType(f.fieldType)}`).join(', ');

        return `${ind()}${name} { ${fields} },`;
    }

    /**
     * Generate type annotation.
     */
    function genType(node: TypeAnnotation): string {
        const typeName = node.name;
        const base = typeMap[typeName] ?? typeName;

        let result = base;

        if (node.typeParameters && node.typeParameters.length > 0) {
            const params = node.typeParameters.map(genTypeParameter).filter((p): p is string => p !== null);
            if (params.length > 0) {
                result = `${base}<${params.join(', ')}>`;
            }
        }

        // Handle nullable: textus? -> Option<String>
        if (node.nullable) {
            result = `Option<${result}>`;
        }

        // Handle preposition for borrowing
        if (node.preposition === 'de') {
            result = `&${result}`;
        } else if (node.preposition === 'in') {
            result = `&mut ${result}`;
        }

        return result;
    }

    function genTypeParameter(param: TypeParameter): string | null {
        if (param.type === 'TypeAnnotation') {
            return genType(param);
        }
        if (param.type === 'Literal') {
            return null; // Size literals not supported in Rust generics
        }
        return null;
    }

    // ---------------------------------------------------------------------------
    // Control Flow
    // ---------------------------------------------------------------------------

    function genSiStatement(node: SiStatement): string {
        let result = `${ind()}if ${genExpression(node.test)} ${genBlockStatement(node.consequent)}`;

        if (node.alternate) {
            if (node.alternate.type === 'SiStatement') {
                result += ` else ${genSiStatement(node.alternate).trim()}`;
            } else {
                result += ` else ${genBlockStatement(node.alternate)}`;
            }
        }

        return result;
    }

    function genDumStatement(node: DumStatement): string {
        const test = genExpression(node.test);
        const body = genBlockStatement(node.body);

        return `${ind()}while ${test} ${body}`;
    }

    function genIteratioStatement(node: IteratioStatement): string {
        const varName = node.variable.name;
        const body = genBlockStatement(node.body);

        if (node.iterable.type === 'RangeExpression') {
            const range = node.iterable;
            const start = genExpression(range.start);
            const end = genExpression(range.end);
            const rangeOp = range.inclusive ? '..=' : '..';

            return `${ind()}for ${varName} in ${start}${rangeOp}${end} ${body}`;
        }

        const iterable = genExpression(node.iterable);

        return `${ind()}for ${varName} in ${iterable} ${body}`;
    }

    function genInStatement(node: InStatement): string {
        const context = genExpression(node.object);
        const lines: string[] = [];

        for (const stmt of node.body.body) {
            if (
                stmt.type === 'ExpressionStatement' &&
                stmt.expression.type === 'AssignmentExpression' &&
                stmt.expression.left.type === 'Identifier'
            ) {
                const prop = stmt.expression.left.name;
                const value = genExpression(stmt.expression.right);
                lines.push(`${ind()}${context}.${prop} = ${value};`);
            } else {
                lines.push(genStatement(stmt));
            }
        }

        return lines.join('\n');
    }

    function genEligeStatement(node: EligeStatement): string {
        const discriminant = genExpression(node.discriminant);
        const lines: string[] = [];

        lines.push(`${ind()}match ${discriminant} {`);
        depth++;

        for (const caseNode of node.cases) {
            const test = genExpression(caseNode.test);
            const body = genBlockStatementInline(caseNode.consequent);
            lines.push(`${ind()}${test} => ${body},`);
        }

        if (node.defaultCase) {
            const body = genBlockStatementInline(node.defaultCase);
            lines.push(`${ind()}_ => ${body},`);
        }

        depth--;
        lines.push(`${ind()}}`);

        return lines.join('\n');
    }

    function genDiscerneStatement(node: DiscerneStatement): string {
        const discriminant = genExpression(node.discriminant);
        const lines: string[] = [];

        lines.push(`${ind()}match ${discriminant} {`);
        depth++;

        for (const caseNode of node.cases) {
            const variantName = caseNode.variant.name;
            let pattern: string;

            if (caseNode.bindings.length > 0) {
                const bindings = caseNode.bindings.map(b => b.name).join(', ');
                pattern = `${variantName} { ${bindings} }`;
            } else {
                pattern = variantName;
            }

            const body = genBlockStatementInline(caseNode.consequent);
            lines.push(`${ind()}${pattern} => ${body},`);
        }

        depth--;
        lines.push(`${ind()}}`);

        return lines.join('\n');
    }

    function genCustodiStatement(node: CustodiStatement): string {
        const lines: string[] = [];

        for (const clause of node.clauses) {
            const test = genExpression(clause.test);
            const body = genBlockStatement(clause.consequent);
            lines.push(`${ind()}if ${test} ${body}`);
        }

        return lines.join('\n');
    }

    function genAdfirmaStatement(node: AdfirmaStatement): string {
        const test = genExpression(node.test);

        if (node.message) {
            const msg = genExpression(node.message);
            return `${ind()}assert!(${test}, ${msg});`;
        }

        return `${ind()}assert!(${test});`;
    }

    function genReddeStatement(node: ReddeStatement): string {
        if (node.argument) {
            return `${ind()}return ${genExpression(node.argument)};`;
        }
        return `${ind()}return;`;
    }

    function genIaceStatement(node: IaceStatement): string {
        const expr = genExpression(node.argument);

        if (node.fatal) {
            return `${ind()}panic!(${expr});`;
        }

        return `${ind()}return Err(${expr});`;
    }

    function genScribeStatement(node: ScribeStatement): string {
        const args = node.arguments.map(genExpression).join(', ');
        const macro = node.level === 'debug' ? 'dbg!' : 'println!';

        return `${ind()}${macro}(${args});`;
    }

    function genTemptaStatement(node: TemptaStatement): string {
        // Rust doesn't have try-catch, emit as comment + block
        const lines: string[] = [];
        lines.push(`${ind()}// tempta (try) - Rust uses Result<T, E> instead`);
        lines.push(`${ind()}${genBlockStatement(node.block)}`);

        return lines.join('\n');
    }

    function genFacBlockStatement(node: FacBlockStatement): string {
        return `${ind()}${genBlockStatement(node.body)}`;
    }

    function genBlockStatement(node: BlockStatement): string {
        if (node.body.length === 0) {
            return '{}';
        }

        depth++;
        const body = node.body.map(genStatement).join('\n');
        depth--;

        return `{\n${body}\n${ind()}}`;
    }

    /**
     * Generate block statement inline (for match arms).
     */
    function genBlockStatementInline(node: BlockStatement): string {
        if (node.body.length === 0) {
            return '{}';
        }

        if (node.body.length === 1) {
            const stmt = node.body[0]!;
            if (stmt.type === 'ExpressionStatement') {
                return genExpression(stmt.expression);
            }
            if (stmt.type === 'ReddeStatement' && stmt.argument) {
                return genExpression(stmt.argument);
            }
        }

        return genBlockStatement(node);
    }

    function genExpressionStatement(node: ExpressionStatement): string {
        return `${ind()}${genExpression(node.expression)};`;
    }

    // ---------------------------------------------------------------------------
    // Test Declarations
    // ---------------------------------------------------------------------------

    function genProbandumStatement(node: ProbandumStatement): string {
        const lines: string[] = [];
        lines.push(`${ind()}// Test suite: ${node.name}`);
        lines.push(`${ind()}#[cfg(test)]`);
        lines.push(`${ind()}mod tests {`);
        depth++;

        for (const member of node.body) {
            switch (member.type) {
                case 'ProbandumStatement':
                    lines.push(genProbandumStatement(member));
                    break;
                case 'ProbaStatement':
                    lines.push(genProbaStatement(member));
                    break;
                case 'CuraBlock':
                    lines.push(genCuraBlock(member));
                    break;
            }
        }

        depth--;
        lines.push(`${ind()}}`);

        return lines.join('\n');
    }

    function genProbaStatement(node: ProbaStatement): string {
        const testName = node.name.replace(/\s+/g, '_').toLowerCase();

        if (node.modifier === 'omitte') {
            return `${ind()}#[ignore]\n${ind()}#[test]\n${ind()}fn ${testName}() ${genBlockStatement(node.body)}`;
        }

        if (node.modifier === 'futurum') {
            return `${ind()}// TODO: ${node.name}`;
        }

        return `${ind()}#[test]\n${ind()}fn ${testName}() ${genBlockStatement(node.body)}`;
    }

    function genCuraBlock(node: CuraBlock): string {
        // Rust tests don't have setup/teardown hooks like Jest
        // Emit as helper function
        const timing = node.timing === 'ante' ? 'setup' : 'teardown';
        const scope = node.omnia ? 'all' : 'each';

        return `${ind()}// ${timing}_${scope}: ${genBlockStatement(node.body)}`;
    }

    function genCuraStatement(node: CuraStatement): string {
        const binding = node.binding.name;
        const resource = genExpression(node.resource);
        const awaitSuffix = node.async ? '.await' : '';
        const body = genBlockStatement(node.body);

        // Rust uses RAII, but we can emit a scoped block
        return `${ind()}let ${binding} = ${resource}${awaitSuffix};\n${ind()}${body}`;
    }

    // ---------------------------------------------------------------------------
    // Expressions
    // ---------------------------------------------------------------------------

    function genExpression(node: Expression): string {
        switch (node.type) {
            case 'Identifier':
                return node.name;
            case 'Literal':
                return genLiteral(node);
            case 'TemplateLiteral':
                return `format!("${node.raw}")`;
            case 'EgoExpression':
                return 'self';
            case 'ArrayExpression':
                return genArrayExpression(node);
            case 'BinaryExpression':
                return genBinaryExpression(node);
            case 'UnaryExpression':
                return genUnaryExpression(node);
            case 'CallExpression':
                return genCallExpression(node);
            case 'MemberExpression':
                return genMemberExpression(node);
            case 'ArrowFunctionExpression':
                return genArrowFunction(node);
            case 'AssignmentExpression':
                return genAssignmentExpression(node);
            case 'CedeExpression':
                return `${genExpression(node.argument)}.await`;
            case 'NovumExpression':
                return genNovumExpression(node);
            case 'ConditionalExpression':
                return `if ${genExpression(node.test)} { ${genExpression(node.consequent)} } else { ${genExpression(node.alternate)} }`;
            case 'RangeExpression':
                return genRangeExpression(node);
            case 'ObjectExpression':
                return genObjectExpression(node);
            case 'LambdaExpression':
                return genLambdaExpression(node);
            case 'QuaExpression':
                return genQuaExpression(node);
            case 'EstExpression':
                return genEstExpression(node);
            case 'PraefixumExpression':
                return genPraefixumExpression(node);
            default:
                throw new Error(`Unknown expression type: ${(node as any).type}`);
        }
    }

    function genLiteral(node: Literal): string {
        if (node.value === null) {
            return 'None';
        }

        if (typeof node.value === 'string') {
            return `String::from(${JSON.stringify(node.value)})`;
        }

        if (typeof node.value === 'boolean') {
            return node.value ? 'true' : 'false';
        }

        if (typeof node.value === 'bigint') {
            return `${node.raw}i128`;
        }

        return node.raw;
    }

    function genArrayExpression(node: ArrayExpression): string {
        const elements = node.elements
            .map(el => {
                if (el.type === 'SpreadElement') {
                    // Rust doesn't have spread in array literals
                    return `/* spread */ ${genExpression(el.argument)}`;
                }
                return genExpression(el);
            })
            .join(', ');

        return `vec![${elements}]`;
    }

    function genObjectExpression(node: ObjectExpression): string {
        if (node.properties.length === 0) {
            return '{}';
        }

        const props = node.properties.map(prop => {
            if (prop.type === 'SpreadElement') {
                return `..${genExpression(prop.argument)}`;
            }
            const key = prop.key.type === 'Identifier' ? prop.key.name : genLiteral(prop.key);
            const value = genExpression(prop.value);
            return `${key}: ${value}`;
        });

        return `{ ${props.join(', ')} }`;
    }

    function genRangeExpression(node: RangeExpression): string {
        const start = genExpression(node.start);
        const end = genExpression(node.end);
        const rangeOp = node.inclusive ? '..=' : '..';

        return `(${start}${rangeOp}${end})`;
    }

    function genBinaryExpression(node: BinaryExpression): string {
        const left = genExpression(node.left);
        const right = genExpression(node.right);

        return `(${left} ${node.operator} ${right})`;
    }

    function genUnaryExpression(node: UnaryExpression): string {
        const arg = genExpression(node.argument);

        // Rust-specific mappings
        if (node.operator === 'nulla') {
            return `${arg}.is_none()`;
        }
        if (node.operator === 'nonnulla') {
            return `${arg}.is_some()`;
        }
        if (node.operator === 'nihil') {
            return `${arg}.is_none()`;
        }
        if (node.operator === 'nonnihil') {
            return `${arg}.is_some()`;
        }

        return node.prefix ? `${node.operator}${arg}` : `${arg}${node.operator}`;
    }

    function genCallExpression(node: CallExpression): string {
        const args = node.arguments
            .map(arg => {
                if (arg.type === 'SpreadElement') {
                    return `/* spread */ ${genExpression(arg.argument)}`;
                }
                return genExpression(arg);
            })
            .join(', ');

        const callee = genExpression(node.callee);

        if (node.optional) {
            return `${callee}.map(|f| f(${args}))`;
        }

        return `${callee}(${args})`;
    }

    function genMemberExpression(node: MemberExpression): string {
        const obj = genExpression(node.object);

        if (node.computed) {
            const prop = genExpression(node.property);
            if (node.optional) {
                return `${obj}.get(${prop})`;
            }
            return `${obj}[${prop}]`;
        }

        const prop = (node.property as Identifier).name;

        if (node.optional) {
            return `${obj}.as_ref().map(|x| x.${prop})`;
        }

        return `${obj}.${prop}`;
    }

    function genArrowFunction(node: ArrowFunctionExpression): string {
        const params = node.params.map(p => p.name.name).join(', ');

        if (node.body.type === 'BlockStatement') {
            const body = genBlockStatement(node.body);
            return `|${params}| ${body}`;
        }

        const body = genExpression(node.body as Expression);
        return `|${params}| ${body}`;
    }

    function genLambdaExpression(node: LambdaExpression): string {
        const params = node.params.map(p => p.name).join(', ');
        const asyncPrefix = node.async ? 'async ' : '';

        if (node.body.type === 'BlockStatement') {
            const body = genBlockStatement(node.body);
            return `${asyncPrefix}|${params}| ${body}`;
        }

        const body = genExpression(node.body);
        return `${asyncPrefix}|${params}| ${body}`;
    }

    function genAssignmentExpression(node: AssignmentExpression): string {
        const left = node.left.type === 'Identifier' ? node.left.name : genExpression(node.left);
        return `${left} ${node.operator} ${genExpression(node.right)}`;
    }

    function genQuaExpression(node: QuaExpression): string {
        const expr = genExpression(node.expression);
        const targetType = genType(node.targetType);
        return `${expr} as ${targetType}`;
    }

    function genEstExpression(node: EstExpression): string {
        const expr = genExpression(node.expression);
        const typeName = node.targetType.name;

        // Rust type checks typically use pattern matching or trait methods
        if (node.negated) {
            return `!matches!(${expr}, ${typeName})`;
        }
        return `matches!(${expr}, ${typeName})`;
    }

    function genPraefixumExpression(node: PraefixumExpression): string {
        // Rust const evaluation
        if (node.body.type === 'BlockStatement') {
            return `const ${genBlockStatement(node.body)}`;
        }
        return `const { ${genExpression(node.body)} }`;
    }

    function genNovumExpression(node: NovumExpression): string {
        const callee = node.callee.name;

        if (node.withExpression && node.withExpression.type === 'ObjectExpression') {
            const obj = node.withExpression;
            const fields = obj.properties
                .filter((p): p is import('../../parser/ast').ObjectProperty => p.type === 'ObjectProperty')
                .map(p => {
                    const key = p.key.type === 'Identifier' ? p.key.name : genLiteral(p.key);
                    const value = genExpression(p.value);
                    return `${key}: ${value}`;
                });
            return `${callee} { ${fields.join(', ')} }`;
        }

        return `${callee}::new()`;
    }

    return genProgram(program);
}
