---
title: "Variables"
---

Every variable declaration carries an **access modifier**. There is no bare `let` or
`var` — the modifier is how you say where the variable lives.

| Modifier | Lives on | Visible to |
| --- | --- | --- |
| `public` | the stage | every sprite, and other files that import this one |
| `private` | whatever encloses the declaration | that sprite, or that file |

If you have used Scratch's variable dialog, you already know this pair: `public` is
**For all sprites**, `private` is **For this sprite only**. You pick when you declare it,
from wherever you happen to be writing.

```katnip
public score: num = 0;
private secret: num = 42;

proc tally() -> void {
    private running: num = 0;
    running += score;
}
```

## Where a declaration puts the variable

**The modifier decides, not the position.** `public` puts the variable on the stage from
anywhere — the top level, a sprite body, even inside a script:

```katnip
public score: num = 0;              # "score" on the stage

sprite Cat {
    public highScore: num = 0;      # also on the stage, declared next to the code using it
    private lives: num = 9;         # "lives" on Cat, and only Cat
}
```

**Position decides what "private" encloses.** At the top level there is no sprite, so a
`private` declaration is a stage variable that other files cannot import. Inside a sprite
it is that sprite's own; inside a script or proc body it belongs to the sprite around it.

Two sprites cannot both claim one stage name — the second declaration is an error:

```katnip
sprite Cat { public score: num = 0; }
sprite Dog { public score: num = 1; }   # error: 'score' is already declared in this scope
```

If a sprite member shares a name with a global, Scratch cannot represent the collision —
it resolves stage and sprite names together. Katnip renames the sprite's copy to
`Sprite_name` at codegen:

```katnip
public greeting: str = "Katnip";

sprite Cat {
    private greeting: str = "Cat";   # emitted as `Cat_greeting`

    events.onFlag() {
        looks.say(greeting);         # "Cat"
    }
}

sprite Dog {
    events.onFlag() {
        looks.say(greeting);         # "Katnip" — no local, so the global
    }
}
```

## A variable declared inside a procedure is not a local

A variable declared inside a procedure is the closest thing Katnip has to a local
variable, and it is important to understand what it actually is: **a global with a
mangled name**.

```katnip
proc tally() -> void {
    private running: num = 0;
    running += 1;
}
```

That emits one Scratch variable, reused by every call. Scratch has no call-frame storage,
so there is nowhere else to put it.

:::caution
**It does not survive recursion.** If a procedure calls itself, the inner call
overwrites the outer call's variable and the outer call resumes with the wrong value. This
is by design — it is what Scratch can do — but it will bite you.

Return values *do* survive recursion; the compiler gives recursive procedures a stack.
See [Returning values](/language/procedures/#returning-values). Prefer passing state through
parameters and returns over a proc-local variable in any procedure that might recurse.
:::

## Assignment

```katnip
score = 10;
score += 5;      # also -=  *=  /=  %=
```

Compound assignment works through a list or dict index too:

```katnip
scores[2] += 1;
stock["apple"] += 3;
```

`**=` parses but does not work — see [Known gaps](/reference/known-gaps/#-is-not-lowered-yet).

## Showing a variable on the stage

```katnip
showVariable(score);
hideVariable(score);
```

The argument must be a plain variable reference — an expression will not compile, because
the block takes a variable *field*, not an input.

Lists have their own methods for this:

```katnip
scores.show();
scores.hide();
```

## Declaration and initialization

Every variable needs an initializer. The type annotation is optional when the initializer
makes the type obvious:

```katnip
public score = 0;                # num, inferred
public scores: list<num> = [];   # annotation needed: [] says nothing
```

### How initializers reach the project

If a list literal is made entirely of literals, it is **baked straight into the project
file** — the list already has its contents when the project loads:

```katnip
public scores: list<num> = [3, 1, 4, 1, 5];
```

If any element needs a block to compute, the whole list is instead **rebuilt by a
green-flag script**:

```katnip
public roster: list<num> = [1, double(4), 9];   # rebuilt on the flag
```

That matters if you have a script that reads the list before the rebuilding script has
run. Both are green-flag scripts and Scratch does not order them for you.

A list or dict declared inside a proc or handler works too, but it is a statement, not a
one-time setup: it clears and refills on every run rather than persisting like a top-level
one.

```katnip
proc reset() -> void {
    private working: list<num> = [];   # empty at the start of every call
}
```
