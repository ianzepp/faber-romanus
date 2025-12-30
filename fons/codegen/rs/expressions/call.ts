/**
 * Rust Code Generator - Call Expression
 *
 * TRANSFORMS:
 *   foo(a, b) -> foo(a, b)
 *   foo?(a) -> foo.map(|f| f(a))
 *   _scribe(x) -> println!("{}", x)
 *   _vide(x) -> eprintln!("[DEBUG] {}", x)
 *   _mone(x) -> eprintln!("[WARN] {}", x)
 *   _lege() -> std::io::stdin().read_line(...)
 */

import type { CallExpression, Identifier } from '../../../parser/ast';
import type { RsGenerator } from '../generator';

// Collection method registry
import { getListaMethod } from '../norma/lista';

/**
 * Rust I/O intrinsic mappings.
 *
 * WHY: Maps Latin I/O intrinsics to Rust equivalents.
 * - _scribe: Standard output via println!
 * - _vide: Debug output to stderr via eprintln! with [DEBUG] prefix
 * - _mone: Warning output to stderr via eprintln! with [WARN] prefix
 * - _lege: Read line from stdin
 */
const RS_INTRINSICS: Record<string, (args: string[]) => string> = {
    _scribe: args => {
        if (args.length === 0) {
            return 'println!()';
        }
        // WHY: Generate format string with {} placeholders for each argument
        const placeholders = args.map(() => '{}').join(' ');
        return `println!("${placeholders}", ${args.join(', ')})`;
    },
    _vide: args => {
        if (args.length === 0) {
            return 'eprintln!("[DEBUG]")';
        }
        const placeholders = args.map(() => '{}').join(' ');
        return `eprintln!("[DEBUG] ${placeholders}", ${args.join(', ')})`;
    },
    _mone: args => {
        if (args.length === 0) {
            return 'eprintln!("[WARN]")';
        }
        const placeholders = args.map(() => '{}').join(' ');
        return `eprintln!("[WARN] ${placeholders}", ${args.join(', ')})`;
    },
    _lege: () => {
        // WHY: Rust stdin reading requires mutable buffer. This pattern reads a line,
        // trims the newline, and returns owned String. Panics on error (simplest).
        return '{ let mut __buf = String::new(); std::io::stdin().read_line(&mut __buf).unwrap(); __buf.trim().to_string() }';
    },
};

export function genCallExpression(node: CallExpression, g: RsGenerator): string {
    // WHY: Build args as array first for intrinsics that need individual args
    const argsArray = node.arguments.map(arg => {
        if (arg.type === 'SpreadElement') {
            return `/* spread */ ${g.genExpression(arg.argument)}`;
        }
        return g.genExpression(arg);
    });
    const args = argsArray.join(', ');

    // Check for intrinsics (bare function calls)
    if (node.callee.type === 'Identifier') {
        const name = node.callee.name;
        const intrinsic = RS_INTRINSICS[name];
        if (intrinsic) {
            return intrinsic(argsArray);
        }
    }

    // Check for collection methods (method calls on lista)
    // WHY: Only lista is implemented for Rust currently
    if (node.callee.type === 'MemberExpression' && !node.callee.computed) {
        const methodName = (node.callee.property as Identifier).name;
        const obj = g.genExpression(node.callee.object);

        const listaMethod = getListaMethod(methodName);
        if (listaMethod) {
            if (typeof listaMethod.rs === 'function') {
                return listaMethod.rs(obj, args);
            }
            return `${obj}.${listaMethod.rs}(${args})`;
        }
    }

    const callee = g.genExpression(node.callee);

    if (node.optional) {
        return `${callee}.map(|f| f(${args}))`;
    }

    return `${callee}(${args})`;
}
