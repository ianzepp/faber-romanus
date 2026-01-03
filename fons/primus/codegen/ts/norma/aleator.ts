/**
 * Aleator Function Registry - TypeScript translations for Latin random functions
 *
 * COMPILER PHASE
 * ==============
 * codegen (TypeScript target)
 *
 * ARCHITECTURE
 * ============
 * This module defines TypeScript translations for aleator (random) module functions.
 * These are imported via `ex "norma/aleator" importa fractus, numerus, uuid`.
 *
 * TARGET MAPPING
 * ==============
 * | Faber      | TypeScript                                    |
 * |------------|-----------------------------------------------|
 * | fractus    | Math.random()                                 |
 * | numerus    | Math.floor(Math.random() * (max-min+1)) + min |
 * | octeti     | crypto.getRandomValues(new Uint8Array(n))     |
 * | uuid       | crypto.randomUUID()                           |
 * | elige      | arr[Math.floor(Math.random() * arr.length)]   |
 * | misce      | [...arr].sort(() => Math.random() - 0.5)      |
 * | semen      | (no-op, JS Math.random is not seedable)       |
 */

// =============================================================================
// TYPES
// =============================================================================

export type AleatorGenerator = (args: string[]) => string;

export interface AleatorEntry {
    latin: string;
    ts: string | AleatorGenerator;
}

// =============================================================================
// FUNCTION REGISTRY
// =============================================================================

export const ALEATOR_FUNCTIONS: Record<string, AleatorEntry> = {
    // Basic generation
    fractus: { latin: 'fractus', ts: () => `Math.random()` },
    inter: {
        latin: 'inter',
        ts: args => `Math.floor(Math.random() * (${args[1]} - ${args[0]} + 1)) + ${args[0]}`,
    },
    octeti: {
        latin: 'octeti',
        ts: args => `crypto.getRandomValues(new Uint8Array(${args[0]}))`,
    },
    uuid: { latin: 'uuid', ts: () => `crypto.randomUUID()` },

    // Collection operations
    selige: {
        latin: 'selige',
        ts: args => `${args[0]}[Math.floor(Math.random() * ${args[0]}.length)]`,
    },
    misce: {
        latin: 'misce',
        // Fisher-Yates shuffle returns new array
        ts: args =>
            `(() => { const a = [...${args[0]}]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })()`,
    },

    // Seeding (no-op in JS)
    semen: {
        latin: 'semen',
        ts: () => `undefined /* JS Math.random is not seedable */`,
    },
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

export function getAleatorFunction(name: string): AleatorEntry | undefined {
    return ALEATOR_FUNCTIONS[name];
}

export function isAleatorFunction(name: string): boolean {
    return name in ALEATOR_FUNCTIONS;
}
