/**
 * ts2fab - TypeScript to Faber transpiler
 *
 * Round-trip testing tool: TS → Faber → TS
 * Uses TypeScript compiler API to parse and generate Faber code.
 */

import ts from "typescript"

// =============================================================================
// KEYWORD MAPPINGS
// =============================================================================

const KEYWORD_MAP: Record<string, string> = {
  const: "fixum",
  let: "esto",
  function: "functio",
  async: "futura",
  return: "redde",
  if: "si",
  else: "aliter",
  while: "dum",
  for: "pro",
  try: "tempta",
  catch: "cape",
  finally: "demum",
  new: "novum",
  await: "exspecta",
  true: "verum",
  false: "falsum",
  null: "nihil",
}

const TYPE_MAP: Record<string, string> = {
  string: "Textus",
  number: "Numerus",
  boolean: "Veritas",
  void: "Vacuus",
  any: "Ignotus",
}

const OPERATOR_MAP: Record<string, string> = {
  "&&": "et",
  "||": "aut",
}

// =============================================================================
// CODE GENERATOR
// =============================================================================

function generate(node: ts.Node, sourceFile: ts.SourceFile, indent = 0): string {
  const pad = "  ".repeat(indent)

  switch (node.kind) {
    case ts.SyntaxKind.SourceFile:
      return (node as ts.SourceFile).statements
        .map(s => generate(s, sourceFile, indent))
        .join("\n")

    // -------------------------------------------------------------------------
    // Declarations
    // -------------------------------------------------------------------------

    case ts.SyntaxKind.VariableStatement: {
      const stmt = node as ts.VariableStatement
      return generate(stmt.declarationList, sourceFile, indent)
    }

    case ts.SyntaxKind.VariableDeclarationList: {
      const list = node as ts.VariableDeclarationList
      const keyword = list.flags & ts.NodeFlags.Const ? "fixum" : "esto"
      return list.declarations
        .map(d => `${pad}${keyword} ${generate(d, sourceFile, 0)}`)
        .join("\n")
    }

    case ts.SyntaxKind.VariableDeclaration: {
      const decl = node as ts.VariableDeclaration
      const name = decl.name.getText(sourceFile)
      const typeAnnotation = decl.type ? `: ${generateType(decl.type, sourceFile)}` : ""
      const init = decl.initializer ? ` = ${generate(decl.initializer, sourceFile, 0)}` : ""
      return `${name}${typeAnnotation}${init}`
    }

    case ts.SyntaxKind.FunctionDeclaration: {
      const fn = node as ts.FunctionDeclaration
      const async = fn.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ? "futura " : ""
      const name = fn.name?.getText(sourceFile) ?? "anonymous"
      const params = fn.parameters.map(p => generateParam(p, sourceFile)).join(", ")
      const returnType = fn.type ? ` -> ${generateType(fn.type, sourceFile)}` : ""
      const body = fn.body ? generate(fn.body, sourceFile, indent) : "{}"
      return `${pad}${async}functio ${name}(${params})${returnType} ${body}`
    }

    // -------------------------------------------------------------------------
    // Statements
    // -------------------------------------------------------------------------

    case ts.SyntaxKind.Block: {
      const block = node as ts.Block
      const stmts = block.statements.map(s => generate(s, sourceFile, indent + 1)).join("\n")
      return `{\n${stmts}\n${pad}}`
    }

    case ts.SyntaxKind.ReturnStatement: {
      const ret = node as ts.ReturnStatement
      const expr = ret.expression ? ` ${generate(ret.expression, sourceFile, 0)}` : ""
      return `${pad}redde${expr}`
    }

    case ts.SyntaxKind.IfStatement: {
      const ifStmt = node as ts.IfStatement
      const cond = generate(ifStmt.expression, sourceFile, 0)
      const thenBlock = generate(ifStmt.thenStatement, sourceFile, indent)
      let result = `${pad}si ${cond} ${thenBlock}`
      if (ifStmt.elseStatement) {
        result += `\n${pad}aliter ${generate(ifStmt.elseStatement, sourceFile, indent)}`
      }
      return result
    }

    case ts.SyntaxKind.WhileStatement: {
      const whileStmt = node as ts.WhileStatement
      const cond = generate(whileStmt.expression, sourceFile, 0)
      const body = generate(whileStmt.statement, sourceFile, indent)
      return `${pad}dum ${cond} ${body}`
    }

    case ts.SyntaxKind.ForOfStatement: {
      const forOf = node as ts.ForOfStatement
      const varDecl = forOf.initializer as ts.VariableDeclarationList
      const varName = varDecl.declarations[0].name.getText(sourceFile)
      const iterable = generate(forOf.expression, sourceFile, 0)
      const body = generate(forOf.statement, sourceFile, indent)
      return `${pad}pro ${varName} ex ${iterable} ${body}`
    }

    case ts.SyntaxKind.ForInStatement: {
      const forIn = node as ts.ForInStatement
      const varDecl = forIn.initializer as ts.VariableDeclarationList
      const varName = varDecl.declarations[0].name.getText(sourceFile)
      const obj = generate(forIn.expression, sourceFile, 0)
      const body = generate(forIn.statement, sourceFile, indent)
      return `${pad}pro ${varName} in ${obj} ${body}`
    }

    case ts.SyntaxKind.TryStatement: {
      const tryStmt = node as ts.TryStatement
      const tryBlock = generate(tryStmt.tryBlock, sourceFile, indent)
      let result = `${pad}tempta ${tryBlock}`
      if (tryStmt.catchClause) {
        const catchVar = tryStmt.catchClause.variableDeclaration?.name.getText(sourceFile) ?? "error"
        const catchBlock = generate(tryStmt.catchClause.block, sourceFile, indent)
        result += `\n${pad}cape ${catchVar} ${catchBlock}`
      }
      if (tryStmt.finallyBlock) {
        const finallyBlock = generate(tryStmt.finallyBlock, sourceFile, indent)
        result += `\n${pad}demum ${finallyBlock}`
      }
      return result
    }

    case ts.SyntaxKind.ExpressionStatement: {
      const expr = node as ts.ExpressionStatement
      return `${pad}${generate(expr.expression, sourceFile, 0)}`
    }

    // -------------------------------------------------------------------------
    // Expressions
    // -------------------------------------------------------------------------

    case ts.SyntaxKind.CallExpression: {
      const call = node as ts.CallExpression
      const callee = generate(call.expression, sourceFile, 0)
      const args = call.arguments.map(a => generate(a, sourceFile, 0)).join(", ")

      // Map console.log to scribe
      if (callee === "console.log") {
        return `scribe(${args})`
      }
      return `${callee}(${args})`
    }

    case ts.SyntaxKind.BinaryExpression: {
      const bin = node as ts.BinaryExpression
      const left = generate(bin.left, sourceFile, 0)
      const right = generate(bin.right, sourceFile, 0)
      const op = bin.operatorToken.getText(sourceFile)
      const mappedOp = OPERATOR_MAP[op] ?? op
      return `${left} ${mappedOp} ${right}`
    }

    case ts.SyntaxKind.PrefixUnaryExpression: {
      const prefix = node as ts.PrefixUnaryExpression
      const operand = generate(prefix.operand, sourceFile, 0)
      const op = ts.tokenToString(prefix.operator) ?? ""
      return `${op}${operand}`
    }

    case ts.SyntaxKind.ParenthesizedExpression: {
      const paren = node as ts.ParenthesizedExpression
      return `(${generate(paren.expression, sourceFile, 0)})`
    }

    case ts.SyntaxKind.PropertyAccessExpression: {
      const prop = node as ts.PropertyAccessExpression
      const obj = generate(prop.expression, sourceFile, 0)
      const name = prop.name.getText(sourceFile)
      return `${obj}.${name}`
    }

    case ts.SyntaxKind.ElementAccessExpression: {
      const elem = node as ts.ElementAccessExpression
      const obj = generate(elem.expression, sourceFile, 0)
      const index = generate(elem.argumentExpression, sourceFile, 0)
      return `${obj}[${index}]`
    }

    case ts.SyntaxKind.NewExpression: {
      const newExpr = node as ts.NewExpression
      const ctor = generate(newExpr.expression, sourceFile, 0)
      const args = newExpr.arguments?.map(a => generate(a, sourceFile, 0)).join(", ") ?? ""
      return `novum ${ctor}(${args})`
    }

    case ts.SyntaxKind.AwaitExpression: {
      const awaitExpr = node as ts.AwaitExpression
      return `exspecta ${generate(awaitExpr.expression, sourceFile, 0)}`
    }

    case ts.SyntaxKind.ArrowFunction: {
      const arrow = node as ts.ArrowFunction
      const params = arrow.parameters.map(p => generateParam(p, sourceFile)).join(", ")
      const body = ts.isBlock(arrow.body)
        ? generate(arrow.body, sourceFile, indent)
        : generate(arrow.body, sourceFile, 0)
      return `(${params}) => ${body}`
    }

    case ts.SyntaxKind.ConditionalExpression: {
      const cond = node as ts.ConditionalExpression
      const test = generate(cond.condition, sourceFile, 0)
      const consequent = generate(cond.whenTrue, sourceFile, 0)
      const alternate = generate(cond.whenFalse, sourceFile, 0)
      return `${test} ? ${consequent} : ${alternate}`
    }

    // -------------------------------------------------------------------------
    // Literals and Identifiers
    // -------------------------------------------------------------------------

    case ts.SyntaxKind.Identifier: {
      const id = node as ts.Identifier
      return id.getText(sourceFile)
    }

    case ts.SyntaxKind.StringLiteral: {
      const str = node as ts.StringLiteral
      return `"${str.text}"`
    }

    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.FirstLiteralToken: {
      return node.getText(sourceFile)
    }

    case ts.SyntaxKind.TrueKeyword:
      return "verum"

    case ts.SyntaxKind.FalseKeyword:
      return "falsum"

    case ts.SyntaxKind.NullKeyword:
      return "nihil"

    case ts.SyntaxKind.ArrayLiteralExpression: {
      const arr = node as ts.ArrayLiteralExpression
      const elements = arr.elements.map(e => generate(e, sourceFile, 0)).join(", ")
      return `[${elements}]`
    }

    case ts.SyntaxKind.ObjectLiteralExpression: {
      const obj = node as ts.ObjectLiteralExpression
      const props = obj.properties.map(p => {
        if (ts.isPropertyAssignment(p)) {
          const key = p.name.getText(sourceFile)
          const value = generate(p.initializer, sourceFile, 0)
          return `${key}: ${value}`
        }
        return p.getText(sourceFile)
      }).join(", ")
      return `{ ${props} }`
    }

    default:
      // Fallback: return original text
      return node.getText(sourceFile)
  }
}

function generateType(node: ts.TypeNode, sourceFile: ts.SourceFile): string {
  const text = node.getText(sourceFile)
  return TYPE_MAP[text] ?? text
}

function generateParam(param: ts.ParameterDeclaration, sourceFile: ts.SourceFile): string {
  const name = param.name.getText(sourceFile)
  const type = param.type ? `: ${generateType(param.type, sourceFile)}` : ""
  return `${name}${type}`
}

// =============================================================================
// MAIN
// =============================================================================

function ts2fab(source: string): string {
  const sourceFile = ts.createSourceFile(
    "input.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )

  return generate(sourceFile, sourceFile)
}

// CLI entry point
const args = process.argv.slice(2)
const inputFile = args[0]

if (!inputFile) {
  console.log("Usage: bun run src/index.ts <file.ts>")
  console.log("\nConverts TypeScript to Faber code.")
  process.exit(0)
}

const source = await Bun.file(inputFile).text()
const faber = ts2fab(source)

console.log(faber)
