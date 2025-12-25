/**
 * Tabula Method Registry - Python translations for Latin map methods
 *
 * COMPILER PHASE
 * ==============
 * codegen (Python target)
 *
 * ARCHITECTURE
 * ============
 * This module defines Python translations for tabula<K,V> (dict) methods.
 * Python uses dict instead of Map, with different method names and syntax.
 *
 * PYTHON IDIOMS
 * =============
 * | Latin         | Python                              |
 * |---------------|-------------------------------------|
 * | pone          | dict[key] = value                   |
 * | accipe        | dict.get(key) or dict[key]          |
 * | habet         | key in dict                         |
 * | dele          | del dict[key]                       |
 * | longitudo     | len(dict)                           |
 * | claves        | dict.keys()                         |
 * | valores       | dict.values()                       |
 * | paria         | dict.items()                        |
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

export interface TabulaMethod {
    latin: string;
    mutates: boolean;
    async: boolean;
    py: string | PyGenerator;
}

type PyGenerator = (obj: string, args: string) => string;

// =============================================================================
// METHOD REGISTRY
// =============================================================================

export const TABULA_METHODS: Record<string, TabulaMethod> = {
    // -------------------------------------------------------------------------
    // CORE OPERATIONS
    // -------------------------------------------------------------------------

    pone: {
        latin: 'pone',
        mutates: true,
        async: false,
        // dict[key] = value; need to split args
        py: (obj, args) => {
            const match = args.match(/^(.+?),\s*(.+)$/);
            if (match) {
                return `${obj}[${match[1]}] = ${match[2]}`;
            }
            return `${obj}.update(${args})`;
        },
    },

    accipe: {
        latin: 'accipe',
        mutates: false,
        async: false,
        py: (obj, args) => `${obj}.get(${args})`,
    },

    habet: {
        latin: 'habet',
        mutates: false,
        async: false,
        py: (obj, args) => `(${args} in ${obj})`,
    },

    dele: {
        latin: 'dele',
        mutates: true,
        async: false,
        py: (obj, args) => `${obj}.pop(${args}, None)`,
    },

    longitudo: {
        latin: 'longitudo',
        mutates: false,
        async: false,
        py: obj => `len(${obj})`,
    },

    vacua: {
        latin: 'vacua',
        mutates: false,
        async: false,
        py: obj => `len(${obj}) == 0`,
    },

    purga: {
        latin: 'purga',
        mutates: true,
        async: false,
        py: 'clear',
    },

    // -------------------------------------------------------------------------
    // ITERATION
    // -------------------------------------------------------------------------

    claves: {
        latin: 'claves',
        mutates: false,
        async: false,
        py: obj => `${obj}.keys()`,
    },

    valores: {
        latin: 'valores',
        mutates: false,
        async: false,
        py: obj => `${obj}.values()`,
    },

    paria: {
        latin: 'paria',
        mutates: false,
        async: false,
        py: obj => `${obj}.items()`,
    },

    // -------------------------------------------------------------------------
    // EXTENDED OPERATIONS
    // -------------------------------------------------------------------------

    accipeAut: {
        latin: 'accipeAut',
        mutates: false,
        async: false,
        py: (obj, args) => {
            const match = args.match(/^(.+?),\s*(.+)$/);
            if (match) {
                return `${obj}.get(${match[1]}, ${match[2]})`;
            }
            return `${obj}.get(${args})`;
        },
    },

    selige: {
        latin: 'selige',
        mutates: false,
        async: false,
        // pick - keep only specified keys
        py: (obj, args) => `{k: ${obj}[k] for k in [${args}] if k in ${obj}}`,
    },

    omitte: {
        latin: 'omitte',
        mutates: false,
        async: false,
        // omit - remove specified keys
        py: (obj, args) => `{k: v for k, v in ${obj}.items() if k not in [${args}]}`,
    },

    confla: {
        latin: 'confla',
        mutates: false,
        async: false,
        // merge dicts (Python 3.9+ syntax)
        py: (obj, args) => `{**${obj}, **${args}}`,
    },

    inversa: {
        latin: 'inversa',
        mutates: false,
        async: false,
        // swap keys and values
        py: obj => `{v: k for k, v in ${obj}.items()}`,
    },

    mappaValores: {
        latin: 'mappaValores',
        mutates: false,
        async: false,
        py: (obj, args) => `{k: (${args})(v) for k, v in ${obj}.items()}`,
    },

    mappaClaves: {
        latin: 'mappaClaves',
        mutates: false,
        async: false,
        py: (obj, args) => `{(${args})(k): v for k, v in ${obj}.items()}`,
    },

    // -------------------------------------------------------------------------
    // CONVERSIONS
    // -------------------------------------------------------------------------

    inLista: {
        latin: 'inLista',
        mutates: false,
        async: false,
        py: obj => `list(${obj}.items())`,
    },

    inObjectum: {
        latin: 'inObjectum',
        mutates: false,
        async: false,
        // dict is already an object in Python
        py: obj => `dict(${obj})`,
    },
};

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

export function getTabulaMethod(name: string): TabulaMethod | undefined {
    return TABULA_METHODS[name];
}

export function isTabulaMethod(name: string): boolean {
    return name in TABULA_METHODS;
}
