# Types

Every expression in Katnip has a type, and the compiler checks them before emitting a
single block. Scratch itself has no types at all — it coerces everything at runtime — so
this whole layer exists purely at compile time and costs nothing in the output.

## Primitives

| Type | Holds | Scratch equivalent |
| --- | --- | --- |
| `num` | numbers, integer or decimal | a value in a number slot |
| `str` | text | a value in a text slot |
| `bool` | `true` / `false` | a hexagonal boolean slot |
| `void` | nothing; a proc's "returns no value" | a stack block |
| `any` | anything; opts out of checking | — |

```katnip
temp count: num = 3;
temp name: str = "Katnip";
temp ready: bool = true;
```

`true` and `false` are declared in the prelude, not keywords. They exist because Scratch
has no boolean literal: `true` is `"true" == "true"` and `false` is `"false" == ""`.

## Collections

```katnip
public scores: list<num> = [3, 1, 4, 1, 5];
public stock: dict<str, num> = {"apple": 2, "banana": 5};
```

`list<T>` is a Scratch list. `dict<K, V>` is a Katnip invention backed by *two* Scratch
lists — `stock_keys` and `stock_vals` — kept in step.

Full detail in [Lists and dicts](collections.md).

## Tuples

A fixed-length, positionally-typed group:

```katnip
temp pair: (num, num) = ...;
temp columns: (list<str>, list<num>) = zip(names, powers);
```

Tuple types are checked structurally — `(num, num)` and `(num, num)` are the same type no
matter where they were written. They are used for multi-value returns and for the
`(key, value)` binding in a dict `for` loop.

{% hint style="warning" %}
You cannot destructure a tuple returned from a procedure yet, and a call site reads only
the first element. See [Known gaps](../reference/known-gaps.md#tuple-returns-read-only-the-first-slot).
{% endhint %}

## Unions

A value that may be one of several types, written with `|`:

```katnip
proc goTo(position: Target | str) -> void {}
```

Assignability works in both directions: a `str` fits a `Target | str` parameter, and a
`Target | str` fits a `str` parameter only if every member is assignable.

The standard library uses unions to let you pass either a named target or a raw string:

```katnip
motion.goTo("_random_");         # str arm
sensing.touching("_edge_");      # str arm
clone.create("_myself_");        # str arm
```

## Enums

Nominal, not structural — two enums that share a member name never compare equal.

```katnip
enum Fruit { apple, banana, cherry }
enum Team { red = "R", blue = "B" }
```

A literal that matches one of an enum's member values is assignable to that enum, so
`temp t: Team = "R";` and `temp t: Team = Team.red;` mean the same thing. A *computed*
value of the backing type is not — see [Enums and structs](enums-and-structs.md#literal-coercion).

## Structs

Nominal record types with named fields:

```katnip
struct Point { x: num, y: num }
```

{% hint style="danger" %}
Structs are fully analyzed and **not lowered**. Nothing struct-shaped survives to the
`.sb3`. See [Known gaps](../reference/known-gaps.md#structs-do-not-reach-the-sb3).
{% endhint %}

## Inference

An annotation is optional whenever there is an initializer to infer from:

```katnip
temp count = 3;              # num
temp name = "Katnip";        # str
temp scores = [3, 1, 4];     # list<num>
```

Annotate when you want the compiler to hold you to something:

```katnip
temp scores: list<num> = [];   # otherwise the element type is open
```

Procedure parameters and return types are **always** annotated. There is no inference
across a procedure boundary.

## Generics in the standard library

The stdlib declares typevars `T`, `K`, and `V`, which bind from the receiver and the
arguments at each call:

```katnip
temp fighters: list<str> = ["Ember", "Splash"];

fighters.contains("Ember");   # T binds to str  -> bool
fighters.length();            # T binds to str  -> num
zip(fighters, powers);        # -> (list<str>, list<num>)
enumerate(fighters);          # -> (list<num>, list<str>)
```

You cannot declare your own generic procedures — typevars are a stdlib facility.

## Type conversion

Katnip does *not* silently convert. `num` into a `str` slot is an error, and the casts
that would fix it are declared but not yet lowered:

```katnip
temp s: str = Str(42);   # type-checks, then fails at codegen
```

Until they land, use an interpolated string, which lowers to `join` and produces a `str`:

```katnip
temp s: str = f"{42}";   # works today
```
