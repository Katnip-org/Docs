---
title: "Sprites and events"
---

Nothing in Katnip runs until it is inside an event handler, and an event handler can only
live inside a sprite. This is the same rule Scratch has — a stack of blocks with no hat on
top never fires.

## Declaring a sprite

```katnip
sprite Cat {
    private lives: num = 9;

    proc pounce(power: num) -> void {
        motion.forward(power);
        motion.turn(90);
    }

    events.onFlag() {
        pounce(40);
    }
}
```

A sprite body holds four kinds of thing:

* **costumes and sounds** — asset files packed into the project, see below
* **variables** — sprite-owned, see [Variables](/language/variables/)
* **procs** — custom blocks available only to this sprite
* **event handlers** — the scripts

Each sprite becomes one target in the `.sb3`, plus the stage.

## The stage

A `stage { }` block holds the same things a sprite body does, and its contents land on the
stage target instead of a sprite. Use it for backdrops and for scripts that belong to no
sprite:

```katnip
stage {
    costume "./assets/sky.svg";

    events.onFlag() {
        looks.switchBackdrop("sky");
    }
}
```

There is no name after `stage`, and a sprite cannot be called `stage` — `sprite stage { }`
is a parse error. Top-level `public` variables live on the stage too; the block is only
needed when the stage has assets or scripts.

## Costumes and sounds

`costume` and `sound` declarations pull a file into the project, the same way `import`
pulls in a module:

```katnip
sprite Cat {
    costume "./assets/cat.svg" as idle;
    costume "./assets/cat-blink.svg" as blink;
    sound "./assets/meow.wav";

    events.onFlag() {
        looks.switchCostume("idle");
        looks.nextCostume();
    }
}
```

* The path is relative to the `.knip` file, quoted, and ends with a semicolon.
* `as name` sets the costume or sound name Scratch sees. Without it, the name is the file
  stem — `sound "./assets/meow.wav";` is a sound called `meow`.
* Declarations go at the sprite's top level, next to variables and procs; the first one
  declared is the costume the sprite starts on.
* Costumes accept `svg`, `png`, `jpg`, `jpeg`, `bmp` and `gif`; sounds accept `wav` and
  `mp3`. Anything else is a type error on the path.
* A file that does not exist is reported against the path, like an unresolvable import,
  and the build produces nothing.
* The same file used by several sprites is packed into the `.sb3` once and shared.

A sprite that declares no costumes keeps the default cat; declaring one replaces it.

## Event handlers

Handlers come from the `events` and `clone` namespaces, and each maps to a Scratch hat
block. The analyzer rejects them anywhere but a sprite's top level.

### Green flag

```katnip
events.onFlag() {
    motion.goTo(0, 0);
    looks.show();
}
```

### Key pressed

```katnip
events.onKey(Key.SPACE) {
    clone.create("_myself_");
}
```

`Key` is a prelude enum: `Key.SPACE`, `Key.LEFT_ARROW`, `Key.RIGHT_ARROW`, `Key.UP_ARROW`,
`Key.DOWN_ARROW`, `Key.ANY`, `Key.NUM_0` … `Key.NUM_9`.

### Sprite clicked

```katnip
events.onClick() {
    looks.say("ow", 1);
}
```

### Backdrop switched

```katnip
events.onBackdropSwitch("backdrop1") {
    looks.say("new scene", 1);
}
```

### Broadcast received

```katnip
events.onBroadcast("tally") {
    looks.say(f"score is {score}", 1);
}
```

### Clone started

```katnip
clone.onStart() {
    looks.setSize(50);
    motion.goTo("_random_");
    wait(1);
    clone.delete();
}
```

## Broadcasts

Broadcasts are how sprites talk to each other, since a sprite cannot call another
sprite's procedures.

```katnip
events.broadcast("tally");           # fire and continue
events.broadcastAndWait("checked");  # block until every receiver finishes
```

The name can be a computed expression, not just a literal:

```katnip
events.broadcast(f"level-{level}");
```

:::caution
A computed broadcast name only reaches a receiver whose literal name matches. Scratch
registers broadcasts by name at project load, so at least one `events.onBroadcast("...")`
with that literal name must exist somewhere.
:::

## Clones

```katnip
sprite Star {
    events.onKey(Key.SPACE) {
        clone.create("_myself_");
    }

    clone.onStart() {
        looks.show();
        motion.goTo("_random_");
        for (i, 20) {
            motion.forward(5);
        }
        clone.delete();
    }
}
```

`clone.create` takes `"_myself_"` or the name of another sprite. Sprite-private variables
are per-clone in Scratch, exactly as in the block editor.

## Multiple handlers of the same kind

A sprite can have as many handlers of a kind as you like. They become separate scripts and
run concurrently, like separate stacks in Scratch:

```katnip
sprite Cat {
    events.onFlag() { drawSquare(); }
    events.onFlag() { playMusic(); }
}
```

## Talking between sprites

| You want | Do this |
| --- | --- |
| Share a value | A top-level `public` variable — it lives on the stage |
| Trigger behaviour | `events.broadcast(...)` |
| Wait for behaviour | `events.broadcastAndWait(...)` |
| Read another sprite's property | `sensing.getProperty("x position", "Cat")` |
| Share a procedure | Declare it at the top level, not in a sprite |

## Not supported

* `self.x = 0`, `self.costume = "..."` — sprite property initializers appear in some older
  examples but are not implemented. Set them in a green-flag handler instead:

  ```katnip
  events.onFlag() {
      motion.goTo(0, 0);
      looks.show();
      looks.switchCostume("idle");
  }
  ```
