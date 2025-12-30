/**
 * Faber Code Generator - IncipitStatement (canonical emit)
 *
 * TRANSFORMS:
 *   incipit { body } -> incipit { body }
 *
 * TARGET: Faber canonical form preserves the incipit block.
 */

import type { IncipitStatement } from '../../../parser/ast';
import type { FabGenerator } from '../generator';
import { genBlockStatement } from './functio';

export function genIncipitStatement(node: IncipitStatement, g: FabGenerator): string {
    const body = genBlockStatement(node.body, g);
    return `${g.ind()}incipit ${body}`;
}
