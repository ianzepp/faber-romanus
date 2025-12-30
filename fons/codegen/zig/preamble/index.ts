/**
 * Zig Preamble Generator
 *
 * Generates preamble based on features used, including arena allocator setup.
 */

import type { RequiredFeatures } from '../../types';

/**
 * Generate preamble based on features used.
 *
 * @param features - Feature flags set during codegen traversal
 * @returns Preamble string
 */
export function genPreamble(features: RequiredFeatures): string {
    const lines: string[] = [];

    // Always import std
    lines.push('const std = @import("std");');

    return lines.join('\n') + '\n';
}

/**
 * Check if collections are used (needs arena allocator in main).
 */
export function usesCollections(features: RequiredFeatures): boolean {
    return features.lista || features.tabula || features.copia;
}
