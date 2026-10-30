import fs from 'node:fs/promises';
import path from 'node:path';
import { config, DATA_DIR, OBRAS_DIR, UPLOADS_DIR } from './config.js';
import { renderObraPage, renderHub } from './render.js';

export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function ensureDirs() {
  await fs.mkdir(OBRAS_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export const obraDir = (slug) => path.join(OBRAS_DIR, slug);

function assertSlug(slug) {
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/i.test(String(slug ?? ''))) {
    throw new Error('slug inválido');
  }
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function uniqueSlug(base, currentSlug = null) {
  let slug = slugify(base) || `obra-${Date.now()}`;
  if (slug === currentSlug) return slug;
  let n = 2;
  while (await exists(path.join(OBRAS_DIR, slug))) {
    slug = `${slugify(base)}-${n++}`;
  }
  return slug;
}

export async function readPhotos(slug) {
  const dir = path.join(obraDir(slug), 'photos');
  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  } catch {
    return [];
  }
}

export async function saveObra({ content, brief, photos, forceSlug = null, source = 'demo' }) {
  await ensureDirs();
  if (forceSlug) assertSlug(forceSlug);
  const base = forceSlug || content.slug || content.title;
  const existing = forceSlug ? await exists(path.join(OBRAS_DIR, slugify(forceSlug), 'content.json')) : false;
  const slug = existing ? slugify(forceSlug) : await uniqueSlug(base, forceSlug ? slugify(forceSlug) : null);
  const dir = obraDir(slug);
  const photosDir = path.join(dir, 'photos');
  await fs.mkdir(photosDir, { recursive: true });

  // shortcut: fotos guardadas no tamanho original; adicionar sharp quando o tráfego justificar.
  const newPhotos = [];
  for (let i = 0; i < photos.length; i++) {
    const src = photos[i];
    const ext = path.extname(src).toLowerCase() || '.jpg';
    const dest = path.join(photosDir, `${i + 1}${ext}`);
    if (path.resolve(src) !== path.resolve(dest)) await fs.copyFile(src, dest);
    newPhotos.push(path.basename(dest));
  }

  const previous = existing ? JSON.parse(await fs.readFile(path.join(dir, 'content.json'), 'utf8')) : null;
  content.slug = slug;
  content.brief = brief;
  content.source = source;
  content.show_partner = content.show_partner ?? previous?.show_partner ?? false;
  content.created_at = previous?.created_at ?? new Date().toISOString();
  content.published_at = previous?.published_at ?? null;

  await fs.writeFile(path.join(dir, 'content.json'), JSON.stringify(content, null, 2));
  await fs.writeFile(path.join(dir, 'index.html'), renderObraPage(content, newPhotos));
  return { slug };
}

export async function loadObra(slug) {
  assertSlug(slug);
  const dir = obraDir(slug);
  const content = JSON.parse(await fs.readFile(path.join(dir, 'content.json'), 'utf8'));
  return { slug, dir, content, photos: await readPhotos(slug) };
}

export async function listObras() {
  await ensureDirs();
  const dirs = await fs.readdir(OBRAS_DIR, { withFileTypes: true });
  const obras = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    try {
      const { content, photos } = await loadObra(d.name);
      obras.push({ slug: d.name, content, photos });
    } catch {
      // pasta incompleta; ignora
    }
  }
  return obras.sort((a, b) => String(b.content.created_at).localeCompare(String(a.content.created_at)));
}

export async function rerender(slug) {
  const { content, photos } = await loadObra(slug);
  const dir = obraDir(slug);
  await fs.writeFile(path.join(dir, 'index.html'), renderObraPage(content, photos));
}

export async function setPartner(slug, show) {
  const { content } = await loadObra(slug);
  content.show_partner = Boolean(show);
  await fs.writeFile(path.join(obraDir(slug), 'content.json'), JSON.stringify(content, null, 2));
  await rerender(slug);
  return content.show_partner;
}

/** Copia a obra para o site e atualiza sitemap + hub. */
export async function publishObra(slug) {
  assertSlug(slug);
  if (!config.siteRepo) throw new Error('SITE_REPO não configurado');
  const publicDir = path.join(config.siteRepo, 'public');
  if (!(await exists(publicDir))) throw new Error(`public/ não encontrado em ${config.siteRepo}`);

  const { content, photos } = await loadObra(slug);
  const target = path.join(publicDir, 'obras', slug);
  await fs.mkdir(path.join(target, 'photos'), { recursive: true });
  await fs.writeFile(path.join(target, 'index.html'), renderObraPage(content, photos));
  for (const file of photos) {
    await fs.copyFile(path.join(obraDir(slug), 'photos', file), path.join(target, 'photos', file));
  }

  content.published_at = new Date().toISOString();
  await fs.writeFile(path.join(obraDir(slug), 'content.json'), JSON.stringify(content, null, 2));

  const assetsDir = path.join(publicDir, 'assets');
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.copyFile(
    path.resolve(import.meta.dirname, '..', 'assets', 'leroy-merlin.svg'),
    path.join(assetsDir, 'leroy-merlin.svg')
  );

  await upsertSitemap(publicDir, slug);
  await writeHub(publicDir);
  return target;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function upsertSitemap(publicDir, slug) {
  const file = path.join(publicDir, 'sitemap.xml');
  const today = new Date().toISOString().slice(0, 10);
  let xml = (await exists(file))
    ? await fs.readFile(file, 'utf8')
    : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n';

  const entries = [
    { loc: `${config.siteUrl}/obras/`, priority: '0.8' },
    { loc: `${config.siteUrl}/obras/${slug}/`, priority: '0.7' },
  ];

  for (const entry of entries) {
    const re = new RegExp(`\\s*<url>\\s*<loc>${escapeRegex(entry.loc)}</loc>[\\s\\S]*?</url>`, 'g');
    xml = xml.replace(re, '');
    const block = `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
    xml = xml.replace('</urlset>', `${block}\n</urlset>`);
  }
  await fs.writeFile(file, xml);
}

async function publishedObras() {
  if (!config.siteRepo) return [];
  const dir = path.join(config.siteRepo, 'public', 'obras');
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const obras = [];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      try {
        const { content, photos } = await loadObra(e.name);
        obras.push({ slug: e.name, content, photos });
      } catch {
        // ignora
      }
    }
    return obras;
  } catch {
    return [];
  }
}

async function writeHub(publicDir) {
  const obras = await publishedObras();
  const dir = path.join(publicDir, 'obras');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), renderHub(obras, '/obras'));
}
