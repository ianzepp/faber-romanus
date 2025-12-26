/**
 * Proba - Test syntax codegen tests.
 *
 * Covers: probandum, proba, cura ante/post, cura statement.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('proba', () => {
    describe('probandum -> describe', () => {
        test('simple probandum', () => {
            const js = compile('probandum "Suite" { }');

            expect(js).toContain('describe("Suite"');
            expect(js).toContain('() => {');
        });

        test('probandum with proba', () => {
            const js = compile(`
                probandum "Math" {
                    proba "adds" { adfirma 1 + 1 est 2 }
                }
            `);

            expect(js).toContain('describe("Math"');
            expect(js).toContain('test("adds"');
        });

        test('nested probandum', () => {
            const js = compile(`
                probandum "Outer" {
                    probandum "Inner" {
                        proba "test" { adfirma verum }
                    }
                }
            `);

            expect(js).toContain('describe("Outer"');
            expect(js).toContain('describe("Inner"');
            expect(js).toContain('test("test"');
        });
    });

    describe('proba -> test', () => {
        test('simple proba', () => {
            const js = compile('proba "test name" { adfirma verum }');

            expect(js).toContain('test("test name"');
            expect(js).toContain('() => {');
        });

        test('proba omitte -> test.skip', () => {
            const js = compile('proba omitte "reason" "skipped" { adfirma verum }');

            expect(js).toContain('test.skip("reason: skipped"');
        });

        test('proba futurum -> test.todo', () => {
            const js = compile('proba futurum "later" "pending" { }');

            expect(js).toContain('test.todo("later: pending"');
        });

        test('proba with adfirma generates assertion', () => {
            const js = compile('proba "math" { adfirma 1 + 1 est 2 }');

            expect(js).toContain('test("math"');
            expect(js).toContain('if (!(');
            expect(js).toContain('throw new Error');
        });
    });

    describe('cura ante -> beforeEach/beforeAll', () => {
        test('cura ante -> beforeEach', () => {
            const js = compile(`
                probandum "Suite" {
                    cura ante { x = 0 }
                }
            `);

            expect(js).toContain('beforeEach(() => {');
            expect(js).toContain('x = 0');
        });

        test('cura ante omnia -> beforeAll', () => {
            const js = compile(`
                probandum "Suite" {
                    cura ante omnia { db = connect() }
                }
            `);

            expect(js).toContain('beforeAll(() => {');
            expect(js).toContain('db = connect()');
        });
    });

    describe('cura post -> afterEach/afterAll', () => {
        test('cura post -> afterEach', () => {
            const js = compile(`
                probandum "Suite" {
                    cura post { cleanup() }
                }
            `);

            expect(js).toContain('afterEach(() => {');
            expect(js).toContain('cleanup()');
        });

        test('cura post omnia -> afterAll', () => {
            const js = compile(`
                probandum "Suite" {
                    cura post omnia { db.close() }
                }
            `);

            expect(js).toContain('afterAll(() => {');
            expect(js).toContain('db.close()');
        });
    });

    describe('full test suite codegen', () => {
        test('complete probandum with all hooks', () => {
            const js = compile(`
                probandum "Database" {
                    cura ante omnia { db = connect() }
                    cura ante { db.reset() }
                    proba "inserts" { adfirma db.count() est 0 }
                    cura post { db.rollback() }
                    cura post omnia { db.close() }
                }
            `);

            expect(js).toContain('describe("Database"');
            expect(js).toContain('beforeAll(() => {');
            expect(js).toContain('beforeEach(() => {');
            expect(js).toContain('test("inserts"');
            expect(js).toContain('afterEach(() => {');
            expect(js).toContain('afterAll(() => {');
        });

        test('multiple tests in suite', () => {
            const js = compile(`
                probandum "Math" {
                    proba "adds" { adfirma 1 + 1 est 2 }
                    proba "subtracts" { adfirma 5 - 3 est 2 }
                    proba "multiplies" { adfirma 3 * 4 est 12 }
                }
            `);

            expect(js).toContain('test("adds"');
            expect(js).toContain('test("subtracts"');
            expect(js).toContain('test("multiplies"');
        });

        test('mixed skip and todo tests', () => {
            const js = compile(`
                probandum "Suite" {
                    proba "works" { adfirma verum }
                    proba omitte "broken" "skip this" { }
                    proba futurum "later" "todo this" { }
                }
            `);

            expect(js).toContain('test("works"');
            expect(js).toContain('test.skip("broken: skip this"');
            expect(js).toContain('test.todo("later: todo this"');
        });
    });

    describe('standalone proba and cura', () => {
        test('proba at top level', () => {
            const js = compile('proba "standalone" { adfirma 1 est 1 }');

            expect(js).toContain('test("standalone"');
        });

        test('cura at top level', () => {
            const js = compile('cura ante { setup() }');

            expect(js).toContain('beforeEach(() => {');
        });
    });

    describe('cura statement - resource management', () => {
        test('simple cura fit -> try/finally', () => {
            const js = compile('cura aperi("file.txt") fit fd { lege(fd) }');

            expect(js).toContain('const fd = aperi("file.txt")');
            expect(js).toContain('try {');
            expect(js).toContain('lege(fd)');
            expect(js).toContain('finally {');
            expect(js).toContain('fd.solve?.()');
        });

        test('cura with async acquisition', () => {
            const js = compile('cura cede connect(url) fit conn { query(conn) }');

            expect(js).toContain('const conn = await connect(url)');
            expect(js).toContain('try {');
            expect(js).toContain('finally {');
            expect(js).toContain('conn.solve?.()');
        });

        test('cura with cape -> try/catch/finally', () => {
            const js = compile('cura lock() fit guard { work() } cape err { mone(err) }');

            expect(js).toContain('const guard = lock()');
            expect(js).toContain('try {');
            expect(js).toContain('work()');
            expect(js).toContain('catch (err) {');
            expect(js).toContain('console.warn(err)');
            expect(js).toContain('finally {');
            expect(js).toContain('guard.solve?.()');
        });

        test('cura with method call resource', () => {
            const js = compile('cura mutex.lock() fit guard { counter = counter + 1 }');

            expect(js).toContain('const guard = mutex.lock()');
            expect(js).toContain('guard.solve?.()');
        });

        test('nested cura statements', () => {
            const js = compile(`
                cura aperi("input.txt") fit input {
                    cura aperi("output.txt") fit output {
                        copy(input, output)
                    }
                }
            `);

            expect(js).toContain('const input = aperi("input.txt")');
            expect(js).toContain('const output = aperi("output.txt")');
            expect(js).toContain('input.solve?.()');
            expect(js).toContain('output.solve?.()');
        });

        test('cura with async and cape', () => {
            const js = compile(`
                cura cede connect(db_url) fit conn {
                    cede conn.query(sql)
                } cape err {
                    scribe "Error:", err
                }
            `);

            expect(js).toContain('const conn = await connect(db_url)');
            expect(js).toContain('await conn.query(sql)');
            expect(js).toContain('catch (err) {');
            expect(js).toContain('console.log("Error:", err)');
            expect(js).toContain('finally {');
            expect(js).toContain('conn.solve?.()');
        });

        test('cura emits block scope', () => {
            const js = compile('cura resource() fit r { use(r) }');

            // Should start and end with block braces for scoping
            expect(js.trim().startsWith('{')).toBe(true);
            expect(js.trim().endsWith('}')).toBe(true);
        });
    });
});
