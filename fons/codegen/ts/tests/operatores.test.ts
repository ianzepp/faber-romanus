/**
 * Operatores - Operator codegen tests.
 *
 * Covers: binary, logical, bitwise, compound assignment, ut (cast), est (type check),
 * sparge/ceteri, optional chaining, ternary.
 */

import { describe, test, expect } from 'bun:test';
import { compile, getParseErrors } from './helpers';

describe('operatores', () => {
    describe('binary operators', () => {
        test('binary operators', () => {
            const js = compile('1 + 2');

            expect(js).toBe('(1 + 2);');
        });

        test('function call', () => {
            const js = compile('salve(nomen)');

            expect(js).toBe('salve(nomen);');
        });

        test('method call', () => {
            const js = compile('lista.filter(f)');

            expect(js).toBe('lista.filter(f);');
        });

        test('member access', () => {
            const js = compile('usuario.nomen');

            expect(js).toBe('usuario.nomen;');
        });
    });

    describe('logical operators', () => {
        test('Latin logical operators become JS', () => {
            const js = compile('a et b');

            expect(js).toBe('(a && b);');
        });

        test('aut becomes ||', () => {
            const js = compile('a aut b');

            expect(js).toBe('(a || b);');
        });

        test('vel becomes ?? (nullish coalescing)', () => {
            const js = compile('a vel b');

            expect(js).toBe('(a ?? b);');
        });

        test('vel chains correctly', () => {
            const js = compile('a vel b vel c');

            expect(js).toBe('((a ?? b) ?? c);');
        });
    });

    describe('bitwise operators', () => {
        test('bitwise AND', () => {
            const js = compile('5 & 3');

            expect(js).toBe('(5 & 3);');
        });

        test('bitwise OR', () => {
            const js = compile('5 | 3');

            expect(js).toBe('(5 | 3);');
        });

        test('bitwise XOR', () => {
            const js = compile('5 ^ 3');

            expect(js).toBe('(5 ^ 3);');
        });

        test('bitwise NOT', () => {
            const js = compile('~5');

            expect(js).toBe('~5;');
        });

        test('left shift', () => {
            const js = compile('1 << 4');

            expect(js).toBe('(1 << 4);');
        });

        test('right shift', () => {
            const js = compile('16 >> 2');

            expect(js).toBe('(16 >> 2);');
        });

        test('bitwise expression with hex literals', () => {
            const js = compile('0xFF & 0x0F');

            expect(js).toBe('(0xFF & 0x0F);');
        });

        test('bitwise precedence preserved', () => {
            const js = compile('flags & MASK == 0');

            // Should parse as (flags & MASK) == 0
            expect(js).toBe('((flags & MASK) == 0);');
        });
    });

    describe('compound assignment', () => {
        test('compound assignment +=', () => {
            const js = compile('varia x = 0\nx += 1');

            expect(js).toContain('x += 1');
        });

        test('compound assignment -=', () => {
            const js = compile('varia x = 10\nx -= 1');

            expect(js).toContain('x -= 1');
        });

        test('compound assignment &=', () => {
            const js = compile('varia flags = 0xFF\nflags &= 0x0F');

            expect(js).toContain('flags &= 0x0F');
        });

        test('compound assignment |=', () => {
            const js = compile('varia flags = 0\nflags |= 0x01');

            expect(js).toContain('flags |= 0x01');
        });
    });

    describe('ternary operator', () => {
        test('ternary with ? :', () => {
            const js = compile('verum ? 1 : 0');

            expect(js).toBe('true ? 1 : 0;');
        });

        test('ternary with sic secus', () => {
            const js = compile('verum sic 1 secus 0');

            expect(js).toBe('true ? 1 : 0;');
        });

        test('ternary with condition', () => {
            const js = compile('x > 5 ? "big" : "small"');

            expect(js).toBe('(x > 5) ? "big" : "small";');
        });

        test('nested ternary', () => {
            const js = compile('a ? b ? c : d : e');

            expect(js).toBe('a ? b ? c : d : e;');
        });

        test('ternary in variable', () => {
            const js = compile('varia x = verum ? 1 : 0');

            expect(js).toBe('let x = true ? 1 : 0;');
        });
    });

    describe('ut (type cast) operator', () => {
        test('simple type cast', () => {
            const js = compile('fixum name = data ut textus');

            expect(js).toBe('const name = (data as string);');
        });

        test('cast member expression', () => {
            const js = compile('fixum body = response.body ut objectum');

            expect(js).toBe('const body = (response.body as object);');
        });

        test('cast in expression context', () => {
            const js = compile('scribe (x ut numerus)');

            expect(js).toContain('(x as number)');
        });

        test('chained casts', () => {
            const js = compile('fixum result = x ut A ut B');

            // Should be ((x as A) as B)
            expect(js).toContain('((x as A) as B)');
        });

        test('cast with generic type', () => {
            const js = compile('fixum items = data ut lista<textus>');

            expect(js).toContain('as Array<string>');
        });

        test('cast with nullable type', () => {
            const js = compile('fixum value = data ut textus?');

            expect(js).toContain('as string | null');
        });
    });

    describe('est (type check) expressions', () => {
        test('est with primitive generates typeof', () => {
            const js = compile('fixum check = x est textus');

            expect(js).toContain('typeof x === "string"');
        });

        test('est with primitive type uses typeof', () => {
            const js = compile('si x est textus { scribe "string" }');

            expect(js).toContain('typeof x === "string"');
        });

        test('est with numerus uses typeof number', () => {
            const js = compile('si x est numerus { scribe "number" }');

            expect(js).toContain('typeof x === "number"');
        });

        test('est with bivalens uses typeof boolean', () => {
            const js = compile('si x est bivalens { scribe "boolean" }');

            expect(js).toContain('typeof x === "boolean"');
        });

        test('non est generates negated check', () => {
            const js = compile('fixum check = x non est numerus');

            expect(js).toContain('typeof x !== "number"');
        });

        test('non est with type uses typeof !==', () => {
            const js = compile('si x non est textus { scribe "not string" }');

            expect(js).toContain('typeof x !== "string"');
        });

        test('est with user type generates instanceof', () => {
            const js = compile('fixum check = obj est Persona');

            expect(js).toContain('instanceof Persona');
        });

        test('est with user type uses instanceof', () => {
            const js = compile('si x est persona { scribe "is persona" }');

            expect(js).toContain('(x instanceof persona)');
        });

        test('non est with user type uses !(instanceof)', () => {
            const js = compile('si x non est persona { scribe "not persona" }');

            expect(js).toContain('!(x instanceof persona)');
        });
    });

    describe('nihil/nonnihil unary operators', () => {
        test('nihil unary uses === null', () => {
            const js = compile('si nihil x { scribe "null" }');

            expect(js).toContain('(x === null)');
        });

        test('nonnihil unary uses !== null', () => {
            const js = compile('si nonnihil x { scribe "not null" }');

            expect(js).toContain('(x !== null)');
        });
    });

    describe('nulla/nonnulla operators', () => {
        test('nulla generates null check', () => {
            const js = compile('si nulla x { scribe "empty" }');

            expect(js).toContain('if');
            expect(js).toContain('null');
        });

        test('nonnulla generates non-null check', () => {
            const js = compile('si nonnulla items { scribe "has items" }');

            expect(js).toContain('if');
        });

        test('nulla on array', () => {
            const js = compile('fixum check = nulla []');

            expect(js).toContain('const check');
        });

        test('nonnulla on object', () => {
            const js = compile('fixum check = nonnulla { a: 1 }');

            expect(js).toContain('const check');
        });

        test('nulla in conditional', () => {
            const js = compile('fixum result = nulla x && verum');

            expect(js).toContain('&&');
            expect(js).toContain('true');
        });
    });

    describe('sparge (spread)', () => {
        test('sparge in array literal', () => {
            const js = compile('fixum combined = [sparge a, sparge b]');

            expect(js).toBe('const combined = [...a, ...b];');
        });

        test('spread in array literal', () => {
            const js = compile(`
                fixum a = [1, 2]
                fixum b = [sparge a, 3, 4]
            `);

            expect(js).toContain('const b = [...a, 3, 4]');
        });

        test('multiple spreads in array', () => {
            const js = compile(`
                fixum a = [1]
                fixum b = [2]
                fixum c = [sparge a, sparge b]
            `);

            expect(js).toContain('const c = [...a, ...b]');
        });

        test('sparge in function call', () => {
            const js = compile('fn(sparge args)');

            expect(js).toBe('fn(...args);');
        });

        test('spread in function call', () => {
            const js = compile(`
                functio sum(numerus a, numerus b) -> numerus { redde a + b }
                fixum args = [1, 2]
                sum(sparge args)
            `);

            expect(js).toContain('sum(...args)');
        });

        test('spread with other args in call', () => {
            const js = compile(`
                functio f(a, b, c) { scribe a, b, c }
                fixum rest = [2, 3]
                f(1, sparge rest)
            `);

            expect(js).toContain('f(1, ...rest)');
        });

        test('sparge in object literal', () => {
            const js = compile('fixum merged = { sparge defaults, x: 1 }');

            expect(js).toBe('const merged = { ...defaults, x: 1 };');
        });

        test('spread in object literal', () => {
            const js = compile(`
                fixum defaults = { a: 1 }
                fixum merged = { sparge defaults, b: 2 }
            `);

            expect(js).toContain('const merged = { ...defaults, b: 2 }');
        });

        test('multiple spreads in object', () => {
            const js = compile(`
                fixum a = { x: 1 }
                fixum b = { y: 2 }
                fixum c = { sparge a, sparge b }
            `);

            expect(js).toContain('const c = { ...a, ...b }');
        });

        test('sparge at start of array', () => {
            const js = compile('fixum arr = [sparge existing, newItem]');

            expect(js).toBe('const arr = [...existing, newItem];');
        });

        test('multiple sparge in call', () => {
            const js = compile('fn(a, sparge b, c, sparge d)');

            expect(js).toBe('fn(a, ...b, c, ...d);');
        });
    });

    describe('ceteri (rest)', () => {
        test('ceteri in array destructuring', () => {
            const js = compile('fixum [first, ceteri rest] = items');

            expect(js).toBe('const [first, ...rest] = items;');
        });

        test('ceteri in object destructuring', () => {
            const js = compile('fixum { a, ceteri rest } = obj');

            expect(js).toBe('const { a, ...rest } = obj;');
        });

        test('rest in object destructuring', () => {
            const js = compile(`
                fixum obj = { a: 1, b: 2, c: 3 }
                fixum { a, ceteri rest } = obj
            `);

            expect(js).toContain('const { a, ...rest } = obj');
        });

        test('rest with rename in destructuring', () => {
            const js = compile(`
                fixum obj = { x: 1, y: 2, z: 3 }
                fixum { x: localX, ceteri others } = obj
            `);

            expect(js).toContain('const { x: localX, ...others } = obj');
        });

        test('ceteri in function params', () => {
            const js = compile('functio sum(ceteri lista<numerus> nums) { redde 0 }');

            expect(js).toContain('...nums: Array<number>');
        });

        test('rest parameter in function', () => {
            const js = compile(`
                functio sum(ceteri lista<numerus> nums) -> numerus {
                    redde 0
                }
            `);

            expect(js).toContain('function sum(...nums: Array<number>)');
        });

        test('rest with regular params', () => {
            const js = compile(`
                functio log(textus prefix, ceteri lista<textus> messages) {
                    scribe prefix
                }
            `);

            expect(js).toContain('function log(prefix: string, ...messages: Array<string>)');
        });
    });

    describe('optional chaining and non-null assertion', () => {
        test('optional property access', () => {
            const js = compile('user?.name');

            expect(js).toBe('user?.name;');
        });

        test('optional member access ?.', () => {
            const js = compile('user?.name');

            expect(js).toContain('user?.name');
        });

        test('optional computed access', () => {
            const js = compile('arr?[0]');

            expect(js).toBe('arr?.[0];');
        });

        test('optional computed access ?[', () => {
            const js = compile('items?[0]');

            expect(js).toContain('items?.[0]');
        });

        test('optional call', () => {
            const js = compile('callback?()');

            expect(js).toBe('callback?.();');
        });

        test('optional call ?(', () => {
            const js = compile('callback?(x)');

            expect(js).toContain('callback?.(x)');
        });

        test('non-null property access', () => {
            const js = compile('user!.name');

            expect(js).toBe('user!.name;');
        });

        test('non-null member access !.', () => {
            const js = compile('user!.name');

            expect(js).toContain('user!.name');
        });

        test('non-null computed access', () => {
            const js = compile('arr![0]');

            expect(js).toBe('arr![0];');
        });

        test('non-null computed access ![', () => {
            const js = compile('items![0]');

            expect(js).toContain('items![0]');
        });

        test('non-null call', () => {
            const js = compile('callback!()');

            expect(js).toBe('callback!();');
        });

        test('non-null call !(', () => {
            const js = compile('callback!(x)');

            expect(js).toContain('callback!(x)');
        });

        test('chained optional access', () => {
            const js = compile('a?.b?.c');

            expect(js).toBe('a?.b?.c;');
        });

        test('mixed optional and regular access', () => {
            const js = compile('a?.b.c?.d');

            expect(js).toBe('a?.b.c?.d;');
        });
    });

    describe('computed member access', () => {
        test('computed access with variable', () => {
            const js = compile('obj[key]');

            expect(js).toBe('obj[key];');
        });

        test('computed access with literal', () => {
            const js = compile('arr[0]');

            expect(js).toBe('arr[0];');
        });

        test('computed access with expression', () => {
            const js = compile('arr[i + 1]');

            expect(js).toBe('arr[(i + 1)];');
        });

        test('array index access', () => {
            const js = compile(`
                fixum items = [1, 2, 3]
                fixum first = items[0]
            `);

            expect(js).toContain('const first = items[0]');
        });

        test('dynamic property access', () => {
            const js = compile(`
                fixum obj = { a: 1 }
                fixum key = "a"
                fixum val = obj[key]
            `);

            expect(js).toContain('const val = obj[key]');
        });
    });

    describe('array slicing and negative indices', () => {
        test('negative index uses .at()', () => {
            const js = compile('fixum x = nums[-1]');

            expect(js).toBe('const x = nums.at(-1);');
        });

        test('slice with exclusive range', () => {
            const js = compile('fixum x = nums[1..3]');

            expect(js).toBe('const x = nums.slice(1, 3);');
        });

        test('slice with inclusive range (usque)', () => {
            const js = compile('fixum x = nums[0 usque 2]');

            expect(js).toBe('const x = nums.slice(0, 3);');
        });

        test('slice with negative indices', () => {
            const js = compile('fixum x = nums[-3..-1]');

            expect(js).toBe('const x = nums.slice(-3, -1);');
        });

        test('slice with inclusive negative end', () => {
            const js = compile('fixum x = nums[-3 usque -1]');

            // inclusive of -1 means to end
            expect(js).toBe('const x = nums.slice(-3);');
        });

        test('optional slice with ?[]', () => {
            const js = compile('fixum x = nums?[1..3]');

            expect(js).toBe('const x = nums?.slice(1, 3);');
        });

        test('optional negative index', () => {
            const js = compile('fixum x = nums?[-1]');

            expect(js).toBe('const x = nums?.at(-1);');
        });
    });

    describe('TS patterns not valid in Faber', () => {
        test('Fail when using TS-style type annotation', () => {
            const errors = getParseErrors('fixum nomen: textus = "x"');

            expect(errors.length).toBeGreaterThan(0);
        });

        test('Fail when using TS-style param annotation', () => {
            const errors = getParseErrors('functio f(x: textus) {}');

            expect(errors.length).toBeGreaterThan(0);
        });

        test('Fail when using TS-style return type', () => {
            const errors = getParseErrors('functio f(): textus {}');

            expect(errors.length).toBeGreaterThan(0);
        });

        test('Fail when using increment operator', () => {
            const errors = getParseErrors('x++');

            expect(errors.length).toBeGreaterThan(0);
        });

        test('Fail when using exponentiation operator', () => {
            const errors = getParseErrors('a ** b');

            expect(errors.length).toBeGreaterThan(0);
        });
    });
});
