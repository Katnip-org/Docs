---
title: "Standard library overview"
---

Katnip's standard library is not compiler magic — it is a set of `.knip` declaration files
bundled into the compiler at build time. Each procedure is an empty body with an
[`@opcode` decorator](/language/decorators/#opcode) naming the Scratch block it emits:

```katnip
proc forward(@opcode = "motion_movesteps", steps: num) -> void {}
```

That means the standard library is readable, and you can see exactly which Scratch block
any call becomes.

## The namespaces

| Namespace | Covers | Status |
| --- | --- | --- |
| [prelude](/stdlib/prelude/) | `wait`, `stop`, `len`, `Key`, `true`/`false`, casts — no namespace prefix | 🟢 mostly |
| [events](/stdlib/events/) | hats, broadcasts | 🟢 |
| [motion](/stdlib/motion/) | movement, turning, position | 🟢 |
| [looks](/stdlib/looks/) | say/think, costumes, size, effects, layers | 🟢 |
| [sensing](/stdlib/sensing/) | touching, mouse, keys, timer, ask/answer | 🟢 |
| [pen](/stdlib/pen/) | the pen extension | 🟢 |
| [clone](/stdlib/clone/) | clone lifecycle | 🟢 |
| [list](/stdlib/collections/#list) | list methods | 🟡 |
| [dict](/stdlib/collections/#dict) | dict methods | 🔴 |
| [str](/stdlib/collections/#str) | string methods | 🟡 |
| [math](/stdlib/math-console/#math) | constants, `random`, `round`, `mod`, and `operator_mathop` wrapped per operation | 🟢 |
| [console](/stdlib/math-console/#console) | `log`, `warn`, `error`, `input` | 🔴 |

🟢 reaches real Scratch blocks · 🟡 partly · 🔴 type-checks but fails the build

## Reading these pages

Each page lists signatures as declared. A ✅ means it compiles all the way to a `.sb3`
today; a ⛔ means it type-checks and then fails, with a note on what to write instead.

## Two calling forms

Anything whose first parameter is named `self` is a **method**, callable either way:

```katnip
scores.contains(4);           # method form     ✅
list.contains(scores, 4);     # namespace form  ⛔ fails at codegen
```

Both type-check, but only the **method form** builds today — the namespace form makes
codegen look for a variable called `list`. Use the receiver form throughout.

## Passing a menu value

Lots of stdlib procedures take an enum, because the Scratch block behind them has a
dropdown. There are two ways to write one, and they compile to the same blocks:

```katnip
motion.setRotationStyle(motion.RotationStyle.LEFT_RIGHT);   # the member
motion.setRotationStyle("left-right");                      # a literal that matches it
```

A literal that misses is an error listing the members, with a did-you-mean. Every page here
gives the full member table so you can use either style.

Enums declared inside a namespace stay **out of global scope**, so reach them through the
namespace. Prelude enums have no namespace and are bare names:

```katnip
motion.Target.RANDOM      # ✅
Target.RANDOM             # error: 'Target' is not defined
Key.SPACE                 # ✅ prelude
stop(StopType.ALL);       # ✅ prelude
```

:::caution
Only a **literal** coerces. A variable or a computed string is rejected — the slot is a
Scratch menu, a shadow block, so a reporter there is almost always a mistake, and there is
no cast to override it. See [Known gaps](/reference/known-gaps/#no-cast-to-an-enum).

The exception is the six menus that also list sprite, costume, and backdrop names —
`Target`, `TouchTarget`, `DistanceTarget`, `ObjectTarget`, `CloneTarget`, `Backdrop`. Those
parameters are typed `Enum | str` and take any string, computed or not.
:::
