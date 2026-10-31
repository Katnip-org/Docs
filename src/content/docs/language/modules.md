---
title: "Modules and imports"
---

:::note
**Imports build now.** An imported procedure is lowered into every target that calls it,
including the procedures it calls in turn, and an imported literal constant folds at the
call site.

The one thing that does not cross is **mutable module state**. See
[What crosses a file boundary](#what-crosses-a-file-boundary).
:::

## Importing

```katnip
import "./thing.knip";
import "../lib/shapes.knip";
import "./thing.knip" as util;
```

Paths are relative to the importing file. The `.knip` extension is optional. Imports go at
the top of the file.

## Namespacing

An import brings its symbols in under a namespace — the file's basename, or the alias:

```katnip
import "./shapes.knip";
import "./shapes.knip" as geo;

private p: num = shapes.perimeter(4, 3);
private q: num = geo.perimeter(4, 3);
```

## Visibility

Only `public` symbols cross a file boundary:

```katnip
# lib.knip
public sides: num = 3;
private secret: num = 42;

public proc perimeter(side: num, count: num) -> num {
    return side * count;
}
```

```katnip
# main.knip
import "./lib.knip";

private a: num = lib.sides;        # ok
private b: num = lib.secret;       # error: 'secret' is private
```

## What crosses a file boundary

A `public` **procedure** and a `public` **value with a literal initializer** cross and build.
The value is copied at compile time, so it behaves as a constant. A `public` **list** does not
cross, and neither does any change to a value:

```katnip
# lib.knip
public SIDES: num = 3;                  # literal: crosses, folds at the call site
public shared: list<num> = [1, 2];      # list: does not cross

public proc twice(n: num) -> num { return n * 2; }
```

```katnip
# main.knip
import "./lib.knip";

private a: num = lib.SIDES;      # ✅ folds to 3
private b: num = lib.twice(4);   # ✅ the proc is lowered into this target
private c: num = lib.shared[1];  # 🔴 check: only members with a literal initializer are supported
lib.SIDES = 4;                   # 🔴 build: a value from an imported module is read-only
```

An imported procedure may take parameters and return a value, but it cannot touch a
variable or list declared in its own module, because that variable is never emitted. One such
procedure fails the build with `undeclared variable` for **any** file that imports the module,
even if nothing calls it. Keep shared state in the entry file and pass it through parameters
and returns.

## Imports are not re-exported

If `a.knip` imports `b.knip`, a file that imports `a.knip` **cannot reach `b`** through it:

```katnip
# a.knip
import "./b.knip";
public proc quad(n: num) -> num { return b.double(b.double(n)); }
```

```katnip
# main.knip
import "./a.knip";

a.quad(2);          # ok — a uses b internally
a.b.double(2);      # error — b is not re-exported
```

Each file names its own dependencies. There is no transitive namespace.

## The import graph

Each file is read and parsed exactly once, no matter how many files import it.
Unresolvable paths and import cycles are reported against the file that did the importing,
with a source span.

## Data files

`import("./levels.csv")`, with parentheses and a `.csv` or `.json` path, is an expression that
loads data rather than a module. See
[Loading a list or dict from a file](/language/collections/#loading-a-list-or-dict-from-a-file).

## Resolvers

Import resolution is pluggable. The CLI resolves against the filesystem; the VS Code
extension prefers open documents so unsaved edits are picked up; an embedding can
supply virtual files, which is how a browser playground would work.

If you are embedding the compiler, you pass a resolver — see
[Embedding the compiler](/toolchain/api/).
