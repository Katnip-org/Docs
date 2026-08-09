# Comments

Katnip has six comment forms. All start with `#`. The character after the `#` picks the
form.

| Syntax | Span | Intent |
| --- | --- | --- |
| `# text` | to end of line | Expanded |
| `#* text` | to end of line | Collapsed |
| `#! text` | to end of line | Ignored |
| `#< text >#` | multi-line | Expanded |
| `#> text <#` | multi-line | Collapsed |
| `#[ text ]#` | multi-line | Ignored |

```katnip
# an ordinary comment

#* a collapsed comment

#! this one is dropped at the lexer

#< an expanded
   multi-line comment >#

#> a collapsed
   multi-line comment <#

#[ this whole block
   is dropped at the lexer ]#
```

## What "expanded", "collapsed" and "ignored" mean

Scratch comments attach to blocks and can be shown open or folded in the editor. The three
intents map onto that:

* **Expanded** — meant to appear open in the Scratch editor.
* **Collapsed** — meant to appear folded.
* **Ignored** — never meant to leave your source. Dropped by the lexer; the parser never
  sees it.

{% hint style="warning" %}
Only the *ignored* forms currently do what they say. Expanded and collapsed comments are
lexed into tokens, but the parser discards them, so **no comment reaches the `.sb3`**
today. Use whichever form reads best in your editor; the distinction is forward-looking.

See [Known gaps](../reference/known-gaps.md#comments-never-reach-the-sb3).
{% endhint %}

## Conventions in the standard library

The Katnip source uses `#>` for file headers — a collapsed multi-line comment at the top
of a file:

```katnip
#> motion.knip ~ sprite motion blocks. <#
```

and plain `#` for everything inline.
