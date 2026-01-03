/**
 * C++23 Code Generator - Scriptum Expression (format string)
 *
 * TRANSFORMS:
 *   scriptum("Hello, {}!", name) -> std::format("Hello, {}!", name)
 *
 * TARGET: C++20's std::format for string formatting.
 *
 * WHY: C++20 introduced {} placeholder syntax matching Python/Rust,
 *      so the format string passes through directly.
 *
 * NOTE: Requires C++20 or later. For older standards, would need sprintf.
 */

import type { ScriptumExpression } from '../../../parser/ast';
import type { CppGenerator } from '../generator';

export function genScriptumExpression(node: ScriptumExpression, g: CppGenerator): string {
    const format = node.format.value as string;

    if (node.arguments.length === 0) {
        // No args - just return the format string as a string literal
        return `"${format}"`;
    }

    const args = node.arguments.map(arg => g.genExpression(arg)).join(', ');

    return `std::format("${format}", ${args})`;
}
