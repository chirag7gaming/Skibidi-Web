# skibidi-web

SCL/STL interpreter — a small, deterministic, sandboxed toy language by [Fish Gang Co.](https://fish-gang.netlify.app/Company).

Complex-number memory cells, stack, chaos ops, `.spoiled` / `.swapped` flags, STL program transforms, and a fixed allow-list of "the dude who no one invited:" modules. No arbitrary `eval`, no filesystem, no network, no DOM access.

## Layout

```
lib/skibidi.js          UMD engine — Node + browser, single source of truth
server.js               Local server: static files + POST /api/skibidi-run
index.html              Reference browser playground (no server needed)
css/theme.css           Design tokens + shared chrome
js/theme-toggle.js      Applies saved theme, exposes window.toggleTheme()
js/perf-tier.js         Sets data-perf-tier + data-motion on <html>
demo.js                 CLI: run a few programs, print output
tests/engine.test.js    node:test suite — deterministic ops only
examples/               Small .skibidi programs, one feature each
docs/OPERATIONS.md      Full op reference
```

## Library

```js
const Skibidi = require('./lib/skibidi');

const { state, steps, error } = Skibidi.run('dop dop dop rizz');
console.log(state.output);     // 'A'
console.log(state.pointer);    // 0
console.log(state.spoiled);    // false
console.log(steps);            // 4
```

Every primitive is exported for REPL-style use:

```js
const {
  SkibidiState, tokenize, step, runOp,
  Transforms, inject, replaceAt, swapAt,
  SAFE_MODULES, VALID_OPS,
  MEMORY_SIZE, STACK_SIZE, MAX_STEPS
} = require('./lib/skibidi');
```

In the browser, `lib/skibidi.js` assigns `window.SkibidiEngine`:

```html
<script src="lib/skibidi.js"></script>
<script>
  const s = new SkibidiEngine.SkibidiState();
  s.program = SkibidiEngine.tokenize('dop dop dop rizz');
  SkibidiEngine.step(s, 5000, null);
  console.log(s.output); // 'A'
</script>
```

## Operations

`dop bop skibidi grimace toilet rizz sigma ohio 67 mango diddy gooner gyatt magical white liquid dih vah twin patrick 3d cross dot let get the dude call kink okay?`

See [`docs/OPERATIONS.md`](docs/OPERATIONS.md) for the full reference.

### The dude who no one invited

Allow-list only. No dynamic `import`, no `require`, no `eval`:

- `math` — `sqrt abs floor ceil round pow sin cos tan log exp max min pi e`
- `random` — `randint random choice`
- `string` — `upper lower length reverse`
- `time` — `now`
- `array` — `sum max min`

```scl
the dude who no one invited: math ;
dude call math.sqrt 81 ;
rizz
```

## Transforms (STL)

`flip invert chaos mutate compress expand diddyfy goonerfy mirror thicc skinny upsideDown insideOut`

Applied to the token stream before `step()`. Live-edit helpers:

- `inject(program, atIp, newOps)` — insert
- `replaceAt(program, position, newOp)` — replace one
- `swapAt(program, pos1, pos2)` — swap two

## HTTP API

`POST /api/skibidi-run`

```json
{ "code": "dop dop dop rizz", "maxSteps": 5000 }
```
→
```json
{
  "output": "A",
  "halted": null,
  "steps": 4,
  "pointer": 0,
  "spoiled": false,
  "swapped": false
}
```

Max code length: 20000 chars. Max steps: `Skibidi.MAX_STEPS` (20000). CORS is open. Intended as a reference implementation, not a public service.

## Running

```bash
npm start      # http://localhost:3000
npm run demo   # prints output of a few example programs
npm test       # runs the deterministic test suite
```

## Testing

Uses Node's built-in test runner (`node:test`, Node 18+). Covers every deterministic op, both flag-toggled paths, the dude's allow-list (accept and reject), `let`/`get`, vector ops, all transforms, and the live-edit helpers. Random ops (`okay?`, `skibidi`, `67`/`mango` under undefined behavior) are excluded — their output is nondeterministic by design.

## Downstream forks

The hosted `Skibidi-Playground`, `/js/skibidi-engine.js`, and `/api/skibidi-run` on https://fish-gang.netlify.app/Skibidi-Playground are forks of `index.html`, `lib/skibidi.js`, and `server.js` from this repo. Known fork divergence:

- `lib/skibidi.js` uses `String.fromCharCode` for `rizz` output (16-bit
  truncation). Some forks use `String.fromCodePoint` (full Unicode) — output differs only for magnitudes above `0xFFFF`. Browsers with the same engine version always match each other.

Forks are welcome — the contract is the token set, the `{ code, maxSteps }` request shape, and the `{ output, halted, steps, pointer, spoiled, swapped }` response.

## License

MIT