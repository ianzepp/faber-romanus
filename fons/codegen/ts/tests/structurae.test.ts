/**
 * Structurae - Data structure codegen tests.
 *
 * Covers: genus, pactum, destructuring (object/array), novum, ego, nexum.
 */

import { describe, test, expect } from 'bun:test';
import { compile, getParseErrors } from './helpers';

describe('structurae', () => {
    describe('object destructuring', () => {
        test('simple destructuring', () => {
            const js = compile('fixum { nomen, aetas } = user');

            expect(js).toBe('const { nomen, aetas } = user;');
        });

        test('destructuring with rename', () => {
            const js = compile('fixum { nomen: localName } = user');

            expect(js).toBe('const { nomen: localName } = user;');
        });

        test('mutable destructuring', () => {
            const js = compile('varia { count } = data');

            expect(js).toBe('let { count } = data;');
        });

        describe('invalid syntax produces errors', () => {
            test('JS spread syntax ...rest is not valid', () => {
                const errors = getParseErrors('fixum { nomen, ...rest } = user');

                expect(errors.length).toBeGreaterThan(0);
                expect(errors[0]).toContain("Expected identifier, got '..'");
            });

            test('missing closing brace', () => {
                const errors = getParseErrors('fixum { nomen, aetas = user');

                expect(errors.length).toBeGreaterThan(0);
            });

            test('nested spread syntax is not valid', () => {
                const errors = getParseErrors('fixum { ...a, ...b } = user');

                expect(errors.length).toBeGreaterThan(0);
            });

            test('empty pattern parses without hanging', () => {
                // Empty pattern is syntactically valid (though semantically useless)
                const errors = getParseErrors('fixum { } = user');

                // Should complete without hanging
                expect(errors).toBeDefined();
            });

            test('Fail when using TS default value in destructure', () => {
                const errors = getParseErrors('fixum { a = 1 } = obj');

                expect(errors.length).toBeGreaterThan(0);
            });
        });
    });

    describe('array destructuring', () => {
        test('simple array destructuring', () => {
            const js = compile('fixum [a, b, c] = coords');

            expect(js).toBe('const [a, b, c] = coords;');
        });

        test('array destructuring with rest', () => {
            const js = compile('fixum [first, ceteri rest] = items');

            expect(js).toBe('const [first, ...rest] = items;');
        });

        test('array destructuring with skip', () => {
            const js = compile('fixum [_, second, _] = data');

            expect(js).toBe('const [, second, ] = data;');
        });

        test('mutable array destructuring', () => {
            const js = compile('varia [x, y] = coords');

            expect(js).toBe('let [x, y] = coords;');
        });

        test('ex array destructuring', () => {
            const js = compile('ex coords fixum [x, y, z]');

            expect(js).toBe('const [x, y, z] = coords;');
        });

        test('ex array destructuring with rest', () => {
            const js = compile('ex items fixum [first, ceteri tail]');

            expect(js).toBe('const [first, ...tail] = items;');
        });
    });

    describe('genus declarations', () => {
        test('genus generates auto-merge constructor', () => {
            const js = compile('genus persona { textus nomen: "X" }');

            expect(js).toContain('class persona');
            expect(js).toContain('nomen: string = "X"');
            expect(js).toContain('constructor(overrides: { nomen?: string } = {})');
            expect(js).toContain('if (overrides.nomen !== undefined) { this.nomen = overrides.nomen; }');
        });

        test('genus with creo emits private no-args method', () => {
            const js = compile(`
                genus persona {
                    numerus aetas: 0
                    functio creo() {
                        si ego.aetas < 0 { ego.aetas = 0 }
                    }
                }
            `);

            expect(js).toContain('this.creo();');
            expect(js).toContain('private creo()');
        });

        test('genus without creo does not call creo', () => {
            const js = compile('genus persona { textus nomen: "X" }');

            expect(js).not.toContain('this.creo()');
            expect(js).not.toContain('private creo()');
        });

        test('novum without overrides passes empty object', () => {
            const js = compile('fixum p = novum persona');

            expect(js).toBe('const p = new persona();');
        });

        test('novum with property overrides', () => {
            const js = compile('fixum p = novum persona { nomen: "Claudia" }');

            expect(js).toBe('const p = new persona({ nomen: "Claudia" });');
        });

        test('ego becomes this', () => {
            const js = compile(`
                genus persona {
                    textus nomen: "X"
                    functio saluta() { redde ego.nomen }
                }
            `);

            expect(js).toContain('return this.nomen');
        });
    });

    describe('nexum (reactive fields)', () => {
        test('nexum field emits private backing field', () => {
            const js = compile('genus counter { nexum numerus count: 0 }');

            expect(js).toContain('#count = 0;');
        });

        test('nexum field emits getter', () => {
            const js = compile('genus counter { nexum numerus count: 0 }');

            expect(js).toContain('get count(): number { return this.#count; }');
        });

        test('nexum field emits setter with invalidation', () => {
            const js = compile('genus counter { nexum numerus count: 0 }');

            expect(js).toContain("set count(v: number) { this.#count = v; this.__invalidate?.('count'); }");
        });

        test('nexum works with different types', () => {
            const js = compile('genus user { nexum textus name: "anon" }');

            expect(js).toContain('#name = "anon";');
            expect(js).toContain('get name(): string { return this.#name; }');
            expect(js).toContain("set name(v: string) { this.#name = v; this.__invalidate?.('name'); }");
        });

        test('nexum without initial value', () => {
            const js = compile('genus timer { nexum numerus elapsed }');

            expect(js).toContain('#elapsed;');
            expect(js).toContain('get elapsed(): number');
            expect(js).toContain('set elapsed(v: number)');
        });

        test('mixed nexum and regular fields', () => {
            const js = compile(`
                genus widget {
                    textus id: "x"
                    nexum numerus count: 0
                    bivalens active: verum
                }
            `);

            // Regular fields - public by default (struct semantics)
            expect(js).toContain('id: string = "x";');
            expect(js).toContain('active: boolean = true;');

            // Reactive field - getter/setter pattern
            expect(js).toContain('#count = 0;');
            expect(js).toContain('get count(): number');
            expect(js).toContain('set count(v: number)');
        });

        test('nexum with publicus modifier', () => {
            const js = compile('genus counter { nexum numerus count: 0 }');

            // Even without publicus, reactive fields are accessible via getter/setter
            expect(js).toContain('get count()');
            expect(js).toContain('set count(');
        });
    });

    describe('pactum (interface) declarations', () => {
        test('basic pactum with method', () => {
            const js = compile(`
                pactum Salutator {
                    functio salve(textus nomen) -> textus
                }
            `);

            expect(js).toContain('interface Salutator');
            expect(js).toContain('salve(nomen: string): string;');
        });

        test('pactum with multiple methods', () => {
            const js = compile(`
                pactum Calculator {
                    functio adde(numerus a, numerus b) -> numerus
                    functio minue(numerus a, numerus b) -> numerus
                }
            `);

            expect(js).toContain('interface Calculator');
            expect(js).toContain('adde(a: number, b: number): number;');
            expect(js).toContain('minue(a: number, b: number): number;');
        });

        test('pactum with async method', () => {
            const js = compile(`
                pactum DataFetcher {
                    futura functio fetch(textus url) -> textus
                }
            `);

            expect(js).toContain('interface DataFetcher');
            expect(js).toContain('fetch(url: string): Promise<string>;');
        });

        test('pactum with generator method', () => {
            const js = compile(`
                pactum NumberGenerator {
                    cursor functio generate(numerus max) -> numerus
                }
            `);

            expect(js).toContain('interface NumberGenerator');
            expect(js).toContain('generate(max: number): Generator<number>;');
        });

        test('pactum with async generator method', () => {
            const js = compile(`
                pactum StreamReader {
                    futura cursor functio read() -> textus
                }
            `);

            expect(js).toContain('interface StreamReader');
            expect(js).toContain('read(): AsyncGenerator<string>;');
        });

        test('pactum with type parameters', () => {
            const js = compile(`
                pactum Container<T> {
                    functio get() -> T
                    functio set(T value)
                }
            `);

            expect(js).toContain('interface Container<T>');
            expect(js).toContain('get(): T;');
            expect(js).toContain('set(value: T): void;');
        });

        test('genus implements pactum', () => {
            const js = compile(`
                pactum Greeter {
                    functio greet(textus name) -> textus
                }

                genus FriendlyGreeter implet Greeter {
                    functio greet(textus name) -> textus {
                        redde "Hello, " + name
                    }
                }
            `);

            expect(js).toContain('interface Greeter');
            expect(js).toContain('class FriendlyGreeter implements Greeter');
            expect(js).toContain('greet(name: string): string');
        });
    });
});
