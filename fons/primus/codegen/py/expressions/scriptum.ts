/**
 * Python Code Generator - Scriptum Expression (format string)
 *
 * TRANSFORMS:
 *   scriptum("Hello, {}!", name) -> "Hello, {}!".format(name)
 *
 * TARGET: Python's str.format() method for string formatting.
 *
 * WHY: Python uses {} placeholders natively in format strings,
 *      so the format string passes through directly.
 */

import type { ScriptumExpression } from '../../../parser/ast';
import type { PyGenerator } from '../generator';

export function genScriptumExpression(node: ScriptumExpression, g: PyGenerator): string {
    const format = node.format.value as string;

    if (node.arguments.length === 0) {
        // No args - just return the format string as a string literal
        return `"${format}"`;
    }

    const args = node.arguments.map(arg => g.genExpression(arg)).join(', ');

    return `"${format}".format(${args})`;
}
