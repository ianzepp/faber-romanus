/**
 * Rust Code Generator - Scriptum Expression (format string)
 *
 * TRANSFORMS:
 *   scriptum("Hello, {}!", name) -> format!("Hello, {}!", name)
 *   scriptum("Hello, §!", name) -> format!("Hello, {}!", name)
 *
 * TARGET: Rust's format! macro for string formatting.
 *
 * WHY: Rust uses {} placeholders natively in format strings,
 *      so the format string passes through directly after converting
 *      § placeholders to {}.
 */

import type { ScriptumExpression } from '../../../parser/ast';
import type { RsGenerator } from '../generator';

export function genScriptumExpression(node: ScriptumExpression, g: RsGenerator): string {
    // Convert § placeholders to {} for Rust format!()
    const format = (node.format.value as string).replace(/§/g, '{}');

    if (node.arguments.length === 0) {
        // No args - just return the format string as a string literal
        return `"${format}".to_string()`;
    }

    const args = node.arguments.map(arg => g.genExpression(arg)).join(', ');

    return `format!("${format}", ${args})`;
}
