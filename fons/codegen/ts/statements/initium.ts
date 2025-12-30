/**
 * TypeScript Code Generator - IncipitStatement (entry point)
 *
 * TRANSFORMS:
 *   incipit { body } -> body (top-level statements)
 *
 * TARGET: TypeScript/JavaScript executes top-level code directly.
 *         No wrapper function needed - just emit the body statements.
 */

import type { IncipitStatement } from '../../../parser/ast';
import type { TsGenerator } from '../generator';

export function genIncipitStatement(node: IncipitStatement, g: TsGenerator): string {
    // Just emit the body statements - no wrapper needed for TS
    return g.genBlockStatementContent(node.body);
}
