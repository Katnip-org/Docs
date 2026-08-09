# Standard library overview

Katnip's standard library is not compiler magic — it is a set of `.knip` declaration files
bundled into the compiler at build time. Each procedure is an empty body with an
[`@opcode` decorator](../language/decorators.md#opcode) naming the Scratch block it emits:

```katnip
proc forward(@opcode = "motion_movesteps", steps: num) -> void {}
```

That means the standard library is readable, and you can see exactly which Scratch block
any call becomes.

## The namespaces

| Namespace | Covers | Status |
| --- | --- | --- |
| [prelude](prelude.md) | `wait`, `stop`, `len`, `Key`, `true`/`false` — no namespace prefix | 🟢 mostly |
| [events](events.md) | hats, broadcasts | 🟢 |
| [motion](motion.md) | movement, turning, position | 🟢 |
| [looks](looks.md) | say/think, costumes, size, effects, layers | 🟢 |
| [sensing](sensing.md) | touching, mouse, keys, timer, ask/answer | 🟢 |
| [pen](pen.md) | the pen extension | 🟢 |
| [clone](clone.md) | clone lifecycle | 🟢 |
| [list](collections.md#list) | list methods | 🟡 |
| [dict](collections.md#dict) | dict methods | 🔴 |
| [str](collections.md#str) | string methods | 🟡 |
| [math](math-console.md#math) | constants and `pow` | 🟡 |
| [console](math-console.md#console) | `log`, `warn`, `error`, `input` | 🔴 |

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

## The namespaced-enum trap

Read this once and it will save you an afternoon.

Enums declared **inside** a stdlib namespace — `motion.Target`, `looks.GraphicEffect`,
`sensing.DragMode`, and friends — cannot be referenced from user code at all:

```katnip
motion.goTo(motion.Target.RANDOM);   # error: Type 'Target' has no member 'RANDOM'
motion.goTo(Target.RANDOM);          # error: 'Target' is not defined
motion.goTo("_random_");             # ✅ this works
```

Where the parameter type is a union with `str`, pass the string — every value in this
documentation is listed. Where it is not, the procedure is unusable until the gap closes.

Enums declared in the **prelude** have no namespace and work normally:

```katnip
events.onKey(Key.SPACE);           # ✅
stop(StopType.THIS_SCRIPT);        # ✅
```
