---
title: "Project 3 — Falling treats"
---

**You will build:** treats fall from the top of the stage, you catch them with a basket
that follows the mouse, three misses and it is over.

**You will learn:** clones and per-clone state, lists, parallel scripts, spawner loops,
game-over signalling, and why a proc-local variable is dangerous here.

Make a file called `treats.knip`.

---

## Step 1 — The basket

```katnip
sprite Basket {
    events.onFlag() {
        looks.show();
        motion.setY(-140);
        while (true) {
            motion.setX(sensing.mouseX());
        }
    }
}
```

`while (true)` is Katnip's `forever` — there is no `forever` keyword yet, though the IR
has a node for it.

No `wait` in this loop, and that is correct: `motion.setX` yields to the scheduler on its
own, the same way a Scratch `forever` containing a motion block does. A `while (true)`
containing *only* arithmetic would hang the project.

## Step 2 — One falling treat

```katnip
proc random(@opcode = "operator_random", from: num, to: num) -> num {}

sprite Treat {
    events.onFlag() {
        looks.setSize(60);
        motion.goTo(random(-200, 200), 160);
        while (!sensing.touching("Basket")) {
            motion.changeY(-4);
        }
        looks.say("caught!", 1);
    }
}
```

Run it. One treat falls, and the loop never ends if you miss — it keeps falling forever
past the bottom of the stage. Scratch sprites do not leave the stage; they stick to the
edge.

`sensing.touching("Basket")` takes a plain string. Its parameter type is
`TouchTarget | str`: the menu lists the two fixed targets `"_edge_"` and `"_mouse_"` *and*
every sprite name, so the `str` arm is there to carry names like `"Basket"`. The two fixed
ones can also be written as members — `sensing.TouchTarget.EDGE` is `"_edge_"`. See
[Passing a menu value](/stdlib/#passing-a-menu-value).

## Step 3 — Catch the miss

```katnip
public missed: num = 0;
public lives: num = 3;
```

```katnip
        while (!sensing.touching("Basket")) {
            motion.changeY(-4);
            if (sensing.touching("_edge_")) {
                missed += 1;
                lives -= 1;
            }
        }
```

## Step 4 — Clones

One treat is not a game. Turn the sprite into a spawner and move the falling behaviour into
a clone handler:

```katnip
sprite Treat {
    private speed: num = 0;

    events.onFlag() {
        looks.hide();
        while (true) {
            clone.create("_myself_");
            wait(0.8);
        }
    }

    clone.onStart() {
        speed = 3 + random(0, 3);
        looks.setSize(60);
        looks.show();
        motion.goTo(random(-200, 200), 160);

        while (!sensing.touching("Basket")) {
            motion.changeY(-speed);
            if (sensing.touching("_edge_")) {
                missed += 1;
                lives -= 1;
                clone.delete();
            }
        }

        clone.delete();
    }
}
```

The original hides itself and does nothing but spawn. Each clone runs `clone.onStart()`
independently, with its own `speed`.

**This is the important part of the whole project:**

| Declared | Per clone? |
| --- | --- |
| top-level `public` / `private` — `missed`, `lives` | **No** — one copy on the stage |
| sprite member — `private speed` | **Yes** — each clone has its own |
| `private` declared inside a proc | **No** — a mangled global, shared by everything |

So `speed` had to be a sprite member. Had you declared it `private` inside a procedure
instead, every clone would share one variable and they would all fall at whatever speed
the most recent clone picked. That is the single most common way to lose an evening in
clone-heavy Katnip.

:::note
Scratch caps a project at 300 clones. Past that, `clone.create` silently does nothing.
Always `clone.delete()` when a clone is finished — note both exits above do.
:::

## Step 5 — Lists

Score the treats by type, and keep a log:

```katnip
public caught: num = 0;
public treatNames: list<str> = ["fish", "milk", "yarn"];
public treatScores: list<num> = [10, 5, 25];
public history: list<str> = [];

proc scoreFor(kind: num) -> num {
    return treatScores[kind];
}

proc record(kind: num) -> void {
    caught += 1;
    history.add(f"{treatNames[kind]} +{scoreFor(kind)}");
}
```

Then give each clone a kind, and call `record` when it is caught:

```katnip
sprite Treat {
    private kind: num = 1;
    private speed: num = 0;

    clone.onStart() {
        kind = random(1, 3);
        ...
        record(kind);
        clone.delete();
    }
}
```

Three things about lists:

* **They are 1-indexed**, like Scratch's. `random(1, 3)` indexes `treatNames` directly.
* **`treatNames` and `treatScores` are baked into the project file**, because every element
  is a literal. If any element needed a block to compute, the whole list would instead be
  rebuilt by a green-flag script — which matters when another script reads it early.
* **`history` is declared at the top level so it is baked into the project file.** A list
  declared inside a proc or handler does lower, but it is cleared and refilled at that
  point on every run — fine for scratch space, wrong for something you want to accumulate
  across runs.

`history.show()` puts the list monitor on the stage — the cheapest debugger you have, since
`console.log` does not compile.

## Step 6 — Game over

```katnip
public playing: bool = false;
```

The spawner loops while the game is on:

```katnip
    events.onFlag() {
        caught = 0;
        missed = 0;
        lives = 3;
        playing = true;
        history.clear();
        history.show();
        looks.hide();

        while (playing) {
            clone.create("_myself_");
            wait(0.8);
        }
    }
```

The clone ends it when lives run out:

```katnip
            if (sensing.touching("_edge_")) {
                missed += 1;
                lives -= 1;
                if (lives <= 0) {
                    playing = false;
                    events.broadcast("gameover");
                }
                clone.delete();
            }
```

And a handler cleans up:

```katnip
    events.onBroadcast("gameover") {
        looks.hide();
        stop(StopType.OTHER_SCRIPTS_IN_SPRITE);
    }
```

`stop(StopType.OTHER_SCRIPTS_IN_SPRITE)` kills the spawner and every clone still falling.
`StopType` is a **prelude** enum, so its members *are* reachable — unlike the namespaced
ones. The other options are `StopType.ALL` and `StopType.THIS_SCRIPT`.

## The finished file

```katnip
public caught: num = 0;
public missed: num = 0;
public lives: num = 3;
public playing: bool = false;

public treatNames: list<str> = ["fish", "milk", "yarn"];
public treatScores: list<num> = [10, 5, 25];
public history: list<str> = [];

proc random(@opcode = "operator_random", from: num, to: num) -> num {}

proc scoreFor(kind: num) -> num {
    return treatScores[kind];
}

proc record(kind: num) -> void {
    caught += 1;
    history.add(f"{treatNames[kind]} +{scoreFor(kind)}");
}

sprite Basket {
    events.onFlag() {
        looks.show();
        motion.setY(-140);
        while (true) {
            motion.setX(sensing.mouseX());
        }
    }
}

sprite Treat {
    private kind: num = 1;
    private speed: num = 0;

    events.onFlag() {
        caught = 0;
        missed = 0;
        lives = 3;
        playing = true;
        history.clear();
        history.show();
        looks.hide();

        while (playing) {
            clone.create("_myself_");
            wait(0.8);
        }
    }

    clone.onStart() {
        kind = random(1, 3);
        speed = 3 + random(0, 3);
        looks.setSize(60);
        looks.show();
        motion.goTo(random(-200, 200), 160);

        while (!sensing.touching("Basket")) {
            motion.changeY(-speed);
            if (sensing.touching("_edge_")) {
                missed += 1;
                lives -= 1;
                if (lives <= 0) {
                    playing = false;
                    events.broadcast("gameover");
                }
                clone.delete();
            }
        }

        record(kind);
        clone.delete();
    }

    events.onBroadcast("gameover") {
        looks.hide();
        stop(StopType.OTHER_SCRIPTS_IN_SPRITE);
    }
}
```

:::caution
A naming collision to know about: a `sprite` and an `enum` share one namespace. An
`enum Treat { ... }` alongside `sprite Treat { ... }` is a hard error —
`'Treat' is already declared in this scope`.
:::

## Try it yourself

* Show the caught total with `showVariable(caught)`.
* Make some treats bad — catching one costs a life. `kind` already distinguishes them.
* Speed the spawner up over time: replace the fixed `wait(0.8)` with a global that shrinks.
* Add a high-score list, sorted. You will need to write your own sort, walking indices —
  `list.remove` is not lowered yet, so build a new list rather than mutating one.

## Next

[Where to go next](/projects/next-steps/).
