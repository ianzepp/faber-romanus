/**
 * Lista Method Registry - Python translations for Latin array methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (Python target)
 *
 * ARCHITECTURE
 * ============
 * This module defines Python translations for lista<T> (array) methods.
 * Python uses list comprehensions and built-in functions rather than
 * method chaining for many operations.
 *
 * PYTHON IDIOMS
 * =============
 * | Latin         | Python                              |
 * |---------------|-------------------------------------|
 * | adde          | list.append(x)                      |
 * | addita        | [*list, x]                          |
 * | filtrata      | [x for x in list if pred(x)]        |
 * | mappata       | [f(x) for x in list]                |
 * | reducta       | functools.reduce(fn, list, init)    |
 * | primus        | list[0]                             |
 * | ultimus       | list[-1]                            |
 * | longitudo     | len(list)                           |
 * | continet      | x in list                           |
 * | inversa       | list[::-1]                          |
 * | ordinata      | sorted(list)                        |
 *
 * INPUT/OUTPUT CONTRACT
 * =====================
 * INPUT:  Latin method name from CallExpression
 * OUTPUT: Python code string
 * ERRORS: Returns undefined if method name not recognized
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ListaMethod {
    latin: string;
    mutates: boolean;
    async: boolean;
    py: string | PyGenerator;
}

type PyGenerator = (obj: string, args: string) => string;

// =============================================================================
// METHOD REGISTRY
// =============================================================================

/**
 * Registry of Latin array methods with Python translations.
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
        py: 'append',
    },

    addita: {
        latin: 'addita',
        mutates: false,
        async: false,
        py: (obj, args) => `[*${obj}, ${args}]`,
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
