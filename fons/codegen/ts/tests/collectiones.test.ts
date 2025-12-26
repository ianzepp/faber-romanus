/**
 * Collectiones - Collection methods codegen tests.
 *
 * Covers: lista methods, tabula methods, copia methods.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('collectiones', () => {
    describe('lista methods - Latin array API', () => {
        describe('adding elements', () => {
            test('adde -> push (mutating)', () => {
                const js = compile('items.adde(x)');
                expect(js).toBe('items.push(x);');
            });

            test('addita -> spread (copying)', () => {
                const js = compile('items.addita(x)');
                expect(js).toBe('[...items, x];');
            });

            test('praepone -> unshift (mutating)', () => {
                const js = compile('items.praepone(x)');
                expect(js).toBe('items.unshift(x);');
            });

            test('praeposita -> spread (copying)', () => {
                const js = compile('items.praeposita(x)');
                expect(js).toBe('[x, ...items];');
            });
        });

        describe('removing elements', () => {
            test('remove -> pop (mutating)', () => {
                const js = compile('items.remove()');
                expect(js).toBe('items.pop();');
            });

            test('remota -> slice (copying)', () => {
                const js = compile('items.remota()');
                expect(js).toBe('items.slice(0, -1);');
            });

            test('decapita -> shift (mutating)', () => {
                const js = compile('items.decapita()');
                expect(js).toBe('items.shift();');
            });

            test('decapitata -> slice (copying)', () => {
                const js = compile('items.decapitata()');
                expect(js).toBe('items.slice(1);');
            });

            test('purga -> length = 0 (mutating)', () => {
                const js = compile('items.purga()');
                expect(js).toBe('items.length = 0;');
            });
        });

        describe('accessing elements', () => {
            test('primus -> [0]', () => {
                const js = compile('items.primus()');
                expect(js).toBe('items[0];');
            });

            test('ultimus -> at(-1)', () => {
                const js = compile('items.ultimus()');
                expect(js).toBe('items.at(-1);');
            });

            test('accipe -> indexed access', () => {
                const js = compile('items.accipe(2)');
                expect(js).toBe('items[2];');
            });
        });

        describe('properties', () => {
            test('longitudo -> length', () => {
                const js = compile('items.longitudo()');
                expect(js).toBe('items.length;');
            });

            test('vacua -> length === 0', () => {
                const js = compile('items.vacua()');
                expect(js).toBe('items.length === 0;');
            });
        });

        describe('searching', () => {
            test('continet -> includes', () => {
                const js = compile('items.continet(x)');
                expect(js).toBe('items.includes(x);');
            });

            test('indiceDe -> indexOf', () => {
                const js = compile('items.indiceDe(x)');
                expect(js).toBe('items.indexOf(x);');
            });

            test('inveni -> find', () => {
                const js = compile('items.inveni(fn)');
                expect(js).toBe('items.find(fn);');
            });

            test('inveniIndicem -> findIndex', () => {
                const js = compile('items.inveniIndicem(fn)');
                expect(js).toBe('items.findIndex(fn);');
            });
        });

        describe('transformations', () => {
            test('filtrata -> filter', () => {
                const js = compile('items.filtrata(fn)');
                expect(js).toBe('items.filter(fn);');
            });

            test('mappata -> map', () => {
                const js = compile('items.mappata(fn)');
                expect(js).toBe('items.map(fn);');
            });

            test('reducta -> reduce (args swapped)', () => {
                const js = compile('items.reducta(0, (acc, n) => acc + n)');
                expect(js).toBe('items.reduce((acc, n) => (acc + n), 0);');
            });

            test('inversa -> spread + reverse (copying)', () => {
                const js = compile('items.inversa()');
                expect(js).toBe('[...items].reverse();');
            });

            test('ordinata -> spread + sort (copying)', () => {
                const js = compile('items.ordinata()');
                expect(js).toBe('[...items].sort();');
            });

            test('ordinata with comparator', () => {
                const js = compile('items.ordinata(fn)');
                expect(js).toBe('[...items].sort(fn);');
            });

            test('sectio -> slice', () => {
                const js = compile('items.sectio(1, 3)');
                expect(js).toBe('items.slice(1, 3);');
            });

            test('prima -> slice(0, n)', () => {
                const js = compile('items.prima(5)');
                expect(js).toBe('items.slice(0, 5);');
            });

            test('ultima -> slice(-n)', () => {
                const js = compile('items.ultima(3)');
                expect(js).toBe('items.slice(-3);');
            });

            test('omitte -> slice(n)', () => {
                const js = compile('items.omitte(2)');
                expect(js).toBe('items.slice(2);');
            });
        });

        describe('predicates', () => {
            test('omnes -> every', () => {
                const js = compile('items.omnes(fn)');
                expect(js).toBe('items.every(fn);');
            });

            test('aliquis -> some', () => {
                const js = compile('items.aliquis(fn)');
                expect(js).toBe('items.some(fn);');
            });
        });

        describe('other methods', () => {
            test('coniunge -> join', () => {
                const js = compile('items.coniunge(", ")');
                expect(js).toBe('items.join(", ");');
            });

            test('perambula -> forEach', () => {
                const js = compile('items.perambula(fn)');
                expect(js).toBe('items.forEach(fn);');
            });

            test('plana -> flat', () => {
                const js = compile('items.plana()');
                expect(js).toBe('items.flat();');
            });

            test('explanata -> flatMap', () => {
                const js = compile('items.explanata(fn)');
                expect(js).toBe('items.flatMap(fn);');
            });
        });

        describe('chaining', () => {
            test('method chain is preserved', () => {
                const js = compile('items.filtrata(f).mappata(g)');
                expect(js).toBe('items.filter(f).map(g);');
            });

            test('complex chain', () => {
                const js = compile('items.filtrata(f).mappata(g).prima(10)');
                expect(js).toBe('items.filter(f).map(g).slice(0, 10);');
            });
        });

        describe('with arrow functions', () => {
            test('filtrata with arrow', () => {
                const js = compile('items.filtrata((x) => x > 0)');
                expect(js).toBe('items.filter((x) => (x > 0));');
            });

            test('mappata with arrow', () => {
                const js = compile('items.mappata((x) => x * 2)');
                expect(js).toBe('items.map((x) => (x * 2));');
            });
        });

        describe('mutating variants', () => {
            test('filtra -> in-place filter', () => {
                const js = compile('items.filtra(fn)');
                expect(js).toContain('splice');
                expect(js).toContain('fn');
            });

            test('ordina -> sort (mutating)', () => {
                const js = compile('items.ordina()');
                expect(js).toBe('items.sort();');
            });

            test('ordina with comparator', () => {
                const js = compile('items.ordina(fn)');
                expect(js).toBe('items.sort(fn);');
            });

            test('inverte -> reverse (mutating)', () => {
                const js = compile('items.inverte()');
                expect(js).toBe('items.reverse();');
            });
        });

        describe('lodash-inspired', () => {
            test('congrega -> Object.groupBy', () => {
                const js = compile('items.congrega(fn)');
                expect(js).toBe('Object.groupBy(items, fn);');
            });

            test('unica -> Set spread', () => {
                const js = compile('items.unica()');
                expect(js).toBe('[...new Set(items)];');
            });

            test('planaOmnia -> flat(Infinity)', () => {
                const js = compile('items.planaOmnia()');
                expect(js).toBe('items.flat(Infinity);');
            });

            test('fragmenta -> chunk implementation', () => {
                const js = compile('items.fragmenta(3)');
                expect(js).toContain('Array.from');
                expect(js).toContain('Math.ceil');
                expect(js).toContain('slice');
            });

            test('densa -> filter(Boolean)', () => {
                const js = compile('items.densa()');
                expect(js).toBe('items.filter(Boolean);');
            });

            test('partire -> partition via reduce', () => {
                const js = compile('items.partire(fn)');
                expect(js).toContain('reduce');
                expect(js).toContain('fn');
            });

            test('misce -> Fisher-Yates shuffle', () => {
                const js = compile('items.misce()');
                expect(js).toContain('Math.random');
                expect(js).toContain('[...items]');
            });

            test('specimen -> random element', () => {
                const js = compile('items.specimen()');
                expect(js).toContain('Math.floor');
                expect(js).toContain('Math.random');
                expect(js).toContain('items.length');
            });

            test('specimina -> random n elements', () => {
                const js = compile('items.specimina(5)');
                expect(js).toContain('Math.random');
                expect(js).toContain('slice(0, 5)');
            });
        });

        describe('aggregation', () => {
            test('summa -> reduce sum', () => {
                const js = compile('nums.summa()');
                expect(js).toBe('nums.reduce((a, b) => a + b, 0);');
            });

            test('medium -> average', () => {
                const js = compile('nums.medium()');
                expect(js).toContain('reduce');
                expect(js).toContain('nums.length');
            });

            test('minimus -> Math.min', () => {
                const js = compile('nums.minimus()');
                expect(js).toBe('Math.min(...nums);');
            });

            test('maximus -> Math.max', () => {
                const js = compile('nums.maximus()');
                expect(js).toBe('Math.max(...nums);');
            });

            test('minimusPer -> min by key', () => {
                const js = compile('items.minimusPer(fn)');
                expect(js).toContain('reduce');
                expect(js).toContain('fn');
            });

            test('maximusPer -> max by key', () => {
                const js = compile('items.maximusPer(fn)');
                expect(js).toContain('reduce');
                expect(js).toContain('fn');
            });

            test('numera -> count matching', () => {
                const js = compile('items.numera(fn)');
                expect(js).toBe('items.filter(fn).length;');
            });
        });
    });

    describe('tabula methods - Latin Map API', () => {
        // Helper to compile with a tabula variable in scope
        const tabulaCompile = (expr: string) => compile(`fixum tabula<textus, numerus> m = novum tabula()\n${expr}`);

        describe('core operations', () => {
            test('pone -> set', () => {
                const js = tabulaCompile('m.pone(k, v)');
                expect(js).toContain('m.set(k, v)');
            });

            test('accipe -> get', () => {
                const js = tabulaCompile('m.accipe(k)');
                expect(js).toContain('m.get(k)');
            });

            test('habet -> has', () => {
                const js = tabulaCompile('m.habet(k)');
                expect(js).toContain('m.has(k)');
            });

            test('dele -> delete', () => {
                const js = tabulaCompile('m.dele(k)');
                expect(js).toContain('m.delete(k)');
            });

            test('longitudo -> size', () => {
                const js = tabulaCompile('m.longitudo()');
                expect(js).toContain('m.size');
            });

            test('vacua -> size === 0', () => {
                const js = tabulaCompile('m.vacua()');
                expect(js).toContain('m.size === 0');
            });

            test('purga -> clear', () => {
                const js = tabulaCompile('m.purga()');
                expect(js).toContain('m.clear()');
            });
        });

        describe('iteration', () => {
            test('claves -> keys', () => {
                const js = tabulaCompile('m.claves()');
                expect(js).toContain('m.keys()');
            });

            test('valores -> values', () => {
                const js = tabulaCompile('m.valores()');
                expect(js).toContain('m.values()');
            });

            test('paria -> entries', () => {
                const js = tabulaCompile('m.paria()');
                expect(js).toContain('m.entries()');
            });
        });

        describe('lodash-inspired', () => {
            test('accipeAut -> get with default', () => {
                const js = tabulaCompile('m.accipeAut(k, def)');
                expect(js).toContain('m.get(k) ?? def');
            });

            test('confla -> merge maps', () => {
                const js = tabulaCompile('m.confla(other)');
                expect(js).toContain('new Map([...m, ...other])');
            });

            test('inversa -> swap keys/values', () => {
                const js = tabulaCompile('m.inversa()');
                expect(js).toContain('new Map');
                expect(js).toContain('[v, k]');
            });

            test('mappaValores -> transform values', () => {
                const js = tabulaCompile('m.mappaValores(fn)');
                expect(js).toContain('new Map');
            });

            test('mappaClaves -> transform keys', () => {
                const js = tabulaCompile('m.mappaClaves(fn)');
                expect(js).toContain('new Map');
            });

            test('selige -> pick keys', () => {
                const js = tabulaCompile('m.selige(a, b)');
                expect(js).toContain('new Map');
                expect(js).toContain('filter');
            });

            test('omitte -> omit keys', () => {
                const js = tabulaCompile('m.omitte(a, b)');
                expect(js).toContain('new Map');
                expect(js).toContain('filter');
            });
        });

        describe('conversions', () => {
            test('inLista -> spread to array', () => {
                const js = tabulaCompile('m.inLista()');
                expect(js).toContain('[...m]');
            });

            test('inObjectum -> Object.fromEntries', () => {
                const js = tabulaCompile('m.inObjectum()');
                expect(js).toContain('Object.fromEntries(m)');
            });
        });
    });

    describe('copia methods - Latin Set API', () => {
        // Helper to compile with copia variables in scope
        const copiaCompile = (expr: string) => compile(`fixum copia<numerus> a = novum copia()\nfixum copia<numerus> b = novum copia()\n${expr}`);

        describe('core operations', () => {
            test('adde -> add', () => {
                const js = copiaCompile('a.adde(v)');
                expect(js).toContain('a.add(v)');
            });

            test('habet -> has', () => {
                const js = copiaCompile('a.habet(v)');
                expect(js).toContain('a.has(v)');
            });

            test('dele -> delete', () => {
                const js = copiaCompile('a.dele(v)');
                expect(js).toContain('a.delete(v)');
            });

            test('longitudo -> size', () => {
                const js = copiaCompile('a.longitudo()');
                expect(js).toContain('a.size');
            });

            test('vacua -> size === 0', () => {
                const js = copiaCompile('a.vacua()');
                expect(js).toContain('a.size === 0');
            });

            test('purga -> clear', () => {
                const js = copiaCompile('a.purga()');
                expect(js).toContain('a.clear()');
            });
        });

        describe('set operations', () => {
            test('unio -> union', () => {
                const js = copiaCompile('a.unio(b)');
                expect(js).toContain('new Set([...a, ...b])');
            });

            test('intersectio -> intersection', () => {
                const js = copiaCompile('a.intersectio(b)');
                expect(js).toContain('filter');
                expect(js).toContain('b.has');
            });

            test('differentia -> difference', () => {
                const js = copiaCompile('a.differentia(b)');
                expect(js).toContain('filter');
                expect(js).toContain('!b.has');
            });

            test('symmetrica -> symmetric difference', () => {
                const js = copiaCompile('a.symmetrica(b)');
                expect(js).toContain('new Set');
                expect(js).toContain('filter');
            });
        });

        describe('predicates', () => {
            test('subcopia -> is subset', () => {
                const js = copiaCompile('a.subcopia(b)');
                expect(js).toContain('every');
                expect(js).toContain('b.has');
            });

            test('supercopia -> is superset', () => {
                const js = copiaCompile('a.supercopia(b)');
                expect(js).toContain('every');
                expect(js).toContain('a.has');
            });
        });

        describe('conversions and iteration', () => {
            test('inLista -> spread to array', () => {
                const js = copiaCompile('a.inLista()');
                expect(js).toContain('[...a]');
            });

            test('valores -> values', () => {
                const js = copiaCompile('a.valores()');
                expect(js).toContain('a.values()');
            });

            test('perambula -> forEach', () => {
                const js = copiaCompile('a.perambula(fn)');
                expect(js).toContain('a.forEach(fn)');
            });
        });
    });
});
