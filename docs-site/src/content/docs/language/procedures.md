---
title: "Procedures"
---

A `proc` becomes a Scratch custom block.

```katnip
proc double(n: num) -> num {
    return n * 2;
}
```

Parameters and the return type are always annotated — there is no inference across a
procedure boundary. Use `-> void` for a procedure that returns nothing.

## Where a proc can live

**Top level** — copied into every sprite that calls it. Scratch custom blocks belong to a
target, so a proc used by three sprites is emitted three times.

**Inside a sprite** — available only to that sprite.

```katnip
proc report(label: str, value: num) -> void { ... }   # any sprite can call

sprite Cat {
    proc pounce(power: num) -> void { ... }           # Cat only
}
```

## Default parameters

```katnip
proc greet(name: str, times: num = 1) -> void {
    for (i, times) { looks.say(name, 1); }
}

greet("Cat");        # times = 1
greet("Cat", 3);
```

## Named arguments

Arguments can be routed by name instead of position:

```katnip
motion.goTo(y = 0, x = 0);
```

Handy when a call has several `num` parameters and the order is not obvious.

## Overloading

Two procedures may share a name if their parameter lists differ. Dispatch is resolved by
argument types:

```katnip
proc say(msg: str) -> void { ... }
proc say(msg: str, seconds: num) -> void { ... }

looks.say("hi");
looks.say("hi", 2);
```

This is how the standard library offers `motion.goTo(x, y)` and `motion.goTo(target)` under
one name.

## Methods

A first parameter named `self` makes a procedure callable in receiver position:

```katnip
proc contains(self: list<T>, item: T) -> bool { ... }
```

```katnip
scores.contains(4);          # method form   ✅
list.contains(scores, 4);    # namespace form — type-checks, fails codegen
```

The standard library declares `list`, `dict`, and `str` methods this way.

:::caution
**Use the method form.** The namespace form type-checks and then fails at codegen with
`undeclared list 'list'` — the generator treats the namespace as a variable. See
[Known gaps](/reference/known-gaps/#the-namespace-call-form-for-methods-fails-at-codegen).
:::

## Warp

User procedures run **warped** (without screen refresh) by default, which is usually what
you want — the whole procedure completes in one frame. Override with `@warp`:

```katnip
proc animate(@warp = false) -> void {
    for (i, 10) {
        motion.forward(5);      # now visible frame by frame
    }
}
```

Decorators go **inside the parameter list**, before any parameters. See
[Decorators](/language/decorators/).

:::note
A warped procedure that loops forever will hang the project — the same trap as a
run-without-screen-refresh custom block in Scratch.
:::

## Returning values

Scratch custom blocks cannot return anything. Katnip works around it, and the workaround
it picks depends on your call graph.

Before codegen, the compiler runs **Tarjan's strongly-connected-components algorithm** over
the resolved call graph. Procedures that are not part of a cycle get the cheap strategy;
procedures that are get the correct one.

### `var` — the default for non-recursive procs

The procedure writes its result to a dedicated variable (`double_ret`), then `control_stop`s.
The caller reads the variable. One variable, no overhead.

### `vstack` — for procs in a call cycle

The procedure pushes its result onto a per-proc Scratch list and the caller pops it. That
costs a list operation per call, and it is the only thing that makes recursion return
correct values — a plain return variable would be clobbered by the inner call.

```katnip
proc fib(n: num) -> num {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}
```

`fib` calls itself, so it lands in a cycle, so it gets `vstack`, so it works.

### Choosing explicitly

```katnip
proc thing(@ret = "auto") -> num { ... }     # or "var" or "vstack"
```

`auto` is the default and is almost always right. Forcing `var` on a procedure that *is*
in a cycle is a **hard compile error**, not a warning — its failure mode is silently wrong
values, which is the worst kind.

### Argument reporter kinds

Parameter types decide the Scratch argument shape: `num` → `%n`, `str` → `%s`,
`bool` → `%b`. A `bool` parameter gets a hexagonal slot in the custom block, as you would
expect.

### What cannot be returned

* **Lists and dicts.** Rejected by the analyzer — the frame width is not statically known.
  Mutate a global list instead.
* **Tuples**, in practice. The multi-slot frame is emitted, but a call site reads only the
  first element and there is no destructuring on the receiving side. See
  [Known gaps](/reference/known-gaps/#tuple-returns-read-only-the-first-slot).

## Recursion and `temp`

Return values survive recursion. `temp` variables do **not** — a `temp` is a mangled
global, and the inner call overwrites it.

```katnip
proc bad(n: num) -> num {
    temp half: num = n / 2;      # clobbered by the recursive call below
    if (n <= 1) { return 1; }
    return bad(half) + half;     # `half` is now the inner call's value
}
```

Pass state through parameters and returns in anything that recurses.
