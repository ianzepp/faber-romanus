/**
 * Faber Code Generator - BinaryExpression
 *
 * BUG: Outputs operators as-is from AST. Should map to Faber canonical forms:
 *   && -> et, || -> aut, ! -> non
 * See issue #81 for full fab codegen fixes needed.
 */

import type { BinaryExpression } from '../../../parser/ast';
import type { FabGenerator } from '../generator';

export function genBinaryExpression(node: BinaryExpression, g: FabGenerator): string {
    const left = g.genExpression(node.left);
    const right = g.genExpression(node.right);
    return `(${left} ${node.operator} ${right})`;
}
