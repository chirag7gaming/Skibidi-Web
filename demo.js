'use strict';

const Skibidi = require('./lib/skibidi');

const programs = [
  {
    name: 'dop × 65 → rizz',
    code: 'dop '.repeat(65) + 'rizz'
  },
  {
    name: 'the dude who no one invited',
    code: 'the dude who no one invited: math ; dude call math.sqrt 81 ; rizz'
  },
  {
    name: 'patrick × 5',
    code: 'patrick 5'
  },
  {
    name: 'dot 0 0 0 (after 8 dops)',
    code: 'dop '.repeat(8) + 'dot 0 0 0 rizz'
  },
  {
    name: 'okay? (random)',
    code: 'okay? dop dop rizz'
  }
];

for (const p of programs) {
  const { state, steps, error } = Skibidi.run(p.code, 5000);
  console.log('--- ' + p.name + ' ---');
  console.log('code   : ' + p.code);
  if (error) console.log('error  : ' + error);
  console.log('output : ' + JSON.stringify(state.output));
  console.log('steps  : ' + steps);
  console.log('pointer: ' + state.pointer);
  console.log('spoiled: ' + state.spoiled);
  console.log('swapped: ' + state.swapped);
  if (state.haltReason) console.log('halted : ' + state.haltReason);
  console.log();
}