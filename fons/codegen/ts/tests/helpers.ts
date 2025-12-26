/**
 * Shared test helpers for TypeScript codegen tests.
 */

import { tokenize } from '../../../tokenizer';
import { parse } from '../../../parser';
import { analyze } from '../../../semantic';
import { generate } from '../../index';

/**
 * Compile Faber source to TypeScript.
 */
export function compile(code: string): string {
    const { tokens } = tokenize(code);
    const { program } = parse(tokens);

    if (!program) {
        throw new Error('Parse failed');
    }

    // WHY: Run semantic analysis to populate resolvedType on AST nodes.
    // This is required for correct collection method dispatch.
    const { program: analyzedProgram } = analyze(program);

    return generate(analyzedProgram);
}

/**
 * Get parse errors from invalid syntax.
 */
export function getParseErrors(code: string): string[] {
    const { tokens } = tokenize(code);
    const { errors } = parse(tokens);
    return errors.map(e => e.message);
}
