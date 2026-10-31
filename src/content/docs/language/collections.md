---
title: "Lists and dicts"
---

## Lists

`list<T>` is a Scratch list, with a type on the elements.

```katnip
public scores: list<num> = [3, 1, 4, 1, 5];
public names: list<str> = ["Ember", "Splash"];
public empty: list<num> = [];
```

:::caution
Put a space before the `=`. The lexer reads `>=` as one operator, so `list<num>= [1]` is a
parse error, `Expected ',' or '>'`. The same goes for `dict<K, V>`.
:::

A trailing comma after the last element is allowed, in list and dict literals alike:

```katnip
public names: list<str> = [
    "Ember",
    "Splash",
];
```

### Indexing

Scratch lists are **1-indexed**, and so are Katnip's.

```katnip
private first: num = scores[1];
scores[2] = scores[2] + 1;
scores[2] += 1;              # compound assignment through an index
```

### Methods

```katnip
scores.add(7);                       # append
scores.clear();                      # delete all
private n: num = scores.length();
private has: bool = scores.contains(4);
private at: num = scores.indexOf(5);    # 0 if absent
scores.show();                       # show the list monitor
scores.hide();
```

Every method also has a namespace form — `list.contains(scores, 4)` — but it does not build
today; codegen looks for a variable named `list`. Use the receiver form.

:::caution
`scores.remove(i)` and `scores.merge(other)` are declared but **not lowered** — `merge`
fails with `no slot metadata`, and `remove` with `@lower = "yields" procs are not lowered
yet`. To delete an element, rebuild the list; see [Known gaps](/reference/known-gaps/).
:::

### Iterating

```katnip
for (s, scores) {
    total += s;
}
```

## Dicts

`dict<K, V>` has no Scratch equivalent. Katnip backs each dict with **two parallel Scratch
lists** — for `stock`, they are `stock_keys` and `stock_vals` — and keeps their indices in
step.

```katnip
public stock: dict<str, num> = {"apple": 2, "banana": 5};
```

### Reading and writing

```katnip
private apples: num = stock["apple"];
stock["cherry"] = 7;        # key missing → appended
stock["apple"] = 3;         # key present → replaced in place
stock["apple"] += 1;
```

A read resolves the key column to an index, then reads the value column at that index.

### Iterating

```katnip
for ((name, count), stock) {
    report(name, count);
}
```

The `(name, count)` tuple pattern walks both columns together.

:::danger
`dict.contains`, `dict.length`, `dict.keys`, `dict.values` and `dict.merge` all resolve to
`katnip_*` opcodes that **have no codegen** yet. They type-check and then fail the build,
except that assigning `keys()` or `values()` to a list builds and leaves it **empty**.

What works today: literals, `d[key]` reads, `d[key] = v` writes, and dict `for` loops.
:::

### Where a list can be declared

Top level, sprite level, and inside a script or procedure all lower. The difference is
*when* the contents arrive: a top-level list with all-literal contents is baked into the
project file, while one declared inside a script is cleared and refilled at that point on
every run.

```katnip
events.onFlag() {
    private xs: list<num> = [1, 2, 3];   # clear, then three `add` blocks, right here
    looks.say(f"{xs[1]}");
}
```

There is still one Scratch list behind it, shared by every run of that script — Scratch has
no local lists, so a declaration inside a body is a placement, not a scope.

## How literals reach the project

If every element is a literal, the contents are **baked into the project file** and are
present the moment the project loads:

```katnip
public scores: list<num> = [3, 1, 4, 1, 5];
```

If any element needs a block to compute, the whole list is instead **rebuilt by a
green-flag script**:

```katnip
public roster: list<num> = [1, double(4), 9];
```

That distinction matters when another green-flag script reads the list — Scratch does not
order concurrent scripts for you. If you depend on it, broadcast after the rebuild rather
than racing it.

## Loading a list or dict from a file

`import("./file")` with a `.csv` or `.json` path reads the file at compile time and acts as
if you had typed the literal yourself. The path is relative to the source file, and a missing
or malformed file is an error reported at the path.

```katnip
private levels: list<num> = import("./levels.csv");
private scores: dict<str, num> = import("./scores.json");
private names = import("./names.csv");
```

| File | Must be | Becomes |
| --- | --- | --- |
| `.csv` | a single row or a single column | a list |
| `.json` | a flat array | a list |
| `.json` | a flat object | a dict |

JSON values must be strings, numbers or booleans, so a nested array or object is an error, and
so is a CSV grid. CSV cells that look like numbers become numbers, quoted cells keep their
whitespace, and blank lines are skipped.

Data files are separate from the module form, `import "./lib.knip";`, which has no parentheses.
Data can be loaded in an imported module too; the path is then relative to that module.

## Strings behave like sequences

```katnip
private c: str = greeting[1];            # 1-based, operator_letter_of
private n: num = len(greeting);
private has: bool = greeting.contains("at");

for (letter, greeting) { ... }
```

There is no slicing. `s[1:5:2]` parses and gets a naive type, and then lowers to an **empty
string** — it builds, and the value is wrong. See
[Known gaps](/reference/known-gaps/#slices-are-not-lowered-yet).

## Generic helpers

```katnip
private paired: (list<str>, list<num>) = zip(names, powers);
private tagged: (list<num>, list<str>) = enumerate(names);
```

The types infer correctly — `T` binds from the arguments. Used **as a value** like this,
both are `katnip_*` builtins with no codegen, so this type-checks and then fails the build
with `no slot metadata`. `range()` as a value is worse: it builds, and produces an **empty
list**.

Use all three directly in a `for` header instead, where they fold into the loop counter and
never build anything:

```katnip
for ((name, power), zip(names, powers)) {
    report(name, power);
}
```

See [Control flow](/language/control-flow/#a-zip-or-enumerate-pair).
