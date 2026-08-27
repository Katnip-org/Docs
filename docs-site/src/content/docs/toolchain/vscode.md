---
title: "VS Code extension"
---

Live diagnostics, syntax highlighting, and a build command for `.knip` files.

## Install

```bash
code --install-extension Katnip-org.katnip-vscode
```

Then `Developer: Reload Window`, and open any `.knip` file.

### From source

```bash
npm run package -w katnip-vscode
code --install-extension packages/vscode/katnip-vscode-0.0.16.vsix --force
```

The `package` script rebuilds the compiler, vendors it into the extension, and produces the
`.vsix`.

## What you get

**Diagnostics as you type.** Errors underline in the editor and list in the Problems panel,
with the same messages and spans the CLI prints.

**Syntax highlighting.** A TextMate grammar for `.knip`.

**Language configuration.** Bracket matching, auto-closing pairs, and comment toggling.

**A build command.** `Ctrl+Shift+P` → **Katnip: Build .sb3** compiles the active file.

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `katnip.check.trigger` | `onType` | When to re-check — `onType` or `onSave` |
| `katnip.check.debounce` | `250` | Milliseconds after the last keystroke before re-checking (`onType` only) |

Raise the debounce on a large file if typing feels sticky; switch to `onSave` if you would
rather not see errors while a line is half-written.

## Imports resolve against open documents

The extension supplies its own import resolver, backed by open editor documents rather than
the filesystem. Unsaved edits in one file are visible to a file that imports it — you do not
have to save to see the effect.

:::caution
The extension checks but the same [gaps](/reference/known-gaps/) apply. A file with no
squiggles can still fail `katnip build` — `console.log` and the dict methods being the two
you will meet — or build and be silently wrong, as `**` and structs are.
:::

## What it is not

There is **no language server**. The extension shells the compiler directly, which means:

* no completion
* no hover
* no go-to-definition
* no rename
* no formatter

Diagnostics are the whole feature set. An LSP is on the roadmap.
