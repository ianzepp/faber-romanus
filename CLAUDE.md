# Faber Romanus

A Latin programming language compiler. "The Roman Craftsman."

## Project Philosophy

- **Compiler as tutor**: Error messages teach Latin grammar
- **Accessibility over purity**: Lower barriers, no gatekeeping
- **Incremental discovery**: Architecture emerges from decisions, not upfront planning

## Stack

- Runtime: Bun
- Language: TypeScript
- Targets: TypeScript (default), Zig

## Commands

```bash
bun run fons/cli.ts compile <file.fab>          # Compile to TypeScript
bun run fons/cli.ts compile <file.fab> -t zig   # Compile to Zig
bun test                                        # Run tests
```

## Timeouts

Keep bash timeouts minimal - tests should complete in seconds, not minutes:

- `bun test` commands: 5-10 seconds max
- Individual file operations: 2-3 seconds
- If something hangs, it's broken - don't wait for it

## Code Standards

See `DEVELOPER.md` for comprehensive guidelines. Key points:

**Module Headers**: Every file needs a header block documenting:

- Compiler phase (lexical, syntactic, semantic, codegen)
- Input/output contract
- Invariants that must hold

**Documentation Tags**:

- `WHY:` - Explain reasoning, not mechanics
- `EDGE:` - Document edge cases handled
- `TARGET:` - Note target-specific behavior
- `GRAMMAR:` - EBNF for parser functions

**Error Handling**:

- Never crash on malformed input
- Collect errors and continue parsing
- Error messages should teach Latin syntax

**Testing**:

- Test each compiler phase independently
- Include error recovery tests

## Directory Structure

- `fons/` — compiler source ("source, spring")
- `exempla/` — example .fab programs ("examples")
- `opus/` — build output ("the work") - future

## Communication Style

Sporadically include Latin phrases with English translations in responses. Examples:

- "Opus perfectum est" (the work is complete)
- "Bene factum" (well done)
- "Errare humanum est" (to err is human) - for bugs
- "Festina lente" (make haste slowly) - for careful refactoring
- "Faber fit fabricando" (the craftsman is made by crafting) - for learning moments
