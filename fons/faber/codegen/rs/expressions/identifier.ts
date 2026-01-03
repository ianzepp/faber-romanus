/**
 * Rust Code Generator - Identifier Expression
 *
 * TRANSFORMS:
 *   myVar -> myVar
 *   PI -> std::f64::consts::PI
 *   E -> std::f64::consts::E
 *   TAU -> std::f64::consts::TAU
 *   SECUNDUM -> 1000_i64
 */

import type { Identifier } from '../../../parser/ast';
import type { RsGenerator } from '../generator';
import { getMathesisConstant } from '../norma/mathesis';
import { getTempusConstant } from '../norma/tempus';

export function genIdentifier(node: Identifier, _g: RsGenerator): string {
    // Check for mathesis constants (PI, E, TAU)
    const mathesisConst = getMathesisConstant(node.name);
    if (mathesisConst) {
        return mathesisConst;
    }

    // Check for tempus constants (MILLISECUNDUM, SECUNDUM, MINUTUM, HORA, DIES)
    const tempusConst = getTempusConstant(node.name);
    if (tempusConst) {
        return tempusConst;
    }

    return node.name;
}
