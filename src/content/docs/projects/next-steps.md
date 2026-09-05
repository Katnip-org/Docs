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
| Understand `public` / `private` properly | [Variables](/language/variables/) |
| Use dicts, or work around the missing methods | [Lists and dicts](/language/collections/) |
| Name your constants | [Enums and structs](/language/enums-and-structs/) |
| Split a project across files | [Modules](/language/modules/) |

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

Remember that a variable declared inside a procedure does **not** survive recursion — pass
state through parameters.

## Reach blocks the stdlib has not wrapped

You did this in project 2. It generalises:

```katnip
proc random(@opcode = "operator_random", from: num, to: num) -> num {}
proc round(@opcode = "operator_round", value: num) -> num {}
proc x(@opcode = "motion_xposition") -> num {}
proc y(@opcode = "motion_yposition") -> num {}

private roll: num = random(1, 6);
```

`operator_mathop` no longer needs this — `math` wraps it, so `math.sqrt`, `math.floor`,
`math.ln` and the trig functions are all there. See [math](/stdlib/math-console/#math).

This works for any opcode codegen has slot metadata for; unknown ones fail the build rather
than emitting a broken project. See [Decorators](/language/decorators/#opcode).

## Read the real examples

The compiler repository ships two files that are kept building, and they are the best
single reference for "does this actually build". `examples/all.knip` uses every feature
that lowers, exactly once each, with a comment on every line;
`examples/codegen.knip` is a fuller project, including a recursive `fib`.

```bash
katnip build examples/all.knip
katnip build examples/codegen.knip
```

:::caution
Other files in `examples/` — `example.knip`, `showcase.knip`, `stdlib.knip`, `proc.knip`,
`overload.knip`, `oos.knip`, `typeof.knip` — are older analyzer tests. They use
`console.log`, `typeof`, `math.pow`, and syntax that was never implemented, and they **do
not build**. Do not copy from them.
:::

## Know the edges

[Known gaps](/reference/known-gaps/) is the page to read before planning anything
ambitious. The short version:

* four things build and are **silently wrong**: `**`, slices, `range()` used as a value,
  and tuple-pattern assignment
* structs do not reach the `.sb3`
* `console.*`, `typeof`, `list.merge`, and every dict method fail the build
* `zip`/`enumerate` work in a `for` header, but fail the build used as a plain value
* imports build — procedures and literal constants cross, module variables do not
* an enum slot takes a member or a matching literal, but never a computed value

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
[Feature status](/reference/feature-status/). Closing the silently-wrong gaps is item one —
a project that builds and lies is worse than one that refuses to build.

[github.com/Katnip-org/Katnip](https://github.com/Katnip-org/Katnip)
