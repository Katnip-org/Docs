# Decorators

Decorators configure a procedure. They go **inside the parameter list**, before any
parameters:

```katnip
proc wait(@opcode = "control_wait", secs: num) -> void {}
proc animate(@warp = false) -> void { ... }
proc onFlag(@opcode = "event_whenflagclicked", @hat) -> void {}
```

A decorator with no `=` is treated as `true`, which is why `@hat` and `@warp` work bare.

Most decorators exist so the **standard library** can describe Scratch's block set in
Katnip itself — the stdlib is a set of `.knip` declaration files, not compiler
special-cases. You will mostly use `@warp` and occasionally `@ret`.

## `@warp`

Runs the procedure without screen refresh.

```katnip
proc fast(@warp) -> void { ... }        # explicit; this is also the default
proc slow(@warp = false) -> void { ... }
```

User procedures are warped **by default**. Set `@warp = false` when you want the body to
animate frame by frame.

## `@ret`

Picks the return strategy: `"auto"` (default), `"var"`, or `"vstack"`.

```katnip
proc fib(@ret = "vstack", n: num) -> num { ... }
```

`auto` runs a Tarjan SCC pass over the call graph and picks correctly. Forcing `"var"` on a
procedure that is in a call cycle is a **hard error**, because the failure mode is silently
wrong values. See [Returning values](procedures.md#returning-values).

## `@opcode`

Binds the procedure to a raw Scratch opcode. The body is empty — the call site emits that
block directly.

```katnip
proc forward(@opcode = "motion_movesteps", steps: num) -> void {}
```

This is how every stdlib procedure works. You can use it to reach a Scratch block the
stdlib has not wrapped, but you are on your own: codegen needs slot metadata for the
opcode, and throws `no slot metadata` if it does not have it.

## `@hat`

Marks a procedure usable **only** as an event handler.

```katnip
proc onFlag(@opcode = "event_whenflagclicked", @hat) -> void {}
```

Misuse is reported in both directions: calling a hat like a normal procedure is an error,
and using a normal procedure as a handler is too.

## `@lower`

Chooses how a procedure is lowered. One of:

| Value | Meaning |
| --- | --- |
| `reporter` | emits a reporter block (a value) |
| `command` | emits a stack block (a statement) |
| `userproc` | emits a Scratch custom block — the default for your procs |
| `builds` | inlines the body expression at every use site |
| `yields` | *accepted but not lowered* |

`builds` is the interesting one. It is how Katnip provides operators Scratch has no block
for — the body is a single expression that gets inlined as a nested reporter at each use,
rather than becoming a procedure call:

```katnip
proc lte(@lower = "builds", @operator = "<=", a: any, b: any) -> bool {
    return !(a > b);
}
```

`a <= b` therefore compiles to `not (a > b)` in place.

## `@operator`

Binds a `builds` procedure to a binary operator, so the IR routes that operator through it.

```katnip
proc xor(@lower = "builds", @operator = "^", a: bool, b: bool) -> bool {
    return !(a == b);
}
```

The prelude uses this for `<=`, `>=`, `^`, `!&`, `!|`, and `!^`.

## Decorators you may see but should not use

Some older examples show `@proccode`, `@doc` and `@constants`. They parse — any identifier
is accepted as a decorator name — but nothing reads them. They have no effect.
