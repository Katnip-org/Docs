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
| `<` | `operator_lt` |
| `>` | `operator_gt` |
| `<=` | *built* — `not (a > b)` |
| `>=` | *built* — `not (a < b)` |

Scratch has no `<=` or `>=` block. Katnip declares them in the prelude as `builds`
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
literal `start` / `stop` / `step`. It is never built as a list.

## Precedence

Katnip uses a Pratt parser with a binding-power table. Precedence follows the usual
arithmetic-then-comparison-then-logic order:

```
unary  -  !
*  /  %
+  -
<  >  <=  >=
==
&&  ^  !&  !^
||  !|
```

When in doubt, parenthesise. It costs nothing in the output — the block tree is the same
either way.

## `**` does not work

```katnip
private x: num = base ** 2;    # DO NOT USE
```

The `**` operator parses and type-checks, but Scratch has no power block and Katnip has no
`builds` procedure for it yet, so the IR **silently** lowers it to an empty literal. No
error, wrong answer. `math.pow` is a stub with an empty body and has the same problem.

For a whole-number exponent, write the multiplication out or use a loop:

```katnip
proc pow(base: num, exp: num) -> num {
    private result: num = 1;
    for (i, exp) {
        result = result * base;
    }
    return result;
}
```

:::caution
The `result` above is clobbered by recursion — but this `pow` does not recurse, so it
is safe. See [Variables](/language/variables/#a-variable-declared-inside-a-procedure-is-not-a-local).
:::
