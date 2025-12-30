/**
 * Tempus Function Registry - Rust translations for Latin time functions
 *
 * COMPILER PHASE
 * ==============
 * codegen (Rust target)
 *
 * TARGET MAPPING
 * ==============
 * | Faber         | Rust                                                      |
 * |---------------|-----------------------------------------------------------|
 * | nunc          | SystemTime::now().duration_since(UNIX_EPOCH).as_millis()  |
 * | nunc_nano     | ...as_nanos()                                             |
 * | nunc_secunda  | ...as_secs()                                              |
 * | dormi         | std::thread::sleep(Duration::from_millis(ms))             |
 * | MILLISECUNDUM | 1_i64                                                     |
 * | SECUNDUM      | 1000_i64                                                  |
 * | MINUTUM       | 60000_i64                                                 |
 * | HORA          | 3600000_i64                                               |
 * | DIES          | 86400000_i64                                              |
 *
 * NOTE: dormi is blocking. Async sleep requires tokio/async-std runtime.
 *       Future nucleus integration may provide async variants.
 */

// =============================================================================
// TYPES
// =============================================================================

export type TempusGenerator = (args: string[]) => string;

export interface TempusEntry {
    latin: string;
    rs: string | TempusGenerator;
}

// =============================================================================
// FUNCTION REGISTRY
// =============================================================================

export const TEMPUS_FUNCTIONS: Record<string, TempusEntry> = {
    nunc: {
        latin: 'nunc',
        rs: () =>
            `std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis() as i64`,
    },
    nunc_nano: {
        latin: 'nunc_nano',
        rs: () =>
            `std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos() as i64`,
    },
    nunc_secunda: {
        latin: 'nunc_secunda',
        rs: () =>
            `std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs() as i64`,
    },
    dormi: {
        latin: 'dormi',
        // NOTE: Blocking sleep. Nucleus integration may provide async variant.
        rs: args => `std::thread::sleep(std::time::Duration::from_millis(${args[0]} as u64))`,
    },
};

// =============================================================================
// CONSTANT REGISTRY
// =============================================================================

export const TEMPUS_CONSTANTS: Record<string, string> = {
    MILLISECUNDUM: '1_i64',
    SECUNDUM: '1000_i64',
    MINUTUM: '60000_i64',
    HORA: '3600000_i64',
    DIES: '86400000_i64',
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
