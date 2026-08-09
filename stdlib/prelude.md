# prelude

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
| `Key.a` … `Key.z` | *implicit* |

{% hint style="warning" %}
The letter members `Key.a` … `Key.z` have no explicit value, so they fold to the qualified
string `"Key.a"`, which Scratch will not match. For letter keys pass the string directly:

```katnip
sensing.keyPressed("a");        # the parameter accepts Key | str
```

`events.onKey` takes a bare `Key`, so letter keys are not usable there yet.
{% endhint %}

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

See [Operators](../language/operators.md).

## Iteration helpers

```katnip
range(stop: num) -> list<num>                             ✅ in a for header
range(start: num, stop: num, step: num = 1) -> list<num>  ✅ in a for header
```

```katnip
for (n, range(2, 10, 2)) { ... }
```

`range` in a `for` header is folded into the loop counter and never built as a list. That
is the only place it works — `range()` used as a value has no codegen:

```katnip
temp xs: list<num> = range(5);      # ⛔ no slot metadata
```

```katnip
zip(l1: list<T>, l2: list<U>) -> (list<T>, list<U>)     ⛔
enumerate(items: list<T>) -> (list<num>, list<T>)       ⛔
```

Both infer their return types correctly and then fail codegen. Walk by index instead:

```katnip
for (i, names.length()) {
    report(names[i], powers[i]);
}
```

## Casts

```katnip
Num(value: any)  -> num        ⛔
Str(value: any)  -> str        ⛔
Bool(value: any) -> bool       ⛔
List(value: any) -> list<any>  ⛔
typeof(value: any) -> str      ⛔
```

All five resolve to `katnip_*` opcodes with no codegen metadata. Using one throws
`no slot metadata` at build time.

For `num` → `str`, an interpolated string works today and lowers to `join`:

```katnip
temp s: str = f"{count}";
```

Scratch coerces at runtime anyway, so most casts are only about satisfying the type
checker. Where you need to opt out, annotate `any`.
