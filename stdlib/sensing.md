# sensing

## Touching

```katnip
sensing.touching(target: TouchTarget | str) -> bool          ✅ with a string
sensing.touchingColor(color: str) -> bool                    ✅
sensing.colorTouchingColor(color: str, color2: str) -> bool  ✅
sensing.distanceTo(target: DistanceTarget | str) -> num      ✅ with a string
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

Target strings: `"_edge_"`, `"_mouse_"`, or a sprite's name. Colours are hex strings.

## Mouse and keyboard

```katnip
sensing.keyPressed(key: Key | str) -> bool   ✅
sensing.mouseDown() -> bool                  ✅
sensing.mouseX() -> num                      ✅
sensing.mouseY() -> num                      ✅
```

```katnip
if (sensing.keyPressed(Key.UP_ARROW) && sensing.mouseDown()) {
    motion.changeY(5);
}
if (sensing.keyPressed("a")) { ... }         # letter keys: pass the string
```

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

{% hint style="info" %}
`console.input(prompt)` is meant to be the one-call version of this pair, but it is a
`yields` procedure and yields are not lowered. Use `ask` + `answer`.
{% endhint %}

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
sensing.getProperty(property: str, target: ObjectTarget | str) -> any   ✅ with a string
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

This is currently the only way to read a sprite's x/y — see [motion](motion.md#not-available).

## Date, time, and the user

```katnip
sensing.daysSince2000() -> num           ✅
sensing.isOnline() -> bool               ✅
sensing.username() -> str                ✅
sensing.current(unit: TimeUnit) -> num   ⛔ namespaced enum
```

`sensing.current` is blocked by the namespaced-enum gap, so individual date parts are not
reachable. `daysSince2000()` works and is enough for elapsed-time and seeding.

## Drag mode

```katnip
sensing.setDragMode(mode: DragMode) -> void   ⛔ namespaced enum
```

## Full enum reference

Declared in the namespace and **not reachable** from user code. Listed so you know which
strings the union arms accept:

| Enum | Members |
| --- | --- |
| `sensing.TouchTarget` | `MOUSE` = `"_mouse_"`, `EDGE` = `"_edge_"` |
| `sensing.DistanceTarget` | `MOUSE` = `"_mouse_"` |
| `sensing.ObjectTarget` | `STAGE` = `"_stage_"` |
| `sensing.DragMode` | `DRAGGABLE`, `NOT_DRAGGABLE` |
| `sensing.TimeUnit` | `YEAR`, `MONTH`, `DATE`, `DAY_OF_WEEK`, `HOUR`, `MINUTE`, `SECOND` |
