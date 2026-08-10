---
title: "CLI"
---

```bash
npm install -g @katnip-org/compiler
katnip help
```

From a source checkout, substitute `node packages/compiler/build/cli.js` for `katnip`.

## Commands

### `build`

```bash
katnip build <source> [output]
```

Compiles a `.knip` to a `.sb3`. Output defaults to the source path with the extension
swapped.

```bash
katnip build game.knip              # writes game.sb3
katnip build game.knip dist/g.sb3
```

Runs the whole pipeline, so it type-checks too. On any error it prints the diagnostics and
exits non-zero without writing a file — a build either produces a project that loads, or
produces nothing.

### `check`

```bash
katnip check <source> [logger]
```

Lex, parse, and analyze. Prints `No semantic errors found.` or the diagnostics. Faster than
`build` because it skips IR and codegen.

:::caution
`check` passing does **not** mean `build` will succeed. Several features are complete in
the analyzer and absent from the IR — structs, imports, `console.*`, the casts. See
[Known gaps](/reference/known-gaps/).
:::

### `lower`

```bash
katnip lower <source> [output]
```

Lowers to IR and prints it as JSON, to stdout unless you give a path. The fastest way to
answer "what did the compiler actually do with that loop".

### `parse`

```bash
katnip parse <source> <output>
```

Writes the AST as JSON. Aborts if the lexer or parser reported errors.

### `tokenize`

```bash
katnip tokenize <source> <output>
```

Writes the token stream as JSON, each token with its line and column.

### `help`

```bash
katnip help
```

## The `logger` flag

`tokenize`, `parse` and `check` take an optional trailing `logger` positional. Pass `true`
to write a verbose per-character, per-state trace:

```bash
katnip check game.knip true
```

The log goes to `examples/log.txt` **relative to your current working directory** — so run
it from a directory that has an `examples/` folder, or the write fails. This is a compiler
debugging aid, not a user-facing feature.

## Errors

Diagnostics carry a source span with line and column, and are printed with the offending
line and a caret:

```
Semantic Error: Argument 2 of 'say' expects 'num', got 'str'
  at line 3, column 39
    |
  3 |         looks.say("Hello from Katnip!", "two");
    |                                         ^^^^^
```

Multiple errors are reported per run. The parser recovers into error nodes, so semantic
errors surface **alongside** syntax errors rather than hiding behind the first one — you
get the whole list.

Each diagnostic is followed by an internal stack trace into the compiler. That is for
compiler development; the first few lines are the part meant for you.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | success |
| 1 | the build failed — diagnostics printed |

Suitable for CI:

```bash
katnip check src/game.knip || exit 1
```
