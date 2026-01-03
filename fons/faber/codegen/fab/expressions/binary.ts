/**
 * Faber Code Generator - BinaryExpression
 *
 * STYLE: Uses && and || (canonical), not et/aut
 */

import type { BinaryExpression } from '../../../parser/ast';
import type { FabGenerator } from '../generator';

export function genBinaryExpression(node: BinaryExpression, g: FabGenerator): string {
    const left = g.genExpression(node.left);
    const right = g.genExpression(node.right);
    return `(${left} ${node.operator} ${right})`;
}
