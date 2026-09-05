---
title: "Program structure"
---

A `.knip` file is a list of **declarations**. Declarations do not run — they describe what
exists. Code only runs inside an **event handler**, and event handlers only exist inside a
**sprite**.

```katnip
# 1. imports, first
import "./lib/shapes.knip";

# 2. type declarations
enum Fruit { apple, banana, cherry }
struct Point { x: num, y: num }

# 3. globals — these become stage variables
public score: num = 0;
public scores: list<num> = [3, 1, 4];

# 4. top-level procedures — usable from any sprite
proc double(n: num) -> num {
    return n * 2;
}

# 5. the stage — backdrops and stage scripts, if any
stage {
    costume "./assets/sky.svg";
}

# 6. sprites — everything that actually runs
sprite Cat {
    costume "./assets/cat.svg";      # an asset packed into the project
    private lives: num = 9;          # a sprite-local variable

    proc pounce() -> void {          # a sprite-local procedure
        motion.forward(40);
    }

    events.onFlag() {                # a script
        pounce();
        score = double(score);
    }
}
```

The order above is conventional, not required. Declarations are hoisted, so a procedure
can call one declared below it and a sprite can read a global declared after it.

## The three levels

| Level | What can go here | Becomes |
| --- | --- | --- |
| **Top level** | imports, enums, structs, variables, procs, sprites, the stage | Stage-owned state and shared blocks |
| **Sprite or stage body** | costumes, sounds, variables, procs, event handlers | Target-owned assets, state and scripts |
| **Handler / proc body** | statements | Blocks in a script stack |

A statement at the top level with nowhere to go is silently dropped by the IR — this is a
known rough edge. Put executable code inside a handler.

## Statements end with a semicolon

```katnip
score = 0;
looks.say("hi");
```

Blocks — `if`, `while`, `for`, `switch`, `proc`, `sprite`, handlers — do not take a
trailing semicolon.

```katnip
if (score > 10) {
    looks.say("nice");
}
```

The exception is `do { } while ( );` which does, because it is a statement.

## Identifiers and case

Identifiers are case-sensitive: `score` and `Score` are different names. Katnip does not
enforce a naming convention, but the standard library uses `lowerCamelCase` for procedures
and variables, `UpperCamelCase` for types and sprites, and `SCREAMING_CASE` for enum
members with explicit values.

## A note on Scratch's name space

Scratch resolves stage and sprite variable names together, so a sprite cannot own a
variable with the same name as a global. Katnip lets you write it anyway and renames the
sprite's copy to `Sprite_name` in the output:

```katnip
public greeting: str = "Katnip";

sprite Cat {
    private greeting: str = "Cat";   # emitted as `Cat_greeting`
}
```

Inside `Cat`, `greeting` reads `"Cat"`. Every other sprite reads `"Katnip"`.

## Next

* [Comments](/language/comments/) — all six of them
* [Types](/language/types/)
* [Variables](/language/variables/)
