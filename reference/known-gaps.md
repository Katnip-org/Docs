# Known gaps

Katnip's analyzer runs ahead of its code generator. Several features type-check cleanly and
then either fail the build or, in one case, silently produce a wrong answer. A couple of
gaps go the other way — the analyzer refuses something Scratch could express, because the
lowering to reach it does not exist yet.

**Read this page before planning a project.** It is the difference between an afternoon of
building and an afternoon of confusion.

## The four failure modes

| Mode | What you see | Examples |
| --- | --- | --- |
| 🔴 **Build error** | `check` passes, `build` fails loudly | imports, `console.*`, casts, dict methods |
| 🔴 **Check error** | `check` refuses it, with a message | a computed value in an enum slot |
| 🟠 **Silent no-op** | builds, but the code is missing from the `.sb3` | structs |
| ⛔ **Silently wrong** | builds and runs, with a wrong answer | `**` |

The last one is the only genuinely dangerous kind, and there is exactly one instance.

---

## `**` does not work

🔴 **Worst gap on this page.**

```katnip
private x: num = base ** 2;      # compiles, produces an empty literal
```

Scratch has no power block, and Katnip has no `builds` procedure for `**` yet, so the IR
lowers it to an empty literal. **No error is reported.** `**=` has the same gap, and
`math.pow` is a stub with an empty body.

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

For fractional powers, bind `operator_mathop`:

```katnip
proc mathop(@opcode = "operator_mathop", operator: str, num: num) -> num {}
private root: num = mathop("sqrt", 16);
```

---

## Imports do not survive codegen

🔴 The IR walks only the entry file. A call to an imported procedure type-checks and then
fails with `call to unknown proc`.

Everything else about modules works — resolution, the import graph, namespacing,
visibility, cycle detection — but only under `katnip check`.

**Instead:** one file per buildable project. This is the number one item on the roadmap.

---

## Structs do not reach the sb3

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

## No cast to an enum

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

## The `katnip_*` builtins have no codegen

🔴 These resolve to placeholder opcodes with no slot metadata. Using one throws
`no slot metadata` at build time.

| Blocked | Instead |
| --- | --- |
| `console.log` / `warn` / `error` | `looks.say(...)`, or a log list |
| `console.input` | `sensing.ask` + `sensing.answer` |
| `Num()`, `Str()`, `Bool()`, `List()` | `f"{value}"` for `num` → `str`; annotate `any` elsewhere |
| `typeof()` | — |
| `zip()`, `enumerate()`, `range()` **as values** | use them in a `for` header instead — there they are folded into the loop counter |
| every `dict` method | keep a parallel key list |
| `list.merge` | `for (x, other) { self.add(x); }` |
| `motion.getPosition` | bind `motion_xposition` / `motion_yposition` yourself |

---

## Every dict method is unimplemented

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

## `@lower = "yields"` procs are not lowered

🔴 A `yields` procedure both performs an action and produces a value. The IR has no
lowering for the shape. Two stdlib procedures are affected: `list.remove` and
`console.input`.

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

## The namespace call form for methods fails at codegen

🔴 Methods — procedures whose first parameter is `self` — have two call forms. Both
type-check; only the receiver form builds.

```katnip
scores.contains(4);          # ✅
list.contains(scores, 4);    # 🔴 "undeclared list 'list'"
str.contains(name, "at");    # 🔴 "undeclared variable 'str'"
```

Codegen treats the namespace as a variable name. **Use the method form.**

---

## Lists and dicts must be declared at the top level

🔴 Only top-level and sprite-level declarations are lowered. A list or dict declared inside
a proc or a handler produces nothing.

```katnip
proc bad() -> void {
    private working: list<num> = [];   # not lowered
}
```

Scratch has no local lists either, so hoist it to the top level — and remember it is then
genuinely shared, including between clones and recursive calls.

---

## Tuple returns read only the first slot

🟠 The multi-slot return frame is emitted, and the ABI carries the extra slots, but a call
site reads only element one and there is no destructuring on the receiving side.

Tuple *patterns* in a dict `for` loop work fine — that is a different mechanism.

**Instead:** return one value, or write results into globals.

---

## Lists and dicts cannot be returned

🔴 Explicitly rejected by the analyzer — the frame width is not statically known. This one
at least fails at `check` time.

**Instead:** mutate a global list.

---

## Slices do not exist

🔴 `s[1:5:2]` parses and gets a naive type, with no lowering. There is no `str.split`,
`replace`, `toUpper`, or `trim` either.

**Instead:** walk characters with `for (c, s)` and rebuild.

---

## Comments never reach the sb3

🔴 All six comment forms lex correctly, and `NodeBase.comment` exists on the AST — but the
parser discards comment tokens, so nothing is ever written to the sb3 comment map. The
`expanded` / `collapsed` distinction is forward-looking.

The `ignored` forms (`#!` and `#[ ]#`) do work, in that they are dropped at the lexer.

---

## No asset import

🔴 Every sprite gets the same default costume. There is no costume, backdrop, or sound
import. You can `switchCostume("name")`, but the costume has to exist — which means editing
the project after building.

Monitors can be shown and hidden but not positioned or styled.

---

## Statements with nowhere to go are dropped

🟠 Handler, import, and switch placement are all checked. But a statement the IR cannot
place — executable code at the top level, outside any sprite — is silently dropped rather
than reported.

Put executable code inside an event handler.

---

## No `stage` block

🔴 There is no `stage { ... }` declaration. Stage state is implied by top-level variables,
and there is no way to attach a script to the stage itself.

---

## Missing bits of the language

| Missing | Note |
| --- | --- |
| `forever` / `repeat` syntax | IR nodes and codegen exist; no syntax reaches them. Use `while (true)` and `for` |
| `break` / `continue` | Not implemented |
| `switch` fallthrough | Not designed |
| `switch` exhaustiveness over enums | Not checked — always write a `default` |
| User-defined generics | Typevars are a stdlib facility |
| Language server, formatter, source maps | Not started |

---

## The examples that do not build

Only `examples/codegen.knip` is kept building. `example.knip`, `showcase.knip`,
`stdlib.knip`, `oos.knip` and friends are analyzer tests — they use `console.log`, `zip`,
`**`, `self.x = ...`, imports, and syntax that was never implemented.

Do not copy from them. Copy from `codegen.knip`.
