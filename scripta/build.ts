#!/usr/bin/env bun
/**
 * Full build: faber -> norma -> rivus -> exempla
 *
 * Usage:
 *   bun run build                        # faber, TypeScript (default)
 *   bun run build -t zig                 # faber, Zig
 *   bun run build -t all                 # faber, all targets
 *   bun run build -c rivus               # rivus, TypeScript
 *   bun run build -c rivus -t all        # rivus, all targets
 */

import { join } from 'path';
import { $ } from 'bun';

const ROOT = join(import.meta.dir, '..');

type Compiler = 'faber' | 'rivus';
type Target = 'ts' | 'zig' | 'py' | 'rs' | 'all';

const VALID_COMPILERS = ['faber', 'rivus'] as const;
const VALID_TARGETS = ['ts', 'zig', 'py', 'rs', 'all'] as const;

interface Args {
    compiler: Compiler;
    target: Target;
}

function parseArgs(): Args {
    const args = process.argv.slice(2);
    let compiler: Compiler = 'faber';
    let target: Target = 'ts';

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-c' || arg === '--compiler') {
            const c = args[++i];
            if (!VALID_COMPILERS.includes(c as Compiler)) {
                console.error(`Unknown compiler '${c}'. Valid: ${VALID_COMPILERS.join(', ')}`);
                process.exit(1);
            }
            compiler = c as Compiler;
        }
        else if (arg === '-t' || arg === '--target') {
            const t = args[++i];
            if (!VALID_TARGETS.includes(t as Target)) {
                console.error(`Unknown target '${t}'. Valid: ${VALID_TARGETS.join(', ')}`);
                process.exit(1);
            }
            target = t as Target;
        }
    }

    return { compiler, target };
}

async function step(name: string, fn: () => Promise<void>) {
    const start = performance.now();
    process.stdout.write(`${name}... `);
    await fn();
    const elapsed = performance.now() - start;
    console.log(`OK (${elapsed.toFixed(0)}ms)`);
}

async function main() {
    const { compiler, target } = parseArgs();
    const start = performance.now();

    console.log(`Full build (exempla compiler: ${compiler}, target: ${target})\n`);

    await step('build:faber', async () => {
        await $`bun run build:faber`.quiet();
    });

    await step('build:norma', async () => {
        await $`bun run build:norma`.quiet();
    });

    await step('build:rivus', async () => {
        await $`bun run build:rivus`.quiet();
    });

    console.log('');
    await $`bun run build:exempla -c ${compiler} -t ${target}`;

    const elapsed = performance.now() - start;
    console.log(`\nFull build complete (${(elapsed / 1000).toFixed(1)}s)`);
}

main().catch(err => {
    console.error(`\nFailed: ${err.message}`);
    process.exit(1);
});
