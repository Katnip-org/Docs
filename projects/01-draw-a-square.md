# Project 1 — Draw a square

**You will build:** a turtle that draws a square, then any polygon, then a spiral on the
space bar.

**You will learn:** sprites, event handlers, `for` loops, procedures, parameters, globals,
and the pen.

Make a file called `turtle.knip`.

---

## Step 1 — Something on screen

```katnip
sprite Turtle {
    events.onFlag() {
        looks.say("ready", 1);
    }
}
```

```bash
katnip build turtle.knip
```

Drag `turtle.sb3` onto [TurboWarp](https://turbowarp.org) and click the flag. The cat says
"ready".

Two rules are already visible here:

* Code lives inside a **sprite**. A `.knip` file with statements at the top level and no
  sprite compiles to a project that does nothing.
* Code runs inside an **event handler**. `events.onFlag()` is Scratch's green-flag hat.

## Step 2 — Draw the square

Replace the handler:

```katnip
sprite Turtle {
    events.onFlag() {
        looks.hide();
        pen.clear();
        motion.goTo(-50, -50);
        motion.point(90);

        pen.setSize(3);
        pen.setHex("#ff8800");

        pen.down();
        motion.forward(100);
        motion.turn(90);
        motion.forward(100);
        motion.turn(90);
        motion.forward(100);
        motion.turn(90);
        motion.forward(100);
        motion.turn(90);
        pen.up();
    }
}
```

Rebuild, drag in, flag. An orange square.

`looks.hide()` gets the cat out of the way — the pen still draws while the sprite is
hidden. `motion.point(90)` faces right, so the first side goes the direction you expect
even after a previous run left it turned.

{% hint style="info" %}
You did not enable the pen extension anywhere. Katnip notices the `pen_` opcodes and adds
the extension to the project for you.
{% endhint %}

## Step 3 — A loop

Four identical pairs of lines is exactly what a loop is for:

```katnip
        pen.down();
        for (side, 4) {
            motion.forward(100);
            motion.turn(90);
        }
        pen.up();
```

`for (side, 4)` runs the body four times with `side` counting 1, 2, 3, 4. It compiles to
Scratch's own counted loop, `repeat (4)`.

You are not using `side` yet. That is fine — the binding is required, using it is not.

## Step 4 — Make it a procedure

A square is a polygon with four sides. Pull the drawing out into a procedure and let the
caller choose:

```katnip
proc drawPolygon(count: num, length: num) -> void {
    pen.down();
    for (side, count) {
        motion.forward(length);
        motion.turn(360 / count);
    }
    pen.up();
}

sprite Turtle {
    events.onFlag() {
        looks.hide();
        pen.clear();
        motion.goTo(-50, -50);
        motion.point(90);
        pen.setSize(3);
        pen.setHex("#ff8800");

        drawPolygon(4, 100);
    }
}
```

`360 / count` is the exterior-angle trick: any closed polygon turns 360° in total.

Three things to notice about `proc`:

* **Parameters are typed.** `count: num` is not optional decoration — pass a string and the
  compiler stops you.
* **`-> void` means it returns nothing.** Every procedure declares a return type.
* **It is at the top level**, outside the sprite, so any sprite can call it. A `proc`
  declared inside a sprite belongs to that sprite alone.

In the output this becomes a Scratch custom block called `drawPolygon`, with two inputs.

Try `drawPolygon(3, 120)`, `drawPolygon(8, 50)`, `drawPolygon(30, 12)`.

## Step 5 — Globals

Hard-coded numbers in the handler are hard to find later. Lift them:

```katnip
public sides: num = 4;
public sideLength: num = 100;

proc drawPolygon(count: num, length: num) -> void { ... }

sprite Turtle {
    events.onFlag() {
        ...
        drawPolygon(sides, sideLength);
    }
}
```

A `public` variable at the top level becomes a **stage variable** — visible to every
sprite, and visible to you in the Scratch editor, where you can tick its checkbox and drag
a slider onto it while the project runs.

`public` vs `private` is about other *files*, not other sprites: `private` means "not
exported when someone imports this file". Both live on the stage.

## Step 6 — A second script

Handlers are independent scripts. Add one for the space bar:

```katnip
    events.onKey(Key.SPACE) {
        pen.clear();
        motion.goTo(0, 0);
        motion.point(90);

        temp length: num = 5;
        pen.down();
        for (step, 60) {
            motion.forward(length);
            motion.turn(89);
            length += 2;
        }
        pen.up();
    }
```

Rebuild, run, press space. A spiral — because 89° never quite closes the shape.

`temp` is Katnip's closest thing to a local variable. It is worth knowing now what it
actually is: **a global with a mangled name**. Scratch has no per-call storage, so there is
nowhere else to put it. It works fine here, and it will quietly break if you ever use one
in a recursive procedure. See [Variables](../language/variables.md#temp-is-not-a-local).

## The finished file

```katnip
public sides: num = 4;
public sideLength: num = 100;

proc drawPolygon(count: num, length: num) -> void {
    pen.down();
    for (side, count) {
        motion.forward(length);
        motion.turn(360 / count);
    }
    pen.up();
}

sprite Turtle {
    events.onFlag() {
        looks.hide();
        pen.clear();
        motion.goTo(-50, -50);
        motion.point(90);
        pen.setSize(3);
        pen.setHex("#ff8800");
        drawPolygon(sides, sideLength);
    }

    events.onKey(Key.SPACE) {
        pen.clear();
        motion.goTo(0, 0);
        motion.point(90);
        temp length: num = 5;
        pen.down();
        for (step, 60) {
            motion.forward(length);
            motion.turn(89);
            length += 2;
        }
        pen.up();
    }
}
```

## Try it yourself

* Draw a row of five polygons with 3, 4, 5, 6 and 7 sides. *(A `for` loop around
  `drawPolygon`, with `motion.goTo` between calls.)*
* Change the colour each iteration. `pen.setHex` takes a hex string, and `f"#{r}0{g}0"`
  builds one.
* Make the spiral angle a global you can slide in the Scratch editor.

## Next

[Project 2 — A clicking game](02-a-clicking-game.md), where two sprites talk to each other.
