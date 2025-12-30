/**
 * Copia Method Registry - Unified translations for Latin set methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (all targets)
 *
 * ARCHITECTURE
 * ============
 * This module defines translations for copia<T> (HashSet) methods across all targets.
 * Phase 2: Zig only. Other targets added in Phase 3.
 *
 * WHY UNIFIED REGISTRY
 * ====================
 * - Single source of truth for method behavior across targets
 * - needsAlloc flag determines if codegen passes curator (allocator)
 * - Reduces N methods x M targets file sprawl
 *
 * ZIG SPECIFICS
 * =============
 * Zig has no native Set type. We implement copia as HashMap(T, void).
 * - copia<textus> maps to CopiaTextus (StringHashMap wrapper)
 * - copia<T> maps to CopiaAuto(T) (AutoHashMap wrapper)
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
export interface CopiaMethod {
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
 * Registry of Latin set methods with translations.
 *
 * Allocator categories:
 * - Adding (adde): Yes - may need to resize
 * - Reading (habet, longitudo, vacua): No
 * - Removing (dele, purga): No - doesn't allocate
 * - Iteration (valores): No
 * - Set operations (unio, intersectio, etc.): Yes - return new sets
 */
export const COPIA_METHODS: Record<string, CopiaMethod> = {
    // -------------------------------------------------------------------------
    // CORE OPERATIONS
    // -------------------------------------------------------------------------

    /** Add element (mutates, needs allocator for growth) */
    adde: {
        mutates: true,
        needsAlloc: true,
        zig: (obj, args, curator) => `${obj}.adde(${curator}, ${args[0]})`,
    },

    /** Check if element exists */
    habet: {
        mutates: false,
        needsAlloc: false,
        zig: (obj, args) => `${obj}.habet(${args[0]})`,
    },

    /** Delete element (mutates) */
    dele: {
        mutates: true,
        needsAlloc: false,
        zig: (obj, args) => `_ = ${obj}.dele(${args[0]})`,
    },

    /** Get size */
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

    /** Clear all elements (mutates) */
    purga: {
        mutates: true,
        needsAlloc: false,
        zig: obj => `${obj}.purga()`,
    },

    // -------------------------------------------------------------------------
    // ITERATION
    // -------------------------------------------------------------------------

    /** Get values iterator (for sets, this iterates elements) */
    valores: {
        mutates: false,
        needsAlloc: false,
        zig: obj => `${obj}.valores()`,
    },

    /** Iterate with callback */
    perambula: {
        mutates: false,
        needsAlloc: false,
        zig: () => `@compileError("perambula not implemented for Zig - use 'ex set.valores() pro item { ... }' loop")`,
    },

    // -------------------------------------------------------------------------
    // SET OPERATIONS - NOT IMPLEMENTED
    // These require creating new sets with allocator, complex to generate inline
    // -------------------------------------------------------------------------

    /** Union: A U B */
    unio: {
        mutates: false,
        needsAlloc: true,
        zig: () => `@compileError("unio not implemented for Zig - use explicit loop to merge sets")`,
    },

    /** Intersection: A n B */
    intersectio: {
        mutates: false,
        needsAlloc: true,
        zig: () => `@compileError("intersectio not implemented for Zig - use explicit loop")`,
    },

    /** Difference: A - B */
    differentia: {
        mutates: false,
        needsAlloc: true,
        zig: () => `@compileError("differentia not implemented for Zig - use explicit loop")`,
    },

    /** Symmetric difference */
    symmetrica: {
        mutates: false,
        needsAlloc: true,
        zig: () => `@compileError("symmetrica not implemented for Zig - use explicit loop")`,
    },

    // -------------------------------------------------------------------------
    // PREDICATES - NOT IMPLEMENTED
    // -------------------------------------------------------------------------

    /** Is subset of other */
    subcopia: {
        mutates: false,
        needsAlloc: false,
        zig: () => `@compileError("subcopia not implemented for Zig - use explicit loop")`,
    },

    /** Is superset of other */
    supercopia: {
        mutates: false,
        needsAlloc: false,
        zig: () => `@compileError("supercopia not implemented for Zig - use explicit loop")`,
    },

    // -------------------------------------------------------------------------
    // CONVERSIONS - NOT IMPLEMENTED
    // -------------------------------------------------------------------------

    /** Convert to list */
    inLista: {
        mutates: false,
        needsAlloc: true,
        zig: () => `@compileError("inLista not implemented for Zig - iterate with ex...pro into ArrayList")`,
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
