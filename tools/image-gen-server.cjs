#!/usr/bin/env node
/**
 * Local image generation server for Boon Card Factory.
 * Uses OpenAI DALL-E 3 API. Requires OPENAI_API_KEY in environment.
 *
 * Run: npm run image-gen
 * Then start dev server and use Generate Image in Boon Factory.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const root = path.join(__dirname, '..');
const artDir = path.join(root, 'game', 'public', 'ART');

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Set OPENAI_API_KEY in your environment to use image generation.');
  console.error('Example: $env:OPENAI_API_KEY="sk-..."; npm run image-gen');
  process.exit(1);
}

async function generateImage(prompt, filename) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1792',
      response_format: 'b64_json',
      quality: 'standard',
      style: 'vivid',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image in response');
  const buf = Buffer.from(b64, 'base64');
  if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });
  const outPath = path.join(artDir, filename);
  fs.writeFileSync(outPath, buf);
  return buf.toString('base64');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/generate') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }
  const { prompt, filename } = json;
  if (!prompt || !filename) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing prompt or filename' }));
    return;
  }

  try {
    const b64 = await generateImage(prompt, filename);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, imageBase64: b64, filename }));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Image gen server: http://localhost:${PORT}`);
  console.log('Boon Factory Generate Image will call this server.');
});
