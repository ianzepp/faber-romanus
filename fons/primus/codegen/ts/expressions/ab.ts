/**
 * TypeScript Code Generator - Ab Expression (Collection Filtering DSL)
 *
 * TRANSFORMS:
 *   ab users activus                     -> users.filter(u => u.activus)
 *   ab users non banned                  -> users.filter(u => !u.banned)
 *   ab users ubi aetas >= 18             -> users.filter(u => u.aetas >= 18)
 *   ab users non ubi banned et suspended -> users.filter(u => !(u.banned && u.suspended))
 *   ab users activus, prima 10           -> users.filter(u => u.activus).slice(0, 10)
 *
 * WHY: 'ab' is the dedicated DSL entry point for collection filtering.
 *      The 'ex' preposition remains unchanged for iteration/import/destructuring.
 */

import type { AbExpression, Expression } from '../../../parser/ast';
import type { TsGenerator } from '../generator';
import { applyDSLTransforms } from '../statements/iteratio';

export function genAbExpression(node: AbExpression, g: TsGenerator): string {
    const source = g.genExpression(node.source);

    // If no filter, just apply transforms (edge case)
    if (!node.filter) {
        if (node.transforms) {
            return applyDSLTransforms(source, node.transforms, g);
        }
        return source;
    }

    // Generate the filter callback
    // Use a short lambda parameter name
    const param = '_x';
    let condition: string;

    if (node.filter.hasUbi) {
        // Full condition: ab users ubi aetas >= 18
        // Need to rewrite the condition to use the lambda parameter
        condition = rewriteCondition(node.filter.condition, param, g);
    } else {
        // Boolean property shorthand: ab users activus
        // The condition is just an identifier - use it as property access
        const propName = g.genExpression(node.filter.condition);
        condition = `${param}.${propName}`;
    }

    // Apply negation if present
    if (node.negated) {
        condition = `!(${condition})`;
    }

    // Build the filter call
    let result = `${source}.filter(${param} => ${condition})`;

    // Apply any additional transforms
    if (node.transforms) {
        result = applyDSLTransforms(result, node.transforms, g);
    }

    return result;
}

/**
 * Rewrite a condition expression to use the lambda parameter.
 *
 * WHY: In 'ab users ubi aetas >= 18', 'aetas' refers to a property of the
 *      current element. We need to rewrite bare identifiers as property accesses.
 *
 * EDGE: For now, we assume all identifiers in the condition are properties.
 *       A more sophisticated approach would use scope analysis.
 */
function rewriteCondition(expr: Expression, param: string, g: TsGenerator): string {
    // For simple cases, we can generate the expression and hope it works
    // A proper implementation would walk the AST and rewrite identifiers
    //
    // For now, generate the expression as-is. The user needs to write
    // conditions that make sense in the context of a filter callback.
    //
    // TODO: Implement proper identifier rewriting for implicit property access
    return g.genExpression(expr);
}
