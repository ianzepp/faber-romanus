/**
 * Python Preamble Generator
 *
 * Reads preamble snippets from .txt files and assembles them based on features used.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { RequiredFeatures } from '../../types';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read preamble files once at module load
const PRAEFIXUM = readFileSync(join(__dirname, 'praefixum.txt'), 'utf-8');

/**
 * Generate preamble based on features used.
 *
 * @param features - Feature flags set during codegen traversal
 * @returns Preamble string (empty if no features need setup)
 */
export function genPreamble(features: RequiredFeatures): string {
    const imports: string[] = [];
    const helpers: string[] = [];

    if (features.enum) {
        imports.push('from enum import Enum, auto');
    }

    if (features.decimal) {
        imports.push('from decimal import Decimal');
    }

    if (features.usesRegex) {
        imports.push('import re');
    }

    if (features.math) {
        imports.push('import math');
    }

    if (features.random) {
        imports.push('import random');
    }

    if (features.uuid) {
        imports.push('import uuid');
    }

    if (features.secrets) {
        imports.push('import secrets');
    }

    if (features.sys) {
        imports.push('import sys');
    }

    if (features.warnings) {
        imports.push('import warnings');
    }

    if (features.time) {
        imports.push('import time');
    }

    if (features.praefixum) {
        helpers.push(PRAEFIXUM);
    }

    const parts: string[] = [];
    if (imports.length > 0) {
        parts.push(imports.join('\n'));
    }
    if (helpers.length > 0) {
        parts.push(helpers.join('\n\n'));
    }

    return parts.length > 0 ? parts.join('\n\n') + '\n\n' : '';
}
