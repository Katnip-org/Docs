---
title: "Where to go next"
---

Three projects in, you have used most of what Katnip can currently compile. Here is what to
read depending on what you want to do.

## Fill in the language

| If you want to | Read |
| --- | --- |
| Know every loop form and what it compiles to | [Control flow](/language/control-flow/) |
| Return values, overload, recurse | [Procedures](/language/procedures/) |
| Understand `public` / `private` / `temp` properly | [Variables](/language/variables/) |
| Use dicts, or work around the missing methods | [Lists and dicts](/language/collections/) |
| Name your constants | [Enums and structs](/language/enums-and-structs/) |
| Split a project across files *(check only)* | [Modules](/language/modules/) |

## Recursion works — try it

Scratch custom blocks cannot return values, and a naive workaround breaks the moment a
procedure calls itself. Katnip runs a Tarjan SCC pass over your call graph and gives
recursive procedures a return **stack** instead of a return variable, so this produces
correct answers in a real `.sb3`:

```katnip
proc fib(n: num) -> num {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}
```

It is genuinely worth building once and watching run. Details in
[Returning values](/language/procedures/#returning-values).

Remember that `temp` does **not** survive recursion — pass state through parameters.

## Reach blocks the stdlib has not wrapped

You did this in project 2. It generalises:

```katnip
proc random(@opcode = "operator_random", from: num, to: num) -> num {}
proc round(@opcode = "operator_round", value: num) -> num {}
proc mathop(@opcode = "operator_mathop", operator: str, num: num) -> num {}
proc x(@opcode = "motion_xposition") -> num {}
proc y(@opcode = "motion_yposition") -> num {}

temp root: num = mathop("sqrt", 16);
```

`operator_mathop` alone covers `abs`, `floor`, `ceiling`, `sqrt`, `sin`, `cos`, `tan`,
`asin`, `acos`, `atan`, `ln`, `log`, `e ^`, and `10 ^`.

This works for any opcode codegen has slot metadata for; unknown ones fail the build rather
than emitting a broken project. See [Decorators](/language/decorators/#opcode).

## Read the real examples

The compiler repository ships `examples/codegen.knip` — a deliberately exhaustive project
exercising everything the pipeline lowers today, with commentary. It is the best single
reference for "does this actually build", and it is kept passing.

```bash
katnip build examples/codegen.knip
```

:::caution
Other files in `examples/` — `example.knip`, `showcase.knip`, `stdlib.knip` — are
analyzer tests. They use `console.log`, `zip`, `**`, and imports, and they **do not
build**. Do not copy from them.
:::

## Know the edges

[Known gaps](/reference/known-gaps/) is the page to read before planning anything
ambitious. The short version:

* imports do not survive codegen — one file per project
* structs do not reach the `.sb3`
* `**` silently produces a wrong answer
* `console.*`, the casts, `typeof`, `zip`/`enumerate` and every dict method fail the build
* an enum slot takes a member or a matching literal, but never a computed value
* no asset import

[Feature status](/reference/feature-status/) has the full per-feature table if you want the
complete picture.

## Improve the workflow

* [VS Code extension](/toolchain/vscode/) — diagnostics as you type, and a build
  command, which beats a terminal round trip.
* [CLI](/toolchain/cli/) — `tokenize`, `parse`, `lower` let you see exactly what each
  stage did with your code.
* [Embedding the compiler](/toolchain/api/) — `checkSource` and `compileToSb3` are
  exported, with a pluggable import resolver, if you want to build a playground or a
  different editor integration.

## Contribute

The roadmap, in the maintainers' own priority order, is at the bottom of
[Feature status](/reference/feature-status/). Lowering imports is item one, and it would unblock
more real projects than anything else on the list.

[github.com/Katnip-org/Katnip](https://github.com/Katnip-org/Katnip)
