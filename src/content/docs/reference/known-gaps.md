---
title: "Known gaps"
---

Katnip builds real, runnable Scratch projects today, and the list of things it cannot do
yet is short and shrinking. The analyzer runs a little ahead of the code generator, so a
few features type-check before they build; a couple go the other way, where the analyzer
holds something back until the lowering exists.

Every entry here comes with something that works instead. Skim it before a big project
and you will not be surprised later.

## How a gap shows up

| Mode | What you see | Examples |
| --- | --- | --- |
| 🔴 **Build error** | `check` passes, `build` fails loudly | `console.*`, `typeof`, dict methods, `list.merge` |
| 🔴 **Check error** | `check` refuses it, with a message | a computed value in an enum slot |
| 🟠 **Silent no-op** | builds, but the code is missing from the `.sb3` | structs, top-level statements |
| ⛔ **Silently wrong** | builds and runs, with a wrong answer | `**`, slices, `range()` as a value, tuple destructuring |

The last row is the one worth memorising. It is four items, listed first so you can check
your code against them in a minute.

---

## Recently closed

### Costumes, sounds and the stage

Sprites declare their own assets, and the stage has a block of its own:

```katnip
stage {
    costume "./assets/sky.svg";
    events.onFlag() { looks.switchBackdrop("sky"); }
}

sprite Cat {
    costume "./assets/cat.svg" as idle;
    sound "./assets/meow.wav";
    events.onFlag() { looks.switchCostume("idle"); }
}
```

Paths are relative to the file; a missing file fails the build. `sprite stage { }` is now
a parse error — use `stage { }`. See [Sprites and events](/language/sprites-and-events/#costumes-and-sounds).

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
fixed — see [`**` is not lowered yet](#-is-not-lowered-yet).

---

## Builds, but not what you meant

### `**` is not lowered yet

⛔ The one to check for first.

```katnip
private x: num = base ** 2;      # compiles, produces an empty literal
```

Scratch has no power block, and Katnip has no `builds` procedure for `**` yet, so the IR
lowers it to an empty literal without reporting anything. `**=` has the same gap.

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

### Slices are not lowered yet

⛔ `s[1:5:2]` parses and gets a type, but the IR emits an empty literal in its place, so the
build succeeds and the value is empty.

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

`str.split`, `replace`, `toUpper` and `trim` are not in the stdlib yet; the same loop
pattern covers them.

---

### `range()` only works in a `for` header

⛔ In a `for` header, `range()` is folded into the loop counter and works. Assigned to a
list, it produces an empty list:

```katnip
public counts: list<num> = range(5);     # builds; `counts` is empty at runtime
```

`zip()` and `enumerate()` used as a value stop the build with `no slot metadata` instead,
so they cannot slip through.

**Instead:** use all three only in a `for` header, or fill the list yourself.

```katnip
public counts: list<num> = [];

events.onFlag() {
    counts.clear();
    for (i, range(5)) { counts.add(i); }
}
```

---

### Tuple destructuring is half built

⛔ The multi-slot return frame is emitted and the ABI carries the extra slots; the receiving
side is the missing half. A tuple-pattern assignment is skipped, so the procedure is not
called and both variables keep their old values:

```katnip
proc bounds() -> (num, num) { return (1, 10); }

(lo, hi) = bounds();     # builds; no call is emitted, lo and hi are unchanged
```

A single-variable assignment from a tuple-returning proc reads only element one.

Tuple *patterns* in a `for` header — `for ((k, v), stock)`, `zip`, `enumerate` — work
fine; that is a different mechanism.

**Instead:** return one value, or write results into globals.

```katnip
public lo: num = 0;
public hi: num = 0;
proc bounds() -> void { lo = 1; hi = 10; }
```

---

### Structs stop at the analyzer

🟠 Structs are fully analyzed — construction, defaults, missing and unknown fields, field
types, struct-typed parameters and returns, struct lists with per-field columns. The IR
does not lower struct literals, field reads or field writes yet, so the build succeeds and
the struct code is left out.

**Instead:** parallel lists.

```katnip
public point_x: list<num> = [];
public point_y: list<num> = [];
```

---

### Top-level statements are dropped

🟠 Handler, import, and switch placement are all checked. A statement the IR cannot place —
executable code at the top level, outside any sprite — is dropped rather than reported.

```katnip
looks.say("hi");        # top level: builds, and is absent from the project
```

Put executable code inside an event handler.

A file with no `sprite` at all gets a warning: `no sprites declared, so this builds to an
empty project`. Warnings print but do not stop the build.

---

## Stops at build time

These fail loudly with a message, so there is nothing to hunt for.

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

### Dict methods are not lowered yet

🔴 `contains`, `length`, `keys`, `values` and `merge` are waiting on codegen.

Everything that is syntax rather than a method already works: dict literals, `d[key]`
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
lowering for that shape yet, so the build stops with an internal
`TypeError: Cannot read properties of undefined (reading 'mangled')` instead of a tidy
message. Two stdlib procedures are affected: `list.remove` and `console.input`.

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

Codegen treats the namespace as a variable name. Use the method form.

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

## Held back by the analyzer, on purpose

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

This is deliberate: the slot is a Scratch *menu*, a
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

🔴 Rejected at `check` time, because the frame width is not statically known.

**Instead:** mutate a global list.

---

## Not started yet

### Comments stay in the source

🔴 All six comment forms lex correctly, and `NodeBase.comment` exists on the AST. The
parser drops comment tokens for now, so nothing is written to the sb3 comment map yet. The
`expanded` / `collapsed` distinction is there for when it is.

The `ignored` forms (`#!` and `#[ ]#`) do work, in that they are dropped at the lexer.

---

### Monitor layout

🔴 Monitors can be shown and hidden but not positioned or styled.

---

### On the roadmap

| Feature | Note |
| --- | --- |
| `forever` / `repeat` syntax | IR nodes and codegen exist; no syntax reaches them. Use `while (true)` and `for` |
| `break` / `continue` | Not yet — `break` is reported as an undefined name |
| `switch` fallthrough | Not planned |
| `switch` exhaustiveness over enums | Not checked — always write a `default` |
| User-defined generics | Typevars are a stdlib facility |
| `math.random` / `min` / `max` / `round` | Bind `operator_random` and `operator_round` yourself |
| Language server, formatter, source maps | Later |

---


## Which examples to learn from

`examples/all.knip` (every feature that lowers, once each), `examples/assets.knip` and
`examples/codegen.knip` are kept building, and are the best reference for "does this
actually build":

```bash
katnip build examples/all.knip
```

`example.knip`, `typeof.knip`, `oos.knip`, `overload.knip`, `proc.knip`, `showcase.knip`
and `stdlib.knip` are older analyzer tests from before codegen existed. They use
`console.log`, `typeof`, `math.pow` and `events.onflag`, so treat them as history rather
than a template.
