---
title: "Modules and imports"
---

:::danger
**Imports are analysis-only today.** The IR walks only the entry file, so calling an
imported procedure type-checks and then fails codegen with `call to unknown proc`.

Everything on this page works for `katnip check`. None of it survives `katnip build` yet.
Keep buildable projects in a single file until this lands — it is the number one item on
the roadmap.
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

temp p: num = shapes.perimeter(4, 3);
temp q: num = geo.perimeter(4, 3);
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

temp a: num = lib.sides;        # ok
temp b: num = lib.secret;       # error: 'secret' is private
```

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

## Resolvers

Import resolution is pluggable. The CLI resolves against the filesystem; the VS Code
extension resolves against open documents so unsaved edits are picked up; an embedding can
supply virtual files, which is how a browser playground would work.

If you are embedding the compiler, you pass a resolver — see
[Embedding the compiler](/toolchain/api/).
