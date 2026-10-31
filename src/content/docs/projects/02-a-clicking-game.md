---
title: "Project 2 — A clicking game"
---

**You will build:** click the cat before the timer runs out. It jumps, your streak grows,
a second sprite keeps score.

**You will learn:** globals vs sprite members, `if`/`switch`, `while`, broadcasts between
sprites, string interpolation, and how to pick random numbers.

Make a file called `clicker.knip`.

---

## Step 1 — A clickable sprite

```katnip
public score: num = 0;

sprite Cat {
    events.onFlag() {
        score = 0;
        motion.goTo(0, 0);
        looks.say("Click me!", 1);
    }

    events.onClick() {
        score += 10;
        looks.say(f"Score: {score}", 1);
    }
}
```

Build and run. Clicking the cat scores.

`f"Score: {score}"` is an **interpolated string**. It compiles to Scratch's `join` block —
and it is the practical way to put a number into a text slot, because the `Str()` cast only
changes the type the checker sees.

## Step 2 — Make it move

A target that stays still is not a game. `math.random` is Scratch's `pick random` block:

```katnip
    events.onClick() {
        score += 10;
        motion.goTo(math.random(-200, 200), math.random(-140, 140));
    }
```

## Step 3 — Sprite state and a streak

Add a member to the sprite:

```katnip
sprite Cat {
    private streak: num = 0;

    events.onClick() {
        streak += 1;
        score += 10 + streak;
        motion.goTo(math.random(-200, 200), math.random(-140, 140));
    }
}
```

The difference between `score` and `streak` matters:

| | Declared | Lives on | Seen by |
| --- | --- | --- | --- |
| `score` | top level | the stage | every sprite |
| `streak` | inside `Cat` | the Cat sprite | Cat only |

If you had named the member `score` too, Scratch could not represent it — stage and sprite
names resolve together. Katnip lets you write it and renames the sprite's copy to
`Cat_score` in the output.

## Step 4 — A procedure with a side effect

Track a best score. This logic belongs in one place:

```katnip
public score: num = 0;
public best: num = 0;

proc award(points: num) -> void {
    score += points;
    if (score > best) {
        best = score;
    }
}
```

```katnip
    events.onClick() {
        streak += 1;
        award(10 + streak);
        motion.goTo(math.random(-200, 200), math.random(-140, 140));
    }
```

## Step 5 — switch

Change the cat's size with the streak, so the game gets visibly harder:

```katnip
        switch (streak % 3) {
            case (0) { looks.setSize(70); }
            case (1) { looks.setSize(100); }
            default  { looks.setSize(130); }
        }
```

`switch` compiles to an if/else chain, which has two consequences worth committing to
memory: **there is no fallthrough**, and **there is no exhaustiveness check**. Always write
a `default`.

A case can hold several values — `case (0, 1) { ... }` matches either.

## Step 6 — A timer

```katnip
public timeLeft: num = 20;
```

```katnip
    events.onFlag() {
        score = 0;
        streak = 0;
        looks.show();
        looks.setSize(100);
        motion.goTo(0, 0);
        looks.say("Click me!", 1);

        sensing.resetTimer();
        while (sensing.timer() < timeLeft) {
            wait(0.1);
        }

        looks.hide();
        events.broadcast("over");
    }
```

The `wait(0.1)` is not optional. A `while` loop with no wait and no motion blocks pins
Scratch's scheduler and the project stops responding — the same trap as a
run-without-screen-refresh loop in the block editor.

## Step 7 — A second sprite

A sprite cannot call another sprite's procedure; custom blocks belong to a target.
Broadcasts are the only cross-sprite control flow there is.

```katnip
sprite Scoreboard {
    events.onFlag() {
        motion.goTo(0, 140);
        looks.show();
    }

    events.onBroadcast("scored") {
        looks.say(f"Score {score} - best {best}");
    }
}
```

And in the Cat's click handler, at the end:

```katnip
        events.broadcast("scored");
```

The pattern is worth naming, because you will use it constantly:

* **data** travels through a top-level `public` variable — a stage global
* **timing** travels through the broadcast

`events.broadcast` fires and returns immediately. `events.broadcastAndWait` blocks until
every receiver has finished — use that when the next line depends on the result.

## The finished file

```katnip
public score: num = 0;
public best: num = 0;
public timeLeft: num = 20;

proc award(points: num) -> void {
    score += points;
    if (score > best) {
        best = score;
    }
}

sprite Cat {
    private streak: num = 0;

    events.onFlag() {
        score = 0;
        streak = 0;
        looks.show();
        looks.setSize(100);
        motion.goTo(0, 0);
        looks.say("Click me!", 1);

        sensing.resetTimer();
        while (sensing.timer() < timeLeft) {
            wait(0.1);
        }

        looks.hide();
        events.broadcast("over");
    }

    events.onClick() {
        streak += 1;
        award(10 + streak);
        motion.goTo(math.random(-200, 200), math.random(-140, 140));

        switch (streak % 3) {
            case (0) { looks.setSize(70); }
            case (1) { looks.setSize(100); }
            default  { looks.setSize(130); }
        }

        events.broadcast("scored");
    }

    events.onBroadcast("over") {
        looks.show();
        looks.setSize(100);
        motion.goTo(0, 0);
        looks.say(f"Final: {score} (best {best})", 3);
    }
}

sprite Scoreboard {
    events.onFlag() {
        motion.goTo(0, 140);
        looks.show();
    }

    events.onBroadcast("scored") {
        looks.say(f"Score {score} - best {best}");
    }
}
```

:::note
Both sprites are the default cat costume, so the Scoreboard is a second cat at the top of
the stage. Give it its own artwork with a `costume "./blank.svg";` line at the top of the
sprite — see [Costumes and sounds](/language/sprites-and-events/#costumes-and-sounds).
:::

## Try it yourself

* Reset `streak` to 0 if the player misses — a click on the stage, not the cat.
* Show the score with `showVariable(score)` instead of a talking sprite.
* Add a second, faster, smaller cat worth more points.
* Make `timeLeft` shrink each round for a survival mode.

## Next

[Project 3 — Falling treats](/projects/03-falling-treats/), where you spawn clones and track state
in lists.
