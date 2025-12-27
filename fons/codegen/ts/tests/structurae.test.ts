/**
 * Structurae - Parse error tests only.
 *
 * Codegen tests have been migrated to fons/codegen/tests/structurae.yaml
 * This file contains only tests that validate parse errors using getParseErrors().
 */

import { describe, test, expect } from 'bun:test';
import { getParseErrors } from './helpers';

describe('structurae', () => {
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
            const errors = getParseErrors('fixum { } = user');

            expect(errors).toBeDefined();
        });

        test('Fail when using TS default value in destructure', () => {
            const errors = getParseErrors('fixum { a = 1 } = obj');

            expect(errors.length).toBeGreaterThan(0);
        });
    });
});
