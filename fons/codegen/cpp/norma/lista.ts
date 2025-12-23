/**
 * Lista Method Registry - C++ translations for Latin array methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (C++ target)
 *
 * ARCHITECTURE
 * ============
 * This module defines C++ translations for lista<T> (vector) methods.
 * C++ uses std::vector with STL algorithms for many operations.
 *
 * C++ IDIOMS
 * ==========
 * | Latin         | C++                                          |
 * |---------------|----------------------------------------------|
 * | adde          | vec.push_back(x)                             |
 * | addita        | [&]{ auto v=vec; v.push_back(x); return v; }() |
 * | filtrata      | std::copy_if + lambda                        |
 * | mappata       | std::transform + lambda                      |
 * | reducta       | std::accumulate                              |
 * | primus        | vec.front()                                  |
 * | ultimus       | vec.back()                                   |
 * | longitudo     | vec.size()                                   |
 * | continet      | std::find != vec.end()                       |
 * | inversa       | std::vector(vec.rbegin(), vec.rend())        |
 * | ordinata      | [&]{ auto v=vec; std::sort(v.begin(),v.end()); return v; }() |
 *
 * INPUT/OUTPUT CONTRACT
 * =====================
 * INPUT:  Latin method name from CallExpression
 * OUTPUT: C++ code string
 * ERRORS: Returns undefined if method name not recognized
 *
 * NOTES
 * =====
 * C++ lacks fluent method chaining for collections. Many operations require
 * STL algorithms with iterators, which makes the generated code verbose.
 * Consider using ranges (C++20) for cleaner output when targeting C++20.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ListaMethod {
    latin: string;
    mutates: boolean;
    async: boolean;
    cpp: string | CppGenerator;
    /** Required headers for this method */
    headers?: string[];
}

type CppGenerator = (obj: string, args: string) => string;

// =============================================================================
// METHOD REGISTRY
// =============================================================================

/**
 * Registry of Latin array methods with C++ translations.
 *
 * TODO: Implement all methods from checklist.md
 */
export const LISTA_METHODS: Record<string, ListaMethod> = {
    // -------------------------------------------------------------------------
    // ADDING ELEMENTS
    // -------------------------------------------------------------------------

    adde: {
        latin: 'adde',
        mutates: true,
        async: false,
        cpp: 'push_back',
    },

    addita: {
        latin: 'addita',
        mutates: false,
        async: false,
        // C++ doesn't have spread, need to copy and push
        cpp: (obj, args) => `[&]{ auto v = ${obj}; v.push_back(${args}); return v; }()`,
    },

    // TODO: Implement remaining methods
    // See checklist.md for full list
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

export function getListaMethod(name: string): ListaMethod | undefined {
    return LISTA_METHODS[name];
}

export function isListaMethod(name: string): boolean {
    return name in LISTA_METHODS;
}
