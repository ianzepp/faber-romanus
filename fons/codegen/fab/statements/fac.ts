/**
 * Faber Code Generator - FacBlockStatement (do block)
 */

import type { FacBlockStatement } from '../../../parser/ast';
import type { FabGenerator } from '../generator';
import { genBlockStatement } from './functio';

export function genFacBlockStatement(node: FacBlockStatement, g: FabGenerator): string {
    let result = `${g.ind()}fac ${genBlockStatement(node.body, g)}`;

    if (node.catchClause) {
        result += ` cape ${node.catchClause.param.name} ${genBlockStatement(node.catchClause.body, g)}`;
    }

    return result;
}
