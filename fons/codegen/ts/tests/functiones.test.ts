/**
 * Functiones - Function declaration and lambda codegen tests.
 *
 * Covers: functio, futura, cursor, fit/fiet/fiunt/fient, arrow functions, pro lambdas.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('functiones', () => {
    describe('function declarations', () => {
        test('simple function', () => {
            const js = compile(`
        functio salve(nomen) {
          redde nomen
        }
      `);

            expect(js).toContain('function salve(nomen)');
            expect(js).toContain('return nomen;');
        });

        test('async function', () => {
            const js = compile(`
        futura functio fetch(url) {
          redde data
        }
      `);

            expect(js).toContain('async function fetch(url)');
        });

        test('fit returns sync function', () => {
            const js = compile('functio greet() fit textus { redde "hello" }');

            expect(js).toContain('function greet(): string');
            expect(js).not.toContain('async');
            expect(js).not.toContain('*');
        });

        test('fiet returns async function with Promise<T>', () => {
            const js = compile('functio fetch() fiet textus { redde "data" }');

            expect(js).toContain('async function fetch(): Promise<string>');
        });

        test('fiunt returns generator function with Generator<T>', () => {
            const js = compile('functio range() fiunt numerus { redde 1 }');

            expect(js).toContain('function* range(): Generator<number>');
        });

        test('fient returns async generator function with AsyncGenerator<T>', () => {
            const js = compile('functio stream() fient textus { redde "chunk" }');

            expect(js).toContain('async function* stream(): AsyncGenerator<string>');
        });

        test('cursor prefix with fiunt is redundant but valid', () => {
            const js = compile('cursor functio range() fiunt numerus { redde 1 }');

            expect(js).toContain('function* range(): Generator<number>');
        });

        test('futura prefix with fiet is redundant but valid', () => {
            const js = compile('futura functio fetch() fiet textus { redde "data" }');

            expect(js).toContain('async function fetch(): Promise<string>');
        });

        test('cursor prefix makes generator without verb', () => {
            const js = compile('cursor functio range() -> numerus { redde 1 }');

            expect(js).toContain('function* range(): Generator<number>');
        });

        test('futura cursor makes async generator', () => {
            const js = compile('futura cursor functio stream() -> textus { redde "chunk" }');

            expect(js).toContain('async function* stream(): AsyncGenerator<string>');
        });

        test('cede emits yield in generator functions', () => {
            const js = compile('functio range() fiunt numerus { cede 1 }');

            expect(js).toContain('yield 1');
            expect(js).not.toContain('await');
        });

        test('cede emits await in async functions', () => {
            const js = compile('functio fetch() fiet textus { cede getData() }');

            expect(js).toContain('await getData()');
            expect(js).not.toContain('yield');
        });

        test('cede emits yield in async generators', () => {
            const js = compile('functio stream() fient textus { cede "chunk" }');

            expect(js).toContain('yield "chunk"');
        });
    });

    describe('arrow functions', () => {
        test('simple arrow', () => {
            const js = compile('(x) => x');

            expect(js).toBe('(x) => x;');
        });

        test('arrow with block', () => {
            const js = compile('(x) => { redde x }');

            expect(js).toContain('(x) =>');
            expect(js).toContain('return x;');
        });
    });

    describe('pro expression (lambda)', () => {
        test('single param lambda', () => {
            const js = compile('pro x redde x * 2');
            expect(js).toBe('(x) => (x * 2);');
        });

        test('multi param lambda', () => {
            const js = compile('pro x, y redde x + y');
            expect(js).toBe('(x, y) => (x + y);');
        });

        test('zero param lambda', () => {
            const js = compile('pro redde 42');
            expect(js).toBe('() => 42;');
        });

        test('lambda used in variable declaration', () => {
            const js = compile('fixum double = pro x redde x * 2');
            expect(js).toBe('const double = (x) => (x * 2);');
        });

        test('lambda as method argument', () => {
            const js = compile('items.filtrata(pro x redde x > 0)');
            expect(js).toBe('items.filter((x) => (x > 0));');
        });

        test('pro with single param in callback', () => {
            const js = compile('items.mappata(pro x redde x * 2)');

            expect(js).toContain('map');
        });

        test('pro with block body', () => {
            const js = compile('items.perambula(pro x { scribe x })');

            expect(js).toContain('forEach');
        });
    });

    describe('method return type wrapping', () => {
        test('async method wraps return in Promise', () => {
            const js = compile(`
                genus fetcher {
                    functio fetch() fiet textus { redde "data" }
                }
            `);

            expect(js).toContain('async fetch(): Promise<string>');
        });

        test('generator method wraps return in Generator', () => {
            const js = compile(`
                genus counter {
                    functio count() fiunt numerus { cede 1 }
                }
            `);

            expect(js).toContain('*count(): Generator<number>');
        });

        test('async method with return type', () => {
            const js = compile(`
                genus Fetcher {
                    futura functio fetch(textus url) -> textus {
                        redde "data"
                    }
                }
            `);

            expect(js).toContain('async fetch(url: string): Promise<string>');
        });

        test('generator method with return type', () => {
            const js = compile(`
                genus NumberStream {
                    cursor functio numbers(numerus max) -> numerus {
                        cede 1
                        cede 2
                    }
                }
            `);

            expect(js).toContain('*numbers(max: number): Generator<number>');
        });

        test('async generator method with return type', () => {
            const js = compile(`
                genus DataStream {
                    futura cursor functio stream() -> textus {
                        cede "chunk1"
                        cede "chunk2"
                    }
                }
            `);

            expect(js).toContain('async *stream(): AsyncGenerator<string>');
        });
    });

    describe('block-body lambdas', () => {
        test('lambda with block body', () => {
            const js = compile(`
                fixum fn = pro x {
                    fixum doubled = x * 2
                    redde doubled
                }
            `);

            expect(js).toContain('(x) => {');
            expect(js).toContain('const doubled = (x * 2)');
            expect(js).toContain('return doubled');
        });

        test('zero-param lambda with block body', () => {
            const js = compile(`
                fixum fn = pro {
                    scribe "hello"
                    redde 42
                }
            `);

            expect(js).toContain('() => {');
            expect(js).toContain('console.log("hello")');
            expect(js).toContain('return 42');
        });

        test('multi-param lambda with block body', () => {
            const js = compile(`
                fixum fn = pro x, y {
                    fixum sum = x + y
                    redde sum
                }
            `);

            expect(js).toContain('(x, y) => {');
            expect(js).toContain('const sum = (x + y)');
            expect(js).toContain('return sum');
        });

        test('pro with block body', () => {
            const js = compile('fixum fn = pro x { scribe x\n redde x * 2 }');

            expect(js).toContain('(x) =>');
            expect(js).toContain('console.log(x)');
            expect(js).toContain('return (x * 2)');
        });

        test('pro with typed return and block', () => {
            const js = compile('fixum fn = pro x -> numerus { redde x * 2 }');

            expect(js).toContain('(x): number =>');
            expect(js).toContain('return (x * 2)');
        });

        test('zero-param pro with block', () => {
            const js = compile('fixum fn = pro { scribe "hello"\n redde 42 }');

            expect(js).toContain('() =>');
            expect(js).toContain('console.log("hello")');
            expect(js).toContain('return 42');
        });

        test('block-body in callback position', () => {
            const js = compile('items.perambula(pro x { scribe x })');

            expect(js).toContain('forEach((x) =>');
            expect(js).toContain('console.log(x)');
        });
    });

    describe('empty blocks', () => {
        test('empty function body', () => {
            const js = compile('functio noop() {}');

            expect(js).toBe('function noop() {}');
        });

        test('empty si block', () => {
            const js = compile('si verum {}');

            expect(js).toContain('if (true) {}');
        });

        test('empty dum block', () => {
            const js = compile('dum verum {}');

            expect(js).toContain('while (true) {}');
        });
    });
});
