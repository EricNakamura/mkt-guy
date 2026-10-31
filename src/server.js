import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
import { generateContent } from './ai.js';
import { listObras, loadObra, publishObra, saveObra, setPartner } from './store.js';
import { renderDashboard, renderHub, renderObraPage, renderPreview } from './render.js';

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function sendHtml(res, html, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(html);
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

function securityHeaders(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'"
  );
  if (req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost']);
const authRequired = Boolean(config.dashboardAuth) || !LOOPBACK.has(config.host);

function authorized(req) {
  if (!config.dashboardAuth) return !authRequired;
  const [scheme, value] = String(req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Basic' || !value) return false;
  const expected = Buffer.from(config.dashboardAuth);
  const given = Buffer.from(value, 'base64');
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error('Pedido demasiado grande');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function main() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const pathname = url.pathname;
    let m;

    securityHeaders(req, res);

    try {
      if (req.method === 'GET' && pathname === '/health') {
        return sendJson(res, { status: 'ok', obras: (await listObras()).length });
      }

      if (!['GET', 'HEAD'].includes(req.method) && !sameOrigin(req)) {
        return sendJson(res, { error: 'Origem inválida' }, 403);
      }

      if (!authorized(req)) {
        res.writeHead(401, {
          'WWW-Authenticate': 'Basic realm="Motor de Obras"',
          'Content-Type': 'text/plain; charset=utf-8',
        });
        return res.end(
          config.dashboardAuth ? 'Autenticação necessária.' : 'Define DASHBOARD_AUTH (user:pass) no .env.'
        );
      }

      if (req.method === 'GET' && pathname === '/') {
        return sendHtml(res, renderDashboard(await listObras()));
      }

      if (req.method === 'GET' && pathname === '/assets/leroy-merlin.svg') {
        const svg = await fs.readFile(
          path.resolve(import.meta.dirname, '..', 'assets', 'leroy-merlin.svg')
        );
        res.writeHead(200, {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        });
        return res.end(svg);
      }

      if (req.method === 'GET' && pathname === '/obras') return redirect(res, '/obras/');
      if (req.method === 'GET' && pathname === '/obras/') {
        const obras = await listObras();
        return sendHtml(res, renderHub(obras, '/obra', { preview: true }));
      }

      if (req.method === 'GET' && (m = pathname.match(/^\/obra\/([^/]+)\/?$/))) {
        const slug = decodeURIComponent(m[1]);
        if (!pathname.endsWith('/')) return redirect(res, `/obra/${encodeURIComponent(slug)}/`);
        const { content, photos } = await loadObra(slug);
        return sendHtml(res, renderObraPage(content, photos, { preview: true }));
      }

      if (req.method === 'GET' && (m = pathname.match(/^\/obra\/([^/]+)\/photos\/([^/]+)$/))) {
        const slug = decodeURIComponent(m[1]);
        if (!/^[a-z0-9][a-z0-9-]{0,80}$/i.test(slug)) return sendJson(res, { error: 'Not found' }, 404);
        const file = path.basename(decodeURIComponent(m[2]));
        const abs = path.join(path.resolve(import.meta.dirname, '..', 'data', 'obras', slug, 'photos'), file);
        const data = await fs.readFile(abs);
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
          'Cache-Control': 'private, max-age=3600',
        });
        return res.end(data);
      }

      if (req.method === 'GET' && (m = pathname.match(/^\/preview\/([^/]+)\/?$/))) {
        const slug = decodeURIComponent(m[1]);
        if (!pathname.endsWith('/')) return redirect(res, `/preview/${encodeURIComponent(slug)}/`);
        const obra = await loadObra(slug);
        return sendHtml(res, renderPreview(obra));
      }

      if (req.method === 'POST' && pathname === '/api/regenerate') {
        const body = await readBody(req);
        const slug = String(body.slug ?? '');
        const brief = String(body.brief ?? '').trim();
        if (!slug || !brief) return sendJson(res, { error: 'slug e brief são obrigatórios' }, 400);

        const obra = await loadObra(slug);
        const photoPaths = obra.photos.map((p) => path.join(obra.dir, 'photos', p));
        const content = await generateContent({ brief, photos: photoPaths });
        const saved = await saveObra({
          content,
          brief,
          photos: photoPaths,
          forceSlug: slug,
          source: 'preview',
        });
        return sendJson(res, { ok: true, slug: saved.slug });
      }

      if (req.method === 'POST' && pathname === '/api/partner') {
        const body = await readBody(req);
        const slug = String(body.slug ?? '');
        if (!slug) return sendJson(res, { error: 'slug é obrigatório' }, 400);
        const show = await setPartner(slug, body.show === true);
        return sendJson(res, { ok: true, show });
      }

      if (req.method === 'POST' && pathname === '/api/publish') {
        const body = await readBody(req);
        if (body.consent !== true) {
          return sendJson(res, { error: 'É preciso confirmar o consentimento do cliente.' }, 400);
        }
        const slug = String(body.slug ?? '');
        if (!slug) return sendJson(res, { error: 'slug é obrigatório' }, 400);
        const target = await publishObra(slug);
        return sendJson(res, { ok: true, target });
      }

      sendJson(res, { error: 'Not found' }, 404);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Erro interno';
      sendJson(res, { error: message }, 500);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Porta ${config.port} já está em uso. O preview já está a correr?`);
      process.exit(1);
    }
    throw err;
  });

  server.listen(config.port, config.host, () => {
    console.log(`\nMotor de Obras · ${config.publicUrl}`);
    console.log(`Preview: ${config.publicUrl}/`);
    console.log(`Host: ${config.host}:${config.port}\n`);
  });
}

main();
