/**
 * Faber Code Generator - ArrowFunctionExpression
 */

import type { ArrowFunctionExpression } from '../../../parser/ast';
import type { FabGenerator } from '../generator';
import { genBlockStatement } from '../statements/functio';

export function genArrowFunction(node: ArrowFunctionExpression, g: FabGenerator): string {
    const params = node.params.map(p => g.genParameter(p)).join(', ');

    if (node.body.type === 'BlockStatement') {
        const body = genBlockStatement(node.body, g);
        return `(${params}) => ${body}`;
    }

    const body = g.genExpression(node.body);
    return `(${params}) => ${body}`;
}
