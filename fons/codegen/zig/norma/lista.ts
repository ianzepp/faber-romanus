/**
 * Lista Method Registry - Zig translations for Latin array methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (Zig target)
 *
 * ARCHITECTURE
 * ============
 * This module defines Zig translations for lista<T> methods.
 * Methods delegate to the Lista(T) type defined in the preamble.
 *
 * WHY SIMPLE METHOD CALLS
 * =======================
 * The Lista(T) type in the preamble provides all these methods natively.
 * This registry just maps Latin method names to Lista method calls.
 * The Lista type handles allocator management internally.
 *
 * INPUT/OUTPUT CONTRACT
 * =====================
 * INPUT:  Latin method name from CallExpression
 * OUTPUT: Zig code string
 * ERRORS: Returns undefined if method name not recognized
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Generator function type for Zig collection methods.
 *
 * WHY: The curator parameter is kept for API compatibility but Lista
 *      handles allocator internally, so it's typically unused.
 * WHY: The args parameter is a string[] (not a joined string) to preserve
 *      argument boundaries for multi-parameter methods.
 */
export type ZigGenerator = (obj: string, args: string[], curator: string) => string;

/**
 * Describes how to translate a Latin method to Zig.
 */
export interface ListaMethod {
    /** The Latin method name */
    latin: string;

    /** True if method mutates the array in place */
    mutates: boolean;

    /**
     * Zig translation.
     * - string: simple property/method access
     * - function: custom code generation
     */
    zig: string | ZigGenerator;
}

// =============================================================================
// METHOD REGISTRY
// =============================================================================

/**
 * Registry of Latin array methods with Zig translations.
 *
 * WHY: All methods delegate to Lista(T) which handles allocator internally.
 *      This makes the generated code clean and readable.
 */
export const LISTA_METHODS: Record<string, ListaMethod> = {
    // -------------------------------------------------------------------------
    // ADDING ELEMENTS
    // -------------------------------------------------------------------------

    /** Add element to end (mutates) */
    adde: {
        latin: 'adde',
        mutates: true,
        zig: (obj, args) => `${obj}.adde(${args[0]})`,
    },

    /** Add element to end (returns new lista) */
    addita: {
        latin: 'addita',
        mutates: false,
        zig: (obj, args) => `${obj}.addita(${args[0]})`,
    },

    /** Add element to start (mutates) */
    praepone: {
        latin: 'praepone',
        mutates: true,
        zig: (obj, args) => `${obj}.praepone(${args[0]})`,
    },

    /** Add element to start (returns new lista) */
    praeposita: {
        latin: 'praeposita',
        mutates: false,
        zig: (obj, args) => `${obj}.praeposita(${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // REMOVING ELEMENTS
    // -------------------------------------------------------------------------

    /** Remove and return last element (mutates) */
    remove: {
        latin: 'remove',
        mutates: true,
        zig: obj => `${obj}.remove()`,
    },

    /** Remove last element (returns new lista) */
    remota: {
        latin: 'remota',
        mutates: false,
        zig: obj => `${obj}.remota()`,
    },

    /** Remove and return first element (mutates) */
    decapita: {
        latin: 'decapita',
        mutates: true,
        zig: obj => `${obj}.decapita()`,
    },

    /** Remove first element (returns new lista) */
    decapitata: {
        latin: 'decapitata',
        mutates: false,
        zig: obj => `${obj}.decapitata()`,
    },

    /** Clear all elements (mutates) */
    purga: {
        latin: 'purga',
        mutates: true,
        zig: obj => `${obj}.purga()`,
    },

    // -------------------------------------------------------------------------
    // ACCESSING ELEMENTS
    // -------------------------------------------------------------------------

    /** Get first element */
    primus: {
        latin: 'primus',
        mutates: false,
        zig: obj => `${obj}.primus()`,
    },

    /** Get last element */
    ultimus: {
        latin: 'ultimus',
        mutates: false,
        zig: obj => `${obj}.ultimus()`,
    },

    /** Get element at index */
    accipe: {
        latin: 'accipe',
        mutates: false,
        zig: (obj, args) => `${obj}.accipe(${args[0]})`,
    },

    /** Get raw slice for iteration */
    toSlice: {
        latin: 'toSlice',
        mutates: false,
        zig: obj => `${obj}.toSlice()`,
    },

    // -------------------------------------------------------------------------
    // PROPERTIES
    // -------------------------------------------------------------------------

    /** Get length */
    longitudo: {
        latin: 'longitudo',
        mutates: false,
        zig: obj => `${obj}.longitudo()`,
    },

    /** Check if empty */
    vacua: {
        latin: 'vacua',
        mutates: false,
        zig: obj => `${obj}.vacua()`,
    },

    // -------------------------------------------------------------------------
    // SEARCHING
    // -------------------------------------------------------------------------

    /** Check if contains element */
    continet: {
        latin: 'continet',
        mutates: false,
        zig: (obj, args) => `${obj}.continet(${args[0]})`,
    },

    /** Find index of element */
    indiceDe: {
        latin: 'indiceDe',
        mutates: false,
        zig: (obj, args) => `${obj}.indiceDe(${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // PREDICATE METHODS
    // -------------------------------------------------------------------------

    /** Check if all elements match predicate */
    omnes: {
        latin: 'omnes',
        mutates: false,
        zig: (obj, args) => `${obj}.omnes(${args[0]})`,
    },

    /** Check if any element matches predicate */
    aliquis: {
        latin: 'aliquis',
        mutates: false,
        zig: (obj, args) => `${obj}.aliquis(${args[0]})`,
    },

    /** Find first element matching predicate */
    inveni: {
        latin: 'inveni',
        mutates: false,
        zig: (obj, args) => `${obj}.inveni(${args[0]})`,
    },

    /** Find index of first element matching predicate */
    inveniIndicem: {
        latin: 'inveniIndicem',
        mutates: false,
        zig: (obj, args) => `${obj}.inveniIndicem(${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // FUNCTIONAL METHODS (allocating, return new lista)
    // -------------------------------------------------------------------------

    /** Filter elements (returns new lista) */
    filtrata: {
        latin: 'filtrata',
        mutates: false,
        zig: (obj, args) => `${obj}.filtrata(${args[0]})`,
    },

    /** Map elements (returns new lista) */
    mappata: {
        latin: 'mappata',
        mutates: false,
        zig: (obj, args) => `${obj}.mappata(${args[0]})`,
    },

    /** Reduce to single value */
    reducta: {
        latin: 'reducta',
        mutates: false,
        zig: (obj, args) => {
            // args[0] = reducer fn, args[1] = initial value
            if (args.length >= 2) {
                return `${obj}.reducta(${args[0]}, ${args[1]})`;
            }
            return `${obj}.reducta(${args[0]}, 0)`;
        },
    },

    /** Reverse (returns new lista) */
    inversa: {
        latin: 'inversa',
        mutates: false,
        zig: obj => `${obj}.inversa()`,
    },

    /** Sort (returns new lista) */
    ordinata: {
        latin: 'ordinata',
        mutates: false,
        zig: obj => `${obj}.ordinata()`,
    },

    /** Slice - take elements from start to end */
    sectio: {
        latin: 'sectio',
        mutates: false,
        zig: (obj, args) => {
            if (args.length >= 2) {
                return `${obj}.sectio(${args[0]}, ${args[1]})`;
            }
            // Single arg: from start to end
            return `${obj}.sectio(${args[0]}, ${obj}.longitudo())`;
        },
    },

    /** Take first n elements */
    prima: {
        latin: 'prima',
        mutates: false,
        zig: (obj, args) => `${obj}.prima(${args[0]})`,
    },

    /** Take last n elements */
    ultima: {
        latin: 'ultima',
        mutates: false,
        zig: (obj, args) => `${obj}.ultima(${args[0]})`,
    },

    /** Skip first n elements */
    omitte: {
        latin: 'omitte',
        mutates: false,
        zig: (obj, args) => `${obj}.omitte(${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // MUTATING OPERATIONS
    // -------------------------------------------------------------------------

    /** Sort in place */
    ordina: {
        latin: 'ordina',
        mutates: true,
        zig: obj => `${obj}.ordina()`,
    },

    /** Reverse in place */
    inverte: {
        latin: 'inverte',
        mutates: true,
        zig: obj => `${obj}.inverte()`,
    },

    // -------------------------------------------------------------------------
    // ITERATION
    // -------------------------------------------------------------------------

    /** Iterate with callback */
    perambula: {
        latin: 'perambula',
        mutates: false,
        zig: (obj, args) => `${obj}.perambula(${args[0]})`,
    },

    /** Join elements to string */
    coniunge: {
        latin: 'coniunge',
        mutates: false,
        // WHY: Zig doesn't have a built-in join, this is complex - stub for now
        zig: () => `@compileError("coniunge not implemented for Zig - string joining requires allocator and format")`,
    },

    // -------------------------------------------------------------------------
    // AGGREGATION
    // -------------------------------------------------------------------------

    /** Sum of numeric elements */
    summa: {
        latin: 'summa',
        mutates: false,
        zig: obj => `${obj}.summa()`,
    },

    /** Average of numeric elements */
    medium: {
        latin: 'medium',
        mutates: false,
        zig: obj => `${obj}.medium()`,
    },

    /** Minimum value */
    minimus: {
        latin: 'minimus',
        mutates: false,
        zig: obj => `${obj}.minimus()`,
    },

    /** Maximum value */
    maximus: {
        latin: 'maximus',
        mutates: false,
        zig: obj => `${obj}.maximus()`,
    },

    /** Count elements (optionally matching predicate) */
    numera: {
        latin: 'numera',
        mutates: false,
        zig: (obj, args) => {
            if (args.length > 0) {
                return `${obj}.numera(${args[0]})`;
            }
            // No predicate - pass null
            return `${obj}.numera(null)`;
        },
    },
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Look up a Latin method name and return its definition.
 */
export function getListaMethod(name: string): ListaMethod | undefined {
    return LISTA_METHODS[name];
}

/**
 * Check if a method name is a known lista method.
 */
export function isListaMethod(name: string): boolean {
    return name in LISTA_METHODS;
}
