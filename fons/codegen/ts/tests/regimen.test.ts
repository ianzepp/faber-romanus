/**
 * Regimen - Control flow codegen tests.
 *
 * Covers: si/aliter, dum, ex/de...pro, elige, custodi, adfirma, redde/rumpe/perge, ranges.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('regimen', () => {
    describe('if statements', () => {
        test('simple if', () => {
            const js = compile(`
        si verum {
          _scribe("yes")
        }
      `);

            expect(js).toContain('if (true)');
            expect(js).toContain('console.log("yes")');
        });

        test('if with else', () => {
            const js = compile(`
        si falsum {
          a()
        }
        aliter {
          b()
        }
      `);

            expect(js).toContain('if (false)');
            expect(js).toContain('} else {');
        });

        test('if with cape wraps in try', () => {
            const js = compile(`
        si riskyCall() {
          process()
        }
        cape erratum {
          handleError()
        }
      `);

            expect(js).toContain('try {');
            expect(js).toContain('catch (erratum)');
        });
    });

    describe('else-if chaining', () => {
        test('si/aliter si chain', () => {
            const js = compile(`
                si x == 1 { a() }
                aliter si x == 2 { b() }
                aliter { c() }
            `);

            expect(js).toContain('if ((x == 1))');
            expect(js).toContain('else if ((x == 2))');
            expect(js).toContain('else {');
        });

        test('multiple aliter si', () => {
            const js = compile(`
                si a { one() }
                aliter si b { two() }
                aliter si c { three() }
                aliter { four() }
            `);

            expect(js).toContain('if (a)');
            expect(js).toContain('else if (b)');
            expect(js).toContain('else if (c)');
            expect(js).toContain('else {');
        });
    });

    describe('loops', () => {
        test('while loop', () => {
            const js = compile(`
        dum verum {
          _scribe("loop")
        }
      `);

            expect(js).toContain('while (true)');
        });

        test('for...in loop', () => {
            const js = compile(`
        de lista pro item {
          _scribe(item)
        }
      `);

            expect(js).toContain('for (const item in lista)');
        });

        test('for...of loop', () => {
            const js = compile(`
        ex numeros pro numero {
          _scribe(numero)
        }
      `);

            expect(js).toContain('for (const numero of numeros)');
        });

        test('ex...fit generates sync for...of', () => {
            const js = compile('ex items fit item { scribe item }');

            expect(js).toContain('for (const item of items)');
            expect(js).not.toContain('await');
        });

        test('ex...fiet generates for await...of', () => {
            const js = compile('ex stream fiet chunk { scribe chunk }');

            expect(js).toContain('for await (const chunk of stream)');
        });

        test('de...fit generates sync for...in', () => {
            const js = compile('de obj fit key { scribe key }');

            expect(js).toContain('for (const key in obj)');
            expect(js).not.toContain('await');
        });

        test('de...fiet generates for await...in', () => {
            const js = compile('de asyncObj fiet key { scribe key }');

            expect(js).toContain('for await (const key in asyncObj)');
        });

        test('rumpe generates break', () => {
            const js = compile(`
                dum verum {
                    rumpe
                }
            `);

            expect(js).toContain('while (true)');
            expect(js).toContain('break;');
        });

        test('perge generates continue', () => {
            const js = compile(`
                dum verum {
                    perge
                }
            `);

            expect(js).toContain('while (true)');
            expect(js).toContain('continue;');
        });

        test('rumpe in for loop', () => {
            const js = compile(`
                ex items pro item {
                    si item == nihil { rumpe }
                }
            `);

            expect(js).toContain('for (const item of items)');
            expect(js).toContain('if ((item == null))');
            expect(js).toContain('break;');
        });

        test('perge in for loop', () => {
            const js = compile(`
                ex items pro item {
                    si item == nihil { perge }
                    scribe item
                }
            `);

            expect(js).toContain('for (const item of items)');
            expect(js).toContain('continue;');
            expect(js).toContain('console.log(item)');
        });

        test('rumpe and perge together', () => {
            const js = compile(`
                dum verum {
                    si skip { perge }
                    si done { rumpe }
                }
            `);

            expect(js).toContain('continue;');
            expect(js).toContain('break;');
        });
    });

    describe('guard statements', () => {
        test('custodi with single clause', () => {
            const js = compile(`
        custodi {
          si x == nihil { redde }
        }
      `);

            expect(js).toContain('if ((x == null))');
            expect(js).toContain('return;');
        });

        test('custodi with multiple clauses', () => {
            const js = compile(`
        custodi {
          si x < 0 { redde }
          si y == nihil { iace "error" }
        }
      `);

            expect(js).toContain('if ((x < 0))');
            expect(js).toContain('if ((y == null))');
            expect(js).toContain('throw "error"');
        });
    });

    describe('assert statements', () => {
        test('adfirma without message', () => {
            const js = compile('adfirma x > 0');

            expect(js).toContain('if (!(');
            expect(js).toContain('throw new Error(');
            expect(js).toContain('Assertion failed');
        });

        test('adfirma with message', () => {
            const js = compile('adfirma x > 0, "x must be positive"');

            expect(js).toContain('if (!(');
            expect(js).toContain('throw new Error("x must be positive")');
        });
    });

    describe('range expressions', () => {
        test('simple range in for loop', () => {
            const js = compile(`
        ex 0..10 pro i {
          _scribe(i)
        }
      `);

            expect(js).toContain('for (let i = 0; i < 10; i++)');
        });

        test('range with step', () => {
            const js = compile(`
        ex 0..10 per 2 pro i {
          _scribe(i)
        }
      `);

            expect(js).toContain('for (let i = 0; i < 10; i += 2)');
        });

        test('range with expressions', () => {
            const js = compile(`
        ex 1..n pro i {
          _scribe(i)
        }
      `);

            expect(js).toContain('for (let i = 1; i < n; i++)');
        });

        test('ante keyword (explicit exclusive)', () => {
            const js = compile(`
        ex 0 ante 10 pro i {
          _scribe(i)
        }
      `);

            expect(js).toContain('for (let i = 0; i < 10; i++)');
        });

        test('usque keyword (inclusive)', () => {
            const js = compile(`
        ex 0 usque 10 pro i {
          _scribe(i)
        }
      `);

            expect(js).toContain('for (let i = 0; i <= 10; i++)');
        });

        test('usque with step', () => {
            const js = compile(`
        ex 0 usque 10 per 2 pro i {
          _scribe(i)
        }
      `);

            expect(js).toContain('for (let i = 0; i <= 10; i += 2)');
        });
    });

    describe('range expression as value', () => {
        test('range assigned to variable generates array', () => {
            const js = compile('fixum nums = 0..5');

            expect(js).toContain('Array.from');
        });

        test('simple range as array', () => {
            const js = compile('fixum nums = 0..5');

            expect(js).toContain('Array.from({length: 5 - 0}, (_, i) => 0 + i)');
        });

        test('range with step as array', () => {
            const js = compile('fixum evens = 0..10 per 2');

            expect(js).toContain('Array.from({length: Math.ceil((10 - 0) / 2)}, (_, i) => 0 + i * 2)');
        });

        test('range with variables', () => {
            const js = compile(`
                fixum start = 5
                fixum end = 10
                fixum nums = start..end
            `);

            expect(js).toContain('Array.from({length: end - start}, (_, i) => start + i)');
        });

        test('inclusive range as value', () => {
            const js = compile('fixum nums = 0 usque 3');

            expect(js).toContain('Array.from');
        });

        test('usque range as array (inclusive)', () => {
            const js = compile('fixum nums = 0 usque 5');

            expect(js).toContain('Array.from({length: 5 - 0 + 1}, (_, i) => 0 + i)');
        });

        test('usque range with step as array', () => {
            const js = compile('fixum evens = 0 usque 10 per 2');

            expect(js).toContain('Array.from({length: Math.floor((10 - 0) / 2) + 1}, (_, i) => 0 + i * 2)');
        });
    });

    describe('switch statements (elige)', () => {
        test('elige with cases emits if/else chain', () => {
            const js = compile(`
                elige x {
                    si 1 { a() }
                    si 2 { b() }
                }
            `);

            expect(js).toContain('if (x === 1)');
            expect(js).toContain('else if (x === 2)');
            expect(js).toContain('a()');
            expect(js).toContain('b()');
        });

        test('elige with default emits else', () => {
            const js = compile(`
                elige x {
                    si 1 { a() }
                    aliter { c() }
                }
            `);

            expect(js).toContain('if (x === 1)');
            expect(js).toContain('else {');
            expect(js).toContain('c()');
        });

        test('elige with multiple cases and default', () => {
            const js = compile(`
                elige status {
                    si 0 { pending() }
                    si 1 { active() }
                    si 2 { done() }
                    aliter { unknown() }
                }
            `);

            expect(js).toContain('if (status === 0)');
            expect(js).toContain('else if (status === 1)');
            expect(js).toContain('else if (status === 2)');
            expect(js).toContain('else {');
            expect(js).toContain('unknown()');
        });

        test('elige with string cases', () => {
            const js = compile(`
                elige name {
                    si "alice" { greetAlice() }
                    si "bob" { greetBob() }
                }
            `);

            expect(js).toContain('if (name === "alice")');
            expect(js).toContain('else if (name === "bob")');
        });
    });

    describe('elige edge cases', () => {
        test('elige with single case', () => {
            const js = compile('elige x { si 1 { a() } }');

            expect(js).toContain('if (x === 1)');
            expect(js).not.toContain('else');
        });

        test('elige only default', () => {
            const js = compile('elige x { aliter { fallback() } }');

            expect(js).toContain('fallback()');
        });

        test('elige with only default', () => {
            const js = compile(`
                fixum x = 1
                elige x {
                    aliter { scribe "always" }
                }
            `);

            expect(js).toContain('{');
            expect(js).toContain('console.log("always")');
        });
    });

    describe('else-if chaining', () => {
        test('multiple else-if', () => {
            const js = compile(`
                fixum x = 2
                si x == 1 {
                    scribe "one"
                } aliter si x == 2 {
                    scribe "two"
                } aliter si x == 3 {
                    scribe "three"
                } aliter {
                    scribe "other"
                }
            `);

            expect(js).toContain('if ((x == 1))');
            expect(js).toContain('else if ((x == 2))');
            expect(js).toContain('else if ((x == 3))');
            expect(js).toContain('else {');
        });
    });

    describe('empty blocks', () => {
        test('empty if body', () => {
            const js = compile('si verum {}');

            expect(js).toBe('if (true) {}');
        });
    });

    describe('with statements', () => {
        test('in block transforms assignments', () => {
            const js = compile(`
        in user {
          nomen = "Marcus"
          aetas = 30
        }
      `);

            expect(js).toContain('user.nomen = "Marcus"');
            expect(js).toContain('user.aetas = 30');
        });
    });

    describe('ergo one-liners', () => {
        test('si with ergo generates inline if', () => {
            const js = compile('si x > 5 ergo scribe "big"');

            expect(js).toContain('if');
            expect(js).toContain('x > 5');
        });

        test('dum with ergo generates while', () => {
            const js = compile('dum x > 0 ergo x = x - 1');

            expect(js).toContain('while');
            expect(js).toContain('x > 0');
        });

        test('ex...pro with ergo', () => {
            const js = compile('ex items pro item ergo scribe item');

            expect(js).toContain('for');
            expect(js).toContain('of items');
        });
    });
});
