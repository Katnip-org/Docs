---
title: "list, dict, str"
---

These three namespaces declare **methods** — procedures whose first parameter is named
`self`. Both call forms type-check, but only one builds:

```katnip
scores.contains(4);           # method form     ✅
list.contains(scores, 4);     # namespace form  ⛔ "undeclared list 'list'"
```

Use the method form everywhere.

Language-level syntax for these types is in
[Lists and dicts](/language/collections/); this page is the API surface.

## list

```katnip
scores.add(item: T) -> void        ✅   # data_addtolist
scores.contains(item: T) -> bool   ✅   # data_listcontainsitem
scores.length() -> num             ✅   # data_lengthoflist
scores.clear() -> void             ✅   # data_deletealloflist
scores.indexOf(item: T) -> num     ✅   # data_itemnumoflist
scores.show() -> void              ✅   # show the list monitor
scores.hide() -> void              ✅

scores.remove(idx: num) -> T       ⛔   # a `yields` proc — not lowered
scores.merge(addition: list<T>)    ⛔   # katnip_list_merge — no codegen
```

```katnip
public scores: list<num> = [3, 1, 4];

proc tally() -> void {
    scores.add(7);
    temp n: num = scores.length();
    temp where: num = scores.indexOf(4);      # 0 if absent
    if (scores.contains(1)) { ... }
}
```

`T` binds from the receiver, so `scores.contains("x")` on a `list<num>` is a type error.

### Working around `remove`

`remove` is declared `@lower = "yields"` — it both mutates and returns, which the IR has no
lowering for. Rebuild instead:

```katnip
public scores: list<num> = [];
public keep: list<num> = [];

proc removeValue(target: num) -> void {
    keep.clear();
    for (s, scores) {
        if (!(s == target)) { keep.add(s); }
    }
    scores.clear();
    for (k, keep) { scores.add(k); }
}
```

### Working around `merge`

```katnip
for (item, other) {
    scores.add(item);
}
```

## dict

:::danger
**Every dict method is unimplemented.** All five resolve to `katnip_*` opcodes with no
codegen metadata; they type-check and then fail the build.
:::

```katnip
stock.contains(key: K) -> bool     ⛔
stock.length() -> num              ⛔
stock.keys() -> list<K>            ⛔
stock.values() -> list<V>          ⛔
stock.merge(addition) -> void      ⛔
```

What **does** work on a dict, because it is language syntax rather than a method:

```katnip
public stock: dict<str, num> = {"apple": 2, "banana": 5};

temp n: num = stock["apple"];       # ✅ read
stock["cherry"] = 7;                # ✅ write — appends if the key is new
stock["apple"] += 1;                # ✅ compound assignment

for ((name, count), stock) {        # ✅ iterate both columns
    report(name, count);
}
```

### Working around `contains`

A dict is two parallel lists under the hood, but you cannot name those lists from Katnip.
Keep your own key list alongside:

```katnip
public stock: dict<str, num> = {};
public stockKeys: list<str> = [];

proc put(key: str, value: num) -> void {
    if (!stockKeys.contains(key)) { stockKeys.add(key); }
    stock[key] = value;
}

proc has(key: str) -> bool {
    return stockKeys.contains(key);
}
```

`stockKeys.length()` then covers `dict.length()` too.

## str

```katnip
greeting.contains(substring: str) -> bool   ✅   # operator_contains
```

That is the whole namespace so far. The rest of the string surface is not written yet.

Other string operations live elsewhere:

```katnip
len(greeting);              # prelude — operator_length
greeting[1];                # 1-based indexing — operator_letter_of
greeting + name;            # operator_join
f"{greeting} {name}";       # interpolation, also join

for (letter, greeting) { ... }
```

There is no `split`, `replace`, `toUpper`, `trim`, or slicing. Build what you need by
walking characters:

```katnip
proc countChar(s: str, target: str) -> num {
    temp n: num = 0;
    for (c, s) {
        if (c == target) { n += 1; }
    }
    return n;
}
```
