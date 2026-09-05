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

### There is no `math.pow` ⛔

`math.pow` was **removed** from the stdlib; `math.pow(2, 3)` is now a check error,
*Namespace 'math' has no member 'pow'*. The `**` operator still parses and is worse — it
lowers silently to an empty literal, so you get a wrong answer with no error at all. See
[Known gaps](/reference/known-gaps/#-is-not-lowered-yet).

For a whole-number exponent, write the loop:

```katnip
proc pow(base: num, exp: num) -> num {
    private result: num = 1;
    for (i, exp) {
        result = result * base;
    }
    return result;
}
```

For a fractional one, go through the natural log — this is exactly what the removed `pow`
body did:

```katnip
private half: num = math.epow(0.5 * math.ln(16));    # 16 ** 0.5 -> 4
```

That is undefined for a negative base, so guard it if the base can go below zero.

### What is missing

No `random`, `min`, `max`, or `round`. Scratch has blocks for all of them; the stdlib has
not wrapped them. Bind the opcodes directly:

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
