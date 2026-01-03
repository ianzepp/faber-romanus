/**
 * Tempus Function Registry - Zig translations for Latin time functions
 *
 * COMPILER PHASE
 * ==============
 * codegen (Zig target)
 *
 * TARGET MAPPING
 * ==============
 * | Faber         | Zig                           |
 * |---------------|-------------------------------|
 * | nunc          | std.time.milliTimestamp()     |
 * | nunc_nano     | std.time.nanoTimestamp()      |
 * | nunc_secunda  | std.time.timestamp()          |
 * | dormi         | std.time.sleep(ns)            |
 * | MILLISECUNDUM | 1                             |
 * | SECUNDUM      | 1000                          |
 * | MINUTUM       | 60000                         |
 * | HORA          | 3600000                       |
 * | DIES          | 86400000                      |
 *
 * NOTE: dormi is blocking. Zig's std.time.sleep takes nanoseconds.
 *       Future nucleus integration may provide async variants.
 */

// =============================================================================
// TYPES
// =============================================================================

export type TempusGenerator = (args: string[]) => string;

export interface TempusEntry {
    latin: string;
    zig: string | TempusGenerator;
}

// =============================================================================
// FUNCTION REGISTRY
// =============================================================================

export const TEMPUS_FUNCTIONS: Record<string, TempusEntry> = {
    nunc: {
        latin: 'nunc',
        zig: () => `std.time.milliTimestamp()`,
    },
    nunc_nano: {
        latin: 'nunc_nano',
        zig: () => `std.time.nanoTimestamp()`,
    },
    nunc_secunda: {
        latin: 'nunc_secunda',
        zig: () => `std.time.timestamp()`,
    },
    dormi: {
        latin: 'dormi',
        // NOTE: Blocking sleep. std.time.sleep takes nanoseconds.
        // Convert milliseconds to nanoseconds: ms * 1_000_000
        zig: args => `std.time.sleep(${args[0]} * 1_000_000)`,
    },
};

// =============================================================================
// CONSTANT REGISTRY
// =============================================================================

export const TEMPUS_CONSTANTS: Record<string, string> = {
    MILLISECUNDUM: '1',
    SECUNDUM: '1000',
    MINUTUM: '60000',
    HORA: '3600000',
    DIES: '86400000',
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

export function getTempusFunction(name: string): TempusEntry | undefined {
    return TEMPUS_FUNCTIONS[name];
}

export function getTempusConstant(name: string): string | undefined {
    return TEMPUS_CONSTANTS[name];
}

export function isTempusFunction(name: string): boolean {
    return name in TEMPUS_FUNCTIONS;
}

export function isTempusConstant(name: string): boolean {
    return name in TEMPUS_CONSTANTS;
}
