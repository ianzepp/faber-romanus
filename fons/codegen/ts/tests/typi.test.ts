/**
 * Typi - Type system codegen tests.
 *
 * Covers: type aliases, ordo (enum), union types, nullable, numeric types.
 */

import { describe, test, expect } from 'bun:test';
import { compile } from './helpers';

describe('typi', () => {
    describe('type declarations', () => {
        test('type alias declaration', () => {
            const js = compile('typus ID = textus');

            expect(js).toBe('type ID = string;');
        });

        test('simple type alias', () => {
            const js = compile('typus ID = textus');

            expect(js).toBe('type ID = string;');
        });

        test('type alias with generic', () => {
            const js = compile('typus StringList = lista<textus>');

            expect(js).toBe('type StringList = Array<string>;');
        });

        test('generic type alias', () => {
            const js = compile('typus StringList = lista<textus>');

            expect(js).toBe('type StringList = Array<string>;');
        });

        test('typeof type alias', () => {
            const js = compile(`
                fixum config = { debug: verum }
                typus ConfigTypus = typus config
            `);

            expect(js).toContain('type ConfigTypus = typeof config;');
        });

        test('type with numeric parameter is ignored in TS', () => {
            const js = compile('typus SmallNum = numerus<32>');

            expect(js).toBe('type SmallNum = number;');
        });

        test('type with size type parameter', () => {
            // i32, u64 etc. are parsed as type annotations but ignored in TS
            const js = compile('typus Int32 = numerus<i32>');

            expect(js).toBe('type Int32 = number<i32>;');
        });

        test('fractus maps to number', () => {
            const js = compile('typus Ratio = fractus');

            expect(js).toBe('type Ratio = number;');
        });

        test('decimus maps to Decimal with import', () => {
            const js = compile('typus Price = decimus');

            expect(js).toContain("import type Decimal from 'decimal.js';");
            expect(js).toContain('type Price = Decimal;');
        });

        test('octeti maps to Uint8Array', () => {
            const js = compile('typus Buffer = octeti');

            expect(js).toBe('type Buffer = Uint8Array;');
        });

        test('magnus maps to bigint', () => {
            const js = compile('typus BigNum = magnus');

            expect(js).toBe('type BigNum = bigint;');
        });

        test('magnus variable with bigint literal', () => {
            const js = compile('fixum magnus huge = 99999999999999999999n');

            expect(js).toBe('const huge: bigint = 99999999999999999999n;');
        });

        test('numquam maps to never', () => {
            const js = compile('functio moritur() -> numquam { iace novum Erratum("fatal") }');

            expect(js).toContain('function moritur(): never');
        });

        test('ignotum maps to unknown', () => {
            const js = compile('typus Mystery = ignotum');

            expect(js).toBe('type Mystery = unknown;');
        });

        test('ignotum variable accepts any value', () => {
            const js = compile('varia ignotum x = 42');

            expect(js).toBe('let x: unknown = 42;');
        });

        test('union type with unio<A, B>', () => {
            const js = compile('fixum unio<textus, numerus> value = "hello"');

            expect(js).toBe('const value: string | number = "hello";');
        });

        test('union type with three members', () => {
            const js = compile('fixum unio<textus, numerus, nihil> value = nihil');

            expect(js).toBe('const value: string | number | null = null;');
        });

        test('type alias with union type', () => {
            const js = compile('typus Json = unio<textus, numerus, bivalens, nihil>');

            expect(js).toBe('type Json = string | number | boolean | null;');
        });
    });

    describe('enum declarations (ordo)', () => {
        test('simple enum', () => {
            const js = compile('ordo color { rubrum, viridis, caeruleum }');

            expect(js).toBe('enum color { rubrum, viridis, caeruleum }');
        });

        test('enum with numeric values', () => {
            const js = compile('ordo status { pendens = 0, actum = 1, finitum = 2 }');

            expect(js).toBe('enum status { pendens = 0, actum = 1, finitum = 2 }');
        });

        test('enum with string values', () => {
            const js = compile('ordo direction { north = "N", south = "S" }');

            expect(js).toBe('enum direction { north = "N", south = "S" }');
        });

        test('enum with mixed values', () => {
            const js = compile('ordo mixed { a, b = 5, c }');

            expect(js).toBe('enum mixed { a, b = 5, c }');
        });

        test('enum member access', () => {
            const js = compile(`
                ordo color { rubrum, viridis }
                scribe color.rubrum
            `);

            expect(js).toContain('enum color { rubrum, viridis }');
            expect(js).toContain('console.log(color.rubrum)');
        });
    });
});
