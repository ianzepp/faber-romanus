#!/usr/bin/env bun
/**
 * Execute compiled exempla artifacts with safety timeout.
 *
 * Usage:
 *   bun run build:exec              # Run all targets (default)
 *   bun run build:exec -t ts        # Run only TypeScript
 *   bun run build:exec -t zig       # Run only Zig binaries
 *   bun run build:exec --timeout 10 # Custom timeout in seconds (default: 5)
 *
 * Prerequisites:
 *   bun run build:exempla -t <target>
 */

import { readdir, stat } from 'fs/promises';
import { basename, dirname, join, relative } from 'path';
import { $ } from 'bun';

const ROOT = join(import.meta.dir, '..');
const EXEMPLA_OUTPUT = join(ROOT, 'opus', 'exempla');

type Target = 'ts' | 'zig' | 'py';

const VALID_TARGETS = ['ts', 'zig', 'py', 'all'] as const;
const ALL_TARGETS: Target[] = ['ts', 'zig', 'py'];

interface Args {
    targets: Target[];
    timeout: number;
}

function parseArgs(): Args {
    const args = process.argv.slice(2);
    let targets: Target[] = ALL_TARGETS;
    let timeout = 5;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-t' || arg === '--target') {
            const t = args[++i];
            if (!VALID_TARGETS.includes(t as typeof VALID_TARGETS[number])) {
                console.error(`Unknown target '${t}'. Valid: ${VALID_TARGETS.join(', ')}`);
                process.exit(1);
            }
            targets = t === 'all' ? ALL_TARGETS : [t as Target];
        }
        else if (arg === '--timeout') {
            const t = parseInt(args[++i], 10);
            if (isNaN(t) || t < 1) {
                console.error(`Invalid timeout '${args[i]}'. Must be positive integer.`);
                process.exit(1);
            }
            timeout = t;
        }
    }

    return { targets, timeout };
}

async function findFiles(dir: string, ext: string): Promise<string[]> {
    try {
        const entries = await readdir(dir);
        const files: string[] = [];

        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const s = await stat(fullPath);
            if (s.isDirectory()) {
                files.push(...await findFiles(fullPath, ext));
            }
            else if (entry.endsWith(ext)) {
                files.push(fullPath);
            }
        }

        return files;
    }
    catch {
        return [];
    }
}

async function findExecutables(dir: string): Promise<string[]> {
    try {
        const entries = await readdir(dir);
        const files: string[] = [];

        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const s = await stat(fullPath);
            if (s.isDirectory()) {
                files.push(...await findExecutables(fullPath));
            }
            else if (!entry.includes('.') && (s.mode & 0o111)) {
                files.push(fullPath);
            }
        }

        return files;
    }
    catch {
        return [];
    }
}

interface ExecResult {
    file: string;
    success: boolean;
    timeout: boolean;
    stdout: string;
    stderr: string;
    exitCode: number | null;
}

async function execWithTimeout(cmd: string[], timeoutSec: number): Promise<ExecResult & { file: '' }> {
    const proc = Bun.spawn(cmd, {
        stdout: 'pipe',
        stderr: 'pipe',
    });

    const timeoutMs = timeoutSec * 1000;
    let timedOut = false;

    const timer = setTimeout(() => {
        timedOut = true;
        proc.kill();
    }, timeoutMs);

    const [stdout, stderr] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
    ]);

    const exitCode = await proc.exited;
    clearTimeout(timer);

    return {
        file: '',
        success: !timedOut && exitCode === 0,
        timeout: timedOut,
        stdout,
        stderr,
        exitCode: timedOut ? null : exitCode,
    };
}

async function runTarget(target: Target, timeoutSec: number): Promise<{ total: number; passed: number; failed: number; timedOut: number }> {
    const targetDir = join(EXEMPLA_OUTPUT, target);
    let files: string[] = [];
    let getCmd: (file: string) => string[];

    switch (target) {
        case 'ts':
            files = await findFiles(targetDir, '.ts');
            getCmd = (file) => ['bun', 'run', file];
            break;
        case 'zig':
            files = await findExecutables(targetDir);
            getCmd = (file) => [file];
            break;
        case 'py':
            files = await findFiles(targetDir, '.py');
            getCmd = (file) => ['python3', file];
            break;
    }

    if (files.length === 0) {
        console.log(`  (no files found)`);
        return { total: 0, passed: 0, failed: 0, timedOut: 0 };
    }

    let passed = 0;
    let failed = 0;
    let timedOut = 0;

    for (const file of files) {
        const relPath = relative(EXEMPLA_OUTPUT, file);
        const cmd = getCmd(file);

        const result = await execWithTimeout(cmd, timeoutSec);

        if (result.timeout) {
            console.log(`  ${relPath}: TIMEOUT (>${timeoutSec}s)`);
            timedOut++;
        }
        else if (result.success) {
            console.log(`  ${relPath}: OK`);
            passed++;
        }
        else {
            console.log(`  ${relPath}: FAILED (exit ${result.exitCode})`);
            if (result.stderr.trim()) {
                const firstLine = result.stderr.trim().split('\n')[0];
                console.log(`    ${firstLine}`);
            }
            failed++;
        }
    }

    return { total: files.length, passed, failed, timedOut };
}

async function main() {
    const { targets, timeout } = parseArgs();
    const start = performance.now();

    console.log(`Executing exempla (targets: ${targets.join(', ')}, timeout: ${timeout}s)\n`);

    let totalPassed = 0;
    let totalFailed = 0;
    let totalTimedOut = 0;
    let totalFiles = 0;

    for (const target of targets) {
        console.log(`${target}:`);
        const result = await runTarget(target, timeout);
        totalFiles += result.total;
        totalPassed += result.passed;
        totalFailed += result.failed;
        totalTimedOut += result.timedOut;
        console.log('');
    }

    const elapsed = performance.now() - start;
    console.log(`Results: ${totalPassed} passed, ${totalFailed} failed, ${totalTimedOut} timed out (${totalFiles} total, ${elapsed.toFixed(0)}ms)`);

    if (totalFailed > 0 || totalTimedOut > 0) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error(`\nFailed: ${err.message}`);
    process.exit(1);
});
