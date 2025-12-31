/**
 * Zig Code Generator - Arrow Function Expression
 *
 * TRANSFORMS:
 *   (x) => x + 1 -> struct { fn call(x: anytype) i64 { return (x + 1); } }.call
 *
 * TARGET: Zig doesn't have arrow functions or lambdas as first-class values.
 *         We emulate with anonymous struct containing a function.
 *         Return type is inferred from semantic analysis.
 *
 * LIMITATION: Closures are not properly supported - captured variables
 *             would need to be passed explicitly via context struct.
 */

import type { ArrowFunctionExpression, Expression } from '../../../parser/ast';
import type { ZigGenerator } from '../generator';

export function genArrowFunction(node: ArrowFunctionExpression, g: ZigGenerator): string {
    const params = node.params.map(p => `${p.name.name}: anytype`).join(', ');

    // Get return type from semantic analysis
    let returnType: string;

    if (node.resolvedType?.kind === 'function') {
        returnType = g.semanticTypeToZig(node.resolvedType.returnType);
    } else {
        return `@compileError("Arrow function return type could not be inferred for Zig target")`;
    }

    // Block body - generate full function block
    if (node.body.type === 'BlockStatement') {
        const body = g.genBlockStatement(node.body);
        return `struct { fn call(${params}) ${returnType} ${body} }.call`;
    }

    // Expression body - wrap in return statement
    const body = g.genExpression(node.body as Expression);
    return `struct { fn call(${params}) ${returnType} { return ${body}; } }.call`;
}
