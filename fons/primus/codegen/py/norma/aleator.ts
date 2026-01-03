/**
 * Aleator Function Registry - Python translations for Latin random functions
 *
 * COMPILER PHASE
 * ==============
 * codegen (Python target)
 *
 * TARGET MAPPING
 * ==============
 * | Faber      | Python                       |
 * |------------|------------------------------|
 * | fractus    | random.random()              |
 * | numerus    | random.randint(min, max)     |
 * | octeti     | secrets.token_bytes(n)       |
 * | uuid       | str(uuid.uuid4())            |
 * | elige      | random.choice(lista)         |
 * | misce      | random.sample(lista, len)    |
 * | semen      | random.seed(n)               |
 */

// =============================================================================
// TYPES
// =============================================================================

export type AleatorGenerator = (args: string[]) => string;

export interface AleatorEntry {
    latin: string;
    py: string | AleatorGenerator;
    requiresRandom?: boolean;
    requiresUuid?: boolean;
    requiresSecrets?: boolean;
}

// =============================================================================
// FUNCTION REGISTRY
// =============================================================================

export const ALEATOR_FUNCTIONS: Record<string, AleatorEntry> = {
    // Basic generation
    fractus: { latin: 'fractus', py: () => `random.random()`, requiresRandom: true },
    inter: {
        latin: 'inter',
        py: args => `random.randint(${args[0]}, ${args[1]})`,
        requiresRandom: true,
    },
    octeti: {
        latin: 'octeti',
        py: args => `secrets.token_bytes(${args[0]})`,
        requiresSecrets: true,
    },
    uuid: {
        latin: 'uuid',
        py: () => `str(uuid.uuid4())`,
        requiresUuid: true,
    },

    // Collection operations
    selige: {
        latin: 'selige',
        py: args => `random.choice(${args[0]})`,
        requiresRandom: true,
    },
    misce: {
        latin: 'misce',
        py: args => `random.sample(${args[0]}, len(${args[0]}))`,
        requiresRandom: true,
    },

    // Seeding
    semen: {
        latin: 'semen',
        py: args => `random.seed(${args[0]})`,
        requiresRandom: true,
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
