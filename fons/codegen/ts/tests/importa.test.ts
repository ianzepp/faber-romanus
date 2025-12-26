/**
 * Importa - Import declaration codegen tests.
 *
 * Covers: ex...importa, wildcard imports, norma intrinsics.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('importa', () => {
    describe('imports', () => {
        test('norma imports are suppressed (handled via intrinsics)', () => {
            const js = compile('ex "norma/tempus" importa nunc');

            // norma imports don't emit import statements
            expect(js).not.toContain('import');
            expect(js).toBe('');
        });

        test('external package imports pass through', () => {
            const js = compile('ex "@hono/hono" importa Hono, Context');

            expect(js).toBe('import { Hono, Context } from "@hono/hono";');
        });

        test('nunc() compiles to Date.now()', () => {
            const js = compile(`
                ex "norma/tempus" importa nunc
                fixum now = nunc()
            `);

            expect(js).not.toContain('import');
            expect(js).toContain('const now = Date.now()');
        });

        test('SECUNDUM compiles to literal 1000', () => {
            const js = compile(`
                ex "norma/tempus" importa SECUNDUM
                fixum sec = SECUNDUM
            `);

            expect(js).not.toContain('import');
            expect(js).toContain('const sec = 1000');
        });

        test('dormi compiles to Promise with setTimeout', () => {
            const js = compile(`
                ex "norma/tempus" importa dormi, SECUNDUM
                futura functio wait() {
                    cede dormi(5 * SECUNDUM)
                }
            `);

            expect(js).not.toContain('import');
            expect(js).toContain('await new Promise(r => setTimeout(r, (5 * 1000)))');
        });

        test('all duration constants compile to literals', () => {
            const js = compile(`
                ex "norma/tempus" importa MILLISECUNDUM, SECUNDUM, MINUTUM, HORA, DIES
                fixum a = MILLISECUNDUM
                fixum b = SECUNDUM
                fixum c = MINUTUM
                fixum d = HORA
                fixum e = DIES
            `);

            expect(js).not.toContain('import');
            expect(js).toContain('const a = 1');
            expect(js).toContain('const b = 1000');
            expect(js).toContain('const c = 60000');
            expect(js).toContain('const d = 3600000');
            expect(js).toContain('const e = 86400000');
        });
    });

    describe('wildcard imports', () => {
        test('wildcard import from external package', () => {
            const js = compile('ex "@lodash/lodash" importa *');

            expect(js).toContain('import * as @lodash/lodash from "@lodash/lodash"');
        });
    });
});
