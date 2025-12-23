/**
 * Lista Method Registry - Ruby translations for Latin array methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (Ruby target)
 *
 * ARCHITECTURE
 * ============
 * This module defines Ruby translations for lista<T> (array) methods.
 * Ruby has rich Array methods with block-based iteration patterns.
 *
 * RUBY IDIOMS
 * ===========
 * | Latin         | Ruby                        |
 * |---------------|-----------------------------|
 * | adde          | array.push(x) or array << x |
 * | addita        | array + [x]                 |
 * | filtrata      | array.select { |x| ... }    |
 * | mappata       | array.map { |x| ... }       |
 * | reducta       | array.reduce(init) { ... }  |
 * | primus        | array.first                 |
 * | ultimus       | array.last                  |
 * | longitudo     | array.length                |
 * | continet      | array.include?(x)           |
 * | inversa       | array.reverse               |
 * | ordinata      | array.sort                  |
 *
 * INPUT/OUTPUT CONTRACT
 * =====================
 * INPUT:  Latin method name from CallExpression
 * OUTPUT: Ruby code string
 * ERRORS: Returns undefined if method name not recognized
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ListaMethod {
    latin: string;
    mutates: boolean;
    async: boolean;
    rb: string | RbGenerator;
}

type RbGenerator = (obj: string, args: string) => string;

// =============================================================================
// METHOD REGISTRY
// =============================================================================

/**
 * Registry of Latin array methods with Ruby translations.
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
        rb: 'push',
    },

    addita: {
        latin: 'addita',
        mutates: false,
        async: false,
        rb: (obj, args) => `${obj} + [${args}]`,
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
