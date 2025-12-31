/**
 * TypeScript Code Generator - Lege Expression (read stdin)
 *
 * TRANSFORMS:
 *   lege() -> await Bun.stdin.text()
 *
 * TARGET: Bun's stdin API for reading all input as text.
 *
 * WHY: Bootstrap compiler needs to read source from stdin.
 *      Uses Bun runtime which is our default TS execution environment.
 */

import type { LegeExpression } from '../../../parser/ast';
import type { TsGenerator } from '../generator';

export function genLegeExpression(_node: LegeExpression, _g: TsGenerator): string {
    // WHY: Bun.stdin.text() returns a Promise<string> with all stdin content
    return 'await Bun.stdin.text()';
}
