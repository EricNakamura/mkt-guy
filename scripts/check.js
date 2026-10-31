import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const tmpSite = await fs.mkdtemp(path.join(os.tmpdir(), 'mkt-site-'));
await fs.mkdir(path.join(tmpSite, 'public'), { recursive: true });
await fs.writeFile(
  path.join(tmpSite, 'public', 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n'
);
process.env.SITE_REPO = tmpSite;

const { saveObra, publishObra, obraDir, slugify, setPartner } = await import('../src/store.js');

assert.equal(slugify('Remodelação de quarto em Braga'), 'remodelacao-de-quarto-em-braga');

const content = {
  title: 'Obra de teste em Braga',
  slug: 'obra-de-teste',
  meta_title: 'Obra de teste em Braga | M&M',
  meta_description: 'Descrição de teste.',
  location: 'Braga',
  type: 'Remodelação de interior',
  intro: 'Introdução de teste.',
  challenge: null,
  solution: 'Solução de teste.',
  scope: ['Teto falso'],
  materials: ['Pladur'],
  duration: '2 semanas',
  highlights: ['Destaque 1'],
  instagram: 'Post de teste.',
  linkedin: 'Post de teste.',
  google_business: 'Post de teste.',
  image_alts: ['Foto de teste'],
  model: 'fixture',
};

const photo = path.resolve(import.meta.dirname, '..', 'demo', 'quarto.jpg');
const saved = await saveObra({
  content,
  brief: 'Brief de teste.',
  photos: [photo],
  forceSlug: 'obra-de-teste',
  source: 'check',
});
assert.equal(saved.slug, 'obra-de-teste');

const page = await fs.readFile(path.join(obraDir('obra-de-teste'), 'index.html'), 'utf8');
assert.match(page, /Obra de teste em Braga/);
assert.match(page, /wa\.me/);
assert.match(page, /photos\/1\.jpg/);
assert.doesNotMatch(page, /leroy-merlin\.svg/);

await setPartner('obra-de-teste', true);
const pageWithPartner = await fs.readFile(path.join(obraDir('obra-de-teste'), 'index.html'), 'utf8');
assert.match(pageWithPartner, /leroy-merlin\.svg/);
assert.match(pageWithPartner, /Instalador oficial/);

const target = await publishObra('obra-de-teste');
assert.match(target, /public\/obras\/obra-de-teste$/);
assert.match(await fs.readFile(path.join(target, 'index.html'), 'utf8'), /Obra de teste/);

const sitemap = await fs.readFile(path.join(tmpSite, 'public', 'sitemap.xml'), 'utf8');
assert.match(sitemap, /\/obras\/obra-de-teste\//);
await fs.access(path.join(tmpSite, 'public', 'assets', 'leroy-merlin.svg'));
assert.match(await fs.readFile(path.join(tmpSite, 'public', 'obras', 'index.html'), 'utf8'), /Obra de teste/);

await fs.rm(obraDir('obra-de-teste'), { recursive: true, force: true });
await fs.rm(tmpSite, { recursive: true, force: true });

const port = 43917;
const server = spawn(process.execPath, ['src/server.js'], {
  cwd: path.resolve(import.meta.dirname, '..'),
  env: {
    ...process.env,
    HOST: '0.0.0.0',
    PREVIEW_PORT: String(port),
    DASHBOARD_AUTH: 'teste:segredo',
  },
  stdio: 'ignore',
});
try {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  const denied = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get('www-authenticate') ?? '', /Basic/);

  const auth = { authorization: `Basic ${Buffer.from('teste:segredo').toString('base64')}` };
  const allowed = await fetch(`http://127.0.0.1:${port}/`, { headers: auth });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('x-content-type-options'), 'nosniff');
  assert.match(allowed.headers.get('content-security-policy') ?? '', /frame-ancestors 'self'/);

  const forged = await fetch(`http://127.0.0.1:${port}/api/publish`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json', origin: 'https://evil.example' },
    body: '{"slug":"x","consent":true}',
  });
  assert.equal(forged.status, 403);
} finally {
  server.kill();
}

console.log('check ok: slug, render, publish, sitemap, hub, auth');
