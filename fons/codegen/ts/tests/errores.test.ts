/**
 * Errores - Error handling codegen tests.
 *
 * Covers: tempta/cape/demum, iace/mori, fac blocks, catch on control flow.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('errores', () => {
    describe('try/catch/finally', () => {
        test('tempta/cape', () => {
            const js = compile(`
        tempta {
          riskyCode()
        }
        cape error {
          handleError()
        }
      `);

            expect(js).toContain('try {');
            expect(js).toContain('catch (error)');
        });

        test('with demum (finally)', () => {
            const js = compile(`
        tempta {
          riskyCode()
        }
        cape error {
          handleError()
        }
        demum {
          cleanup()
        }
      `);

            expect(js).toContain('finally {');
            expect(js).toContain('cleanup()');
        });
    });

    describe('iace (throw)', () => {
        test('iace string becomes throw', () => {
            const js = compile('iace "error message"');

            expect(js).toContain('throw');
            expect(js).toContain('error message');
        });

        test('iace with Error constructor', () => {
            const js = compile('iace novum Error("msg")');

            expect(js).toContain('throw');
            expect(js).toContain('new Error');
        });

        test('iace variable', () => {
            const js = compile('iace err');

            expect(js).toContain('throw');
            expect(js).toContain('err');
        });

        test('iace in function', () => {
            const js = compile(`
                functio validate() {
                    iace "invalid"
                }
            `);

            expect(js).toContain('function validate');
            expect(js).toContain('throw');
        });

        test('iace in elige case', () => {
            const js = compile(`
                elige x {
                    si 1 { iace "error" }
                }
            `);

            expect(js).toContain('if (x === 1)');
            expect(js).toContain('throw "error"');
        });
    });

    describe('mori (panic)', () => {
        test('mori emits Panic class in preamble', () => {
            const js = compile('mori "something went wrong"');

            expect(js).toContain('class Panic extends Error { name = "Panic"; }');
        });

        test('mori string becomes throw new Panic', () => {
            const js = compile('mori "something went wrong"');

            expect(js).toContain('throw new Panic("something went wrong")');
        });

        test('mori with variable wraps in Panic', () => {
            const js = compile('mori err');

            expect(js).toContain('throw new Panic(String(err))');
        });

        test('mori always wraps in Panic (unlike iace)', () => {
            const iaceJs = compile('iace "message"');
            const moriJs = compile('mori "message"');

            // iace just throws the value directly (no preamble)
            expect(iaceJs).toBe('throw "message";');

            // mori wraps in Panic class
            expect(moriJs).toContain('throw new Panic("message")');
        });

        test('mori in conditional', () => {
            const js = compile('si invalid { mori "impossible state" }');

            expect(js).toContain('if (invalid)');
            expect(js).toContain('throw new Panic("impossible state")');
        });

        test('mori with expression', () => {
            const js = compile('mori computeError()');

            expect(js).toContain('throw new Panic(String(computeError()))');
        });

        test('mori preserves quotes in message', () => {
            const js = compile('mori "can\'t do this"');

            expect(js).toContain("can't do this");
        });

        test('preamble only emitted when mori used', () => {
            const withoutMori = compile('scribe "hello"');
            const withMori = compile('mori "error"');

            expect(withoutMori).not.toContain('class Panic');
            expect(withMori).toContain('class Panic');
        });
    });

    describe('fac block statement', () => {
        test('fac block -> bare block', () => {
            const js = compile('fac { varia x = 1 }');
            expect(js).toContain('{');
            expect(js).toContain('let x = 1');
        });

        test('fac with cape -> try-catch', () => {
            const js = compile('fac { x() } cape e { y() }');
            expect(js).toContain('try {');
            expect(js).toContain('x()');
            expect(js).toContain('catch (e)');
            expect(js).toContain('y()');
        });
    });

    describe('catch on control flow', () => {
        test('if with catch', () => {
            const js = compile(`
                si verum {
                    iace novum Erratum("boom")
                } cape e {
                    scribe e
                }
            `);

            expect(js).toContain('try {');
            expect(js).toContain('if (true)');
            expect(js).toContain('} catch (e)');
        });

        test('while with catch', () => {
            const js = compile(`
                dum verum {
                    iace novum Erratum("boom")
                } cape e {
                    scribe e
                }
            `);

            expect(js).toContain('try {');
            expect(js).toContain('while (true)');
            expect(js).toContain('} catch (e)');
        });

        test('for-of with catch', () => {
            const js = compile(`
                ex [1, 2, 3] pro item {
                    iace novum Erratum("boom")
                } cape e {
                    scribe e
                }
            `);

            expect(js).toContain('try {');
            expect(js).toContain('for (const item of');
            expect(js).toContain('} catch (e)');
        });

        test('for range with catch', () => {
            const js = compile(`
                ex 0..5 pro i {
                    iace novum Erratum("boom")
                } cape e {
                    scribe e
                }
            `);

            expect(js).toContain('try {');
            expect(js).toContain('for (let i = 0; i < 5; i++)');
            expect(js).toContain('} catch (e)');
        });

        test('elige with catch', () => {
            const js = compile(`
                fixum x = 1
                elige x {
                    si 1 { scribe "one" }
                    aliter { scribe "other" }
                } cape e {
                    scribe e
                }
            `);

            expect(js).toContain('try {');
            expect(js).toContain('if (x === 1)');
            expect(js).toContain('} catch (e)');
        });
    });
});
