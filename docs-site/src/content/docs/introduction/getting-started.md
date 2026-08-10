---
title: "Getting started"
---

By the end of this page you will have compiled a `.knip` file into a `.sb3` and watched it
run in MistWarp.

## Requirements

* **Node.js 20 or newer** — `node --version` to check.
* A text editor. [VS Code](https://code.visualstudio.com/) is recommended, because Katnip
  ships an extension for it.
* Somewhere to run the result: [MistWarp](https://warp.mistium.com/editor) (fastest, no account) or
  [scratch.mit.edu](https://scratch.mit.edu).

## Install

```bash
npm install -g @katnip-org/compiler
```

That puts a `katnip` command on your path:

```bash
katnip help
```

:::note
Prefer not to install globally? `npx @katnip-org/compiler help` works too — substitute
`npx @katnip-org/compiler` for `katnip` everywhere below.
:::

### Building from source instead

If you cloned the repository:

```bash
pnpm install
pnpm build
node packages/compiler/build/cli.js help
```

## Your first file

Make a file called `hello.knip`:

```katnip
sprite Cat {
    events.onFlag() {
        looks.say("Hello from Katnip!", 2);
        motion.forward(50);
        motion.turn(90);
    }
}
```

Three things to notice:

* Everything that runs lives inside a `sprite`. A bare statement at the top of the file
  is a declaration, not an action.
* `events.onFlag() { ... }` is the green-flag hat block. Inside a sprite, it becomes a
  script.
* `looks.say` and `motion.forward` are standard-library procedures that map onto Scratch
  blocks one-for-one.

## Check it

Before building, type-check:

```bash
katnip check hello.knip
```

```
No semantic errors found.
```

Now break it on purpose — change the `2` to `"two"`:

```
Semantic Error: Argument 2 of 'say' expects 'num', got 'str'
  at line 3, column 39
    |
  3 |         looks.say("Hello from Katnip!", "two");
    |                                         ^^^^^
```

That is the entire pitch for Katnip in one screenshot. Change it back.

## Build it

```bash
katnip build hello.knip
```

```
Wrote hello.sb3
```

Drag `hello.sb3` onto [MistWarp](https://warp.mistium.com/editor) and click the green flag.
The cat says hello and takes a step.

:::tip
`build` runs the whole pipeline, so it type-checks too. `check` is just the fast path when
you only want the errors.
:::

## Set up the editor

The VS Code extension gives you live diagnostics as you type, syntax highlighting, and a
build command.

```bash
code --install-extension Katnip-org.katnip-vscode
```

Reload the window, open a `.knip` file, and errors underline as you type. `Ctrl+Shift+P`
→ **Katnip: Build .sb3** compiles the file you are looking at.

Full details, including the debounce and on-save settings, are in
[VS Code extension](/toolchain/vscode/).

## What next

* **[Your first projects](/projects/)** — build a square, then a game.
* **[Program structure](/language/)** — what can go where in a `.knip` file.
* **[How the compiler works](/introduction/how-it-works/)** — what happens between `.knip` and `.sb3`.
