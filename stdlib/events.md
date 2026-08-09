# events

Hat blocks and broadcasts. Handlers must appear at a sprite's top level.

## Hats

```katnip
events.onFlag() { ... }                                  ✅
events.onKey(key: Key) { ... }                           ✅
events.onClick() { ... }                                 ✅
events.onBackdropSwitch(backdrop: str) { ... }           ✅
events.onBroadcast(broadcast: str) { ... }               ✅
events.onGreaterThan(property, threshold: num) { ... }   ⛔
```

```katnip
sprite Cat {
    events.onFlag() {
        motion.goTo(0, 0);
        looks.show();
    }

    events.onKey(Key.SPACE) {
        clone.create("_myself_");
    }

    events.onClick() {
        looks.say("ow", 1);
    }

    events.onBackdropSwitch("backdrop1") {
        looks.say("new scene", 1);
    }

    events.onBroadcast("tally") {
        looks.say(f"score is {score}", 1);
    }
}
```

### `onGreaterThan` is unusable

Its `property` parameter is `GreaterThanProperty`, an enum declared inside the `events`
namespace — and namespaced enum members cannot be referenced from user code. Poll instead:

```katnip
events.onFlag() {
    while (true) {
        if (sensing.timer() > 10) {
            looks.say("time!", 1);
            sensing.resetTimer();
        }
    }
}
```

## Broadcasts

```katnip
events.broadcast(broadcast: str) -> void          ✅
events.broadcastAndWait(broadcast: str) -> void   ✅
```

`broadcast` fires and returns immediately. `broadcastAndWait` blocks until every receiving
script has finished.

```katnip
events.broadcast("tally");
events.broadcastAndWait("checked");
```

The name may be computed:

```katnip
events.broadcast(f"level-{level}");
```

{% hint style="warning" %}
Scratch registers broadcast names when the project loads, from the literal names it finds.
A computed name only reaches a receiver whose literal name matches, so at least one
`events.onBroadcast("level-1")` must exist for `f"level-{1}"` to arrive.
{% endhint %}

## Why broadcasts matter in Katnip

A sprite cannot call another sprite's procedure — Scratch custom blocks belong to a target.
Broadcasts are the only cross-sprite control flow there is. A common shape:

```katnip
public score: num = 0;

sprite Player {
    events.onClick() {
        score += 10;
        events.broadcast("scored");
    }
}

sprite Scoreboard {
    events.onBroadcast("scored") {
        looks.say(f"Score: {score}", 1);
    }
}
```

Data goes through a top-level `public` variable (a stage global); the *timing* goes through
the broadcast.
