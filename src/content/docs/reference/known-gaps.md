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
| 🔴 **Build error** | `check` passes, `build` fails loudly | `console.*`, `typeof`, `dict.contains`, `list.merge`, top-level statements |
| 🔴 **Check error** | `check` refuses it, with a message | a computed value in an enum slot |

A construct the compiler cannot lower stops the build with a message, rather than producing a
project that runs and gives a wrong answer.

---

## Recently closed

### `**`, slices and tuple patterns

```katnip
private area: num = side ** 2;          # also **= and math.pow
looks.say(name[1:3]);                   # 1-based, stop-inclusive; lists too
(lo, hi) = bounds();                    # also (a, b) = (b, a);
```

See [Operators](/language/operators/), [Lists and dicts](/language/collections/#slices) and
[Procedures](/language/procedures/).

### Calling twice in one statement

`f(1) + f(2)` used to read the second result twice. Each call now keeps its own value. The one
remaining limit: a value held across a **recursive** call in the same statement can be
overwritten, so split that statement in two.

### `forever` and `repeat`

Both have source syntax now. See [Control flow](/language/control-flow/#forever).

```katnip
forever { motion.turn(1); }
repeat (4) { motion.forward(10); }
```

### Data files

`import("./levels.csv")` and `import("./scores.json")` load a flat file into a list or dict at
compile time. See
[Loading a list or dict from a file](/language/collections/#loading-a-list-or-dict-from-a-file).

### Decompiling

`katnip decompile game.sb3` writes `.knip` source. Costumes and sounds are not recovered; see
[the CLI page](/toolchain/cli/#decompile) for the limits.

### `math.random`, `math.round` and `math.mod`

These no longer need a hand-written `@opcode` binding.

### Comments inside multi-line statements

A comment between tokens, such as after an element of a multi-line list, no longer causes a
parse error.

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
`log`, `epow` and the underlying `math.op` all build. `math.pow` is back, and is what `**` calls.

---

## Limits to plan around

### `zip()` as a value

🔴 Used as a value, `range()`, `zip()`, `enumerate()`, `dict.keys()` and `dict.values()` all stop
the build. Use them in a `for` header instead, or walk a dict with `for ((k, v), stock)`.

---

### Struct limits

🔴 Structs compile to one Scratch variable (or list) per field, so a struct only works
through its fields.

These fail the build:

* a whole struct inside an interpolated string: `f"{p}"`
* `contains`, `indexOf`, `remove` and `merge` on a `list<Struct>`

These are check errors:

* passing a whole struct where a scalar is expected: `looks.say(p)`
* comparing structs: `p == q`
* constructing a struct declared in an imported module: `geo.Point(x = 1, y = 2)`

**Instead:** work field by field.

```katnip
if (p.x == q.x && p.y == q.y) { ... }
looks.say(f"{p.x}, {p.y}");
```

---

### Statements outside a handler

🔴 Executable code at the top level or directly in a sprite stops the build:

```katnip
looks.say("hi");        # this statement isn't allowed at the top level
```

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
| `dict.contains`, `length`, `merge` | keep a parallel key list |
| `list.merge` | `for (x, other) { self.add(x); }` |
| `motion.getPosition` | bind `motion_xposition` / `motion_yposition` yourself |

`Num()`, `Str()` and `Bool()` used to be on this list. They are not any more — see
[Casts build now](#casts-build-now). `List()` was removed from the prelude rather than
fixed; there is no list cast.

---

### Dict methods are not lowered yet

🔴 `contains`, `length` and `merge` are waiting on codegen, and so are `keys` and `values`, with
they stop the build the same way when assigned to a list.

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
lowering for that shape yet, so the build stops with `@lower = "yields" procs are not lowered
yet`. Two stdlib procedures are affected: `list.remove` and `console.input`.

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

🔴 Imported *procedures* and *values with a literal initializer* build (see
[Imports build now](#imports-build-now)), with the value copied in at compile time. Imported
**mutable state** does not cross:

```katnip
# lib.knip
public counter: num = 0;
public shared: list<num> = [1, 2];
public proc bump() -> void { counter += 1; }
```

```katnip
import "./lib.knip";

lib.shared[1];      # 🔴 check: "only members with a literal initializer are supported"
lib.SIDES = 4;      # 🔴 build: "a value from an imported module is read-only"
lib.bump();         # 🔴 build: "undeclared variable 'counter'"
```

An imported procedure may take parameters and return a value, but it cannot touch a
variable or list declared in its own module. The error above appears for any file importing
`lib`, even one that never calls `bump`.

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
| `break` / `continue` | Not yet — `break` is reported as an undefined name |
| `switch` fallthrough | Not planned |
| `switch` exhaustiveness over enums | Not checked — always write a `default` |
| User-defined generics | Typevars are a stdlib facility |
| `math.min` / `math.max` | Write them with an `if` |
| Optional `-> void` | A procedure must declare its return type, even `void` |
| Language server, formatter, source maps | Later |
| `check` on `costume` and `sound` files | The CLI's `check` does not read them; `build` and the editor do |
| `lower` on projects with assets or data | The CLI's `lower` reports them as missing |

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
