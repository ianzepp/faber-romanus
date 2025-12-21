import type { Token, TokenType, Position, TokenizerResult, TokenizerError } from "./types"
import { isKeyword, getKeyword } from "../lexicon"

export function tokenize(source: string): TokenizerResult {
  const tokens: Token[] = []
  const errors: TokenizerError[] = []

  let current = 0
  let line = 1
  let column = 1
  let lineStart = 0

  function position(): Position {
    return { line, column: current - lineStart + 1, offset: current }
  }

  function peek(offset = 0): string {
    return source[current + offset] ?? ""
  }

  function advance(): string {
    const char = source[current]
    current++
    column++
    return char
  }

  function isAtEnd(): boolean {
    return current >= source.length
  }

  function isDigit(char: string): boolean {
    return char >= "0" && char <= "9"
  }

  function isAlpha(char: string): boolean {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_"
  }

  function isAlphaNumeric(char: string): boolean {
    return isAlpha(char) || isDigit(char)
  }

  function addToken(type: TokenType, value: string, pos: Position, keyword?: string): void {
    tokens.push({ type, value, position: pos, keyword })
  }

  function addError(message: string, pos: Position): void {
    errors.push({ message, position: pos })
  }

  function skipWhitespace(): void {
    while (!isAtEnd()) {
      const char = peek()
      if (char === " " || char === "\t" || char === "\r") {
        advance()
      }
      else if (char === "\n") {
        advance()
        line++
        lineStart = current
      }
      else if (char === "/" && peek(1) === "/") {
        // Single-line comment
        const pos = position()
        let comment = ""
        advance() // /
        advance() // /
        while (!isAtEnd() && peek() !== "\n") {
          comment += advance()
        }
        // Optionally emit comment tokens for tooling
        // addToken("COMMENT", comment.trim(), pos)
      }
      else if (char === "/" && peek(1) === "*") {
        // Multi-line comment
        advance() // /
        advance() // *
        while (!isAtEnd() && !(peek() === "*" && peek(1) === "/")) {
          if (peek() === "\n") {
            line++
            lineStart = current + 1
          }
          advance()
        }
        if (!isAtEnd()) {
          advance() // *
          advance() // /
        }
      }
      else {
        break
      }
    }
  }

  function scanNumber(): void {
    const pos = position()
    let value = ""

    while (isDigit(peek())) {
      value += advance()
    }

    // Decimal
    if (peek() === "." && isDigit(peek(1))) {
      value += advance() // .
      while (isDigit(peek())) {
        value += advance()
      }
    }

    addToken("NUMBER", value, pos)
  }

  function scanString(quote: string): void {
    const pos = position()
    let value = ""
    advance() // opening quote

    while (!isAtEnd() && peek() !== quote) {
      if (peek() === "\n") {
        addError("Unterminated string", pos)
        return
      }
      if (peek() === "\\") {
        advance()
        const escaped = advance()
        switch (escaped) {
          case "n": value += "\n"; break
          case "t": value += "\t"; break
          case "r": value += "\r"; break
          case "\\": value += "\\"; break
          case quote: value += quote; break
          default: value += escaped
        }
      }
      else {
        value += advance()
      }
    }

    if (isAtEnd()) {
      addError("Unterminated string", pos)
      return
    }

    advance() // closing quote
    addToken("STRING", value, pos)
  }

  function scanTemplateString(): void {
    const pos = position()
    let value = ""
    advance() // opening backtick

    while (!isAtEnd() && peek() !== "`") {
      if (peek() === "\n") {
        line++
        lineStart = current + 1
        value += advance()
      }
      else if (peek() === "\\") {
        advance()
        value += advance()
      }
      else if (peek() === "$" && peek(1) === "{") {
        // For now, capture the whole template as-is
        // Full interpolation parsing would be more complex
        value += advance() // $
        value += advance() // {
        let braceDepth = 1
        while (!isAtEnd() && braceDepth > 0) {
          if (peek() === "{") braceDepth++
          if (peek() === "}") braceDepth--
          value += advance()
        }
      }
      else {
        value += advance()
      }
    }

    if (isAtEnd()) {
      addError("Unterminated template string", pos)
      return
    }

    advance() // closing backtick
    addToken("TEMPLATE_STRING", value, pos)
  }

  function scanIdentifier(): void {
    const pos = position()
    let value = ""

    while (isAlphaNumeric(peek())) {
      value += advance()
    }

    // Check if it's a keyword
    if (isKeyword(value)) {
      const kw = getKeyword(value)!
      addToken("KEYWORD", value, pos, kw.latin)
    }
    else {
      addToken("IDENTIFIER", value, pos)
    }
  }

  function scanToken(): void {
    skipWhitespace()
    if (isAtEnd()) return

    const pos = position()
    const char = peek()

    // Numbers
    if (isDigit(char)) {
      scanNumber()
      return
    }

    // Identifiers and keywords
    if (isAlpha(char)) {
      scanIdentifier()
      return
    }

    // Strings
    if (char === '"' || char === "'") {
      scanString(char)
      return
    }

    // Template strings
    if (char === "`") {
      scanTemplateString()
      return
    }

    // Operators and delimiters
    advance()
    switch (char) {
      case "(": addToken("LPAREN", char, pos); break
      case ")": addToken("RPAREN", char, pos); break
      case "{": addToken("LBRACE", char, pos); break
      case "}": addToken("RBRACE", char, pos); break
      case "[": addToken("LBRACKET", char, pos); break
      case "]": addToken("RBRACKET", char, pos); break
      case ",": addToken("COMMA", char, pos); break
      case ";": addToken("SEMICOLON", char, pos); break
      case ".": addToken("DOT", char, pos); break
      case ":": addToken("COLON", char, pos); break
      case "?": addToken("QUESTION", char, pos); break
      case "|":
        if (peek() === "|") {
          advance()
          addToken("OR", "||", pos)
        }
        else {
          addToken("PIPE", char, pos)
        }
        break
      case "&":
        if (peek() === "&") {
          advance()
          addToken("AND", "&&", pos)
        }
        else {
          addError(`Unexpected character '${char}'`, pos)
        }
        break
      case "+": addToken("PLUS", char, pos); break
      case "-":
        if (peek() === ">") {
          advance()
          addToken("THIN_ARROW", "->", pos)
        }
        else {
          addToken("MINUS", char, pos)
        }
        break
      case "*": addToken("STAR", char, pos); break
      case "/": addToken("SLASH", char, pos); break
      case "%": addToken("PERCENT", char, pos); break
      case "=":
        if (peek() === "=") {
          advance()
          addToken("EQUAL_EQUAL", "==", pos)
        }
        else if (peek() === ">") {
          advance()
          addToken("ARROW", "=>", pos)
        }
        else {
          addToken("EQUAL", char, pos)
        }
        break
      case "!":
        if (peek() === "=") {
          advance()
          addToken("BANG_EQUAL", "!=", pos)
        }
        else {
          addToken("BANG", char, pos)
        }
        break
      case "<":
        if (peek() === "=") {
          advance()
          addToken("LESS_EQUAL", "<=", pos)
        }
        else {
          addToken("LESS", char, pos)
        }
        break
      case ">":
        if (peek() === "=") {
          advance()
          addToken("GREATER_EQUAL", ">=", pos)
        }
        else {
          addToken("GREATER", char, pos)
        }
        break
      default:
        addError(`Unexpected character '${char}'`, pos)
    }
  }

  // Main tokenization loop
  while (!isAtEnd()) {
    scanToken()
  }

  addToken("EOF", "", position())

  return { tokens, errors }
}

export * from "./types"
