/**
 * Shared test runner for cross-target codegen tests.
 *
 * Loads YAML test cases and runs them against multiple codegen targets.
 * Each test case specifies input and expected output per target.
 */

import { describe, test, expect } from 'bun:test';
import { parse as parseYaml } from 'yaml';
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

import { tokenize } from '../../tokenizer';
import { parse } from '../../parser';
import { analyze } from '../../semantic';
import { generate } from '../index';

// Supported targets
const TARGETS = ['ts', 'py'] as const;
type Target = (typeof TARGETS)[number];

interface TestCase {
    name: string;
    input: string;
    ts?: string | string[];
    py?: string | string[];
    zig?: string | string[];
    cpp?: string | string[];
    rs?: string | string[];
    skip?: Target[];
}

/**
 * Compile Faber source to target language.
 */
function compile(code: string, target: Target = 'ts'): string {
    const { tokens } = tokenize(code);
    const { program } = parse(tokens);

    if (!program) {
        throw new Error('Parse failed');
    }

    const { program: analyzedProgram } = analyze(program);
    return generate(analyzedProgram, { target });
}

/**
 * Check if output matches expectation.
 * - String: exact match (after trimming)
 * - Array: all fragments must be present (contains)
 */
function checkOutput(output: string, expected: string | string[]): void {
    if (Array.isArray(expected)) {
        for (const fragment of expected) {
            expect(output).toContain(fragment);
        }
    } else {
        expect(output.trim()).toBe(expected);
    }
}

/**
 * Load and run all test cases from a YAML file.
 */
function runTestFile(filePath: string): void {
    const content = readFileSync(filePath, 'utf-8');
    const cases: TestCase[] = parseYaml(content);
    const suiteName = basename(filePath, '.yaml');

    describe(suiteName, () => {
        for (const target of TARGETS) {
            describe(target, () => {
                for (const tc of cases) {
                    const expected = tc[target];

                    // Skip if no expectation for this target
                    if (expected === undefined) continue;

                    // Skip if explicitly marked to skip
                    if (tc.skip?.includes(target)) continue;

                    test(tc.name, () => {
                        const output = compile(tc.input.trim(), target);
                        checkOutput(output, expected);
                    });
                }
            });
        }
    });
}

// Load all YAML test files from this directory
const testDir = import.meta.dir;
const yamlFiles = readdirSync(testDir).filter(f => f.endsWith('.yaml'));

for (const file of yamlFiles) {
    runTestFile(join(testDir, file));
}
