---
title: "Variables"
---

Every variable declaration carries an **access modifier**. There is no bare `let` or
`var` — the modifier is how you say where the variable lives and who can see it.

| Modifier | Visible to | Lives on |
| --- | --- | --- |
| `public` | this file, and other files that import it | stage or sprite |
| `private` | this file only | stage or sprite |
| `temp` | this scope only *(see the warning below)* | a mangled global |

```katnip
public score: num = 0;
private secret: num = 42;

proc tally() -> void {
    temp running: num = 0;
    running += score;
}
```

## Where a declaration puts the variable

**Top level** → a stage-owned global, visible from every sprite:

```katnip
public score: num = 0;          # "score" on the stage
```

**Inside a sprite** → a sprite-owned member, visible only within that sprite:

```katnip
sprite Cat {
    private lives: num = 9;     # "lives" on Cat
}
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

## `temp` is not a local

`temp` is the closest thing Katnip has to a local variable, and it is important to
understand what it actually is: **a global with a mangled name**.

```katnip
proc tally() -> void {
    temp running: num = 0;
    running += 1;
}
```

That emits one Scratch variable, reused by every call. Scratch has no call-frame storage,
so there is nowhere else to put it.

:::caution
**A `temp` does not survive recursion.** If a procedure calls itself, the inner call
overwrites the outer call's `temp` and the outer call resumes with the wrong value. This
is by design — it is what Scratch can do — but it will bite you.

Return values *do* survive recursion; the compiler gives recursive procedures a stack.
See [Returning values](/language/procedures/#returning-values). Prefer passing state through
parameters and returns over `temp` in any procedure that might recurse.
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

`**=` parses but does not work — see [Known gaps](/reference/known-gaps/#-does-not-work).

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

:::caution
Lists and dicts can only be declared at the top level or in a sprite body. Declaring one
inside a proc or handler is not lowered. See
[Known gaps](/reference/known-gaps/#lists-and-dicts-must-be-declared-at-the-top-level).
:::
