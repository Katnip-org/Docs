---
title: "Control flow"
---

## if / elif / else

```katnip
if (score == 0) {
    looks.say("zero");
} elif (score <= 50) {
    looks.say("low");
} else {
    looks.say("high");
}
```

Lowers to nested `control_if_else` blocks. Parentheses around the condition are required;
braces are required even for a single statement.

## while

```katnip
while (score > 100) {
    score -= 5;
}
```

Lowers to `control_while`, with the condition taken as-is.

## do / while

```katnip
do {
    score += 1;
} while (score < 10);

```

Runs the body at least once. Scratch has no do-while block, so Katnip emits the body
**once before the loop, then again inside it**. Note the semicolon — this is a statement.

:::note
The body is duplicated in the output. For a large body, that doubles the block count.
Prefer `while` when the first iteration does not need to be unconditional.
:::

## forever

```katnip
forever {
    motion.setX(sensing.mouseX());
}
```

Lowers to `control_forever`. Anything after the loop in the same script never runs.

## repeat

```katnip
repeat (4) {
    motion.forward(10);
}
```

Lowers to `control_repeat`. The count must be a `num`, and Scratch reads it once, when the loop
starts. Use `repeat` when you do not need a counter, and `for` when you do.

## for

Katnip's `for` takes a binding and something to walk. There are seven things it can walk.

### A counter

```katnip
for (step, 4) {
    motion.forward(10);
}
```

Runs four times with `step` = 1, 2, 3, 4. Lowers to `control_for_each`, Scratch's own
counted loop. The count can be any `num` expression, not just a literal.

### A range

```katnip
for (n, range(2, 10, 2)) {
    score += n;
}
```

`range(stop)` or `range(start, stop, step)`, **1-based and stop-inclusive**, like Scratch's
own counter: `range(5)` is `1 2 3 4 5`, `range(5, 1, -1)` counts down `5 4 3 2 1`. The range
is folded into the loop counter, with constant folding when the bounds are literals — no
list is ever built.

### A zip() or enumerate() pair

```katnip
for ((name, power), zip(names, powers)) {
    report(name, power);
}

for ((i, name), enumerate(names)) {
    report(i, name);
}
```

Also folded into the loop counter, never built as a list or tuple. `enumerate` reuses the
1-based counter as the index, so it costs no extra block. A single binding takes just the
first column — `for (i, enumerate(names))` binds the index alone. `zip`'s length comes
from its first list; a second list shorter than the first reads empty past its end, rather
than the loop stopping early.

### A list

```katnip
for (s, scores) {
    score += s;
}
```

Binds each element in turn, by index.

### A string

```katnip
for (letter, greeting) {
    if (letter == "a") {
        score += 1;
    }
}
```

Binds each character, through `operator_letter_of`.

### A dict

```katnip
for ((name, count), stock) {
    report(name, count);
}
```

Binds the key and the value together, walking the keys and values columns in step. The
double parentheses are the tuple pattern — see [Lists and dicts](/language/collections/).

## switch

```katnip
switch (score % 3) {
    case (0, 1) { looks.switchCostume("costume1"); }
    case (2)    { looks.nextCostume(); }
    default     { looks.setSize(100); }
}
```

A case can hold several values, separated by commas — it matches if any of them do. Cases
work on enums too:

```katnip
switch (pick) {
    case (Fruit.apple, Fruit.cherry) { looks.think("red-ish", 1); }
    default { looks.think("something else", 1); }
}
```

Every label is checked against the switch value's type, so a label that could never match
is an error. On an enum-typed value a label must be a member or a literal that
[coerces](/language/enums-and-structs/#literal-coercion) to one:

```katnip
enum Team { red = "R", blue = "B" }

switch (side) {            # side: Team
    case (Team.red) { ... }   # ✅
    case ("B")      { ... }   # ✅ Team.blue's value
    case ("R!")     { ... }   # error, with a did-you-mean
    case (Fruit.apple) { ... } # error, wrong enum
}
```

`switch` lowers to an if/else chain, which has two consequences:

* **There is no fallthrough.** Each case is independent; there is no keyword to fall into
  the next one.
* **There is no exhaustiveness check.** A `switch` over an enum that misses a member
  compiles without complaint. Add a `default`.

`case` and `default` are reserved words. They can only start a block inside a `switch`, and
you cannot use them as the name of a variable, parameter or procedure:

```katnip
private default = 1;    # error: 'default' is a reserved word
```

## return

```katnip
proc double(n: num) -> num {
    return n * 2;
}
```

`return` in a `void` procedure ends the script early:

```katnip
proc guard() -> void {
    if (score < 0) { return; }
    looks.say("ok");
}
```

Both forms emit a `control_stop` after writing the return value. The mechanics of how the
value gets back to the caller are in
[Procedures → Returning values](/language/procedures/#returning-values).

## Stopping

```katnip
stop(StopType.ALL);
stop(StopType.THIS_SCRIPT);
stop(StopType.OTHER_SCRIPTS_IN_SPRITE);
```

## What is missing

`break` and `continue` do not exist. Using either is reported as an undefined name. To leave
a loop early, put the condition in a `while`, or `return` from a procedure.
