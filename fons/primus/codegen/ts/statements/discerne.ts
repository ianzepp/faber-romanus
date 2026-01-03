/**
 * TypeScript Code Generator - DiscerneStatement
 *
 * TRANSFORMS:
 *   discerne event { si Click ut c { use(c.x) } }
 *   -> if (event.tag === 'Click') { const c = event; use(c.x); }
 *
 *   discerne event { si Click pro a, b { use(a, b) } si Quit { exit() } }
 *   -> if (event.tag === 'Click') { const a = event.x; const b = event.y; use(a, b); }
 *      else if (event.tag === 'Quit') { exit(); }
 *
 * WHY: TypeScript discriminated unions use a 'tag' property for discrimination.
 *      The 'pro' syntax extracts fields positionally (a gets first field, b gets second).
 *      The 'ut' syntax binds the whole variant for field access via alias.
 */

import type { DiscerneStatement, Identifier } from '../../../parser/ast';
import type { TsGenerator } from '../generator';
import type { DiscretioType } from '../../../semantic/types';

export function genDiscerneStatement(node: DiscerneStatement, g: TsGenerator): string {
    const discriminant = g.genExpression(node.discriminant);
    let result = '';

    // Get discretio type info for field name lookup
    const discriminantType = node.discriminant.resolvedType;
    const discretio = discriminantType?.kind === 'discretio' ? (discriminantType as DiscretioType) : null;

    // Generate if/else chain
    for (let i = 0; i < node.cases.length; i++) {
        const caseNode = node.cases[i]!;
        const keyword = i === 0 ? 'if' : 'else if';

        // Variant matching: si VariantName (ut alias | pro bindings)? { ... }
        const variantName = caseNode.variant.name;
        result += `${g.ind()}${keyword} (${discriminant}.tag === '${variantName}') {\n`;
        g.depth++;

        // Alias binding: si Click ut c { ... }
        // WHY: Binds the whole variant to c, so c.x and c.y work
        if (caseNode.alias) {
            result += `${g.ind()}const ${caseNode.alias.name} = ${discriminant};\n`;
        }
        // Positional bindings: si Click pro a, b { ... }
        // WHY: Extracts fields by position - a gets first field, b gets second
        else if (caseNode.bindings.length > 0) {
            const variantInfo = discretio?.variants.get(variantName);

            if (variantInfo) {
                // With type info: map positional bindings to actual field names
                for (let j = 0; j < caseNode.bindings.length; j++) {
                    const binding = caseNode.bindings[j]!;
                    const fieldName = variantInfo.fields[j]?.name;

                    if (fieldName) {
                        result += `${g.ind()}const ${binding.name} = ${discriminant}.${fieldName};\n`;
                    }
                }
            } else {
                // Fallback without type info: assume binding names match field names
                // WHY: When discretio isn't in scope (e.g., test snippets), we can't
                //      know actual field names, so we assume programmer used matching names
                const bindingNames = caseNode.bindings.map((b: Identifier) => b.name).join(', ');
                result += `${g.ind()}const { ${bindingNames} } = ${discriminant};\n`;
            }
        }

        for (const stmt of caseNode.consequent.body) {
            result += g.genStatement(stmt) + '\n';
        }

        g.depth--;
        result += `${g.ind()}}`;

        // Add newline if more cases follow
        if (i < node.cases.length - 1) {
            result += '\n';
        }
    }

    return result;
}
