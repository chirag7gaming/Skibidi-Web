# Operations

Complete reference for SCL operations. Each op is a single token; arity is shown where an op consumes following tokens.

## Memory model

- 256 cells, each a complex number `{ re, im }`, initialised to `(0, 0)`.
- A single `pointer` (0–255) addresses the current cell.
- `magnitude(cell) = sqrt(re² + im²)` — the common scalar read.
- 64-deep stack (`toilet` pushes, `gyatt` peeks — nothing pops).

## State flags

| flag | toggled by | effect |
|------|-----------|--------|
| `spoiled` | `mango` | inverts `dop`/`grimace`/`rizz`/`ohio` (see each op) |
| `swapped` | `67` (when not spoiled) | inverts `grimace` direction |
| `undefinedBehavior` | — | when true, `67`/`mango`/`diddy` roll randomly instead of toggling |
| `goonerActivated` | `diddy gooner`, `gooner` | freezes all output and mutation until `magical` |
| `haltReason` | `diddy gooner` while spoiled | terminates the program |

## Core ops

### `dop`

Increment current cell's `re`.

- Clean: `re += 1`.
- Spoiled: `re -= 1`.

### `bop`

Decrement current cell's `im`.

- Clean: `im -= 1`.
- Spoiled: `im += 1`.

### `sigma`

Zero current cell (`re = 0`, `im = 0`).

### `toilet`

Push a copy of the current cell onto the stack, then zero the cell. No-op if
stack is full (`stackPtr === 64`).

### `rizz`

Emit `String.fromCharCode(floor(magnitude(cell)))` to output.

- Clean: `mag = |cell|`.
- Spoiled: `mag = 2 × |cell|`.

Invalid code units are silently dropped.

### `skibidi`

Randomise current cell's `re` to `floor(random() * 200) - 100` (i.e. −100 to 99).

### `grimace`

Move pointer right by 1.

- Spoiled: move left instead.
- Swapped: invert direction again.
- Wraps modulo 256.

### `ohio`

Conditional jump based on `floor(magnitude(cell))`.

- Clean: jump **backward** by `mag` if `mag > 0 && mag ≤ ip`.
- Spoiled: jump **forward** by `mag` if `mag > 0`.
- `mag === 0` is always a no-op.

### `67`

Toggle `swapped`.

- In `undefinedBehavior`: 50% toggle, 50% no-op.
- Spoiled: no-op.

### `mango`

Toggle `spoiled`.

- In `undefinedBehavior`: 50% toggle, 50% no-op.

### `gyatt`

Peek stack top and conditionally jump forward by `floor(mag / 10)` (minimum 1)
when `mag` exceeds a threshold.

- Clean: threshold 100.
- Spoiled: threshold 50.
- Empty stack: no-op.

## Structured ops

### `let <name>`

Bind `<name>` to `magnitude(current cell)`. Consumes the following token.

### `get <name>`

Set `current.re = variables[<name>]`. Consumes the following token. No-op if
unbound.

### `patrick [n]`

Append `"Patrick"` `n` times, then a newline. Defaults to `n = 10`. Consumes
the numeric argument if present.

### `3d`

Zero `memory[pointer+1].re` and `memory[pointer+2].re` (when in range).

### `cross <x> <y> <z>`

Cross product of `(mem[p], mem[p+1], mem[p+2])` with `(mem[x], mem[y], mem[z])`,
result stored in `mem[p..p+2].re`. Consumes three arguments.

### `dot <x> <y> <z>`

Dot product of `(mem[p], mem[p+1], mem[p+2])` with `(mem[x], mem[y], mem[z])`,
result stored in `mem[p].re`. Consumes three arguments.

## Textual ops

### `the dude who no one invited: <module> [as <alias>] ;`

Import a module from the fixed allow-list into `state.imported[<alias>]`.
Consumes every token through the terminating `;`. Unknown modules produce a
message in output but do not error.

Allow-list:

| module | functions |
|--------|-----------|
| `math` | `sqrt abs floor ceil round pow sin cos tan log exp max min pi e` |
| `random` | `randint random choice` |
| `string` | `upper lower length reverse` |
| `time` | `now` |
| `array` | `sum max min` |

### `dude call <module>.<fn> [args...] ;`

Invoke a function from a previously-imported module.

- Numeric args are parsed with `parseFloat`.
- Non-numeric args pass through as strings.
- Numeric results are written to `current.re`.
- Consumes every token through the terminating `;`.

## No-ops with messages

| op | reason |
|----|--------|
| `dih <path>` | file system not available in sandbox; skips its argument |
| `vah`, `twin` | file system not available in sandbox |
| `magical`, `liquid`, `white` | phrase markers of the "magical white liquid" incantation |

## Gooner sequence

`diddy gooner` — consumes the `gooner` token.

- If `spoiled` or `undefinedBehavior`: sets `haltReason`, halts.
- Otherwise: sets `goonerActivated = true`. All further tokens except `magical` are skipped; output is frozen.

`gooner` on its own also sets `goonerActivated`.

## Unknown tokens

Ignored silently. The tokenizer splits on whitespace, keeping quoted strings (`"..."`) as single tokens.

## Transforms

Applied to the token stream *before* `step()`. Order matters — mutations compound.

| name | effect |
|------|--------|
| `flip` | reverse the entire token array |
| `invert` | swap every `dop` ↔ `bop` |
| `chaos [n]` | shuffle the array `n` times (default 5) |
| `mutate [rate]` | replace `floor(len × rate)` random positions with random valid ops (default 0.1) |
| `compress` | remove `magical` tokens |
| `expand` | interleave a `magical` after every token |
| `diddyfy` | every token → `diddy` |
| `goonerfy` | every token → `magical` |
| `mirror` | append a reversed copy of the array |
| `thicc` | multiply every numeric token by 69 |
| `skinny` | divide every numeric token by 69 |
| `upsideDown` | swap `dop` ↔ `bop` (same as `invert`) |
| `insideOut` | swap `dop` ↔ `bop`, `grimace` → `skibidi` |

## Live-edit helpers

For REPL-style editing without reparsing:

```js
Skibidi.inject(program, atIp, newOps)       // insert tokens before atIp
Skibidi.replaceAt(program, position, newOp) // replace one token
Skibidi.swapAt(program, pos1, pos2)         // swap two tokens
```

All three return a new array; the original is untouched. Out-of-range positions are no-ops.