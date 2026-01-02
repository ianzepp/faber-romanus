/**
 * C++23 Code Generator - BinaryExpression
 *
 * TRANSFORMS:
 *   a + b           -> (a + b)
 *   a === b         -> (a == b)
 *   a !== b         -> (a != b)
 *   a && b          -> (a && b)
 *   a || b          -> (a || b)
 *   a ?? b          -> (a != nullptr ? a : b)
 *   x intra 0..100  -> (x >= 0 && x < 100)
 *   x inter [1,2,3] -> std::ranges::contains(std::vector{1,2,3}, x)
 *
 * WHY: C++ has no ?? operator; use ternary with nullptr check.
 *      For std::optional, would use .value_or() instead.
 */

import type { BinaryExpression, RangeExpression } from '../../../parser/ast';
import type { CppGenerator } from '../generator';

/**
 * Map operators to C++ equivalents.
 */
function mapOperator(op: string): string {
    switch (op) {
        case '===':
            return '==';
        case '!==':
            return '!=';
        case '&&':
            return '&&';
        case '||':
            return '||';
        default:
            return op;
    }
}

export function genBinaryExpression(node: BinaryExpression, g: CppGenerator): string {
    const left = g.genExpression(node.left);
    const right = g.genExpression(node.right);

    // WHY: C++ has no ?? operator; use ternary with nullptr check
    //      For std::optional, would use .value_or() instead
    if (node.operator === '??') {
        return `(${left} != nullptr ? ${left} : ${right})`;
    }

    // Range containment: x intra range
    // TRANSFORMS: x intra 0..100 -> (x >= 0 && x < 100)
    if (node.operator === 'intra') {
        if (node.right.type === 'RangeExpression') {
            const range = node.right as RangeExpression;
            const start = g.genExpression(range.start);
            const end = g.genExpression(range.end);
            const endOp = range.inclusive ? '<=' : '<';
            return `(${left} >= ${start} && ${left} ${endOp} ${end})`;
        }
        return `(${left} intra ${right})`;
    }

    // Set membership: x inter array
    // TRANSFORMS: x inter [1, 2, 3] -> std::ranges::contains(right, left)
    // WHY: C++23 adds std::ranges::contains for convenient membership testing
    if (node.operator === 'inter') {
        return `std::ranges::contains(${right}, ${left})`;
    }

    const op = mapOperator(node.operator);

    return `(${left} ${op} ${right})`;
}
