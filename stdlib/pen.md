# pen

The Scratch pen extension. Katnip detects the `pen_` opcode prefix and adds the extension
to the project automatically — there is nothing to enable.

## Drawing

```katnip
pen.down() -> void    ✅
pen.up() -> void      ✅
pen.clear() -> void   ✅
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

## Colour parameters

```katnip
pen.setAttr(attr: ColorParam, value: num) -> void     ⛔ namespaced enum
pen.changeAttr(attr: ColorParam, dA: num) -> void     ⛔ namespaced enum
```

`pen.ColorParam` is declared inside the namespace, so its members cannot be referenced.
Until that gap closes, use `setHex` — cycling a hue by hand works fine:

```katnip
proc rainbow(steps: num) -> void {
    for (i, steps) {
        pen.setHex(f"#{i}0{i}0{i}0");
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

## Note on stamping

There is no `pen.stamp()`, and unlike some other unwrapped blocks you cannot reach it by
binding the opcode yourself — codegen has no slot metadata for `pen_stamp` and will throw.
The seven procedures above are the whole usable pen surface today.
