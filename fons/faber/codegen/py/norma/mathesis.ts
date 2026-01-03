/**
 * Mathesis Function Registry - Python translations for Latin math functions
 *
 * COMPILER PHASE
 * ==============
 * codegen (Python target)
 *
 * TARGET MAPPING
 * ==============
 * | Faber         | Python          |
 * |---------------|-----------------|
 * | pavimentum    | math.floor      |
 * | tectum        | math.ceil       |
 * | rotundum      | round           |
 * | truncatum     | math.trunc      |
 * | radix         | math.sqrt       |
 * | potentia      | math.pow        |
 * | logarithmus   | math.log        |
 * | logarithmus10 | math.log10      |
 * | exponens      | math.exp        |
 * | sinus         | math.sin        |
 * | cosinus       | math.cos        |
 * | tangens       | math.tan        |
 * | absolutum     | abs             |
 * | signum        | copysign(1, x)  |
 * | minimus       | min             |
 * | maximus       | max             |
 * | constringens  | max(lo, min(hi, x)) |
 * | PI            | math.pi         |
 * | E             | math.e          |
 * | TAU           | math.tau        |
 */

// =============================================================================
// TYPES
// =============================================================================

export type MathesisGenerator = (args: string[]) => string;

export interface MathesisEntry {
    latin: string;
    py: string | MathesisGenerator;
    requiresMath?: boolean;
}

// =============================================================================
// FUNCTION REGISTRY
// =============================================================================

export const MATHESIS_FUNCTIONS: Record<string, MathesisEntry> = {
    // Rounding
    pavimentum: { latin: 'pavimentum', py: args => `math.floor(${args[0]})`, requiresMath: true },
    tectum: { latin: 'tectum', py: args => `math.ceil(${args[0]})`, requiresMath: true },
    rotundum: { latin: 'rotundum', py: args => `round(${args[0]})` },
    truncatum: { latin: 'truncatum', py: args => `math.trunc(${args[0]})`, requiresMath: true },

    // Powers and roots
    radix: { latin: 'radix', py: args => `math.sqrt(${args[0]})`, requiresMath: true },
    potentia: { latin: 'potentia', py: args => `math.pow(${args[0]}, ${args[1]})`, requiresMath: true },
    logarithmus: { latin: 'logarithmus', py: args => `math.log(${args[0]})`, requiresMath: true },
    logarithmus10: { latin: 'logarithmus10', py: args => `math.log10(${args[0]})`, requiresMath: true },
    exponens: { latin: 'exponens', py: args => `math.exp(${args[0]})`, requiresMath: true },

    // Trigonometry
    sinus: { latin: 'sinus', py: args => `math.sin(${args[0]})`, requiresMath: true },
    cosinus: { latin: 'cosinus', py: args => `math.cos(${args[0]})`, requiresMath: true },
    tangens: { latin: 'tangens', py: args => `math.tan(${args[0]})`, requiresMath: true },

    // Absolute and sign
    absolutum: { latin: 'absolutum', py: args => `abs(${args[0]})` },
    signum: { latin: 'signum', py: args => `(1 if ${args[0]} > 0 else (-1 if ${args[0]} < 0 else 0))` },

    // Min/max/clamp
    minimus: { latin: 'minimus', py: args => `min(${args[0]}, ${args[1]})` },
    maximus: { latin: 'maximus', py: args => `max(${args[0]}, ${args[1]})` },
    constringens: {
        latin: 'constringens',
        py: args => `max(${args[1]}, min(${args[2]}, ${args[0]}))`,
    },
};

// =============================================================================
// CONSTANT REGISTRY
// =============================================================================

export const MATHESIS_CONSTANTS: Record<string, { py: string; requiresMath?: boolean }> = {
    PI: { py: 'math.pi', requiresMath: true },
    E: { py: 'math.e', requiresMath: true },
    TAU: { py: 'math.tau', requiresMath: true },
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

export function getMathesisFunction(name: string): MathesisEntry | undefined {
    return MATHESIS_FUNCTIONS[name];
}

export function getMathesisConstant(name: string): { py: string; requiresMath?: boolean } | undefined {
    return MATHESIS_CONSTANTS[name];
}

export function isMathesisFunction(name: string): boolean {
    return name in MATHESIS_FUNCTIONS;
}

export function isMathesisConstant(name: string): boolean {
    return name in MATHESIS_CONSTANTS;
}
