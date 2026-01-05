/**
 * TypeScript Code Generator - Scriptum Expression (format string)
 *
 * TRANSFORMS:
 *   scriptum("Hello, §!", name) -> `Hello, ${name}!`
 *
 * TARGET: TypeScript template literals for string interpolation.
 *
 * WHY: TS has native template literals, so we transform § placeholders
 *      into ${arg} interpolations. This provides the most idiomatic output.
 *
 * NOTE: Placeholder count must match argument count. Extra args are ignored,
 *       missing args produce undefined. Faber does not validate at compile time.
 */

import type { ScriptumExpression } from '../../../parser/ast';
import type { TsGenerator } from '../generator';

export function genScriptumExpression(node: ScriptumExpression, g: TsGenerator): string {
    const format = node.format.value as string;

    if (node.arguments.length === 0) {
        return `"${format}"`;
    }

    // Transform format string with § placeholders into template literal
    const args = node.arguments.map(arg => g.genExpression(arg));
    let argIndex = 0;

    let template = '';
    for (let i = 0; i < format.length; i++) {
        if (format[i] === '§') {
            const arg = args[argIndex++] ?? 'undefined';
            template += `\${${arg}}`;
        }
        else {
            template += format[i];
        }
    }

    return `\`${template}\``;
}
