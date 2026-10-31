---
title: "Operators and expressions"
---

## Arithmetic

| Operator | Meaning | Scratch block |
| --- | --- | --- |
| `+` | add, or join strings | `operator_add` / `operator_join` |
| `-` | subtract | `operator_subtract` |
| `*` | multiply | `operator_multiply` |
| `/` | divide | `operator_divide` |
| `%` | modulo | `operator_mod` |
| `-x` | negate | `operator_subtract` from 0 |

```katnip
private total: num = (a + b) * 2 % 10;
```

## Comparison

| Operator | Scratch block |
| --- | --- |
| `==` | `operator_equals` |
| `!=` | *built*: `not (a == b)` |
| `<` | `operator_lt` |
| `>` | `operator_gt` |
| `<=` | *built* — `not (a > b)` |
| `>=` | *built* — `not (a < b)` |

Scratch has no `!=`, `<=` or `>=` block. Katnip declares them in the prelude as `builds`
procedures and inlines the body at every use site, so `score <= 50` becomes a `not`
wrapping a `>` — a nested reporter, not a procedure call.

## Logic

| Operator | Meaning | How |
| --- | --- | --- |
| `&&` | and | `operator_and` |
| `\|\|` | or | `operator_or` |
| `!` | not | `operator_not` |
| `^` | xor | *built* — `not (a == b)` |
| `!&` | nand | *built* — `not (a && b)` |
| `!\|` | nor | *built* — `not (a \|\| b)` |
| `!^` | xnor | *built* — `a == b` |

```katnip
if ((where >= 1) ^ (total <= 2)) {
    looks.say("exactly one");
}
```

Every logic operator needs `bool` operands, the same as `!`. Scratch would quietly treat
`0`, `""` and `"false"` as false and everything else as true, but Katnip asks you to say
what you mean:

```katnip
if (lives && ready) { ... }       # error, if lives is a num
if (lives > 0 && ready) { ... }   # ✅
```

Both sides are always evaluated. There is no short-circuiting, because Scratch's `and` and
`or` blocks evaluate both inputs.

## Boolean shape coercion

Scratch distinguishes round reporter slots from hexagonal boolean slots, and will not let
a round block sit in a hexagonal one. Katnip handles this for you:

* a round reporter entering a boolean slot is wrapped automatically
* a literal in a boolean slot becomes a comparison

So you can write the natural thing and the compiler produces a shape Scratch accepts.

## Strings

`+` on strings lowers to `operator_join`:

```katnip
private label: str = "score: " + name;
```

### Interpolated strings

Prefix a string with `f` and put expressions in `{}`:

```katnip
looks.say(f"{name} scored {score}", 1);
```

This folds into a right-nested `join` chain. It is also, today, the most practical way to
turn a `num` into a `str`, because the `Str()` cast is not lowered yet:

```katnip
private s: str = f"{count}";
```

An interpolation is a full expression, and it may contain strings — of either quote style,
and f-strings of their own. The lexer keeps a stack of string frames, so nesting resumes
the outer string correctly:

```katnip
looks.say(f"{countChar("banana", "a")}");     # ✅
looks.say(f"{countChar('banana', 'a')}");     # ✅
looks.say(f"outer {f"inner {name}"} end");    # ✅
```

An **unterminated** string — a missing closing quote, or a `{` interpolation never closed —
is reported as `Unterminated string literal` at the position the string opened, rather than
swallowing the rest of the file.

### String indexing and length

```katnip
private first: str = greeting[1];      # operator_letter_of — 1-based
private n: num = len(greeting);        # operator_length
private has: bool = greeting.contains("at");
```

Scratch strings are **1-indexed**, and so are Katnip's.

## Compile-time folding

Two things are resolved before any block is emitted:

**Enum members** fold to constants:

```katnip
private pick: Fruit = Fruit.banana;    # the literal "Fruit.banana"
private side: Team = Team.red;         # the literal "R"
```

**Namespace constants** fold to their literal value:

```katnip
private turns: num = math.pi * 2;      # 3.141592653589793 * 2
```

`range()` in a `for` header is folded into the loop counter, with constant folding on
literal `start` / `stop` / `step`. It is never built as a list. Outside a `for` header it
stops the build.

## Precedence

Katnip uses a Pratt parser with a binding-power table. Precedence follows the usual
arithmetic-then-comparison-then-logic order:

```
unary  -  !
*  /  %
+  -
<  >  <=  >=
==  !=
&&  ^  !&  !^
||  !|
```

Every binary operator is **left-associative**, so `10 - 3 - 2` is `(10 - 3) - 2`. The one
exception is `**`, which binds to the right.

When in doubt, parenthesise. It costs nothing in the output — the block tree is the same
either way.

## Powers

```katnip
private x: num = base ** 2;
x **= 3;
```

Scratch has no power block, so what `**` becomes depends on the exponent. It is right-associative,
so `2 ** 3 ** 2` is `512`.

| You write | You get |
| --- | --- |
| `2 ** 3` | the literal `8`, computed at compile time |
| `x ** 0`, `x ** 1` | `1`, `x` |
| `x ** 2`, `x ** 3` | `x * x`, `x * x * x` |
| `x ** 0.5` | the `sqrt` block |
| anything else | a call to [`math.pow`](/stdlib/math-console/#mathpow-) |

When multiplying, a base that is more than a plain variable is computed once into a temporary
variable first, so `math.random(1, 6) ** 2` squares a single roll.
