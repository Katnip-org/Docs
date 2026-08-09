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
temp pick: Fruit = Fruit.banana;

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

`switch` over an enum is **not** checked for exhaustiveness. Always add a `default`.

### Enums declared inside a namespace

The standard library declares enums like `motion.RotationStyle` and `looks.GraphicEffect`
inside its namespaces. **Those members are not reachable from user code** —
`motion.RotationStyle.LEFT_RIGHT` is a semantic error.

The prelude enums are reachable, because the prelude has no namespace:

```katnip
Key.SPACE            # works
StopType.ALL         # works
motion.Target.RANDOM # error: Type 'Target' has no member 'RANDOM'
```

Where the parameter accepts `Enum | str`, pass the string:

```katnip
motion.goTo("_random_");
sensing.touching("_edge_");
```

Where it does not, the procedure is currently unusable. The full list is in
[Known gaps](../reference/known-gaps.md#namespaced-enum-members-are-unreachable).

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
temp p: Point = Point(x = 1, y = 2);
temp c: Cfg   = Cfg(a = 5);            # b = 2
```

### Field access

```katnip
temp a: num = p.x;
p.x = 10;
```

### Struct lists and field columns

A `list<Point>` supports both element access and whole-column access:

```katnip
temp ps: list<Point> = [];
temp one: num = ps[1].x;        # one element's field
temp col: list<num> = ps.x;     # every element's x, as a list
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
