---
title: "math and console"
---

## math

### Constants ✅

```katnip
math.pi     3.141592653589793
math.e      2.718281828459045
math.tau    6.283185307179586
```

These fold to their literal value at compile time, so they cost nothing at runtime:

```katnip
private turns: num = math.pi * 2;
motion.forward(10 * math.pi);
```

### `math.pow` ⛔

```katnip
math.pow(base: num, exponent: num) -> num
```

Declared with an **empty body** and no opcode. It type-checks and produces nothing. The
`**` operator has the same gap and is worse — it lowers silently to an empty literal, so
you get a wrong answer with no error.

Write it out:

```katnip
proc pow(base: num, exp: num) -> num {
    private result: num = 1;
    for (i, exp) {
        result = result * base;
    }
    return result;
}
```

That covers whole-number exponents, which is most of what a Scratch project needs. For
fractional powers, Scratch's `[sqrt v] of ()` block is the practical route — bind it
yourself:

```katnip
proc mathop(@opcode = "operator_mathop", operator: str, num: num) -> num {}

private root: num = mathop("sqrt", 16);
```

:::note
`operator_mathop` also covers `abs`, `floor`, `ceiling`, `sqrt`, `sin`, `cos`, `tan`,
`asin`, `acos`, `atan`, `ln`, `log`, `e ^`, and `10 ^`. It is not in the stdlib yet, so
binding it yourself is the current answer for all of them.
:::

### What is missing

No `random`, `min`, `max`, `abs`, `round`, `floor`, or trigonometry. Scratch has blocks for
all of these; the stdlib has not wrapped them. Bind the opcodes directly:

```katnip
proc random(@opcode = "operator_random", from: num, to: num) -> num {}
proc round(@opcode = "operator_round", value: num) -> num {}

private roll: num = random(1, 6);
```

## console

:::danger
**The whole console namespace is unimplemented.** `log`, `warn` and `error` resolve to
`katnip_*` opcodes with no codegen; `input` is a `yields` procedure with no lowering. All
four type-check and then fail the build.

You will see `console.log` in several example files. Those examples do not build.
:::

```katnip
console.log(msg: str) -> void       ⛔
console.warn(msg: str) -> void      ⛔
console.error(msg: str) -> void     ⛔
console.input(prompt: str) -> str   ⛔
```

### What to use instead

**For output**, say it:

```katnip
looks.say(f"score is {score}", 1);
```

Or keep a log list, which persists and is scrollable:

```katnip
public logLines: list<str> = [];

proc log(msg: str) -> void {
    logLines.add(msg);
    logLines.show();
}
```

**For input**, use the sensing pair that `console.input` was meant to wrap:

```katnip
sensing.ask("What is your name?");
private name: str = sensing.answer();
looks.say(f"Welcome, {name}!", 2);
```

`console.input` cannot work until `yields` procedures are lowered, because it has to both
run a blocking block and produce a value — the two-call form does that explicitly.
