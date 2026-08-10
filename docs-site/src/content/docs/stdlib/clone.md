---
title: "clone"
---

Clone lifecycle. Three procedures, all working.

```katnip
clone.onStart() { ... }                         ✅   # hat
clone.create(target: CloneTarget | str) -> void ✅
clone.delete() -> void                          ✅
```

## A complete clone

```katnip
sprite Star {
    events.onFlag() {
        looks.hide();                # the original stays hidden
    }

    events.onKey(Key.SPACE) {
        clone.create("_myself_");
    }

    clone.onStart() {
        looks.show();
        looks.setSize(50);
        motion.goTo("_random_");
        motion.point(0);

        for (i, 30) {
            motion.forward(5);
        }

        clone.delete();
    }
}
```

`clone.create` takes `"_myself_"` or another sprite's name.

## What clones share and what they do not

This follows Scratch exactly:

| Declared | Per clone? |
| --- | --- |
| Top-level `public` / `private` variable | **No** — one copy on the stage |
| Sprite `private` variable | **Yes** — each clone gets its own |
| `temp` inside a proc | **No** — a mangled global, shared by everything |

So per-clone state goes in a sprite member:

```katnip
sprite Star {
    private speed: num = 0;      # each clone has its own

    clone.onStart() {
        speed = 3;
        while (true) {
            motion.forward(speed);
            speed += 0.1;
        }
    }
}
```

:::caution
`temp` is a global. If two clones run the same procedure at once, they share its `temp`
variables and will corrupt each other. In clone-heavy code, pass values as parameters and
keep per-clone state in sprite members.
:::

## Limits

Scratch caps a project at 300 clones. Past that, `clone.create` silently does nothing —
there is no error, the clone just never starts. Delete clones when they finish.

## Full enum reference

| `clone.CloneTarget` | Value |
| --- | --- |
| `MYSELF` | `"_myself_"` |

`clone.CloneTarget.MYSELF` and `"_myself_"` compile to the same block. The menu also lists
sprite names, so the parameter keeps its `| str` arm and takes a computed name.
