---
title: "How the compiler works"
---

You do not need this page to write Katnip. You do need it the first time an error message
says something like `no slot metadata` or `call to unknown proc`, because those come from
specific stages and knowing which one tells you what to change.

The pipeline is five stages:

```
.knip source
    │
    ├─> Lexer            characters → tokens
    ├─> Parser           tokens → AST
    ├─> Semantic         AST → types, symbols, call graph
    ├─> IR generator     AST → Scratch-shaped IR
    └─> SB3 codegen      IR → project.json → .sb3 zip
```

## Lexer

A hand-written state machine. It tracks line and column for every token, uses an operator
trie so `!` , `!=` and `!&` are distinguished without backtracking, and handles the six
[comment forms](/language/comments/) and interpolated-string nesting.

Errors here look like `Invalid operator '!!'` and stop the build immediately — there is
nothing sensible to parse.

## Parser

A [Pratt parser](https://en.wikipedia.org/wiki/Operator-precedence_parser) driven by a
binding-power table, which is why operator precedence is a data change rather than a code
change.

Crucially it **recovers**: when a statement fails to parse it emits an error node and
keeps going. The analyzer treats error nodes as no-ops, so a single missing semicolon does
not hide every type error below it. You get the whole list in one run.

## Semantic analyzer

Two passes over the AST:

1. **Hoist** — every declaration is registered before any body is walked, so procedures
   can call each other in any order and a sprite can use a global declared below it.
2. **Walk** — types are inferred and checked, symbols resolved through a scoped symbol
   table, and the call graph recorded.

This is where most errors you will see come from: type mismatches, unknown names,
handlers outside a sprite, `return` in a `void` proc.

The analyzer also runs a **Tarjan strongly-connected-components pass** over the call graph
to decide each procedure's return strategy — see
[the return ABI](/language/procedures/#returning-values). Recursive procedures get a
stack; everything else gets a plain variable.

## IR generator

Lowers the AST into nodes that already look like Scratch: blocks, inputs, fields,
substacks. This is where the interesting translations happen — a `for` over a dict becomes
two parallel list walks, `f"{a}{b}"` becomes a nested `join`, `<=` becomes `not (a > b)`.

It is also the stage with the most holes. Anything listed under
[Known gaps](/reference/known-gaps/) type-checks fine and then either no-ops or throws
here.

## SB3 codegen

Turns IR into `project.json`: one target for the stage plus one per sprite, variables and
lists on the correct target, custom-block prototypes with proccodes and argument ids,
shadow primitives for every input slot, broadcast primitives on the stage, and the
extension list.

Then [fflate](https://github.com/101arrowz/fflate) zips `project.json`, the default
costume and every declared costume and sound into a `.sb3`. Assets are named by md5, so a
file shared between sprites is stored once.

If an opcode reaches this stage without slot metadata — which is how the unimplemented
`katnip_*` builtins fail — codegen throws rather than emitting a broken project. A build
that succeeds produces a project that loads.

It does not guarantee the project is *right*. A handful of constructs are lowered to an
empty literal or skipped outright, so they build and then misbehave at runtime — see
[Known gaps](/reference/known-gaps/) for the list.

## Seeing inside

Every intermediate stage has a CLI command, which is the fastest way to answer "what did
it actually do with that?":

```bash
katnip tokenize hello.knip tokens.json
katnip parse    hello.knip ast.json
katnip lower    hello.knip ir.json
katnip build    hello.knip
```

Details in [CLI](/toolchain/cli/).
