# Before you start

Three projects, in order. Each one builds and runs — every listing on these pages has been
compiled with the current compiler, so if a build fails it is a typo, not the tutorial.

| # | Project | Teaches |
| --- | --- | --- |
| [1](01-draw-a-square.md) | **Draw a square** | sprites, handlers, `for`, procedures, pen |
| [2](02-a-clicking-game.md) | **A clicking game** | globals, `switch`, broadcasts, two sprites |
| [3](03-falling-treats.md) | **Falling treats** | clones, lists, parallel scripts, game state |

## What you need

* The compiler installed — see [Getting started](../introduction/getting-started.md).
* A folder to work in.
* [TurboWarp](https://turbowarp.org) open in a tab.

## The loop you will be in

```bash
katnip build game.knip     # writes game.sb3
```

Then drag `game.sb3` onto TurboWarp and click the flag. When you change the source, rebuild
and drag it in again.

{% hint style="info" %}
TurboWarp does not hot-reload. Each rebuild is a fresh drag-and-drop. If you are iterating
fast, keep the file explorer and the browser side by side.
{% endhint %}

`katnip check game.knip` is the faster loop when you just want to know whether it
type-checks — it skips codegen entirely.

## Two things that will surprise you

**Every sprite has the same default costume.** Katnip does not import assets, so all your
sprites are the Scratch cat until you add costumes by hand in the editor. Position, size
and colour are all you have to tell them apart. Plan visuals accordingly, or add costumes
after building.

**Some things type-check and then fail to build.** `console.log` is the one you will hit
first — it appears in older examples and does not compile. Skim
[Known gaps](../reference/known-gaps.md) once before you start; it is short, and it will
save you a confusing half hour.

Ready? [Start with the square.](01-draw-a-square.md)
