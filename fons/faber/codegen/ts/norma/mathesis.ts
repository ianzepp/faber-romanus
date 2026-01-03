/**
 * Mathesis Function Registry - TypeScript translations for Latin math functions
 *
 * COMPILER PHASE
 * ==============
 * codegen (TypeScript target)
 *
 * ARCHITECTURE
 * ============
 * This module defines TypeScript translations for mathesis (math) module functions.
 * These are imported via `ex "norma/mathesis" importa pavimentum, radix, PI`.
 *
 * Unlike intrinsics which are always available, mathesis functions are only
 * accessible after explicit import.
 *
 * TARGET MAPPING
 * ==============
 * | Faber         | TypeScript      |
 * |---------------|-----------------|
 * | pavimentum    | Math.floor      |
 * | tectum        | Math.ceil       |
 * | rotundum      | Math.round      |
 * | truncatum     | Math.trunc      |
 * | radix         | Math.sqrt       |
 * | potentia      | Math.pow        |
 * | logarithmus   | Math.log        |
 * | logarithmus10 | Math.log10      |
 * | exponens      | Math.exp        |
 * | sinus         | Math.sin        |
 * | cosinus       | Math.cos        |
 * | tangens       | Math.tan        |
 * | absolutum     | Math.abs        |
 * | signum        | Math.sign       |
 * | minimus       | Math.min        |
 * | maximus       | Math.max        |
 * | constringens  | Math.min/max    |
 * | PI            | Math.PI         |
 * | E             | Math.E          |
 * | TAU           | Math.PI * 2     |
 */

// =============================================================================
// TYPES
// =============================================================================

export type MathesisGenerator = (args: string[]) => string;

export interface MathesisEntry {
    latin: string;
    ts: string | MathesisGenerator;
}

// =============================================================================
// FUNCTION REGISTRY
// =============================================================================

export const MATHESIS_FUNCTIONS: Record<string, MathesisEntry> = {
    // Rounding
    pavimentum: { latin: 'pavimentum', ts: args => `Math.floor(${args[0]})` },
    tectum: { latin: 'tectum', ts: args => `Math.ceil(${args[0]})` },
    rotundum: { latin: 'rotundum', ts: args => `Math.round(${args[0]})` },
    truncatum: { latin: 'truncatum', ts: args => `Math.trunc(${args[0]})` },

    // Powers and roots
    radix: { latin: 'radix', ts: args => `Math.sqrt(${args[0]})` },
    potentia: { latin: 'potentia', ts: args => `Math.pow(${args[0]}, ${args[1]})` },
    logarithmus: { latin: 'logarithmus', ts: args => `Math.log(${args[0]})` },
    logarithmus10: { latin: 'logarithmus10', ts: args => `Math.log10(${args[0]})` },
    exponens: { latin: 'exponens', ts: args => `Math.exp(${args[0]})` },

    // Trigonometry
    sinus: { latin: 'sinus', ts: args => `Math.sin(${args[0]})` },
    cosinus: { latin: 'cosinus', ts: args => `Math.cos(${args[0]})` },
    tangens: { latin: 'tangens', ts: args => `Math.tan(${args[0]})` },

    // Absolute and sign
    absolutum: { latin: 'absolutum', ts: args => `Math.abs(${args[0]})` },
    signum: { latin: 'signum', ts: args => `Math.sign(${args[0]})` },

    // Min/max/clamp
    minimus: { latin: 'minimus', ts: args => `Math.min(${args[0]}, ${args[1]})` },
    maximus: { latin: 'maximus', ts: args => `Math.max(${args[0]}, ${args[1]})` },
    constringens: {
        latin: 'constringens',
        ts: args => `Math.min(Math.max(${args[0]}, ${args[1]}), ${args[2]})`,
    },
};

// =============================================================================
// CONSTANT REGISTRY
// =============================================================================

export const MATHESIS_CONSTANTS: Record<string, string> = {
    PI: 'Math.PI',
    E: 'Math.E',
    TAU: '(Math.PI * 2)',
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

export function getMathesisFunction(name: string): MathesisEntry | undefined {
    return MATHESIS_FUNCTIONS[name];
}

export function getMathesisConstant(name: string): string | undefined {
    return MATHESIS_CONSTANTS[name];
}

export function isMathesisFunction(name: string): boolean {
    return name in MATHESIS_FUNCTIONS;
}

export function isMathesisConstant(name: string): boolean {
    return name in MATHESIS_CONSTANTS;
}
