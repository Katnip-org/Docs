---
title: "prelude"
---

The prelude has **no namespace prefix**. Everything here is available as a bare name.

## Control

```katnip
wait(secs: num) -> void                              ✅
stop(stop_option: StopType = StopType.ALL) -> void   ✅
```

```katnip
wait(0.5);
stop(StopType.THIS_SCRIPT);
```

### `StopType`

| Member | Value |
| --- | --- |
| `StopType.ALL` | `"all"` |
| `StopType.THIS_SCRIPT` | `"this script"` |
| `StopType.OTHER_SCRIPTS_IN_SPRITE` | `"other scripts in sprite"` |

## Constants

```katnip
public true: bool
public false: bool
```

Scratch has no boolean literal, so these are declared rather than lexed: `true` is
`"true" == "true"` and `false` is `"false" == ""`.

## `Key`

Used by `events.onKey` and `sensing.keyPressed`.

| Member | Value |
| --- | --- |
| `Key.SPACE` | `"space"` |
| `Key.LEFT_ARROW` | `"left arrow"` |
| `Key.RIGHT_ARROW` | `"right arrow"` |
| `Key.UP_ARROW` | `"up arrow"` |
| `Key.DOWN_ARROW` | `"down arrow"` |
| `Key.ANY` | `"any"` |
| `Key.NUM_0` … `Key.NUM_9` | `"0"` … `"9"` |
| `Key.a` … `Key.z` | `"a"` … `"z"` |

The letter members have no explicit value. Because `Key` is a stdlib enum, they fold to the
bare member name — `Key.a` is `"a"`, which is exactly what the Scratch field wants — so
both forms work everywhere:

```katnip
events.onKey(Key.a) { ... }
events.onKey("a") { ... }               # identical
sensing.keyPressed(Key.UP_ARROW);
sensing.keyPressed("up arrow");         # identical
```

:::caution
`Key` is the whole keyboard menu, so a literal is checked against it. `"ctrl"` or `"A"` is
an error listing every key. Both parameters are a bare `Key` — a computed string is not
accepted; see [Known gaps](/reference/known-gaps/#no-cast-to-an-enum).
:::

## Strings and variables

```katnip
len(input: str) -> num                  ✅   # operator_length
showVariable(variable: any) -> void     ✅
hideVariable(variable: any) -> void     ✅
```

`showVariable` and `hideVariable` need a **plain variable reference**, not an expression —
the Scratch block takes a variable field, not an input.

```katnip
showVariable(score);            # ✅
showVariable(score + 1);        # ⛔
```

## Operator procedures

These exist so `<=`, `>=`, `^`, `!&`, `!|` and `!^` have something to compile to. You never
call them by name; the IR routes the operator through them and inlines the body.

```katnip
nand(a: bool, b: bool) -> bool     # !&
nor (a: bool, b: bool) -> bool     # !|
xnor(a: bool, b: bool) -> bool     # !^
xor (a: bool, b: bool) -> bool     # ^
lte (a: any,  b: any)  -> bool     # <=
gte (a: any,  b: any)  -> bool     # >=
```

See [Operators](/language/operators/).

## Iteration helpers

```katnip
range(stop: num) -> list<num>                             ✅ in a for header
range(start: num, stop: num, step: num = 1) -> list<num>  ✅ in a for header
zip(l1: list<T>, l2: list<U>) -> (list<T>, list<U>)       ✅ in a for header
enumerate(items: list<T>) -> (list<num>, list<T>)         ✅ in a for header
```

```katnip
for (n, range(2, 10, 2)) { ... }
for ((name, power), zip(names, powers)) { ... }
for ((i, name), enumerate(names)) { ... }
```

All three fold into the loop counter and never build a list or tuple. `range` is 1-based
and stop-inclusive, like Scratch's own counter — `range(5)` is `1 2 3 4 5`. That `for`
header is the only place any of them work. Used as a plain value they all infer their
return type correctly and then go wrong, in two different ways:

```katnip
private paired: (list<str>, list<num>) = zip(names, powers);   # ⛔ no slot metadata
private tagged: (list<num>, list<str>) = enumerate(names);     # ⛔ no slot metadata
public  xs: list<num> = range(5);                              # ⛔ builds, and xs is EMPTY
```

`zip` and `enumerate` fail the build. `range` does not — it silently produces an empty
list, which is the more dangerous of the two. Walk by index instead if you need one outside
a `for` header:

```katnip
for (i, names.length()) {
    report(names[i], powers[i]);
}
```

## Casts

```katnip
Num(value: any)  -> num        ✅
Str(value: any)  -> str        ✅
Bool(value: any) -> bool       ✅
typeof(value: any) -> str      ⛔
```

The three casts are `@lower = "builds"` procedures whose body is the value itself, so they
**inline the value unchanged** and cost nothing in the output:

```katnip
private answer: str = sensing.answer();
private n: num = Num(answer);         # emits the `answer` reporter, nothing around it
```

That makes them **type-checker assertions, not runtime conversions.** Scratch coerces at
runtime anyway; `Num("abc")` does not become `0`, it stays `"abc"` in the block tree. Use a
cast to tell the checker you know what a value is, not to change it.

For `num` → `str`, an interpolated string also works and lowers to a real `join`:

```katnip
private s: str = f"{count}";
```

`typeof` still resolves to a `katnip_*` opcode with no codegen metadata and throws
`no slot metadata` at build time. `List()` was removed from the prelude — there is no list
cast, and none is needed, since a `list<T>` annotation is checked on the declaration.
