/**
 * Lista Method Registry - Unified translations for Latin array methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (all targets)
 *
 * ARCHITECTURE
 * ============
 * This module defines translations for lista<T> methods across all targets.
 * Phase 1: Zig only. Other targets added in Phase 3.
 *
 * WHY UNIFIED REGISTRY
 * ====================
 * - Single source of truth for method behavior across targets
 * - needsAlloc flag determines if codegen passes curator (allocator)
 * - Reduces N methods x M targets file sprawl
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Generator function type for Zig collection methods.
 * WHY: curator parameter is the current allocator from curatorStack.
 */
export type ZigGenerator = (obj: string, args: string[], curator: string) => string;

/**
 * Describes how to translate a Latin method.
 */
export interface ListaMethod {
    /** True if method mutates the collection in place */
    mutates: boolean;

    /** True if method needs allocator (growing, returning new collection) */
    needsAlloc: boolean;

    /**
     * Zig translation.
     * - string: method name to delegate to stdlib
     * - function: custom code generation
     */
    zig?: string | ZigGenerator;

    // Future phases will add: ts, py, rs, cpp
}

// =============================================================================
// METHOD REGISTRY
// =============================================================================

/**
 * Registry of Latin array methods with translations.
 *
 * Allocator categories from design doc:
 * - Construction: Yes (init, fromItems, clone)
 * - Destruction: Yes (deinit)
 * - Growing: Yes (adde, praepone)
 * - Shrinking: No (remove, decapita, purga)
 * - Reading: No (primus, longitudo, continet)
 * - Returns new collection: Yes (addita, filtrata, mappata, inversa)
 * - In-place (no resize): No (ordina, inverte)
 * - Aggregation: No (summa, reducta, minimus)
 */
export const LISTA_METHODS: Record<string, ListaMethod> = {
    // -------------------------------------------------------------------------
    // ADDING ELEMENTS
    // -------------------------------------------------------------------------

    /** Add element to end (mutates) */
    adde: {
        mutates: true,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.adde(${curator}, ${args[0]})`,
    },

    /** Add element to end (returns new lista) */
    addita: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.addita(${curator}, ${args[0]})`,
    },

    /** Add element to start (mutates) */
    praepone: {
        mutates: true,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.praepone(${curator}, ${args[0]})`,
    },

    /** Add element to start (returns new lista) */
    praeposita: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.praeposita(${curator}, ${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // REMOVING ELEMENTS
    // -------------------------------------------------------------------------

    /** Remove and return last element (mutates) */
    remove: {
        mutates: true,
        needsAlloc: false,
        zig: obj => `${obj}.remove()`,
    },

    /** Remove last element (returns new lista) */
    remota: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, _args, curator) => `${obj}.remota(${curator})`,
    },

    /** Remove and return first element (mutates) */
    decapita: {
        mutates: true,
        needsAlloc: false,
        zig: obj => `${obj}.decapita()`,
    },

    /** Remove first element (returns new lista) */
    decapitata: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, _args, curator) => `${obj}.decapitata(${curator})`,
    },

    /** Clear all elements (mutates) */
    purga: {
        mutates: true,
        needsAlloc: false,
        zig: obj => `${obj}.purga()`,
    },

    // -------------------------------------------------------------------------
    // ACCESSING ELEMENTS
    // -------------------------------------------------------------------------

    /** Get first element */
    primus: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.primus()`,
    },

    /** Get last element */
    ultimus: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.ultimus()`,
    },

    /** Get element at index */
    accipe: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.accipe(${args[0]})`,
    },

    /** Get raw slice for iteration */
    toSlice: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.toSlice()`,
    },

    // -------------------------------------------------------------------------
    // PROPERTIES
    // -------------------------------------------------------------------------

    /** Get length */
    longitudo: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.longitudo()`,
    },

    /** Check if empty */
    vacua: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.vacua()`,
    },

    // -------------------------------------------------------------------------
    // SEARCHING
    // -------------------------------------------------------------------------

    /** Check if contains element */
    continet: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.continet(${args[0]})`,
    },

    /** Find index of element */
    indiceDe: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.indiceDe(${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // PREDICATE METHODS
    // -------------------------------------------------------------------------

    /** Check if all elements match predicate */
    omnes: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.omnes(${args[0]})`,
    },

    /** Check if any element matches predicate */
    aliquis: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.aliquis(${args[0]})`,
    },

    /** Find first element matching predicate */
    inveni: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.inveni(${args[0]})`,
    },

    /** Find index of first element matching predicate */
    inveniIndicem: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.inveniIndicem(${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // FUNCTIONAL METHODS (allocating, return new lista)
    // -------------------------------------------------------------------------

    /** Filter elements (returns new lista) */
    filtrata: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.filtrata(${curator}, ${args[0]})`,
    },

    /** Map elements (returns new lista) */
    mappata: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.mappata(${curator}, ${args[0]})`,
    },

    /** Reduce to single value */
    reducta: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => {
            if (args.length >= 2) {
                return `${obj}.reducta(${args[0]}, ${args[1]})`;
            }
            return `${obj}.reducta(${args[0]}, 0)`;
        },
    },

    /** Reverse (returns new lista) */
    inversa: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, _args, curator) => `${obj}.inversa(${curator})`,
    },

    /** Sort (returns new lista) */
    ordinata: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, _args, curator) => `${obj}.ordinata(${curator})`,
    },

    /** Slice - take elements from start to end */
    sectio: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => {
            if (args.length >= 2) {
                return `${obj}.sectio(${curator}, ${args[0]}, ${args[1]})`;
            }
            return `${obj}.sectio(${curator}, ${args[0]}, ${obj}.longitudo())`;
        },
    },

    /** Take first n elements */
    prima: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.prima(${curator}, ${args[0]})`,
    },

    /** Take last n elements */
    ultima: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.ultima(${curator}, ${args[0]})`,
    },

    /** Skip first n elements */
    omitte: {
        mutates: false,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.omitte(${curator}, ${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // MUTATING OPERATIONS
    // -------------------------------------------------------------------------

    /** Sort in place */
    ordina: {
        mutates: true,
        needsAlloc: false,
        zig: obj => `${obj}.ordina()`,
    },

    /** Reverse in place */
    inverte: {
        mutates: true,
        needsAlloc: false,
        zig: obj => `${obj}.inverte()`,
    },

    // -------------------------------------------------------------------------
    // ITERATION
    // -------------------------------------------------------------------------

    /** Iterate with callback */
    perambula: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.perambula(${args[0]})`,
    },

    /** Join elements to string */
    coniunge: {
        mutates: false,
        needsAlloc: true,
        zig: () => `@compileError("coniunge not implemented for Zig - string joining requires allocator and format")`,
    },

    // -------------------------------------------------------------------------
    // AGGREGATION
    // -------------------------------------------------------------------------

    /** Sum of numeric elements */
    summa: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.summa()`,
    },

    /** Average of numeric elements */
    medium: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.medium()`,
    },

    /** Minimum value */
    minimus: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.minimus()`,
    },

    /** Maximum value */
    maximus: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.maximus()`,
    },

    /** Count elements (optionally matching predicate) */
    numera: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => {
            if (args.length > 0) {
                return `${obj}.numera(${args[0]})`;
            }
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
