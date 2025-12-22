/**
 * Semantic Analyzer Tests
 *
 * Tests for type resolution, symbol table management, and error detection.
 */

import { describe, expect, it } from 'bun:test';
import { tokenize } from '../tokenizer';
import { parse } from '../parser';
import { analyze, type SemanticError } from './index';
import type { SemanticType } from './types';

/**
 * Helper to parse and analyze source code.
 */
function analyzeSource(source: string): {
    errors: SemanticError[];
    types: Map<string, SemanticType>;
} {
    const { tokens } = tokenize(source);
    const { program } = parse(tokens);

    if (!program) {
        throw new Error('Parse failed');
    }

    const result = analyze(program);

    // Collect resolved types from variable declarations for inspection
    const types = new Map<string, SemanticType>();

    for (const stmt of program.body) {
        if (stmt.type === 'VariableDeclaration' && stmt.resolvedType) {
            types.set(stmt.name.name, stmt.resolvedType);
        }
    }

    return { errors: result.errors, types };
}

describe('Semantic Analyzer', () => {
    describe('Variable Type Resolution', () => {
        it('resolves type from explicit annotation', () => {
            const { errors, types } = analyzeSource(`varia numerus x = 5`);

            expect(errors).toHaveLength(0);
            expect(types.get('x')).toEqual({ kind: 'primitive', name: 'numerus' });
        });

        it('resolves type from string annotation', () => {
            const { errors, types } = analyzeSource(`varia textus s = "hello"`);

            expect(errors).toHaveLength(0);
            expect(types.get('s')).toEqual({ kind: 'primitive', name: 'textus' });
        });

        it('resolves type from boolean annotation', () => {
            const { errors, types } = analyzeSource(`varia bivalens b = verum`);

            expect(errors).toHaveLength(0);
            expect(types.get('b')).toEqual({ kind: 'primitive', name: 'bivalens' });
        });

        it('infers type from number literal', () => {
            const { errors, types } = analyzeSource(`varia x = 42`);

            expect(errors).toHaveLength(0);
            expect(types.get('x')).toEqual({ kind: 'primitive', name: 'numerus' });
        });

        it('infers type from string literal', () => {
            const { errors, types } = analyzeSource(`varia s = "hello"`);

            expect(errors).toHaveLength(0);
            expect(types.get('s')).toEqual({ kind: 'primitive', name: 'textus' });
        });

        it('infers type from boolean literal', () => {
            const { errors, types } = analyzeSource(`varia b = verum`);

            expect(errors).toHaveLength(0);
            expect(types.get('b')).toEqual({ kind: 'primitive', name: 'bivalens' });
        });

        it('handles nullable types', () => {
            const { errors, types } = analyzeSource(`varia numerus? x = nihil`);

            expect(errors).toHaveLength(0);
            expect(types.get('x')).toEqual({ kind: 'primitive', name: 'numerus', nullable: true });
        });
    });

    describe('Expression Type Resolution', () => {
        it('resolves arithmetic expression to numerus', () => {
            const { errors } = analyzeSource(`varia x = 1 + 2`);

            expect(errors).toHaveLength(0);
        });

        it('resolves string concatenation to textus', () => {
            const { errors, types } = analyzeSource(`varia s = "a" + "b"`);

            expect(errors).toHaveLength(0);
            // The + operator on strings resolves to textus
            expect(types.get('s')).toEqual({ kind: 'primitive', name: 'textus' });
        });

        it('resolves comparison to bivalens', () => {
            const { errors, types } = analyzeSource(`varia b = 1 < 2`);

            expect(errors).toHaveLength(0);
            expect(types.get('b')).toEqual({ kind: 'primitive', name: 'bivalens' });
        });

        it('resolves equality to bivalens', () => {
            const { errors, types } = analyzeSource(`varia b = 1 == 2`);

            expect(errors).toHaveLength(0);
            expect(types.get('b')).toEqual({ kind: 'primitive', name: 'bivalens' });
        });

        it('resolves logical operators to bivalens', () => {
            const { errors, types } = analyzeSource(`varia b = verum && falsum`);

            expect(errors).toHaveLength(0);
            expect(types.get('b')).toEqual({ kind: 'primitive', name: 'bivalens' });
        });

        it('resolves negation to bivalens', () => {
            const { errors, types } = analyzeSource(`varia b = !verum`);

            expect(errors).toHaveLength(0);
            expect(types.get('b')).toEqual({ kind: 'primitive', name: 'bivalens' });
        });
    });

    describe('Function Type Resolution', () => {
        it('records function in symbol table', () => {
            const source = `
        functio add(numerus a, numerus b) -> numerus {
          redde a + b
        }
      `;
            const { errors } = analyzeSource(source);

            expect(errors).toHaveLength(0);
        });

        it('type checks return statements', () => {
            const source = `
        functio greet() -> textus {
          redde "hello"
        }
      `;
            const { errors } = analyzeSource(source);

            expect(errors).toHaveLength(0);
        });

        it('reports error for wrong return type', () => {
            const source = `
        functio greet() -> textus {
          redde 42
        }
      `;
            const { errors } = analyzeSource(source);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].message).toContain('not assignable');
        });
    });

    describe('Scope Management', () => {
        it('allows variable shadowing in nested scope', () => {
            const source = `
        varia x = 1
        si verum {
          varia x = "hello"
        }
      `;
            const { errors } = analyzeSource(source);

            expect(errors).toHaveLength(0);
        });

        it('reports error for duplicate in same scope', () => {
            const source = `
        varia x = 1
        varia x = 2
      `;
            const { errors } = analyzeSource(source);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].message).toContain('already defined');
        });
    });

    describe('Error Detection', () => {
        it('reports undefined variable', () => {
            const { errors } = analyzeSource(`varia x = y`);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].message).toContain('Undefined variable');
        });

        it('reports assignment to immutable variable', () => {
            const source = `
        fixum x = 5
        x = 10
      `;
            const { errors } = analyzeSource(source);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].message).toContain('immutable');
        });

        it('reports type mismatch in assignment', () => {
            const source = `
        varia numerus x = 5
        x = "hello"
      `;
            const { errors } = analyzeSource(source);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].message).toContain('not assignable');
        });

        it('reports variable without type or initializer', () => {
            const { errors } = analyzeSource(`varia x`);

            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].message).toContain('no type annotation or initializer');
        });
    });

    describe('Control Flow', () => {
        it('analyzes if statement condition', () => {
            const source = `
        varia x = 5
        varia y = 0
        si x > 0 {
          y = 1
        }
      `;
            const { errors } = analyzeSource(source);

            expect(errors).toHaveLength(0);
        });

        it('analyzes while loop', () => {
            const source = `
        varia i = 0
        dum i < 10 {
          i = i + 1
        }
      `;
            const { errors } = analyzeSource(source);

            expect(errors).toHaveLength(0);
        });

        it('analyzes for loop with loop variable', () => {
            const source = `
        varia count = 0
        ex "test" pro item {
          count = count + 1
        }
      `;
            const { errors } = analyzeSource(source);

            expect(errors).toHaveLength(0);
        });
    });

    describe('Generic Types', () => {
        it('resolves generic type annotation', () => {
            const { errors, types } = analyzeSource(`varia lista<numerus>? items = nihil`);

            expect(errors).toHaveLength(0);
            const itemsType = types.get('items');

            expect(itemsType?.kind).toBe('generic');
        });
    });

    describe('Arrow Functions', () => {
        it('resolves arrow function type', () => {
            const source = `varia add = (numerus a, numerus b) => a + b`;
            const { errors } = analyzeSource(source);

            expect(errors).toHaveLength(0);
        });
    });
});
