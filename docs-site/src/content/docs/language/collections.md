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
`scores.remove(i)` and `scores.merge(other)` are declared but **not lowered**. To delete an
element, rebuild the list; see [Known gaps](/reference/known-gaps/).
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
`katnip_*` opcodes that **have no codegen** yet. They type-check and then fail the build.

What works today: literals, `d[key]` reads, `d[key] = v` writes, and dict `for` loops.
:::

## Where a collection can be declared

Only at the **top level** or in a **sprite body**. A list or dict declared inside a proc or
a handler is not lowered:

```katnip
proc bad() -> void {
    private working: list<num> = [];   # NOT lowered
}

public working: list<num> = [];     # do this instead
```

Scratch has no local lists either, so this is less of a restriction than it sounds — but
it does mean shared scratch space is genuinely shared, including across clones and
recursive calls.

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

## Strings behave like sequences

```katnip
private c: str = greeting[1];            # 1-based, operator_letter_of
private n: num = len(greeting);
private has: bool = greeting.contains("at");

for (letter, greeting) { ... }
```

There is no slicing. `s[1:5:2]` parses and gets a naive type, but has no lowering.

## Generic helpers

```katnip
private paired: (list<str>, list<num>) = zip(names, powers);
private tagged: (list<num>, list<str>) = enumerate(names);
```

The types infer correctly — `T` binds from the arguments. Used **as a value** like this,
both are `katnip_*` builtins with no codegen, so this type-checks and then fails the
build. Use them directly in a `for` header instead, where both fold into the loop counter
and never build anything:

```katnip
for ((name, power), zip(names, powers)) {
    report(name, power);
}
```

See [Control flow](/language/control-flow/#a-zip-or-enumerate-pair).
