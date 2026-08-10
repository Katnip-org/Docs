# pen

The Scratch pen extension. Katnip detects the `pen_` opcode prefix and adds the extension
to the project automatically — there is nothing to enable.

## Drawing

```katnip
pen.down() -> void    ✅
pen.up() -> void      ✅
pen.clear() -> void   ✅
pen.stamp() -> void   ✅
```

```katnip
pen.clear();
pen.down();
for (side, 4) {
    motion.forward(100);
    motion.turn(90);
}
pen.up();
```

## Colour

```katnip
pen.setHex(hex: str) -> void   ✅
```

```katnip
pen.setHex("#ff8800");
```

## Size

```katnip
pen.setSize(size: num) -> void      ✅
pen.changeSize(dS: num) -> void     ✅
```

```katnip
pen.setSize(3);
pen.changeSize(1);
```

`stamp` prints the sprite's current costume onto the pen layer, at its current position,
size, and direction.

## Colour parameters

```katnip
pen.setAttr(attr: ColorParam, value: num) -> void     ✅
pen.changeAttr(attr: ColorParam, dA: num) -> void     ✅
```

Pass the member or the literal — they compile to the same menu shadow:

```katnip
pen.setAttr(pen.ColorParam.COLOR, 50);
pen.setAttr("color", 50);                # identical

proc rainbow(steps: num) -> void {
    pen.setAttr("color", 0);
    for (i, steps) {
        pen.changeAttr("color", 100 / steps);
        motion.forward(5);
        motion.turn(360 / steps);
    }
}
```

## Full enum reference

| `pen.ColorParam` | Value |
| --- | --- |
| `COLOR` | `"color"` |
| `SATURATION` | `"saturation"` |
| `BRIGHTNESS` | `"brightness"` |
| `TRANSPARENCY` | `"transparency"` |
