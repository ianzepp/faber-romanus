/**
 * Copia Method Registry - Rust translations for Latin set methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (Rust target)
 *
 * ARCHITECTURE
 * ============
 * This module defines Rust translations for copia<T> (HashSet<T>) methods.
 * Rust's HashSet provides efficient set operations.
 *
 * RUST IDIOMS
 * ===========
 * | Latin         | Rust                                      |
 * |---------------|-------------------------------------------|
 * | adde          | set.insert(x)                             |
 * | habet         | set.contains(&x)                          |
 * | dele          | set.remove(&x)                            |
 * | longitudo     | set.len()                                 |
 * | vacua         | set.is_empty()                            |
 * | purga         | set.clear()                               |
 * | unio          | set.union(&other).cloned().collect()      |
 * | intersectio   | set.intersection(&other).cloned().collect()|
 * | differentia   | set.difference(&other).cloned().collect() |
 * | symmetrica    | set.symmetric_difference(&other)...       |
 * | subcopia      | set.is_subset(&other)                     |
 * | supercopia    | set.is_superset(&other)                   |
 * | inLista       | set.iter().cloned().collect::<Vec<_>>()   |
 * | perambula     | set.iter().for_each(fn)                   |
 *
 * INPUT/OUTPUT CONTRACT
 * =====================
 * INPUT:  Latin method name from CallExpression
 * OUTPUT: Rust code string
 * ERRORS: Returns undefined if method name not recognized
 */

// =============================================================================
// TYPES
// =============================================================================

export interface CopiaMethod {
    latin: string;
    mutates: boolean;
    async: boolean;
    rs: string | RsGenerator;
}

type RsGenerator = (obj: string, args: string[]) => string;

// =============================================================================
// METHOD REGISTRY
// =============================================================================

/**
 * Registry of Latin set methods with Rust translations.
 */
export const COPIA_METHODS: Record<string, CopiaMethod> = {
    // -------------------------------------------------------------------------
    // CORE OPERATIONS
    // -------------------------------------------------------------------------

    /** Add element (mutates) */
    adde: {
        latin: 'adde',
        mutates: true,
        async: false,
        rs: 'insert',
    },

    /** Check if element exists */
    habet: {
        latin: 'habet',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.contains(&${args[0]})`,
    },

    /** Delete element (mutates) */
    dele: {
        latin: 'dele',
        mutates: true,
        async: false,
        rs: (obj, args) => `${obj}.remove(&${args[0]})`,
    },

    /** Get size */
    longitudo: {
        latin: 'longitudo',
        mutates: false,
        async: false,
        rs: (obj, _args) => `${obj}.len()`,
    },

    /** Check if empty */
    vacua: {
        latin: 'vacua',
        mutates: false,
        async: false,
        rs: (obj, _args) => `${obj}.is_empty()`,
    },

    /** Clear all elements (mutates) */
    purga: {
        latin: 'purga',
        mutates: true,
        async: false,
        rs: 'clear',
    },

    // -------------------------------------------------------------------------
    // SET OPERATIONS (return new sets)
    // -------------------------------------------------------------------------

    /** Union: A U B */
    unio: {
        latin: 'unio',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.union(&${args[0]}).cloned().collect::<HashSet<_>>()`,
    },

    /** Intersection: A n B */
    intersectio: {
        latin: 'intersectio',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.intersection(&${args[0]}).cloned().collect::<HashSet<_>>()`,
    },

    /** Difference: A - B */
    differentia: {
        latin: 'differentia',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.difference(&${args[0]}).cloned().collect::<HashSet<_>>()`,
    },

    /** Symmetric difference: (A - B) U (B - A) */
    symmetrica: {
        latin: 'symmetrica',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.symmetric_difference(&${args[0]}).cloned().collect::<HashSet<_>>()`,
    },

    // -------------------------------------------------------------------------
    // PREDICATES
    // -------------------------------------------------------------------------

    /** Is subset of other */
    subcopia: {
        latin: 'subcopia',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.is_subset(&${args[0]})`,
    },

    /** Is superset of other */
    supercopia: {
        latin: 'supercopia',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.is_superset(&${args[0]})`,
    },

    // -------------------------------------------------------------------------
    // CONVERSIONS
    // -------------------------------------------------------------------------

    /** Convert to lista */
    inLista: {
        latin: 'inLista',
        mutates: false,
        async: false,
        rs: (obj, _args) => `${obj}.iter().cloned().collect::<Vec<_>>()`,
    },

    // -------------------------------------------------------------------------
    // ITERATION
    // -------------------------------------------------------------------------

    /** Iterate with callback (no return value) */
    perambula: {
        latin: 'perambula',
        mutates: false,
        async: false,
        rs: (obj, args) => `${obj}.iter().for_each(${args[0]})`,
    },
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Look up a Latin method name and return its definition.
 */
export function getCopiaMethod(name: string): CopiaMethod | undefined {
    return COPIA_METHODS[name];
}

/**
 * Check if a method name is a known copia method.
 */
export function isCopiaMethod(name: string): boolean {
    return name in COPIA_METHODS;
}
