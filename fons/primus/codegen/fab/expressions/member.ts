/**
 * Faber Code Generator - MemberExpression
 */

import type { MemberExpression } from '../../../parser/ast';
import type { FabGenerator } from '../generator';

export function genMemberExpression(node: MemberExpression, g: FabGenerator): string {
    const obj = g.genExpression(node.object);
    const prop = g.genExpression(node.property);

    if (node.computed) {
        const op = node.optional ? '?[' : node.nonNull ? '![' : '[';
        return `${obj}${op}${prop}]`;
    }

    const dot = node.optional ? '?.' : node.nonNull ? '!.' : '.';
    return `${obj}${dot}${prop}`;
}
