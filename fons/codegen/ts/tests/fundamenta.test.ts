/**
 * Fundamenta - Basic language constructs codegen tests.
 *
 * Covers: variable declarations, literals, object/array literals, scribe.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('fundamenta', () => {
    describe('variable declarations', () => {
        test('varia -> let', () => {
            const js = compile('varia nomen = "Marcus"');

            expect(js).toBe('let nomen = "Marcus";');
        });

        test('fixum -> const', () => {
            const js = compile('fixum PI = 3.14159');

            expect(js).toBe('const PI = 3.14159;');
        });

        test('figendum -> const with await', () => {
            const js = compile(`
                futura functio fetchData() -> textus { redde "data" }
                figendum data = fetchData()
            `);

            expect(js).toContain('const data = await fetchData()');
        });

        test('variandum -> let with await', () => {
            const js = compile(`
                futura functio getResult() -> numerus { redde 42 }
                variandum result = getResult()
            `);

            expect(js).toContain('let result = await getResult()');
        });

        test('figendum with type annotation', () => {
            const js = compile(`
                futura functio fetch() -> textus { redde "x" }
                figendum textus data = fetch()
            `);

            expect(js).toContain('const data: string = await fetch()');
        });

        test('variandum with type annotation', () => {
            const js = compile(`
                futura functio getCount() -> numerus { redde 1 }
                variandum numerus count = getCount()
            `);

            expect(js).toContain('let count: number = await getCount()');
        });

        test('multiple async bindings', () => {
            const js = compile(`
                futura functio fetchA() -> textus { redde "a" }
                futura functio fetchB() -> textus { redde "b" }
                figendum a = fetchA()
                figendum b = fetchB()
            `);

            expect(js).toContain('const a = await fetchA()');
            expect(js).toContain('const b = await fetchB()');
        });

        test('mixed async and sync bindings', () => {
            const js = compile(`
                futura functio fetch() -> textus { redde "x" }
                fixum sync = "static"
                figendum async = fetch()
            `);

            expect(js).toContain('const sync = "static"');
            expect(js).toContain('const async = await fetch()');
        });
    });

    describe('special expressions', () => {
        test('cede -> await', () => {
            const js = compile('cede fetch(url)');

            expect(js).toBe('await fetch(url);');
        });

        test('novum -> new', () => {
            const js = compile('novum erratum(message)');

            expect(js).toBe('new erratum(message);');
        });

        test('verum -> true', () => {
            const js = compile('verum');

            expect(js).toBe('true;');
        });

        test('falsum -> false', () => {
            const js = compile('falsum');

            expect(js).toBe('false;');
        });

        test('nihil -> null', () => {
            const js = compile('nihil');

            expect(js).toBe('null;');
        });
    });

    describe('object literals', () => {
        test('empty object', () => {
            const js = compile('fixum x = {}');

            expect(js).toBe('const x = {};');
        });

        test('object with properties', () => {
            const js = compile('fixum user = { nomen: "Marcus", aetas: 30 }');

            expect(js).toBe('const user = { nomen: "Marcus", aetas: 30 };');
        });

        test('object with expression values', () => {
            const js = compile('fixum data = { sum: 1 + 2, active: verum }');

            expect(js).toBe('const data = { sum: (1 + 2), active: true };');
        });
    });

    describe('array literals', () => {
        test('empty array', () => {
            const js = compile('fixum arr = []');

            expect(js).toBe('const arr = [];');
        });

        test('array with elements', () => {
            const js = compile('fixum nums = [1, 2, 3]');

            expect(js).toBe('const nums = [1, 2, 3];');
        });
    });

    describe('hex literals', () => {
        test('hex numbers are preserved', () => {
            const js = compile('fixum x = 0xFF');

            expect(js).toBe('const x = 0xFF;');
        });

        test('hex literal passes through', () => {
            const js = compile('fixum mask = 0xFF');

            expect(js).toBe('const mask = 0xFF;');
        });

        test('hex in expressions', () => {
            const js = compile('0xFF & 0x0F');

            expect(js).toBe('(0xFF & 0x0F);');
        });

        test('hex literal in expression', () => {
            const js = compile('fixum result = 0xFF - 0xAA');

            expect(js).toContain('const result');
            expect(js).toContain('0xFF - 0xAA');
        });

        test('hex bigint passes through', () => {
            const js = compile('fixum big = 0xFFFFFFFFFFn');

            expect(js).toBe('const big = 0xFFFFFFFFFFn;');
        });

        test('lowercase hex', () => {
            const js = compile('fixum val = 0xabcdef');

            expect(js).toBe('const val = 0xabcdef;');
        });
    });

    describe('template literals', () => {
        test('template string preserved', () => {
            const js = compile('fixum msg = `hello ${name}`');

            expect(js).toContain('`hello ${name}`');
        });

        test('simple template literal', () => {
            const js = compile('fixum msg = `hello world`');

            expect(js).toBe('const msg = `hello world`;');
        });

        test('template literal with interpolation', () => {
            const js = compile(`
                fixum name = "Marcus"
                fixum greeting = \`Hello, \${name}!\`
            `);

            expect(js).toContain('const greeting = `Hello, ${name}!`');
        });
    });

    describe('scribe statements', () => {
        test('scribe two args becomes console.log', () => {
            const js = compile('scribe "Name:", name');

            expect(js).toContain('console.log');
            expect(js).toContain('Name:');
        });

        test('scribe multiple args', () => {
            const js = compile('scribe "a", "b", "c"');

            expect(js).toContain('console.log');
        });

        test('scribe with expressions', () => {
            const js = compile('scribe x + y, a * b');

            expect(js).toContain('console.log');
        });

        test('scribe with function calls', () => {
            const js = compile('scribe getName(), getAge()');

            expect(js).toContain('console.log');
            expect(js).toContain('getName()');
        });
    });

    describe('complete programs', () => {
        test('hello world', () => {
            const js = compile(`
        functio salve(nomen) {
          redde "Salve, " + nomen
        }
        _scribe(salve("Mundus"))
      `);

            expect(js).toContain('function salve(nomen)');
            expect(js).toContain('return ("Salve, " + nomen);');
            expect(js).toContain('console.log(salve("Mundus"))');
        });
    });
});
