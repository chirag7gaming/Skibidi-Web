'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const Skibidi = require('./lib/skibidi');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MAX_BODY = 8 * 1024 * 1024;
const MAX_CODE = 20000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.skb': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        const err = new Error('Payload too large');
        err.status = 413;
        req.destroy();
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function runSkibidi(code, maxSteps) {
  const s = new Skibidi.SkibidiState();
  s.program = Skibidi.tokenize(code);
  let steps = 0;
  try {
    steps = Skibidi.step(s, maxSteps, null);
  } catch (e) {
    return { output: s.output, error: e.message, steps };
  }
  return {
    output: s.output,
    halted: s.haltReason,
    steps,
    pointer: s.pointer,
    spoiled: s.spoiled,
    swapped: s.swapped
  };
}

async function handleApi(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    });
    return res.end();
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'POST only' });

  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw.toString('utf-8') || '{}');
  } catch (err) {
    return sendJson(res, err.status || 400, { error: err.message });
  }

  const code = typeof body.code === 'string' ? body.code : '';
  if (!code || code.length > MAX_CODE) {
    return sendJson(res, 400, { error: `code must be a non-empty string under ${MAX_CODE} chars` });
  }

  const requested = parseInt(body.maxSteps, 10);
  const maxSteps = Math.min(
    Number.isInteger(requested) && requested > 0 ? requested : Skibidi.MAX_STEPS,
    Skibidi.MAX_STEPS
  );

  return sendJson(res, 200, runSkibidi(code, maxSteps));
}

function serveStatic(req, res, urlPath) {
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/skibidi-run') return handleApi(req, res);
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log('skibidi server listening on http://localhost:' + PORT);
});