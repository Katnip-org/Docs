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

### Random, round and mod ✅

```katnip
math.random(low: num, high: num) -> num     ✅   # operator_random
math.round(value: num) -> num               ✅   # operator_round
math.mod(value1: num, value2: num) -> num   ✅   # operator_mod, the same block as %
```

```katnip
private roll: num = math.random(1, 6);
```

### Functions ✅

`operator_mathop` is Scratch's one-block maths menu, and `math` wraps it twice: the raw
`math.op`, plus a named `builds` procedure per operation that inlines to the same block.

```katnip
math.op(op: MathOp, value: num) -> num     ✅   # operator_mathop

math.abs(value: num)   -> num    ✅        math.ln(value: num)   -> num    ✅
math.floor(value: num) -> num    ✅        math.log(value: num)  -> num    ✅
math.ceil(value: num)  -> num    ✅        math.epow(value: num) -> num    ✅   # e ^ value
math.sqrt(value: num)  -> num    ✅

math.sin(value: num)  -> num    ✅         math.asin(value: num) -> num    ✅
math.cos(value: num)  -> num    ✅         math.acos(value: num) -> num    ✅
math.tan(value: num)  -> num    ✅         math.atan(value: num) -> num    ✅
```

```katnip
private root: num = math.sqrt(16);
private steps: num = math.floor(distance / 10);
private same: num = math.op(math.MathOp.SQRT, 16);   # identical output
```

Trigonometry is in **degrees**, as everywhere in Scratch.

#### `MathOp`

| Member | Value | | Member | Value |
| --- | --- | --- | --- | --- |
| `MathOp.ABS` | `"abs"` | | `MathOp.ASIN` | `"asin"` |
| `MathOp.FLOOR` | `"floor"` | | `MathOp.ACOS` | `"acos"` |
| `MathOp.CEIL` | `"ceiling"` | | `MathOp.ATAN` | `"atan"` |
| `MathOp.SQRT` | `"sqrt"` | | `MathOp.LN` | `"ln"` |
| `MathOp.SIN` | `"sin"` | | `MathOp.LOG` | `"log"` |
| `MathOp.COS` | `"cos"` | | `MathOp.EPOW` | `"e ^"` |
| `MathOp.TAN` | `"tan"` | | | |

Reach it through the namespace — `math.MathOp.SQRT`. A matching literal works too:
`math.op("sqrt", 16)`.

### `math.pow` ✅

```katnip
math.pow(base: num, exponent: num) -> num     ✅   # what ** calls
```

A whole exponent is computed by multiplying, so `b ** 10` is exact. A fractional one goes through
`e ^ (exponent * ln(base))`, and a negative base with a fractional exponent gives `NaN`. It is a
procedure that runs without a screen refresh, added to the project only if used. The `**`
operator skips it when plain blocks will do; see [Powers](/language/operators/#powers).

### What is missing

No `min` or `max`. Scratch has no block for either, so write them:

```katnip
proc max(a: num, b: num) -> num {
    if (a > b) { return a; }
    return b;
}
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
