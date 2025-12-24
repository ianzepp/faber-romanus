#!/usr/bin/env bun
/**
 * Tree-sitter Grammar Test Script
 *
 * Regenerates the parser from grammar.js and verifies it compiles without errors.
 * The generated parser is used by Zed for syntax highlighting.
 */

import { $ } from 'bun';
import { join } from 'path';

const GRAMMAR_DIR = join(import.meta.dir, '../editors/zed/grammars/faber_romanus');

async function main() {
    console.log('Tree-sitter Grammar Check');
    console.log('=========================\n');

    // Check if tree-sitter is available
    try {
        await $`which tree-sitter`.quiet();
    }
    catch {
        console.error('Error: tree-sitter CLI not found');
        console.error('Install with: brew install tree-sitter');
        process.exit(1);
    }

    // Check tree-sitter version
    const version = await $`tree-sitter --version`.text();
    console.log(`tree-sitter version: ${version.trim()}`);

    // Regenerate the parser
    console.log('\nGenerating parser from grammar.js...');
    try {
        const result = await $`cd ${GRAMMAR_DIR} && tree-sitter generate 2>&1`.text();

        // Check for warnings (non-fatal)
        if (result.includes('Warning:')) {
            const warnings = result.split('\n').filter(l => l.includes('Warning:'));
            for (const w of warnings) {
                console.log(`  ⚠ ${w.replace('[33mWarning:[0m', 'Warning:').trim()}`);
            }
        }

        console.log('  ✓ Parser generated successfully\n');
    }
    catch (error: unknown) {
        console.error('  ✗ Failed to generate parser:');
        if (error instanceof Error) {
            console.error(error.message);
        }
        process.exit(1);
    }

    // Verify generated files exist
    console.log('Verifying generated files...');
    const requiredFiles = [
        'src/parser.c',
        'src/grammar.json',
        'src/node-types.json',
    ];

    for (const file of requiredFiles) {
        const path = join(GRAMMAR_DIR, file);
        const exists = await Bun.file(path).exists();
        if (exists) {
            console.log(`  ✓ ${file}`);
        }
        else {
            console.log(`  ✗ ${file} - MISSING`);
            process.exit(1);
        }
    }

    // Parse node-types.json to verify grammar structure
    console.log('\nVerifying grammar structure...');
    const nodeTypesPath = join(GRAMMAR_DIR, 'src/node-types.json');
    const nodeTypes = await Bun.file(nodeTypesPath).json();

    // Count named node types (rules that appear in the AST)
    const namedTypes = nodeTypes.filter((n: { named: boolean }) => n.named);
    console.log(`  Found ${namedTypes.length} named node types`);

    // Check for expected top-level constructs
    const expectedTypes = [
        'program',
        'variable_declaration',
        'function_declaration',
        'if_statement',
        'while_statement',
        'for_statement',
        'enum_declaration',
        'genus_declaration',
        'pactum_declaration',
        'block_statement',
        'identifier',
        'literal',
    ];

    const typeNames = new Set(namedTypes.map((n: { type: string }) => n.type));
    let missingCount = 0;

    for (const expected of expectedTypes) {
        if (typeNames.has(expected)) {
            console.log(`  ✓ ${expected}`);
        }
        else {
            console.log(`  ✗ ${expected} - MISSING`);
            missingCount++;
        }
    }

    if (missingCount > 0) {
        console.log(`\n✗ ${missingCount} expected node types missing`);
        process.exit(1);
    }

    console.log('\n✓ Tree-sitter grammar check passed');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
