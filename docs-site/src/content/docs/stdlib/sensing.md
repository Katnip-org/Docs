---
title: "sensing"
---

## Touching

```katnip
sensing.touching(target: TouchTarget | str) -> bool          ✅
sensing.touchingColor(color: str) -> bool                    ✅
sensing.colorTouchingColor(color: str, color2: str) -> bool  ✅
sensing.distanceTo(target: DistanceTarget | str) -> num      ✅
```

```katnip
if (sensing.touching("_edge_")) {
    motion.turn(180);
}
if (sensing.touching("Apple")) {
    score += 1;
}
if (sensing.touchingColor("#ff8800")) { ... }

temp d: num = sensing.distanceTo("_mouse_");
```

Target strings: `"_edge_"`, `"_mouse_"`, or a sprite's name. These menus also list sprite
names, so both parameters keep an `| str` arm and take a computed name. Colours are hex
strings.

## Mouse and keyboard

```katnip
sensing.keyPressed(key: Key) -> bool   ✅
sensing.mouseDown() -> bool            ✅
sensing.mouseX() -> num                ✅
sensing.mouseY() -> num                ✅
```

```katnip
if (sensing.keyPressed(Key.UP_ARROW) && sensing.mouseDown()) {
    motion.changeY(5);
}
if (sensing.keyPressed("a")) { ... }         # letter keys, as a literal
```

`key` is a bare `Key` — the keyboard menu is a closed set, so a literal is checked against
it. `sensing.keyPressed("q")` is fine; `sensing.keyPressed("ctrl")` is an error listing
every key.

## Asking

```katnip
sensing.ask(question: str) -> void   ✅
sensing.answer() -> str              ✅
```

`ask` blocks until the user answers; `answer` reads the result.

```katnip
sensing.ask("How many treats?");
temp treats: str = sensing.answer();
looks.say(f"treats: {treats}", 1);
```

:::note
`console.input(prompt)` is meant to be the one-call version of this pair, but it is a
`yields` procedure and yields are not lowered. Use `ask` + `answer`.
:::

## Timer and loudness

```katnip
sensing.timer() -> num          ✅
sensing.resetTimer() -> void    ✅
sensing.loudness() -> num       ✅
```

```katnip
sensing.resetTimer();
while (sensing.timer() < 10) {
    motion.forward(1);
}
```

## Other sprites and the stage

```katnip
sensing.getProperty(property: str, target: ObjectTarget | str) -> any   ✅
```

Scratch's `() of ()` block. Target is `"_stage_"` or a sprite name; property is the
dropdown's text.

```katnip
temp x: num = sensing.getProperty("x position", "Cat");
temp bg: any = sensing.getProperty("backdrop #", "_stage_");
```

Common properties: `"x position"`, `"y position"`, `"direction"`, `"costume #"`,
`"costume name"`, `"size"`, `"volume"`, `"backdrop #"`, `"backdrop name"`, or a variable's
name.

This is currently the only way to read a sprite's x/y — see [motion](/stdlib/motion/#not-available).

## Date, time, and the user

```katnip
sensing.daysSince2000() -> num           ✅
sensing.isOnline() -> bool               ✅
sensing.username() -> str                ✅
sensing.current(unit: TimeUnit) -> num   ✅
```

```katnip
temp year: num  = sensing.current(sensing.TimeUnit.YEAR);
temp hour: num  = sensing.current("HOUR");        # identical
```

## Drag mode

```katnip
sensing.setDragMode(mode: DragMode) -> void   ✅
```

```katnip
sensing.setDragMode(sensing.DragMode.NOT_DRAGGABLE);
sensing.setDragMode("not draggable");             # identical
```

## Full enum reference

Reference a member through the namespace (`sensing.DragMode.DRAGGABLE`), or pass the value
as a literal.

| Enum | Members |
| --- | --- |
| `sensing.TouchTarget` | `MOUSE` = `"_mouse_"`, `EDGE` = `"_edge_"` |
| `sensing.DistanceTarget` | `MOUSE` = `"_mouse_"` |
| `sensing.ObjectTarget` | `STAGE` = `"_stage_"` |
| `sensing.DragMode` | `DRAGGABLE` = `"draggable"`, `NOT_DRAGGABLE` = `"not draggable"` |
| `sensing.TimeUnit` | `YEAR`, `MONTH`, `DATE`, `DAY_OF_WEEK` = `"DAYOFWEEK"`, `HOUR`, `MINUTE`, `SECOND` |

:::note
`TimeUnit` members other than `DAY_OF_WEEK` have no explicit value, so they fold to the
bare member name — the literal form is `"YEAR"`, uppercase, not `"year"`.
:::
