/**
 * TypeScript Preamble Generator
 *
 * Reads preamble snippets from .txt files and assembles them based on features used.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { RequiredFeatures } from '../../types';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read preamble files once at module load
const PANIC = readFileSync(join(__dirname, 'panic.txt'), 'utf-8');
const DECIMAL = readFileSync(join(__dirname, 'decimal.txt'), 'utf-8');
const FLUMINA = readFileSync(join(__dirname, 'flumina.txt'), 'utf-8');

/**
 * Generate preamble based on features used.
 *
 * @param features - Feature flags set during codegen traversal
 * @returns Preamble string (empty if no features need setup)
 */
export function genPreamble(features: RequiredFeatures): string {
    const imports: string[] = [];
    const definitions: string[] = [];

    if (features.decimal) {
        imports.push(DECIMAL);
    }

    if (features.panic) {
        definitions.push(PANIC);
    }

    if (features.flumina) {
        definitions.push(FLUMINA);
    }

    const lines = [...imports, ...definitions];
    return lines.length > 0 ? lines.join('\n') + '\n\n' : '';
}
