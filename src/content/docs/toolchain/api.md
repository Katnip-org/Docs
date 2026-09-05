---
title: "Embedding the compiler"
---

The compiler is a normal ES module. Three functions are exported, plus the error type and two
resolver hooks — enough to build a browser playground, a different editor integration, or a
build step.

```bash
npm install @katnip-org/compiler
```

```js
import { checkSource, compileToIR, compileToSb3, KatnipError } from "@katnip-org/compiler";
```

Requires Node 20+. The package is ESM-only.

## `checkSource`

```ts
checkSource(source: string, options?: Options): readonly KatnipError[]
```

Lex, parse, analyze. Returns the diagnostics; an empty array means clean.

```js
const errors = checkSource(source);
for (const e of errors) {
    console.log(`${e.message} at ${e.location.line}:${e.location.column}`);
}
```

## `compileToSb3`

```ts
compileToSb3(source: string, options?: Options): { errors: readonly KatnipError[]; sb3?: Uint8Array }
```

The whole pipeline. `sb3` is present only when `errors` is empty.

```js
import { writeFile } from "node:fs/promises";

const { errors, sb3 } = compileToSb3(source, { path: "/proj/main.knip" });
if (!sb3) throw new Error(errors.map(e => e.message).join("\n"));
await writeFile("out.sb3", sb3);
```

In a browser, hand the bytes straight to a download or to MistWarp:

```js
const url = URL.createObjectURL(new Blob([sb3], { type: "application/zip" }));
```

## `compileToIR`

```ts
compileToIR(source: string, options?: Options): { errors: readonly KatnipError[]; ir?: IRProgram }
```

Stops after lowering. Useful for tooling that wants the Scratch-shaped tree without the
zip.

:::note
`IRProgram` is full of `Map`s, which `JSON.stringify` renders as `{}`. Use a replacer:

```js
JSON.stringify(ir, (_, v) => v instanceof Map ? Object.fromEntries(v) : v, 2);
```
:::

## Options

```ts
interface Options {
    path?: string;              // the entry file's path, for resolving relative imports and assets
    resolve?: ImportResolver;   // how to fetch an imported file
    readAsset?: AssetReader;    // how to fetch a costume or sound file
}
```

Imports are only followed when you supply a `resolve`. Without it, the entry file is
compiled alone.

Assets are only found when you supply a `readAsset`. Without it, every `costume` and
`sound` declaration is reported as a missing file — a clearer failure than silently
shipping the default costume.

## Import resolvers

```ts
type ImportResolver = (specifier: string, fromPath: string)
    => { path: string; source: string } | null;
```

Return `null` for an unresolvable specifier; the compiler reports it against the importing
file with a source span.

### Filesystem, as the CLI does

```js
import { readFileSync } from "node:fs";
import path from "node:path";

const fileResolver = (specifier, fromPath) => {
    const resolved = path.resolve(
        path.dirname(fromPath),
        specifier.endsWith(".knip") ? specifier : `${specifier}.knip`,
    );
    try {
        return { path: resolved, source: readFileSync(resolved, "utf8") };
    } catch {
        return null;
    }
};
```

### Virtual files, for a playground

```js
const files = {
    "/main.knip": "import \"./lib.knip\";",
    "/lib.knip":  "public proc double(n: num) -> num { return n * 2; }",
};

const virtualResolver = (specifier, fromPath) => {
    const resolved = new URL(specifier, `file://${fromPath}`).pathname;
    const key = resolved.endsWith(".knip") ? resolved : `${resolved}.knip`;
    return files[key] ? { path: key, source: files[key] } : null;
};
```

Each file is read and parsed exactly once per compile, no matter how many times it is
imported. Cycles are detected and reported.

:::note
Imports build. `compileToSb3` lowers an imported procedure into every target that calls it,
and folds an imported literal constant at the call site. What does not cross is mutable
module state: reading an imported variable or list is a check error, and an imported
procedure that touches its own module's variable fails codegen with `undeclared variable`.
:::

## Asset readers

```ts
type AssetReader = (specifier: string, fromPath: string) => Uint8Array | null;
```

Same contract as an import resolver, but returning bytes. Return `null` when the file does
not exist and the compiler reports it against the path in the declaring file.

```js
import { readFileSync } from "node:fs";
import path from "node:path";

const fileAssetReader = (specifier, fromPath) => {
    try {
        return readFileSync(path.resolve(path.dirname(fromPath), specifier));
    } catch {
        return null;
    }
};
```

For a virtual filesystem, key a map by resolved path and return `files[resolved] ?? null`.

## Errors

```ts
class KatnipError {
    message: string;
    location: { line: number; column: number };
}
```

Errors are collected, not thrown — the parser recovers into error nodes so a syntax error
does not hide the semantic errors after it. Both `compileToIR` and `compileToSb3` catch the
`KatnipError`s that codegen throws and return them in `errors`; anything else propagates.

## Performance note

The standard library is parsed once and cached across calls in module scope. The first
`checkSource` in a process pays for it; the rest do not. That is what makes an
on-every-keystroke editor integration viable.
