/**
 * Faber Code Generator - CallExpression
 */

import type { CallExpression } from '../../../parser/ast';
import type { FabGenerator } from '../generator';

export function genCallExpression(node: CallExpression, g: FabGenerator): string {
    const callee = g.genExpression(node.callee);
    const args = node.arguments.map(arg => {
        if (arg.type === 'SpreadElement') {
            return `sparge ${g.genExpression(arg.argument)}`;
        }
        return g.genExpression(arg);
    });

    const op = node.optional ? '?(' : node.nonNull ? '!(' : '(';
    return `${callee}${op}${args.join(', ')})`;
}
