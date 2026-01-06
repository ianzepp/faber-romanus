/**
 * TypeScript Code Generator - SiStatement
 *
 * TRANSFORMS:
 *   si cond { block }                    -> if (cond) { block }
 *   si cond { block } secus { alt }      -> if (cond) { block } else { alt }
 *   si cond { block } cape err { hand }  -> if (cond) { try { block } catch (err) { hand } }
 *   si cond { b } cape e { h } secus { a } -> if (cond) { try { b } catch (e) { h } } else { a }
 *
 * WHY: Latin 'cape' clause wraps the consequent block in try-catch, not the entire if.
 *      This allows catching errors inside the if-true branch while still having else.
 */

import type { SiStatement } from '../../../parser/ast';
import type { TsGenerator } from '../generator';
import { genBlockStatement } from './functio';

export function genSiStatement(node: SiStatement, g: TsGenerator): string {
    let result = '';

    result += `${g.ind()}if (${g.genExpression(node.test)}) `;

    // WHY: 'cape' wraps the consequent block in try-catch, inside the if
    if (node.catchClause) {
        result += `{\n`;
        g.depth++;
        result += `${g.ind()}try ${genBlockStatement(node.consequent, g)}`;
        result += ` catch (${node.catchClause.param.name}) ${genBlockStatement(node.catchClause.body, g)}\n`;
        g.depth--;
        result += `${g.ind()}}`;
    }
    else {
        result += genBlockStatement(node.consequent, g);
    }

    if (node.alternate) {
        if (node.alternate.type === 'SiStatement') {
            result += ` else ${genSiStatement(node.alternate, g).trim()}`;
        }
        else {
            result += ` else ${genBlockStatement(node.alternate, g)}`;
        }
    }

    return result;
}
