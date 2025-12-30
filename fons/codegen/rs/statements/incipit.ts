/**
 * Rust Code Generator - IncipitStatement (entry point)
 *
 * TRANSFORMS:
 *   incipit { body } -> fn main() { body }
 *
 * TARGET: Rust uses fn main() as the program entry point.
 */

import type { IncipitStatement } from '../../../parser/ast';
import type { RsGenerator } from '../generator';
import { genBlockStatement } from './functio';

export function genIncipitStatement(node: IncipitStatement, g: RsGenerator): string {
    const body = genBlockStatement(node.body, g);
    return `${g.ind()}fn main() ${body}`;
}
