'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Skibidi = require('../lib/skibidi');

function run(code, maxSteps) {
  return Skibidi.run(code, maxSteps || Skibidi.MAX_STEPS);
}

// ---- state shape ---------------------------------------------------------

test('SkibidiState exposes full field set', () => {
  const s = new Skibidi.SkibidiState();
  assert.equal(s.pointer, 0);
  assert.equal(s.ip, 0);
  assert.deepEqual(s.program, []);
  assert.equal(s.output, '');
  assert.equal(s.spoiled, false);
  assert.equal(s.swapped, false);
  assert.equal(s.undefinedBehavior, false);
  assert.deepEqual(s.variables, {});
  assert.deepEqual(s.imported, {});
  assert.equal(s.diddyGoonerInside, false);
  assert.equal(s.goonerCustomText, null);
  assert.equal(s.goonerActivated, false);
  assert.equal(s.haltReason, null);
  assert.deepEqual(s.log, []);
});

test('memory is MEMORY_SIZE complex cells', () => {
  const s = new Skibidi.SkibidiState();
  assert.equal(s.memory.length, Skibidi.MEMORY_SIZE);
  assert.equal(s.memory[0].re, 0);
  assert.equal(s.memory[0].im, 0);
});

// ---- arithmetic ----------------------------------------------------------

test('dop increments re', () => {
  const { state } = run('dop');
  assert.equal(state.memory[0].re, 1);
  assert.equal(state.memory[0].im, 0);
});

test('dop × 5 → re 5', () => {
  const { state } = run('dop dop dop dop dop');
  assert.equal(state.memory[0].re, 5);
});

test('bop decrements im', () => {
  const { state } = run('bop bop bop');
  assert.equal(state.memory[0].im, -3);
});

test('dop under spoiled decrements re', () => {
  const { state } = run('mango dop dop');
  assert.equal(state.spoiled, true);
  assert.equal(state.memory[0].re, -2);
});

test('sigma zeroes the cell', () => {
  const { state } = run('dop bop sigma');
  assert.equal(state.memory[0].re, 0);
  assert.equal(state.memory[0].im, 0);
});

// ---- stack ---------------------------------------------------------------

test('toilet pushes current cell and zeroes it', () => {
  const { state } = run('dop dop dop toilet');
  assert.equal(state.stackPtr, 1);
  assert.equal(state.stack[0].re, 3);
  assert.equal(state.memory[0].re, 0);
});

test('toilet stops at STACK_SIZE', () => {
  const code = 'dop toilet '.repeat(Skibidi.STACK_SIZE + 5);
  const { state } = run(code);
  assert.equal(state.stackPtr, Skibidi.STACK_SIZE);
});

// ---- pointer -------------------------------------------------------------

test('grimace moves pointer right', () => {
  const { state } = run('grimace grimace');
  assert.equal(state.pointer, 2);
});

test('grimace moves left when swapped', () => {
  const { state } = run('67 grimace grimace');
  assert.equal(state.swapped, true);
  assert.equal(state.pointer, 254);
});

// ---- flags ---------------------------------------------------------------

test('67 toggles swapped when not spoiled', () => {
  const { state } = run('67');
  assert.equal(state.swapped, true);
});

test('67 is inert when spoiled', () => {
  const { state } = run('mango 67');
  assert.equal(state.spoiled, true);
  assert.equal(state.swapped, false);
});

test('mango toggles spoiled', () => {
  const { state } = run('mango');
  assert.equal(state.spoiled, true);
});

test('mango twice restores clean state', () => {
  const { state } = run('mango mango');
  assert.equal(state.spoiled, false);
});

// ---- output --------------------------------------------------------------

test('rizz emits fromCharCode of magnitude', () => {
  const { state } = run('dop '.repeat(65) + 'rizz');
  assert.equal(state.output, 'A');
});

test('two rizz emit two chars', () => {
  const { state } = run('dop '.repeat(72) + 'rizz ' + 'dop '.repeat(33) + 'rizz');
  assert.equal(state.output, 'Hi');
});

test('patrick defaults to 10', () => {
  const { state } = run('patrick');
  assert.equal(state.output, 'Patrick '.repeat(10).trim() + '\n');
});

test('patrick takes numeric arity', () => {
  const { state } = run('patrick 3');
  assert.equal(state.output, 'Patrick Patrick Patrick\n');
});

// ---- jumps ---------------------------------------------------------------

test('ohio with zero magnitude is a no-op', () => {
  const { state, steps } = run('ohio', 5);
  assert.equal(steps, 1);
  assert.equal(state.ip, 1);
});

test('ohio forward jump when spoiled skips ops', () => {
  const { state } = run('mango dop dop dop ohio dop dop dop', 20);
  assert.equal(state.memory[0].re, -3);
});

// ---- the dude who no one invited ----------------------------------------

test('the dude imports a safe module and calls it', () => {
  const { state } = run('the dude who no one invited: math ; dude call math.sqrt 81 ; rizz');
  assert.ok(state.output.includes('[Dude] math joined'));
  assert.ok(state.output.includes('[Dude] math.sqrt -> 9'));
  assert.ok(state.output.endsWith('\t'));
});

test('the dude supports aliasing', () => {
  const { state } = run('the dude who no one invited: math as m ; dude call m.abs -5 ; rizz');
  assert.ok(state.output.includes('[Dude] m joined'));
  assert.ok(state.output.includes('[Dude] m.abs -> 5'));
});

test('the dude rejects unknown modules', () => {
  const { state } = run('the dude who no one invited: fs ;');
  assert.ok(state.output.includes("fs didn't show"));
  assert.equal(state.imported.fs, undefined);
});

test('the dude cannot import eval or Function', () => {
  const { state } = run(
    'the dude who no one invited: eval ; the dude who no one invited: Function ;'
  );
  assert.equal(state.imported.eval, undefined);
  assert.equal(state.imported.Function, undefined);
  assert.ok(state.output.includes("eval didn't show"));
  assert.ok(state.output.includes("Function didn't show"));
});

// ---- variables -----------------------------------------------------------

test('let/get roundtrip via magnitude', () => {
  const { state } = run('dop dop dop let x get x rizz');
  assert.equal(state.variables.x, 3);
  assert.equal(state.memory[0].re, 3);
  assert.equal(state.output, '\x03');
});

test('get of unbound name is a no-op', () => {
  const { state } = run('dop dop get nope');
  assert.equal(state.memory[0].re, 2);
});

// ---- vector ops ----------------------------------------------------------

test('dot computes squared magnitude at pointer', () => {
  const { state } = run('dop '.repeat(8) + 'dot 0 0 0');
  assert.equal(state.memory[0].re, 64);
});

test('3d is safe and leaves pointer cell intact', () => {
  const { state } = run('dop 3d');
  assert.equal(state.memory[0].re, 1);
  assert.equal(state.memory[1].re, 0);
  assert.equal(state.memory[2].re, 0);
});

// ---- gooner --------------------------------------------------------------

test('diddy+gooner activates gooner when clean', () => {
  const { state } = run('diddy gooner');
  assert.equal(state.goonerActivated, true);
  assert.equal(state.haltReason, null);
});

test('diddy+gooner freezes subsequent output', () => {
  const { state } = run('diddy gooner patrick 3');
  assert.equal(state.goonerActivated, true);
  assert.equal(state.output, '');
});

test('diddy+gooner halts when spoiled', () => {
  const { state } = run('mango diddy gooner');
  assert.equal(state.spoiled, true);
  assert.equal(state.haltReason, 'CRASH (diddy+gooner while spoiled/undefined)');
});

// ---- misc ----------------------------------------------------------------

test('unknown tokens are ignored', () => {
  const { state, steps } = run('dop notanop dop');
  assert.equal(state.memory[0].re, 2);
  assert.equal(steps, 3);
});

test('file ops are no-ops that skip their argument', () => {
  const { state } = run('dih file.txt', 100);
  assert.equal(state.ip, 2);
  assert.equal(state.output, '');
});

test('run() returns steps and error-free state for clean programs', () => {
  const r = run('dop dop');
  assert.equal(r.error, undefined);
  assert.equal(r.steps, 2);
  assert.equal(r.state.memory[0].re, 2);
});

// ---- transforms ----------------------------------------------------------

test('flip reverses tokens', () => {
  assert.deepEqual(Skibidi.Transforms.flip(['a', 'b', 'c']), ['c', 'b', 'a']);
});

test('invert swaps dop <-> bop', () => {
  assert.deepEqual(
    Skibidi.Transforms.invert(['dop', 'bop', 'rizz']),
    ['bop', 'dop', 'rizz']
  );
});

test('mirror doubles program reversed', () => {
  assert.deepEqual(Skibidi.Transforms.mirror(['a', 'b']), ['a', 'b', 'b', 'a']);
});

test('compress drops magical', () => {
  assert.deepEqual(
    Skibidi.Transforms.compress(['dop', 'magical', 'bop']),
    ['dop', 'bop']
  );
});

test('expand interleaves magical', () => {
  assert.deepEqual(
    Skibidi.Transforms.expand(['dop', 'bop']),
    ['dop', 'magical', 'bop', 'magical']
  );
});

test('thicc multiplies numbers by 69', () => {
  assert.deepEqual(
    Skibidi.Transforms.thicc(['dop', '5', 'ohio']),
    ['dop', '345', 'ohio']
  );
});

test('skinny divides numbers by 69', () => {
  assert.deepEqual(Skibidi.Transforms.skinny(['69', '138']), ['1', '2']);
});

test('diddyfy replaces every token with diddy', () => {
  assert.deepEqual(Skibidi.Transforms.diddyfy(['a', 'b', 'c']), ['diddy', 'diddy', 'diddy']);
});

test('goonerfy replaces every token with magical', () => {
  assert.deepEqual(Skibidi.Transforms.goonerfy(['a', 'b']), ['magical', 'magical']);
});

// ---- live-edit helpers ---------------------------------------------------

test('inject inserts at ip', () => {
  assert.deepEqual(
    Skibidi.inject(['a', 'b', 'c'], 1, ['x']),
    ['a', 'x', 'b', 'c']
  );
});

test('replaceAt replaces one token', () => {
  assert.deepEqual(Skibidi.replaceAt(['a', 'b', 'c'], 1, 'z'), ['a', 'z', 'c']);
});

test('replaceAt ignores out-of-range', () => {
  assert.deepEqual(Skibidi.replaceAt(['a'], 5, 'z'), ['a']);
});

test('swapAt swaps two positions', () => {
  assert.deepEqual(Skibidi.swapAt(['a', 'b', 'c'], 0, 2), ['c', 'b', 'a']);
});

test('swapAt ignores out-of-range', () => {
  assert.deepEqual(Skibidi.swapAt(['a', 'b'], 0, 5), ['a', 'b']);
});