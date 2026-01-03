/**
 * Zig Code Generator - Scriptum Expression (format string)
 *
 * TRANSFORMS:
 *   scriptum("Hello, {s}!", name) -> std.fmt.allocPrint(alloc, "Hello, {s}!", .{name}) catch @panic("OOM")
 *   scriptum("Hello, §!", name) -> std.fmt.allocPrint(alloc, "Hello, {any}!", .{name}) catch @panic("OOM")
 *
 * TARGET: Zig's std.fmt.allocPrint for runtime string formatting.
 *
 * WHY: Zig's ++ operator is comptime-only. Runtime string concatenation
 *      requires an allocator. scriptum provides a clean syntax for this.
 *
 * WHY: Format string is passed through with § converted to {any}.
 *      User can also use Zig-specific format specifiers ({s} for strings,
 *      {d} for integers) which are passed through as-is.
 */

import type { ScriptumExpression } from '../../../parser/ast';
import type { ZigGenerator } from '../generator';

export function genScriptumExpression(node: ScriptumExpression, g: ZigGenerator): string {
    // Convert § placeholders to {any} for Zig std.fmt
    const format = (node.format.value as string).replace(/§/g, '{any}');
    const curator = g.getCurator();

    if (node.arguments.length === 0) {
        // No args - just return the format string as-is (it's a constant)
        return `"${format}"`;
    }

    const args = node.arguments.map(arg => g.genExpression(arg)).join(', ');

    return `std.fmt.allocPrint(${curator}, "${format}", .{ ${args} }) catch @panic("OOM")`;
}
