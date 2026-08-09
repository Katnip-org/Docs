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
looks.switchBackdrop(backdrop: Backdrop | str) -> void   ✅ with a string
looks.nextBackdrop() -> void                             ✅
looks.costume(mode: NumberName = NUMBER) -> any          ✅ default only
looks.backdrop(mode: NumberName = NUMBER) -> any         ✅ default only
```

```katnip
looks.switchCostume("costume1");
looks.nextCostume();
looks.switchBackdrop("next backdrop");

temp c: any = looks.costume();      # number, the default
```

Backdrop strings: `"next backdrop"`, `"previous backdrop"`, `"random backdrop"`, or a
backdrop name.

The `mode` parameter of `costume()` / `backdrop()` is a namespaced enum, so you cannot pass
`NAME` — only the default `NUMBER` mode is reachable.

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
looks.changeEffect(effect: GraphicEffect, change: num)   ⛔ namespaced enum
looks.setEffect(effect: GraphicEffect, value: num)       ⛔ namespaced enum
```

Only `clearEffects()` is usable. `changeEffect` and `setEffect` need
`looks.GraphicEffect.GHOST`, which the analyzer cannot resolve.

## Layers

```katnip
looks.goToLayer(position: LayerPosition) -> void            ⛔ namespaced enum
looks.changeLayer(direction: LayerDirection, layers: num)   ⛔ namespaced enum
```

Both are blocked by the same gap.

## Full enum reference

Declared in the namespace and **not reachable** from user code. Listed so you know which
strings the union arms accept:

| `looks.Backdrop` | Value |
| --- | --- |
| `NEXT` | `"next backdrop"` |
| `PREVIOUS` | `"previous backdrop"` |
| `RANDOM` | `"random backdrop"` |

| `looks.GraphicEffect` | `looks.LayerPosition` | `looks.LayerDirection` | `looks.NumberName` |
| --- | --- | --- | --- |
| `COLOR`, `FISHEYE`, `WHIRL`, `PIXELATE`, `MOSAIC`, `BRIGHTNESS`, `GHOST` | `FRONT`, `BACK` | `FORWARD`, `BACKWARD` | `NUMBER`, `NAME` |
