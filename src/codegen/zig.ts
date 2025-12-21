import type {
  Program,
  Statement,
  Expression,
  ImportDeclaration,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  BlockStatement,
  ThrowStatement,
  TryStatement,
  ExpressionStatement,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  ArrowFunctionExpression,
  AssignmentExpression,
  AwaitExpression,
  NewExpression,
  Identifier,
  Literal,
  TemplateLiteral,
  Parameter,
  TypeAnnotation,
  CatchClause,
} from "../parser/ast"
import type { CodegenOptions } from "./types"

// Map Latin type names to Zig types
const typeMap: Record<string, string> = {
  Textus: "[]const u8",
  Numerus: "i64",
  Bivalens: "bool",
  Nihil: "void",
}

export function generateZig(program: Program, options: CodegenOptions = {}): string {
  const indent = options.indent ?? "    "

  let depth = 0

  function ind(): string {
    return indent.repeat(depth)
  }

  function genProgram(node: Program): string {
    const lines: string[] = []

    // Add std import if we detect scribe() usage
    const needsStd = programUsesScribe(node)
    if (needsStd) {
      lines.push("const std = @import(\"std\");")
      lines.push("")
    }

    // Separate top-level declarations from runtime statements
    const topLevel: Statement[] = []
    const runtime: Statement[] = []

    for (const stmt of node.body) {
      if (isTopLevelDeclaration(stmt)) {
        topLevel.push(stmt)
      }
      else {
        runtime.push(stmt)
      }
    }

    // Emit top-level declarations
    lines.push(...topLevel.map(genStatement))

    // Wrap runtime statements in main()
    if (runtime.length > 0) {
      if (topLevel.length > 0) lines.push("")
      lines.push("pub fn main() void {")
      depth++
      lines.push(...runtime.map(genStatement))
      depth--
      lines.push("}")
    }

    return lines.join("\n")
  }

  function isTopLevelDeclaration(node: Statement): boolean {
    // Functions are always top-level
    if (node.type === "FunctionDeclaration") return true
    // Imports are always top-level
    if (node.type === "ImportDeclaration") return true
    // Const declarations with literal values are comptime
    if (node.type === "VariableDeclaration" && node.kind === "fixum") {
      if (node.init && isComptimeValue(node.init)) return true
    }
    return false
  }

  function isComptimeValue(node: Expression): boolean {
    // Literals are comptime
    if (node.type === "Literal") return true
    if (node.type === "TemplateLiteral") return true
    // Identifiers that are verum/falsum/nihil are comptime
    if (node.type === "Identifier") {
      return ["verum", "falsum", "nihil"].includes(node.name)
    }
    return false
  }

  function programUsesScribe(node: Program): boolean {
    const source = JSON.stringify(node)
    return source.includes('"name":"scribe"')
  }

  function genStatement(node: Statement): string {
    switch (node.type) {
      case "ImportDeclaration":
        return genImportDeclaration(node)
      case "VariableDeclaration":
        return genVariableDeclaration(node)
      case "FunctionDeclaration":
        return genFunctionDeclaration(node)
      case "IfStatement":
        return genIfStatement(node)
      case "WhileStatement":
        return genWhileStatement(node)
      case "ForStatement":
        return genForStatement(node)
      case "ReturnStatement":
        return genReturnStatement(node)
      case "ThrowStatement":
        return genThrowStatement(node)
      case "TryStatement":
        return genTryStatement(node)
      case "BlockStatement":
        return genBlockStatementContent(node)
      case "ExpressionStatement":
        return genExpressionStatement(node)
      default:
        throw new Error(`Unknown statement type: ${(node as any).type}`)
    }
  }

  function genImportDeclaration(node: ImportDeclaration): string {
    const source = node.source
    // In Zig, imports are done via @import
    // ex norma importa * -> const norma = @import("norma");
    // ex norma importa scribe, lege -> const scribe = @import("norma").scribe; etc.
    if (node.wildcard) {
      return `${ind()}const ${source} = @import("${source}");`
    }
    // For specific imports, we import the module and then reference the names
    const lines: string[] = []
    const modVar = `_${source}`
    lines.push(`${ind()}const ${modVar} = @import("${source}");`)
    for (const spec of node.specifiers) {
      lines.push(`${ind()}const ${spec.name} = ${modVar}.${spec.name};`)
    }
    return lines.join("\n")
  }

  function genVariableDeclaration(node: VariableDeclaration): string {
    const kind = node.kind === "esto" ? "var" : "const"
    const name = node.name.name

    // Zig needs explicit types for var declarations with literals
    let typeAnno = ""
    if (node.typeAnnotation) {
      typeAnno = `: ${genType(node.typeAnnotation)}`
    }
    else if (kind === "var" && node.init) {
      typeAnno = `: ${inferZigType(node.init)}`
    }

    const init = node.init ? ` = ${genExpression(node.init)}` : " = undefined"
    return `${ind()}${kind} ${name}${typeAnno}${init};`
  }

  function inferZigType(node: Expression): string {
    if (node.type === "Literal") {
      if (typeof node.value === "number") {
        return Number.isInteger(node.value) ? "i64" : "f64"
      }
      if (typeof node.value === "string") return "[]const u8"
      if (typeof node.value === "boolean") return "bool"
    }
    if (node.type === "Identifier") {
      if (node.name === "verum" || node.name === "falsum") return "bool"
      if (node.name === "nihil") return "?void"
    }
    return "anytype"
  }

  function genType(node: TypeAnnotation): string {
    const base = typeMap[node.name] ?? node.name
    if (node.nullable) {
      return `?${base}`
    }
    return base
  }

  function genFunctionDeclaration(node: FunctionDeclaration): string {
    const name = node.name.name
    const params = node.params.map(genParameter).join(", ")
    const returnType = node.returnType ? genType(node.returnType) : "void"

    // Handle async with error union
    const retType = node.async ? `!${returnType}` : returnType

    const body = genBlockStatement(node.body)
    return `${ind()}fn ${name}(${params}) ${retType} ${body}`
  }

  function genParameter(node: Parameter): string {
    const name = node.name.name
    const type = node.typeAnnotation ? genType(node.typeAnnotation) : "anytype"
    return `${name}: ${type}`
  }

  function genIfStatement(node: IfStatement): string {
    let result = ""

    // Zig doesn't have try/catch like JS, we'll use error handling differently
    // For now, ignore catchClause in Zig output
    result += `${ind()}if (${genExpression(node.test)}) ${genBlockStatement(node.consequent)}`

    if (node.alternate) {
      if (node.alternate.type === "IfStatement") {
        result += ` else ${genIfStatement(node.alternate).trim()}`
      }
      else {
        result += ` else ${genBlockStatement(node.alternate)}`
      }
    }

    return result
  }

  function genWhileStatement(node: WhileStatement): string {
    const test = genExpression(node.test)
    const body = genBlockStatement(node.body)
    return `${ind()}while (${test}) ${body}`
  }

  function genForStatement(node: ForStatement): string {
    const varName = node.variable.name
    const iterable = genExpression(node.iterable)
    const body = genBlockStatement(node.body)

    // Zig uses for (slice) |item| syntax
    return `${ind()}for (${iterable}) |${varName}| ${body}`
  }

  function genReturnStatement(node: ReturnStatement): string {
    if (node.argument) {
      return `${ind()}return ${genExpression(node.argument)};`
    }
    return `${ind()}return;`
  }

  function genThrowStatement(node: ThrowStatement): string {
    // Zig uses return error.X for errors
    return `${ind()}return error.${genExpression(node.argument)};`
  }

  function genTryStatement(node: TryStatement): string {
    // Zig handles errors differently — this is a simplified mapping
    // Real Zig would use catch |err| { } syntax on expressions
    let result = `${ind()}// try block\n`
    result += genBlockStatementContent(node.block)

    if (node.handler) {
      result += `\n${ind()}// catch handling would use: catch |${node.handler.param.name}| { ... }`
    }

    return result
  }

  function genBlockStatement(node: BlockStatement): string {
    if (node.body.length === 0) {
      return "{}"
    }

    depth++
    const body = node.body.map(genStatement).join("\n")
    depth--

    return `{\n${body}\n${ind()}}`
  }

  function genBlockStatementContent(node: BlockStatement): string {
    return node.body.map(genStatement).join("\n")
  }

  function genExpressionStatement(node: ExpressionStatement): string {
    const expr = genExpression(node.expression)
    // In Zig, assignment is a statement, not an expression
    // Calls also don't need _ = prefix
    if (node.expression.type === "CallExpression" || node.expression.type === "AssignmentExpression") {
      return `${ind()}${expr};`
    }
    return `${ind()}_ = ${expr};`
  }

  function genExpression(node: Expression): string {
    switch (node.type) {
      case "Identifier":
        return genIdentifier(node)
      case "Literal":
        return genLiteral(node)
      case "TemplateLiteral":
        // Zig doesn't have template literals, convert to string
        return `"${node.raw.replace(/`/g, "")}"`
      case "BinaryExpression":
        return genBinaryExpression(node)
      case "UnaryExpression":
        return genUnaryExpression(node)
      case "CallExpression":
        return genCallExpression(node)
      case "MemberExpression":
        return genMemberExpression(node)
      case "ArrowFunctionExpression":
        return genArrowFunction(node)
      case "AssignmentExpression":
        return genAssignmentExpression(node)
      case "AwaitExpression":
        // Zig async is different, use try for error handling
        return `try ${genExpression(node.argument)}`
      case "NewExpression":
        return genNewExpression(node)
      case "ConditionalExpression":
        return `if (${genExpression(node.test)}) ${genExpression(node.consequent)} else ${genExpression(node.alternate)}`
      default:
        throw new Error(`Unknown expression type: ${(node as any).type}`)
    }
  }

  function genIdentifier(node: Identifier): string {
    // Map Latin keywords to Zig equivalents
    switch (node.name) {
      case "verum": return "true"
      case "falsum": return "false"
      case "nihil": return "null"
      default: return node.name
    }
  }

  function genLiteral(node: Literal): string {
    if (node.value === null) return "null"
    if (typeof node.value === "string") return `"${node.value}"`
    if (typeof node.value === "boolean") return node.value ? "true" : "false"
    return String(node.value)
  }

  function genBinaryExpression(node: BinaryExpression): string {
    const left = genExpression(node.left)
    const right = genExpression(node.right)
    const op = mapOperator(node.operator)
    return `(${left} ${op} ${right})`
  }

  function mapOperator(op: string): string {
    switch (op) {
      case "&&": return "and"
      case "||": return "or"
      // NOTE: String concat in Zig needs ++ but we can't distinguish from numeric +
      // without type information. This is a known limitation.
      default: return op
    }
  }

  function genUnaryExpression(node: UnaryExpression): string {
    const arg = genExpression(node.argument)
    return node.prefix ? `${node.operator}${arg}` : `${arg}${node.operator}`
  }

  function genCallExpression(node: CallExpression): string {
    // Special case: scribe() -> std.debug.print()
    if (node.callee.type === "Identifier" && node.callee.name === "scribe") {
      const args = node.arguments.map(genExpression)
      // Use {s} for string literals, {any} for others
      const formatSpecs = node.arguments.map(arg => {
        if (arg.type === "Literal" && typeof arg.value === "string") return "{s}"
        if (arg.type === "Identifier") return "{any}"  // Could be string or number
        return "{any}"
      })
      const format = formatSpecs.join(" ") + "\\n"
      return `std.debug.print("${format}", .{${args.join(", ")}})`
    }

    const callee = genExpression(node.callee)
    const args = node.arguments.map(genExpression).join(", ")
    return `${callee}(${args})`
  }

  function genMemberExpression(node: MemberExpression): string {
    const obj = genExpression(node.object)
    if (node.computed) {
      return `${obj}[${genExpression(node.property)}]`
    }
    return `${obj}.${node.property.name}`
  }

  function genArrowFunction(node: ArrowFunctionExpression): string {
    // Zig doesn't have arrow functions, but has inline closures
    // This is a simplification — real Zig would need more context
    const params = node.params.map(genParameter).join(", ")

    if (node.body.type === "BlockStatement") {
      const body = genBlockStatement(node.body)
      return `struct { fn call(${params}) anytype ${body} }.call`
    }

    const body = genExpression(node.body as Expression)
    return `struct { fn call(${params}) anytype { return ${body}; } }.call`
  }

  function genAssignmentExpression(node: AssignmentExpression): string {
    const left = node.left.type === "Identifier"
      ? node.left.name
      : genExpression(node.left)
    return `${left} ${node.operator} ${genExpression(node.right)}`
  }

  function genNewExpression(node: NewExpression): string {
    // Zig doesn't have 'new', use init pattern
    const callee = node.callee.name
    const args = node.arguments.map(genExpression).join(", ")
    return `${callee}.init(${args})`
  }

  return genProgram(program)
}
