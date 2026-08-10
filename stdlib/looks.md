# looks

## Saying and thinking

```katnip
looks.say(msg: str) -> void                       ✅
looks.say(msg: str, seconds: num) -> void         ✅
looks.think(msg: str) -> void                     ✅
looks.think(msg: str, seconds: num) -> void       ✅
```

The one-argument form shows the bubble and continues; the two-argument form waits.

```katnip
looks.say("stretching");
looks.say(f"{name} scored {score}", 2);
looks.think("...");
```

The message must be a `str`. Use an interpolated string to include a number — the `Str()`
cast is not lowered yet.

## Costumes and backdrops

```katnip
looks.switchCostume(costume: str) -> void                ✅
looks.nextCostume() -> void                              ✅
looks.switchBackdrop(backdrop: Backdrop | str) -> void   ✅
looks.nextBackdrop() -> void                             ✅
looks.costume(mode: NumberName = NUMBER) -> any          ✅
looks.backdrop(mode: NumberName = NUMBER) -> any         ✅
```

```katnip
looks.switchCostume("costume1");
looks.nextCostume();
looks.switchBackdrop("next backdrop");

private c: any = looks.costume();            # number, the default
private n: any = looks.costume("name");      # or looks.NumberName.NAME
```

Backdrop strings: `"next backdrop"`, `"previous backdrop"`, `"random backdrop"`, or a
backdrop name. That menu also lists backdrop names, so it keeps its `| str` arm and takes a
computed name.

{% hint style="warning" %}
Katnip does not import assets. Every sprite gets the same default costume, so a name you
switch to has to be added by hand after building. See
[Known gaps](../reference/known-gaps.md#no-asset-import).
{% endhint %}

## Size

```katnip
looks.changeSize(dSize: num) -> void   ✅
looks.setSize(size: num) -> void       ✅
looks.size() -> num                    ✅
```

```katnip
looks.setSize(looks.size() / 2);
looks.changeSize(10);
```

## Visibility

```katnip
looks.show() -> void   ✅
looks.hide() -> void   ✅
```

## Graphic effects

```katnip
looks.clearEffects() -> void                             ✅
looks.changeEffect(effect: GraphicEffect, change: num)   ✅
looks.setEffect(effect: GraphicEffect, value: num)       ✅
```

```katnip
looks.setEffect(looks.GraphicEffect.GHOST, 50);
looks.setEffect("GHOST", 50);              # identical
looks.changeEffect("WHIRL", 25);
looks.clearEffects();
```

{% hint style="warning" %}
`GraphicEffect` members have no explicit value, so they fold to the bare member name — the
literal form is `"GHOST"`, **uppercase**. `"ghost"` is an error.
{% endhint %}

## Layers

```katnip
looks.goToLayer(position: LayerPosition) -> void            ✅
looks.changeLayer(direction: LayerDirection, layers: num)   ✅
```

```katnip
looks.goToLayer("front");
looks.changeLayer("backward", 2);
```

## Full enum reference

Reference a member through the namespace (`looks.GraphicEffect.GHOST`), or pass the value
as a literal.

| `looks.Backdrop` | Value |
| --- | --- |
| `NEXT` | `"next backdrop"` |
| `PREVIOUS` | `"previous backdrop"` |
| `RANDOM` | `"random backdrop"` |

| Enum | Members | Literal form |
| --- | --- | --- |
| `looks.GraphicEffect` | `COLOR`, `FISHEYE`, `WHIRL`, `PIXELATE`, `MOSAIC`, `BRIGHTNESS`, `GHOST` | the member name, uppercase |
| `looks.LayerPosition` | `FRONT`, `BACK` | `"front"`, `"back"` |
| `looks.LayerDirection` | `FORWARD`, `BACKWARD` | `"forward"`, `"backward"` |
| `looks.NumberName` | `NUMBER`, `NAME` | `"number"`, `"name"` |
