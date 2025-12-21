export type TokenType =
  // Literals
  | "NUMBER"
  | "STRING"
  | "TEMPLATE_STRING"
  | "IDENTIFIER"

  // Keywords (filled in from lexicon)
  | "KEYWORD"

  // Operators
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "PERCENT"
  | "EQUAL"
  | "EQUAL_EQUAL"
  | "BANG"
  | "BANG_EQUAL"
  | "LESS"
  | "LESS_EQUAL"
  | "GREATER"
  | "GREATER_EQUAL"
  | "AND"
  | "OR"
  | "ARROW"        // =>
  | "THIN_ARROW"   // ->
  | "DOT"
  | "QUESTION"
  | "COLON"
  | "PIPE"

  // Delimiters
  | "LPAREN"
  | "RPAREN"
  | "LBRACE"
  | "RBRACE"
  | "LBRACKET"
  | "RBRACKET"
  | "COMMA"
  | "SEMICOLON"

  // Special
  | "NEWLINE"
  | "EOF"
  | "COMMENT"

export interface Position {
  line: number
  column: number
  offset: number
}

export interface Token {
  type: TokenType
  value: string
  position: Position
  // For keywords, the specific keyword
  keyword?: string
}

export interface TokenizerError {
  message: string
  position: Position
}

export interface TokenizerResult {
  tokens: Token[]
  errors: TokenizerError[]
}
