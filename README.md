# Katnip docs

Source for <https://docs.katnip.org>, the documentation for the
[Katnip](https://github.com/Katnip-org/Katnip) language. Built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run build` | Build the site to `./dist/` |
| `npm run preview` | Preview the build locally |

## Layout

| Path | What's in it |
| --- | --- |
| `src/content/docs/` | The pages; the sidebar is defined in `astro.config.mjs` |
| `src/grammars/katnip.tmLanguage.json` | Highlighting for `katnip` code fences |

## Keeping it in sync

* `src/grammars/katnip.tmLanguage.json` is a copy of `packages/vscode/syntaxes/katnip.tmLanguage.json`
  from the compiler repo. Copy it over when the grammar changes.
* `reference/feature-status.md` mirrors `features.md` in the compiler repo.
* `reference/known-gaps.md` is the practical version of those gaps. Update it alongside them.
