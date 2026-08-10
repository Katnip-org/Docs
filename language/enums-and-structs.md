# Enums and structs

## Enums

An enum is a nominal set of named constants.

```katnip
enum Fruit { apple, banana, cherry }
enum Team { red = "R", blue = "B" }
```

### Implicit vs explicit values

This distinction matters more than it looks.

**Implicit** members — no `=` — fold to the **qualified** name:

```katnip
Fruit.banana        # the string "Fruit.banana"
```

**Explicit** members keep their value **verbatim**:

```katnip
Team.red            # the string "R"
```

The qualification is what makes enums nominal: two enums that both have a member called
`red` never compare equal, because one folds to `"Fruit.red"` and the other to
`"Team.red"`.

Explicit values exist for the opposite reason — when the value has to match something
Scratch already expects. Every stdlib enum that feeds a Scratch field or menu uses them:

```katnip
enum StopType { ALL = "all", THIS_SCRIPT = "this script", ... }
enum RotationStyle { LEFT_RIGHT = "left-right", ALL_AROUND = "all around", ... }
```

{% hint style="warning" %}
If you write an enum whose members feed a Scratch dropdown, give every member an explicit
value. An implicit member sends `"MyEnum.member"` into the field, which Scratch will not
match.
{% endhint %}

### Using enums

Members fold to compile-time constants, so they cost nothing at runtime:

```katnip
private pick: Fruit = Fruit.banana;

if (pick == Fruit.apple) { ... }

switch (pick) {
    case (Fruit.apple, Fruit.cherry) { looks.think("red-ish", 1); }
    default { looks.think("something else", 1); }
}
```

Comparison between two enum values is a `bool`, so enums work as procedure parameters and
dispatch normally:

```katnip
proc effectiveness(attacker: Element, defender: Element) -> num {
    if (attacker == Element.WATER && defender == Element.FIRE) { return 2; }
    return 1;
}
```

A `case` label is checked against the switch value's type, so a label that could never
match is an error rather than a dead branch:

```katnip
switch (pick) {
    case (Team.red) { ... }   # error, if pick is a Fruit
}
```

`switch` over an enum is still **not** checked for exhaustiveness. Always add a `default`.

### Literal coercion

A **literal** whose value is one of an enum's member values is assignable to that enum:

```katnip
enum Team { red = "R", blue = "B" }

private t: Team = "R";          # same as Team.red
```

Both forms fold to the identical value, so they emit identical blocks. This is what makes
the standard library's menu parameters pleasant to call:

```katnip
pen.setAttr(pen.ColorParam.COLOR, 10);
pen.setAttr("color", 10);                 # identical output
```

The rule lives in assignability itself, so it applies everywhere a value meets a type —
arguments, initializers, assignments, `return`, struct field defaults, list and dict
elements, and `case` labels.

A literal that misses gets the member list and a did-you-mean:

```
"colour" is not a value of enum 'ColorParam'; must be one of:
"color", "saturation", "brightness", "transparency". Did you mean "color"?
```

Coercion matches the **lowered** value, which is the one qualification affects. For an enum
whose members are implicit, that means the qualified string:

```katnip
enum Fruit { apple, banana }

private f: Fruit = "Fruit.apple";   # ✅ but nobody writes this
private g: Fruit = "apple";         # error: not a value of enum 'Fruit'
private h: Fruit = Fruit.apple;     # ✅ write this
```

So coercion is really for enums with explicit values — which is every enum that feeds a
Scratch menu. On your own implicit enums, keep using the member.

{% hint style="warning" %}
Only a **literal** coerces. A variable, a call, or a concatenation of the backing type is
rejected, and there is no `Enum(x)` cast to force one:

```katnip
private attr: str = "color";
pen.setAttr(attr, 10);       # error: expects one of its members here, not a computed 'str'
```

The slot is a Scratch *menu* — a shadow block — so a reporter there is legal but almost
always a mistake. See [Known gaps](../reference/known-gaps.md#no-cast-to-an-enum).
{% endhint %}

### Enums declared inside a namespace

The standard library declares enums like `motion.RotationStyle` and `looks.GraphicEffect`
inside its namespaces. Reference them through the namespace:

```katnip
motion.setRotationStyle(motion.RotationStyle.LEFT_RIGHT);   # ✅
looks.setEffect(looks.GraphicEffect.GHOST, 50);             # ✅
```

A namespaced enum stays **out of global scope** — the bare name is undefined:

```katnip
motion.setRotationStyle(RotationStyle.LEFT_RIGHT);   # error: 'RotationStyle' is not defined
```

The prelude enums have no namespace, so they *are* bare names:

```katnip
Key.SPACE            # ✅
StopType.ALL         # ✅
```

{% hint style="info" %}
Members of a stdlib enum written **without** `=` fold to the bare member name, not the
qualified one — `looks.GraphicEffect.GHOST` is `"GHOST"`, which is what the Scratch field
expects. The qualification rule above applies to enums you declare yourself.
{% endhint %}

## Structs

A struct is a nominal record type with named, scalar fields.

```katnip
struct Point { x: num, y: num }
struct Cfg   { a: num = 1, b: num = 2 }
```

### Construction

Struct literals take **named fields only** — positional arguments are an error. Fields with
defaults may be omitted:

```katnip
private p: Point = Point(x = 1, y = 2);
private c: Cfg   = Cfg(a = 5);            # b = 2
```

### Field access

```katnip
private a: num = p.x;
p.x = 10;
```

### Struct lists and field columns

A `list<Point>` supports both element access and whole-column access:

```katnip
private ps: list<Point> = [];
private one: num = ps[1].x;        # one element's field
private col: list<num> = ps.x;     # every element's x, as a list
```

### Rules

* Fields must be **scalar** — `list<num>` as a field is rejected.
* Duplicate field names are rejected.
* A field default must match the field's type.
* Missing required fields and unknown fields are reported at construction.
* Struct-typed parameters and return types are allowed.

{% hint style="danger" %}
**Structs do not reach the `.sb3`.** The analyzer is complete for them — every rule above
is enforced — but the IR no-ops struct literals, field reads and field writes. A build
containing structs produces a project with the struct code missing.

Until lowering lands, model records as parallel lists:

```katnip
public point_x: list<num> = [];
public point_y: list<num> = [];
```
{% endhint %}
