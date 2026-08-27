---
title: "Known gaps"
---

Katnip's analyzer runs ahead of its code generator. Several features type-check cleanly and
then either fail the build or silently produce a wrong answer. A couple of gaps go the
other way — the analyzer refuses something Scratch could express, because the lowering to
reach it does not exist yet.

**Read this page before planning a project.** It is the difference between an afternoon of
building and an afternoon of confusion.

## The four failure modes

| Mode | What you see | Examples |
| --- | --- | --- |
| 🔴 **Build error** | `check` passes, `build` fails loudly | `console.*`, `typeof`, dict methods, `list.merge` |
| 🔴 **Check error** | `check` refuses it, with a message | a computed value in an enum slot |
| 🟠 **Silent no-op** | builds, but the code is missing from the `.sb3` | structs, top-level statements |
| ⛔ **Silently wrong** | builds and runs, with a wrong answer | `**`, slices, `range()` as a value, tuple destructuring |

The last one is the dangerous kind. There are four of them, and they are listed first.

:::tip[What changed recently]
**Imports, the casts, and the `math` functions now build.** If you are working from older
notes, see [Imports build now](#imports-build-now), [Casts build now](#casts-build-now),
and [math and console](/stdlib/math-console/#math). Lists and dicts declared inside a
script or procedure lower too.
:::

---

## Silently wrong

### `**` does not work

⛔ **Worst gap on this page.**

```katnip
private x: num = base ** 2;      # compiles, produces an empty literal
```

Scratch has no power block, and Katnip has no `builds` procedure for `**` yet, so the IR
lowers it to an empty literal. **No error is reported.** `**=` has the same gap.

**Instead:**

```katnip
proc pow(base: num, exp: num) -> num {
    private result: num = 1;
    for (i, exp) {
        result = result * base;
    }
    return result;
}
```

For fractional powers, `math` now wraps `operator_mathop`:

```katnip
private root: num = math.sqrt(16);
private half: num = math.epow(0.5 * math.ln(16));   # 16 ** 0.5
```

---

### Slices lower to an empty string

⛔ `s[1:5:2]` parses and gets a naive type, and the IR emits an **empty literal** in its
place. The build succeeds and the value is wrong.

```katnip
looks.say(name[1:3]);      # says nothing
```

**Instead:** walk characters and rebuild.

```katnip
proc slice(s: str, from: num, to: num) -> str {
    private out: str = "";
    for (i, to) {
        if (i >= from) { out = out + s[i]; }
    }
    return out;
}
```

There is no `str.split`, `replace`, `toUpper`, or `trim` either.

---

### `range()` as a value builds an empty list

⛔ In a `for` header, `range()` is folded into the loop counter and works. Assigned to a
list, it silently produces an **empty list**:

```katnip
public counts: list<num> = range(5);     # builds; `counts` is empty at runtime
```

`zip()` and `enumerate()` used as a value are safer — they fail the build with
`no slot metadata` rather than lying to you.

**Instead:** use all three only in a `for` header, or fill the list yourself.

```katnip
public counts: list<num> = [];

events.onFlag() {
    counts.clear();
    for (i, range(5)) { counts.add(i); }
}
```

---

### Tuple destructuring drops the call

⛔ The multi-slot return frame is emitted, and the ABI carries the extra slots, but there
is no destructuring on the receiving side. A tuple-pattern assignment is skipped
**entirely** — the procedure is never called, and both variables keep their old values:

```katnip
proc bounds() -> (num, num) { return (1, 10); }

(lo, hi) = bounds();     # builds; no call is emitted, lo and hi are unchanged
```

A single-variable assignment from a tuple-returning proc reads only element one.

Tuple *patterns* in a `for` header — `for ((k, v), stock)`, `zip`, `enumerate` — work fine.
That is a different mechanism.

**Instead:** return one value, or write results into globals.

```katnip
public lo: num = 0;
public hi: num = 0;
proc bounds() -> void { lo = 1; hi = 10; }
```

---

### Structs do not reach the sb3

🟠 Structs are **fully analyzed** — construction, defaults, missing and unknown fields,
field types, struct-typed parameters and returns, struct lists with per-field columns, all
checked. And then the IR no-ops struct literals, field reads, and field writes. Nothing
struct-shaped survives.

The build succeeds. The struct code is simply absent.

**Instead:** parallel lists.

```katnip
public point_x: list<num> = [];
public point_y: list<num> = [];
```

---

### Statements with nowhere to go are dropped

🟠 Handler, import, and switch placement are all checked. But a statement the IR cannot
place — executable code at the top level, outside any sprite — is silently dropped rather
than reported.

```katnip
looks.say("hi");        # top level: builds, and is absent from the project
```

Put executable code inside an event handler.

A file with no `sprite` at all is at least reported, as a **warning**: `no sprites
declared, so this builds to an empty project`. Warnings print but do not stop the build.

---

## Fails the build

### The `katnip_*` builtins have no codegen

🔴 These resolve to placeholder opcodes with no slot metadata. Using one throws
`no slot metadata` at build time.

| Blocked | Instead |
| --- | --- |
| `console.log` / `warn` / `error` | `looks.say(...)`, or a log list |
| `console.input` | `sensing.ask` + `sensing.answer` |
| `typeof()` | — |
| `zip()`, `enumerate()` **as a value** | use them in a `for` header, where both fold into the loop counter |
| every `dict` method | keep a parallel key list |
| `list.merge` | `for (x, other) { self.add(x); }` |
| `motion.getPosition` | bind `motion_xposition` / `motion_yposition` yourself |

`Num()`, `Str()` and `Bool()` used to be on this list. They are not any more — see
[Casts build now](#casts-build-now). `List()` was removed from the prelude rather than
fixed; there is no list cast.

---

### Every dict method is unimplemented

🔴 `contains`, `length`, `keys`, `values`, `merge` — all five.

What **does** work, because it is syntax rather than a method: dict literals, `d[key]`
reads, `d[key] = v` writes, compound assignment, and `for ((k, v), d)` iteration.

**Instead**, keep a key list alongside:

```katnip
public stock: dict<str, num> = {};
public stockKeys: list<str> = [];

proc put(key: str, value: num) -> void {
    if (!stockKeys.contains(key)) { stockKeys.add(key); }
    stock[key] = value;
}
```

---

### `@lower = "yields"` procs are not lowered

🔴 A `yields` procedure both performs an action and produces a value. The IR has no
lowering for the shape, and crashes rather than reporting an error — you get an internal
`TypeError: Cannot read properties of undefined (reading 'mangled')`. Two stdlib procedures
are affected: `list.remove` and `console.input`.

**Instead:** for `console.input`, use `sensing.ask` + `sensing.answer`. For `list.remove`,
rebuild the list:

```katnip
proc removeValue(target: num) -> void {
    keep.clear();
    for (s, scores) {
        if (!(s == target)) { keep.add(s); }
    }
    scores.clear();
    for (k, keep) { scores.add(k); }
}
```

---

### The namespace call form for methods fails at codegen

🔴 Methods — procedures whose first parameter is `self` — have two call forms. Both
type-check; only the receiver form builds.

```katnip
scores.contains(4);          # ✅
list.contains(scores, 4);    # 🔴 "undeclared list 'list'"
str.contains(name, "at");    # 🔴 "undeclared variable 'str'"
```

Codegen treats the namespace as a variable name. **Use the method form.**

---

### Imported variables do not cross

🔴 Imported *procedures* and *literal constants* build (see
[Imports build now](#imports-build-now)). Imported **mutable state** does not, in either
direction:

```katnip
# lib.knip
public counter: num = 0;
public shared: list<num> = [1, 2];
public proc bump() -> void { counter += 1; }
```

```katnip
import "./lib.knip";

lib.shared[1];      # 🔴 check: "only members with a literal initializer are supported"
lib.bump();         # 🔴 build: "undeclared variable 'counter'"
```

An imported procedure may take parameters and return a value, but it cannot touch a
variable or list declared in its own module.

**Instead:** keep shared state in the entry file and pass it through parameters and return
values.

---

## Refused by the analyzer

### No cast to an enum

🔴 A *literal* whose value is one of an enum's member values is accepted in an enum slot,
and so is a member reference. A **computed** value of the backing type is not, and there is
no `Enum(x)` escape hatch to force one:

```katnip
pen.setAttr(pen.ColorParam.COLOR, 10);   # ✅ member
pen.setAttr("color", 10);                # ✅ literal, coerced
private attr: str = "color";
pen.setAttr(attr, 10);                   # 🔴 "expects one of its members here, not a computed 'str'"
```

This is a deliberate narrow gap rather than an oversight: the slot is a Scratch *menu*, a
shadow block, so dropping a reporter into it is legal but almost never what you meant. The
diagnostic points at the member form.

**Instead:** branch on the value and pass a literal in each arm.

```katnip
if (mode == 1) { pen.setAttr("color", 10); }
else           { pen.setAttr("saturation", 10); }
```

The six *open* menus — `motion.Target`, `sensing.TouchTarget`, `sensing.DistanceTarget`,
`sensing.ObjectTarget`, `clone.CloneTarget`, `looks.Backdrop` — also list sprite, costume,
and backdrop names, so their parameters keep an `| str` arm and take any string, computed
or not.

---

### Lists and dicts cannot be returned

🔴 Explicitly rejected by the analyzer — the frame width is not statically known. This one
at least fails at `check` time.

**Instead:** mutate a global list.

---

## Not there at all

### Comments never reach the sb3

🔴 All six comment forms lex correctly, and `NodeBase.comment` exists on the AST — but the
parser discards comment tokens, so nothing is ever written to the sb3 comment map. The
`expanded` / `collapsed` distinction is forward-looking.

The `ignored` forms (`#!` and `#[ ]#`) do work, in that they are dropped at the lexer.

---

### No asset import

🔴 Every sprite gets the same default costume. There is no costume, backdrop, or sound
import. You can `switchCostume("name")`, but the costume has to exist — which means editing
the project after building.

Monitors can be shown and hidden but not positioned or styled.

---

### No `stage` block

🔴 There is no `stage { ... }` declaration — `stage { ... }` is a parse error. Stage state
is implied by top-level variables, and there is no way to attach a script to the stage
itself.

---

### Missing bits of the language

| Missing | Note |
| --- | --- |
| `forever` / `repeat` syntax | IR nodes and codegen exist; no syntax reaches them. Use `while (true)` and `for` |
| `break` / `continue` | Not implemented — `break` is reported as an undefined name |
| `switch` fallthrough | Not designed |
| `switch` exhaustiveness over enums | Not checked — always write a `default` |
| User-defined generics | Typevars are a stdlib facility |
| `math.random` / `min` / `max` / `round` | Bind `operator_random` and `operator_round` yourself |
| Language server, formatter, source maps | Not started |

---

## Gaps that have closed

### Imports build now

An imported procedure lowers into every target that calls it, including procedures it calls
in turn, and imported literal constants fold at the call site:

```katnip
# lib.knip
public SIDES: num = 3;
public proc twice(n: num) -> num { return n * 2; }
public proc quad(n: num) -> num { return twice(twice(n)); }
```

```katnip
import "./lib.knip";

sprite Cat {
    events.onFlag() {
        looks.say(f"{lib.quad(2)} {lib.SIDES}");   # builds
    }
}
```

Aliases (`import "./lib.knip" as geo;`) build too. The one thing that does not cross is
mutable module state — see [Imported variables do not cross](#imported-variables-do-not-cross).

### Casts build now

`Num()`, `Str()` and `Bool()` are `@lower = "builds"` procedures. They inline the value
unchanged and cost nothing:

```katnip
private answer: str = sensing.answer();
private n: num = Num(answer);      # builds
```

They are **type-checker assertions, not runtime conversions** — Scratch coerces at runtime
anyway, so `Num("abc")` does not become `0`, it stays `"abc"` in the block tree. Use them to
satisfy the checker where you know better than it does.

`List()` was removed from the prelude, and `typeof()` still has no codegen.

### Lists and dicts declared inside a script or procedure

They lower — the list is cleared and refilled at the declaration site, on every run, rather
than baked into the project file once like a top-level list:

```katnip
events.onFlag() {
    private xs: list<num> = [1, 2, 3];    # builds
    looks.say(f"{xs[1]}");
}
```

### The `math` functions

`math.abs`, `floor`, `ceil`, `sqrt`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `ln`,
`log`, `epow` and the underlying `math.op` all build. `math.pow` was removed rather than
fixed — see [`**` does not work](#-does-not-work).

---

## The examples that do not build

`examples/all.knip` (every feature that lowers, once each) and `examples/codegen.knip` are
kept building, and are the best reference for "does this actually build":

```bash
katnip build examples/all.knip
```

`example.knip`, `typeof.knip`, `oos.knip`, `overload.knip`, `proc.knip`, `showcase.knip`
and `stdlib.knip` are older analyzer tests. They use `console.log`, `typeof`, `math.pow`,
`events.onflag`, and syntax that was never implemented. Do not copy from them.
