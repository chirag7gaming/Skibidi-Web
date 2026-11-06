# Examples

Small SCL programs demonstrating one feature each. All are deterministic
(no `okay?`, `skibidi`, or `67`/`mango`-in-undefined-behavior randomness).

Run any of them with:

```bash
node -e "const s = require('./lib/skibidi').run(require('fs').readFileSync('examples/hello.skb', 'utf8')); console.log(JSON.stringify(s.state.output))"
```

Or paste into the playground (`index.html`).

| file | shows |
|------|-------|
| `hello.skb`     | `dop` + `rizz` — emit one character |
| `hi.skb`        | two `rizz` chars in sequence |
| `dude-math.skb` | `the dude … math ;` import + `dude call` |
| `patrick.skb`   | numeric-arity text op |
| `dot.skb`       | vector dot product via `dot` |
| `flags.skb`     | `mango` / `67` toggling `spoiled` / `swapped` |
| `crash.skb`     | `diddy gooner` while spoiled → halt |
| `chaos.skb`     | `okay?` — random; run a few times to see variety |