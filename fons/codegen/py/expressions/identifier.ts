/**
 * Python Code Generator - Identifier Expression
 *
 * TRANSFORMS:
 *   other -> other (unchanged)
 *   PI -> math.pi (mathesis constant)
 *
 * NOTE: verum/falsum/nihil are parsed as Literals, not Identifiers,
 *       so they're handled by literal.ts, not here.
 */

import type { Identifier } from '../../../parser/ast';
import type { PyGenerator } from '../generator';
import { getMathesisConstant } from '../norma/mathesis';

export function genIdentifier(node: Identifier, g: PyGenerator): string {
    // Check for mathesis constants (PI, E, TAU)
    const mathesisConst = getMathesisConstant(node.name);
    if (mathesisConst) {
        if (mathesisConst.requiresMath) {
            g.features.math = true;
        }
        return mathesisConst.py;
    }

    return node.name;
}
