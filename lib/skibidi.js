(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SkibidiEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MEMORY_SIZE = 256;
  var STACK_SIZE = 64;
  var MAX_STEPS = 20000;

  function Complex(re, im) {
    this.re = re || 0;
    this.im = im || 0;
  }
  Complex.prototype.magnitude = function () {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  };
  Complex.prototype.zero = function () {
    this.re = 0;
    this.im = 0;
  };

  var SAFE_MODULES = {
    math: {
      sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor, ceil: Math.ceil,
      round: Math.round, pow: Math.pow, sin: Math.sin, cos: Math.cos,
      tan: Math.tan, log: Math.log, exp: Math.exp, max: Math.max, min: Math.min,
      pi: function () { return Math.PI; },
      e: function () { return Math.E; }
    },
    random: {
      randint: function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
      random: function () { return Math.random(); },
      choice: function () {
        var args = Array.prototype.slice.call(arguments);
        return args[Math.floor(Math.random() * args.length)];
      }
    },
    string: {
      upper: function (s) { return String(s).toUpperCase(); },
      lower: function (s) { return String(s).toLowerCase(); },
      length: function (s) { return String(s).length; },
      reverse: function (s) { return String(s).split('').reverse().join(''); }
    },
    time: {
      now: function () { return Date.now(); }
    },
    array: {
      sum: function () {
        return Array.prototype.slice.call(arguments).reduce(function (a, b) { return a + b; }, 0);
      },
      max: function () { return Math.max.apply(null, arguments); },
      min: function () { return Math.min.apply(null, arguments); }
    }
  };

  function SkibidiState() {
    this.memory = [];
    for (var i = 0; i < MEMORY_SIZE; i++) this.memory.push(new Complex(0, 0));
    this.pointer = 0;
    this.ip = 0;
    this.program = [];
    this.output = '';
    this.stack = [];
    this.stackPtr = 0;
    this.spoiled = false;
    this.swapped = false;
    this.undefinedBehavior = false;
    this.variables = {};
    this.imported = {};
    this.diddyGoonerInside = false;
    this.goonerCustomText = null;
    this.goonerActivated = false;
    this.haltReason = null;
    this.log = [];
  }

  function tokenize(src) {
    var tokens = [];
    var re = /"[^"]*"|\S+/g;
    var m;
    while ((m = re.exec(src)) !== null) tokens.push(m[0]);
    return tokens;
  }

  var VALID_OPS = [
    'dop', 'bop', 'skibidi', 'grimace', 'toilet', 'rizz', 'sigma', 'ohio',
    '67', 'mango', 'diddy', 'gooner', 'magical', 'gyatt', 'dih', 'vah',
    'twin', 'patrick', '3d', 'cross', 'dot', 'let', 'get',
    'the', 'dude', 'call', 'kink', 'okay?'
  ];

  function step(s, maxSteps, onLog) {
    var steps = 0;
    while (s.ip < s.program.length && steps < maxSteps) {
      runOp(s, s.program[s.ip], onLog);
      s.ip++;
      steps++;
      if (s.haltReason) break;
    }
    return steps;
  }

  function runOp(s, op, onLog) {
    if (s.goonerActivated && op !== 'magical') return;
    if (op === 'magical' || op === 'liquid' || op === 'white') return;

    if (op === 'dop') {
      if (s.spoiled && !s.undefinedBehavior) s.memory[s.pointer].re -= 1;
      else s.memory[s.pointer].re += 1;
      return;
    }
    if (op === 'bop') {
      if (s.spoiled && !s.undefinedBehavior) s.memory[s.pointer].im += 1;
      else s.memory[s.pointer].im -= 1;
      return;
    }
    if (op === 'skibidi') {
      s.memory[s.pointer].re = Math.floor(Math.random() * 200) - 100;
      return;
    }
    if (op === 'grimace') {
      var moveRight = !(s.spoiled && !s.undefinedBehavior);
      if (s.swapped) moveRight = !moveRight;
      s.pointer = ((s.pointer + (moveRight ? 1 : -1)) % MEMORY_SIZE + MEMORY_SIZE) % MEMORY_SIZE;
      return;
    }
    if (op === 'toilet') {
      if (s.stackPtr < STACK_SIZE) {
        s.stack[s.stackPtr] = new Complex(s.memory[s.pointer].re, s.memory[s.pointer].im);
        s.stackPtr++;
        s.memory[s.pointer].zero();
      }
      return;
    }
    if (op === 'rizz') {
      var mag = s.memory[s.pointer].magnitude();
      if (s.spoiled && !s.undefinedBehavior) mag *= 2;
      var code = Math.floor(mag) % 0x10FFFF;
      try { s.output += String.fromCharCode(code); } catch (e) {}
      return;
    }
    if (op === 'sigma') {
      s.memory[s.pointer].zero();
      return;
    }
    if (op === 'ohio') {
      var jump = Math.floor(s.memory[s.pointer].magnitude());
      if (s.spoiled && !s.undefinedBehavior) {
        if (jump > 0) s.ip += jump;
      } else {
        if (jump > 0 && jump <= s.ip) s.ip -= jump;
      }
      return;
    }
    if (op === '67') {
      if (s.undefinedBehavior) { if (Math.random() < 0.5) s.swapped = !s.swapped; }
      else if (!s.spoiled) s.swapped = !s.swapped;
      return;
    }
    if (op === 'mango') {
      if (s.undefinedBehavior) { if (Math.random() < 0.5) s.spoiled = !s.spoiled; }
      else s.spoiled = !s.spoiled;
      return;
    }
    if (op === 'gyatt') {
      if (s.stackPtr > 0) {
        var top = s.stack[s.stackPtr - 1];
        var m = top.magnitude();
        var threshold = (s.spoiled && !s.undefinedBehavior) ? 50 : 100;
        if (m > threshold) {
          var j = Math.max(1, Math.floor(m / 10));
          s.ip += j;
        }
      }
      return;
    }
    if (op === 'diddy') {
      if (s.program[s.ip + 1] === 'gooner') {
        s.ip++;
        if (s.spoiled || s.undefinedBehavior) {
          s.haltReason = 'CRASH (diddy+gooner while spoiled/undefined)';
          return;
        }
        s.goonerActivated = true;
        if (onLog) onLog('💀 gooner activated — output frozen.');
      }
      return;
    }
    if (op === 'gooner') {
      s.goonerActivated = true;
      return;
    }
    if (op === 'dih') {
      if (onLog) onLog('[dih] file ops are not available in this sandbox.');
      s.ip++;
      return;
    }
    if (op === 'vah' || op === 'twin') {
      if (onLog) onLog('[' + op + '] file ops are not available in this sandbox.');
      return;
    }
    if (op === 'patrick') {
      var cnt = 10;
      var maybeNum = parseInt(s.program[s.ip + 1], 10);
      if (!isNaN(maybeNum)) { cnt = maybeNum; s.ip++; }
      var line = '';
      for (var i = 0; i < cnt; i++) line += 'Patrick ';
      s.output += line.trim() + '\n';
      return;
    }
    if (op === '3d') {
      if (s.pointer + 2 < MEMORY_SIZE) {
        s.memory[s.pointer + 1].re = 0;
        s.memory[s.pointer + 2].re = 0;
      }
      return;
    }
    if (op === 'cross' && s.ip + 3 < s.program.length) {
      var ax = s.pointer, ay = s.pointer + 1, az = s.pointer + 2;
      var bx = (parseInt(s.program[s.ip + 1], 10) || 0) % MEMORY_SIZE;
      var by = (parseInt(s.program[s.ip + 2], 10) || 0) % MEMORY_SIZE;
      var bz = (parseInt(s.program[s.ip + 3], 10) || 0) % MEMORY_SIZE;
      var cx = s.memory[ay].re * s.memory[bz].re - s.memory[az].re * s.memory[by].re;
      var cy = s.memory[az].re * s.memory[bx].re - s.memory[ax].re * s.memory[bz].re;
      var cz = s.memory[ax].re * s.memory[by].re - s.memory[ay].re * s.memory[bx].re;
      s.memory[ax].re = cx;
      s.memory[ay].re = cy;
      s.memory[az].re = cz;
      s.ip += 3;
      return;
    }
    if (op === 'dot' && s.ip + 3 < s.program.length) {
      var dx = s.pointer, dy = s.pointer + 1, dz = s.pointer + 2;
      var ex = (parseInt(s.program[s.ip + 1], 10) || 0) % MEMORY_SIZE;
      var ey = (parseInt(s.program[s.ip + 2], 10) || 0) % MEMORY_SIZE;
      var ez = (parseInt(s.program[s.ip + 3], 10) || 0) % MEMORY_SIZE;
      s.memory[s.pointer].re =
        s.memory[dx].re * s.memory[ex].re +
        s.memory[dy].re * s.memory[ey].re +
        s.memory[dz].re * s.memory[ez].re;
      s.ip += 3;
      return;
    }
    if (op === 'let' && s.ip + 1 < s.program.length) {
      s.variables[s.program[s.ip + 1]] = s.memory[s.pointer].magnitude();
      s.ip++;
      return;
    }
    if (op === 'get' && s.ip + 1 < s.program.length) {
      var key = s.program[s.ip + 1];
      if (Object.prototype.hasOwnProperty.call(s.variables, key)) {
        s.memory[s.pointer].re = s.variables[key];
      }
      s.ip++;
      return;
    }
    if (op === 'the' && s.program[s.ip + 1] === 'dude') {
      var spec = [];
      var ti = s.ip + 1;
      while (ti < s.program.length && s.program[ti] !== ';') { spec.push(s.program[ti]); ti++; }
      var colonIdx = -1;
      for (var k = 0; k < spec.length; k++) {
        if (/:$/.test(spec[k])) { colonIdx = k; break; }
      }
      var rest = colonIdx >= 0 ? spec.slice(colonIdx + 1) : spec;
      var modName = rest[0];
      var alias = (rest[1] === 'as' && rest[2]) ? rest[2] : modName;
      if (modName && Object.prototype.hasOwnProperty.call(SAFE_MODULES, modName)) {
        s.imported[alias] = SAFE_MODULES[modName];
        s.output += '[Dude] ' + alias + ' joined\n';
      } else if (modName) {
        s.output += "[Dude] " + modName + " didn't show — not in the safe module list\n";
      }
      s.ip = ti;
      return;
    }
    if (op === 'dude' && s.program[s.ip + 1] === 'call') {
      var callStr = s.program[s.ip + 2];
      if (!callStr) { s.ip += 2; return; }
      var parts = callStr.split('.');
      var ti2 = s.ip + 3;
      var args = [];
      while (ti2 < s.program.length && s.program[ti2] !== ';') {
        var raw = s.program[ti2];
        var num = parseFloat(raw);
        args.push(isNaN(num) ? raw : num);
        ti2++;
      }
      if (parts.length >= 2 && Object.prototype.hasOwnProperty.call(s.imported, parts[0])) {
        var mod = s.imported[parts[0]];
        var fn = mod[parts.slice(1).join('.')];
        if (typeof fn === 'function') {
          try {
            var result = fn.apply(null, args);
            if (typeof result === 'number') s.memory[s.pointer].re = result;
            s.output += '[Dude] ' + callStr + ' -> ' + result + '\n';
          } catch (e) {
            s.output += '[Dude] call failed: ' + e.message + '\n';
          }
        } else {
          s.output += '[Dude] function not found in ' + parts[0] + '\n';
        }
      } else {
        s.output += '[Dude] module ' + parts[0] + ' not found (import it first)\n';
      }
      s.ip = ti2;
      return;
    }
    if (op === 'okay?') {
      var roll = Math.random();
      if (roll < 0.33) {
        s.memory[s.pointer].re += Math.floor(Math.random() * 20) - 10;
        if (onLog) onLog('okay? -> cell nudged');
      } else if (roll < 0.66) {
        s.pointer = Math.floor(Math.random() * MEMORY_SIZE);
        if (onLog) onLog('okay? -> pointer teleported');
      } else {
        if (onLog) onLog('okay? -> nothing happened. okay.');
      }
      return;
    }
  }

  var Transforms = {
    flip: function (instr) { return instr.slice().reverse(); },
    invert: function (instr) {
      var map = { dop: 'bop', bop: 'dop' };
      return instr.map(function (i) { return map[i] || i; });
    },
    chaos: function (instr, times) {
      times = times || 5;
      var result = instr.slice();
      for (var t = 0; t < times; t++) {
        for (var i = result.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = result[i]; result[i] = result[j]; result[j] = tmp;
        }
      }
      return result;
    },
    mutate: function (instr, rate) {
      rate = rate || 0.1;
      var ops = VALID_OPS;
      var result = instr.slice();
      var count = Math.floor(result.length * rate);
      for (var c = 0; c < count; c++) {
        var pos = Math.floor(Math.random() * result.length);
        result[pos] = ops[Math.floor(Math.random() * ops.length)];
      }
      return result;
    },
    compress: function (instr) {
      return instr.filter(function (i) { return i !== 'magical'; });
    },
    expand: function (instr) {
      var result = [];
      instr.forEach(function (i) { result.push(i); result.push('magical'); });
      return result;
    },
    diddyfy: function (instr) { return instr.map(function () { return 'diddy'; }); },
    goonerfy: function (instr) { return instr.map(function () { return 'magical'; }); },
    mirror: function (instr) { return instr.concat(instr.slice().reverse()); },
    thicc: function (instr) {
      return instr.map(function (tok) {
        var n = parseFloat(tok);
        return isNaN(n) ? tok : String(n * 69);
      });
    },
    skinny: function (instr) {
      return instr.map(function (tok) {
        var n = parseFloat(tok);
        return isNaN(n) ? tok : String(n / 69);
      });
    },
    upsideDown: function (instr) {
      var map = { dop: 'bop', bop: 'dop' };
      return instr.map(function (i) { return map[i] || i; });
    },
    insideOut: function (instr) {
      var map = { dop: 'bop', grimace: 'skibidi' };
      return instr.map(function (i) { return map[i] || i; });
    }
  };

  function inject(program, atIp, newOps) {
    return program.slice(0, atIp).concat(newOps, program.slice(atIp));
  }
  function replaceAt(program, position, newOp) {
    var result = program.slice();
    if (position >= 0 && position < result.length) result[position] = newOp;
    return result;
  }
  function swapAt(program, pos1, pos2) {
    var result = program.slice();
    if (pos1 >= 0 && pos1 < result.length && pos2 >= 0 && pos2 < result.length) {
      var tmp = result[pos1];
      result[pos1] = result[pos2];
      result[pos2] = tmp;
    }
    return result;
  }

  function run(code, maxSteps, onLog) {
    var s = new SkibidiState();
    s.program = tokenize(code);
    var steps = 0;
    try {
      steps = step(s, maxSteps || MAX_STEPS, onLog);
    } catch (e) {
      return { state: s, steps: steps, error: e.message };
    }
    return { state: s, steps: steps };
  }

  return {
    MEMORY_SIZE: MEMORY_SIZE,
    STACK_SIZE: STACK_SIZE,
    MAX_STEPS: MAX_STEPS,
    VALID_OPS: VALID_OPS,
    SAFE_MODULES: SAFE_MODULES,
    SkibidiState: SkibidiState,
    tokenize: tokenize,
    step: step,
    runOp: runOp,
    run: run,
    Transforms: Transforms,
    inject: inject,
    replaceAt: replaceAt,
    swapAt: swapAt
  };
});