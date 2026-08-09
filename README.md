# What is Katnip?

Katnip is a **typed programming language that compiles to Scratch**. You write `.knip`
files in a text editor, run the compiler, and get a `.sb3` project file that opens in
[Scratch](https://scratch.mit.edu) or [TurboWarp](https://turbowarp.org) and runs like
any other project.

```katnip
public score: num = 0;

proc award(points: num) -> void {
    score += points;
}

sprite Cat {
    events.onFlag() {
        pen.down();
        for (side, 4) {
            motion.forward(100);
            motion.turn(90);
            award(10);
        }
        pen.up();
        looks.say(f"Scored {score}!", 2);
    }
}
```

That compiles to a real Scratch project: a stage variable named `score`, a custom block
named `award`, a green-flag script on the Cat sprite, and the pen extension enabled.

## Why write Scratch as text?

Scratch's block editor is wonderful for learning and painful at scale. Once a project
grows past a few hundred blocks, the things text has always been good at start to matter:

| You want | Blocks give you | Katnip gives you |
| --- | --- | --- |
| Find every use of a variable | Scrolling | Ctrl+F |
| Reuse code between projects | Backpack, sort of | `import` |
| Catch a typo before running | Nothing | A type error, with line and column |
| Review a change | Screenshots | A diff |
| Copy a loop 20 times | 20 drags | A `for` loop |

Katnip is not a different runtime. There is no interpreter, no VM, no plugin to install
in Scratch. The compiler emits ordinary Scratch blocks, so anything you build stays
shareable, remixable, and readable by anyone who opens it in the editor.

## What Katnip adds on top of Scratch

* **Static types.** `num`, `str`, `bool`, `list<T>`, `dict<K, V>`, tuples, unions, enums,
  and structs — all checked before a block is ever emitted.
* **Real procedures.** Return values (Scratch has none), overloads, default parameters,
  named arguments, and methods.
* **Working recursion.** The compiler analyses your call graph and picks a return
  strategy per procedure, so a recursive `fib` returns correct values instead of garbage.
* **Dictionaries.** Backed by two parallel Scratch lists, with `d["key"]` syntax.
* **Operators Scratch lacks.** `<=`, `>=`, `^`, `!&`, `!|`, `!^` are inlined at every use
  site as nested reporter blocks.
* **Interpolated strings.** `f"{name} scored {score}"` folds into a `join` chain.
* **Modules.** Split a project across files with `import` and `public` visibility.

## What Katnip is not

* Not a Scratch **decompiler**. It goes one way: `.knip` → `.sb3`.
* Not a way to escape Scratch's limits. There are no real function-local variables, no
  objects at runtime, no threads beyond Scratch's own. Katnip is a nicer way to write
  Scratch, not a way to stop writing Scratch.
* Not finished. Several language features type-check but do not yet reach blocks —
  see [Known gaps](reference/known-gaps.md) before you plan a project around one.

## Where to go next

* **[Getting started](introduction/getting-started.md)** — install the compiler and build
  your first `.sb3` in about five minutes.
* **[Your first projects](projects/README.md)** — three guided builds that take you from
  a square to a working game.
* **[The language](language/README.md)** — the reference, top to bottom.
* **[Known gaps](reference/known-gaps.md)** — what does not work yet, and what to write
  instead.

---

Katnip is Apache-2.0 licensed and developed at
[github.com/Katnip-org/Katnip](https://github.com/Katnip-org/Katnip).
