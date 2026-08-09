# motion

## Moving

```katnip
motion.forward(steps: num) -> void       ✅   # "move () steps"
motion.turn(degrees: num) -> void        ✅   # "turn right () degrees"
```

Turn left by turning a negative amount:

```katnip
motion.forward(100);
motion.turn(90);
motion.turn(-90);
```

## Going to a position

```katnip
motion.goTo(x: num, y: num) -> void                  ✅
motion.goTo(position: Target | str) -> void          ✅ with a string
motion.glideTo(time: num, x: num, y: num) -> void    ✅
motion.glideTo(time: num, position: Target | str)    ✅ with a string
```

```katnip
motion.goTo(0, 0);
motion.goTo("_random_");
motion.goTo(y = 0, x = 0);        # named arguments
motion.glideTo(1, 100, 50);
motion.glideTo(1, "_random_");
```

Target strings: `"_random_"`, `"_mouse_"`, or a sprite's name.

## Pointing

```katnip
motion.point(degrees: num) -> void        ✅
motion.point(target: Target) -> void      ⛔ namespaced enum
```

```katnip
motion.point(90);        # right
motion.point(0);         # up
motion.point(-90);       # left
motion.point(180);       # down
```

The `point(target)` overload takes a bare `Target` with no `str` arm, so it cannot be
called. To point at the mouse, aim with `sensing.mouseX` / `mouseY`, or glide instead:

```katnip
motion.glideTo(0, "_mouse_");     # 0-second glide ≈ go to
```

## Changing x and y

```katnip
motion.changeX(dX: num) -> void   ✅
motion.setX(x: num) -> void       ✅
motion.changeY(dY: num) -> void   ✅
motion.setY(y: num) -> void       ✅
```

```katnip
motion.changeY(5);
motion.setX(0);
```

## Edges and rotation

```katnip
motion.ifOnEdgeBounce() -> void                   ✅
motion.setRotationStyle(style: RotationStyle)     ⛔ namespaced enum
```

## Not available

**Reading position.** There is no `motion.x()` or `motion.y()` reporter in the stdlib, and
`motion.getPosition()` resolves to `katnip_motion_position`, which has no codegen.

The underlying Scratch blocks *do* have codegen metadata, so bind them yourself:

```katnip
proc x(@opcode = "motion_xposition") -> num {}
proc y(@opcode = "motion_yposition") -> num {}

proc drift() -> void {
    if (x() > 200) { motion.setX(-200); }
}
```

To read *another* sprite's position, go through sensing:

```katnip
temp cx: num = sensing.getProperty("x position", "Cat");
```

## Full enum reference

These are declared in the namespace and are **not reachable** from user code. Listed so you
know which strings the union arms accept:

| `motion.Target` | Value |
| --- | --- |
| `RANDOM` | `"_random_"` |
| `MOUSE` | `"_mouse_"` |

| `motion.RotationStyle` | Value |
| --- | --- |
| `LEFT_RIGHT` | `"left-right"` |
| `ALL_AROUND` | `"all around"` |
| `NONE` | `"don't rotate"` |
