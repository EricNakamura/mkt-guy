import { config } from './config.js';

const esc = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const PHONE_LABEL = '+351 933 873 125';
const EMAIL = 'geral@memremodelacoes.pt';

function waLink(content) {
  const where = content.location ? ` em ${content.location}` : '';
  const text = `Olá! Vi a obra "${content.title}"${where} no vosso site e gostaria de pedir um orçamento.`;
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
}

function head({ title, description, canonical, image, robots = 'index,follow', schema = null }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${esc(robots)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="M&M Remodelações">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap" rel="stylesheet">
${schema ? `<script type="application/ld+json">${jsonLd(schema)}</script>` : ''}
<style>${pageCss()}</style>
</head>`;
}

function pageCss() {
  return `
:root{--orange:#F29122;--orange-dark:#D97706;--ink:#0B0B0C;--muted:#6B7280;--line:#E5E7EB;--soft:#F9FAFB}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:#fff;color:var(--ink);font-family:'Raleway',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.skip{position:absolute;left:-9999px;top:0;background:#000;color:#fff;padding:8px 12px;z-index:50}
.skip:focus{left:8px;top:8px}
.site-header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.header-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:72px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:700;letter-spacing:-.03em;font-size:19px}
.brand-mark{width:34px;height:34px;border-radius:10px;background:var(--orange);color:#fff;display:grid;place-items:center;font-size:13px;font-weight:800}
.brand span{font-weight:500;color:#374151}
.header-actions{display:flex;align-items:center;gap:12px}
.phone{font-size:14px;color:#374151;text-decoration:none;white-space:nowrap}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;border-radius:999px;background:var(--orange);color:#fff;text-decoration:none;font-weight:700;font-size:14px;border:1px solid transparent;transition:background .15s ease,transform .15s ease}
.btn:hover{background:var(--orange-dark)}
.btn:active{transform:translateY(1px)}
.btn-ghost{background:#fff;color:var(--ink);border-color:var(--line)}
.btn-ghost:hover{background:var(--soft)}
.btn-sm{padding:9px 16px;font-size:13px}
main{padding-bottom:72px}
.back{display:inline-block;margin:28px 0 0;color:var(--muted);text-decoration:none;font-size:13px}
.back:hover{color:var(--ink)}
.hero{padding:44px 0 32px}
.eyebrow{margin:0 0 14px;color:var(--orange-dark);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
h1{margin:0;font-size:clamp(34px,5.2vw,58px);line-height:1.03;letter-spacing:-.035em;max-width:900px}
.lead{margin:22px 0 0;max-width:680px;font-size:18px;color:#374151}
.hero-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.gallery{padding:8px 0 8px}
.gallery-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.gallery-grid.one{grid-template-columns:1fr}
.gallery-grid img{width:100%;height:100%;object-fit:cover;border-radius:20px;display:block;aspect-ratio:4/3;background:var(--soft)}
.gallery-grid.one img{aspect-ratio:16/9;max-height:620px}
.details{padding:56px 0 8px}
.content-grid{display:grid;grid-template-columns:1.35fr .65fr;gap:56px;align-items:start}
.prose h2{margin:0 0 14px;font-size:26px;letter-spacing:-.02em}
.prose h3{margin:30px 0 10px;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.prose p{margin:0 0 16px;color:#374151;font-size:16.5px}
.prose ul{margin:0;padding:0;list-style:none;display:grid;gap:9px}
.prose li{position:relative;padding-left:22px;color:#374151}
.prose li::before{content:'';position:absolute;left:0;top:.55em;width:9px;height:9px;border-radius:3px;background:var(--orange)}
.facts{position:sticky;top:92px;background:var(--soft);border:1px solid var(--line);border-radius:20px;padding:24px}
.fact{display:flex;flex-direction:column;gap:3px;padding:13px 0;border-bottom:1px solid var(--line)}
.fact:first-child{padding-top:0}
.fact:last-of-type{border-bottom:0;padding-bottom:0}
.fact span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:700}
.fact strong{font-size:15px;font-weight:600}
.partner-card{margin-top:20px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center}
.partner-card span{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:700}
.partner-card img{width:152px;height:auto;display:block}
.partner-card small{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.highlights{padding:40px 0 8px}
.highlights h2{margin:0 0 18px;font-size:26px;letter-spacing:-.02em}
.highlight-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.highlight{border:1px solid var(--line);border-radius:16px;padding:22px;background:#fff}
.highlight b{display:block;color:var(--orange);font-size:12px;letter-spacing:.12em;margin-bottom:10px}
.highlight p{margin:0;color:#374151}
.cta-wrap{padding:56px 0 0}
.cta{background:#0B0B0C;color:#fff;border-radius:26px;padding:44px;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap}
.cta h2{margin:0 0 8px;font-size:clamp(26px,3.4vw,38px);letter-spacing:-.03em}
.cta p{margin:0;color:#D1D5DB;max-width:560px}
.cta-actions{display:flex;gap:10px;flex-wrap:wrap}
.cta .btn-ghost{background:transparent;color:#fff;border-color:#4B5563}
.cta .btn-ghost:hover{background:#1F2937}
.site-footer{border-top:1px solid var(--line);margin-top:56px;padding:34px 0;color:var(--muted);font-size:13px}
.footer-inner{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.footer-inner a{color:#374151;text-decoration:none}
.footer-inner a:hover{color:var(--ink)}
.hub-head{padding:52px 0 28px}
.hub-head h1{font-size:clamp(34px,5vw,52px)}
.hub-head p{margin:16px 0 0;max-width:620px;color:#374151}
.hub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:8px 0 20px}
.card{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff;text-decoration:none;display:flex;flex-direction:column;transition:transform .15s ease,box-shadow .15s ease}
.card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.07)}
.card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--soft)}
.card-body{padding:16px 18px 18px}
.card-body small{color:var(--orange-dark);font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700}
.card-body h3{margin:6px 0 0;font-size:18px;letter-spacing:-.02em;line-height:1.25}
.card-body p{margin:8px 0 0;color:var(--muted);font-size:13px}
.empty{border:1px dashed var(--line);border-radius:18px;padding:40px;text-align:center;color:var(--muted)}
@media (max-width:860px){
  .content-grid{grid-template-columns:1fr;gap:30px}
  .facts{position:static}
  .highlight-grid,.hub-grid{grid-template-columns:1fr 1fr}
  .cta{padding:30px}
}
@media (max-width:560px){
  .header-actions .phone{display:none}
  .gallery-grid{grid-template-columns:1fr}
  .highlight-grid,.hub-grid{grid-template-columns:1fr}
  .hero{padding-top:30px}
  .cta-actions{width:100%}
  .cta-actions .btn{flex:1}
}
@media (max-width:420px){
  .brand{font-size:17px}
  .brand-mark{width:30px;height:30px;border-radius:9px}
  .header-actions .btn-sm{padding:8px 12px;font-size:12px}
  .hero-actions .btn{padding:10px 14px;font-size:13px}
  .wrap{padding:0 18px}
}
`;
}

function header() {
  return `<header class="site-header"><div class="wrap header-inner">
  <a class="brand" href="${esc(config.siteUrl)}"><span class="brand-mark">M&M</span><span>Remodelações</span></a>
  <nav class="header-actions" aria-label="Contacto">
    <a class="phone" href="tel:${esc(PHONE_LABEL.replace(/\s/g, ''))}">${esc(PHONE_LABEL)}</a>
    <a class="btn btn-sm" href="https://wa.me/${esc(config.whatsapp)}?text=${encodeURIComponent('Olá! Gostaria de pedir um orçamento.')}" rel="noopener">Pedir orçamento</a>
  </nav>
</div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap footer-inner">
  <div>
    <strong>M&M Remodelações</strong><br>
    Remodelação de interiores e exteriores · Braga e Minho<br>
    <a href="tel:${esc(PHONE_LABEL.replace(/\s/g, ''))}">${esc(PHONE_LABEL)}</a> · <a href="mailto:${EMAIL}">${EMAIL}</a>
  </div>
  <div>
    <a href="/obras/">Todas as obras</a><br>
    <a href="${esc(config.siteUrl)}/politica-privacidade">Política de privacidade</a><br>
    <span>© ${new Date().getFullYear()} M&M Remodelações</span>
  </div>
</div></footer>`;
}

export function renderObraPage(content, photos = [], { preview = false } = {}) {
  const canonical = `${config.siteUrl}/obras/${content.slug}/`;
  const first = photos[0] ? `${config.siteUrl}/obras/${content.slug}/photos/${photos[0]}` : null;
  const alts = content.image_alts ?? [];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title,
      description: content.meta_description,
      image: photos.map((p) => `${config.siteUrl}/obras/${content.slug}/photos/${p}`),
      datePublished: content.created_at,
      dateModified: content.generated_at,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'M&M Remodelações', url: config.siteUrl },
      publisher: { '@type': 'Organization', name: 'M&M Remodelações', url: config.siteUrl },
      about: {
        '@type': 'GeneralContractor',
        name: 'M&M Remodelações',
        areaServed: content.location ?? 'Braga e Minho',
        url: config.siteUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: config.siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Obras', item: `${config.siteUrl}/obras/` },
        { '@type': 'ListItem', position: 3, name: content.title, item: canonical },
      ],
    },
  ];

  const facts = [
    content.type ? `<div class="fact"><span>Tipo de obra</span><strong>${esc(content.type)}</strong></div>` : '',
    content.location
      ? `<div class="fact"><span>Localização</span><strong>${esc(content.location)}</strong></div>`
      : '',
    content.duration
      ? `<div class="fact"><span>Duração</span><strong>${esc(content.duration)}</strong></div>`
      : '',
  ].join('');

  const partner =
    content.show_partner === true
      ? `<div class="partner-card"><span>Instalador oficial</span><img src="/assets/leroy-merlin.svg" alt="Leroy Merlin Home Services" width="152" height="92" loading="lazy"><small>Home Services</small></div>`
      : '';

  const scope = content.scope?.length
    ? `<h3>O que foi feito</h3><ul>${content.scope.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
    : '';
  const materials = content.materials?.length
    ? `<h3>Materiais e acabamentos</h3><ul>${content.materials.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
    : '';
  const challenge = content.challenge ? `<p>${esc(content.challenge)}</p>` : '';
  const highlights = content.highlights?.length
    ? `<section class="highlights"><div class="wrap"><h2>Destaques da obra</h2><div class="highlight-grid">${content.highlights
        .slice(0, 3)
        .map(
          (h, i) =>
            `<div class="highlight"><b>0${i + 1}</b><p>${esc(h)}</p></div>`
        )
        .join('')}</div></div></section>`
    : '';

  const gallery = photos.length
    ? `<section class="gallery"><div class="wrap"><div class="gallery-grid ${photos.length === 1 ? 'one' : ''}">${photos
        .map(
          (p, i) =>
            `<img src="photos/${esc(p)}" alt="${esc(alts[i] ?? `${content.title} — foto ${i + 1}`)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`
        )
        .join('')}</div></div></section>`
    : '';

  return `${head({
    title: content.meta_title || `${content.title} | M&M Remodelações`,
    description: content.meta_description,
    canonical,
    image: first,
    robots: preview ? 'noindex,nofollow' : 'index,follow',
    schema,
  })}
<body>
<a class="skip" href="#main">Saltar para o conteúdo</a>
${header()}
<main id="main">
  <div class="wrap"><a class="back" href="/obras/">← Todas as obras</a></div>
  <section class="hero"><div class="wrap">
    <p class="eyebrow">Obra concluída${content.location ? ` · ${esc(content.location)}` : ''}</p>
    <h1>${esc(content.title)}</h1>
    ${content.intro ? `<p class="lead">${esc(content.intro)}</p>` : ''}
    <div class="hero-actions">
      <a class="btn" href="${esc(waLink(content))}" rel="noopener">Pedir orçamento no WhatsApp</a>
      <a class="btn btn-ghost" href="tel:${esc(PHONE_LABEL.replace(/\s/g, ''))}">Ligar</a>
    </div>
  </div></section>
  ${gallery}
  <section class="details"><div class="wrap content-grid">
    <article class="prose">
      <h2>A obra</h2>
      ${challenge}
      ${content.solution ? `<p>${esc(content.solution)}</p>` : ''}
      ${scope}
      ${materials}
    </article>
    <aside class="facts" aria-label="Detalhes da obra">
      ${facts}
      ${partner}
    </aside>
  </div></section>
  ${highlights}
  <section class="cta-wrap"><div class="wrap"><div class="cta">
    <div>
      <h2>Quer uma remodelação assim?</h2>
      <p>Conte-nos o que precisa. Respondemos em menos de 24 horas úteis, sem compromisso.</p>
    </div>
    <div class="cta-actions">
      <a class="btn" href="${esc(waLink(content))}" rel="noopener">Falar no WhatsApp</a>
      <a class="btn btn-ghost" href="mailto:${EMAIL}">Enviar email</a>
    </div>
  </div></div></section>
</main>
${footer()}
</body>
</html>`;
}

export function renderHub(obras, base = '/obras', { preview = false } = {}) {
  const cards = obras.length
    ? `<div class="hub-grid">${obras
        .map(({ slug, content, photos }) => {
          const image = photos[0] ? `${base}/${slug}/photos/${photos[0]}` : '';
          return `<a class="card" href="${esc(base)}/${esc(slug)}/">
            ${image ? `<img src="${esc(image)}" alt="${esc(content.title)}" loading="lazy">` : ''}
            <div class="card-body">
              <small>${esc(content.type || 'Obra')}</small>
              <h3>${esc(content.title)}</h3>
              <p>${esc([content.location, content.duration].filter(Boolean).join(' · '))}</p>
            </div>
          </a>`;
        })
        .join('')}</div>`
    : `<div class="empty">Ainda não há obras publicadas.</div>`;

  return `${head({
    title: 'Obras realizadas | M&M Remodelações',
    description:
      'Obras de remodelação realizadas pela M&M Remodelações em Braga e no Minho. Pladur, pintura, pavimentos e acabamentos.',
    canonical: `${config.siteUrl}/obras/`,
    image: null,
    robots: preview ? 'noindex,nofollow' : 'index,follow',
    schema: null,
  })}
<body>
${header()}
<main>
  <section class="hub-head"><div class="wrap">
    <p class="eyebrow">Portfólio</p>
    <h1>Obras realizadas</h1>
    <p>Projetos reais, com o detalhe do que foi feito. Se procura uma remodelação em Braga ou no Minho, fale connosco.</p>
  </div></section>
  <section><div class="wrap">${cards}</div></section>
  <section class="cta-wrap"><div class="wrap"><div class="cta">
    <div><h2>O próximo projeto é o seu?</h2><p>Peça um orçamento gratuito. Respondemos em menos de 24 horas úteis.</p></div>
    <div class="cta-actions"><a class="btn" href="https://wa.me/${esc(config.whatsapp)}?text=${encodeURIComponent('Olá! Vi o portfólio e gostaria de pedir um orçamento.')}">Falar no WhatsApp</a></div>
  </div></div></section>
</main>
${footer()}
</body>
</html>`;
}

export function renderDashboard(obras) {
  const cards = obras.length
    ? obras
        .map(({ slug, content, photos }) => {
          const image = photos[0] ? `/obra/${encodeURIComponent(slug)}/photos/${encodeURIComponent(photos[0])}` : '';
          const status = content.published_at ? 'Publicado' : 'Rascunho';
          return `<article class="admin-card">
            ${image ? `<img src="${esc(image)}" alt="">` : ''}
            <div class="admin-card-body">
              <div class="row"><span class="pill ${content.published_at ? 'ok' : ''}">${status}</span><small>${esc(slug)}</small></div>
              <h2>${esc(content.title)}</h2>
              <p>${esc([content.location, content.type, content.duration].filter(Boolean).join(' · '))}</p>
              <div class="row actions">
                <a class="btn btn-sm" href="/preview/${encodeURIComponent(slug)}/">Abrir e aprovar</a>
                <a class="btn btn-sm btn-ghost" href="/obra/${encodeURIComponent(slug)}/" target="_blank" rel="noopener">Ver página</a>
              </div>
            </div>
          </article>`;
        })
        .join('')
    : `<div class="empty">Ainda não há obras. Corre <code>npm run demo</code>.</div>`;

  return `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Motor de Obras · M&M</title><style>${adminCss()}</style></head>
<body>
<header class="admin-top"><div class="admin-top-inner"><div><strong>Motor de Obras</strong><span>M&M Remodelações</span></div><div class="row"><a class="btn btn-sm btn-ghost" href="/obras/">Ver portfólio</a><a class="btn btn-sm" href="/preview/${obras[0]?.slug ?? ''}/">Abrir última</a></div></div></header>
<main class="admin-main">
  <div class="admin-hero">
    <p class="eyebrow">Ferramenta interna</p>
    <h1>Obras que viram prova.</h1>
    <p>Envia fotos e um áudio no Telegram, a IA escreve a página e os posts, tu aprovas. Nada é publicado sem consentimento.</p>
    <div class="row"><code>npm run bot</code><span class="muted">para criar uma obra real</span></div>
  </div>
  <div class="admin-grid">${cards}</div>
</main>
</body></html>`;
}

export function renderPreview({ slug, content }) {
  return `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Preview · ${esc(content.title)}</title><style>${adminCss()}
  .preview-layout{display:grid;grid-template-columns:minmax(0,1fr) 420px;height:calc(100vh - 64px)}
  .preview-frame{background:#E5E7EB;padding:16px;overflow:auto}
  .preview-frame iframe{width:100%;height:100%;border:0;border-radius:14px;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.12)}
  .panel{overflow:auto;border-left:1px solid var(--line);padding:22px;background:#fff}
  .panel h1{font-size:22px;margin:0 0 4px;letter-spacing:-.03em}
  .panel .sub{color:var(--muted);font-size:12px;margin-bottom:18px;word-break:break-all}
  .panel label{display:block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:18px 0 7px}
  .panel textarea{width:100%;min-height:150px;resize:vertical;border:1px solid var(--line);border-radius:12px;padding:12px;font:inherit;font-size:13px;line-height:1.5}
  .panel select{width:100%;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font:inherit;font-size:13px;background:#fff;color:var(--ink)}
  .hint{font-size:11.5px;color:var(--muted);margin:7px 0 0;line-height:1.45}
  .panel details{border:1px solid var(--line);border-radius:12px;margin-top:10px;overflow:hidden}
  .panel summary{cursor:pointer;padding:11px 13px;font-size:12px;font-weight:700;background:var(--soft);list-style:none;display:flex;justify-content:space-between;gap:10px}
  .panel summary::-webkit-details-marker{display:none}
  .panel pre{white-space:pre-wrap;margin:0;padding:13px;font-family:inherit;font-size:13px;line-height:1.55;color:#374151}
  .copy{border:0;background:none;color:var(--orange-dark);font-size:11px;font-weight:700;cursor:pointer;padding:0}
  .status{min-height:20px;font-size:12px;color:var(--muted);margin-top:10px;word-break:break-word}
  .consent{display:flex;gap:9px;align-items:flex-start;margin:18px 0 10px;font-size:12px;line-height:1.45;color:#374151}
  .consent input{margin-top:2px}
  .panel .btn{width:100%;margin-top:8px}
  .panel .btn:disabled{opacity:.45;cursor:not-allowed}
  @media(max-width:900px){.preview-layout{grid-template-columns:1fr;height:auto}.preview-frame{height:70vh}.panel{border-left:0;border-top:1px solid var(--line)}}
  </style></head>
<body>
<header class="admin-top"><div class="admin-top-inner"><div><strong>Preview</strong><span>${esc(content.title)}</span></div><div class="row"><a class="btn btn-sm btn-ghost" href="/">Todas as obras</a><a class="btn btn-sm" href="/obra/${encodeURIComponent(slug)}/" target="_blank" rel="noopener">Abrir página</a></div></div></header>
<div class="preview-layout">
  <div class="preview-frame"><iframe src="/obra/${encodeURIComponent(slug)}/" title="Pré-visualização da obra"></iframe></div>
  <aside class="panel">
    <h1>${esc(content.title)}</h1>
    <div class="sub">${esc(slug)}</div>
    <p class="note">Pré-visualização local. Os textos são gerados a partir do brief e das fotos; revê antes de publicar.</p>
    ${
      content.model === 'fixture'
        ? `<p class="note warn">Estes textos são de exemplo: a chave OpenRouter falhou. Atualiza a chave e clica em Regenerar.</p>`
        : ''
    }

    <label for="brief">Brief / factos da obra</label>
    <textarea id="brief">${esc(content.brief ?? '')}</textarea>
    <button class="btn" id="regen">Regenerar com IA</button>
    <div class="status" id="status"></div>

    <label for="partner">Selo Leroy Merlin</label>
    <select id="partner">
      <option value="0" ${content.show_partner === true ? '' : 'selected'}>Não mostrar</option>
      <option value="1" ${content.show_partner === true ? 'selected' : ''}>Mostrar na página</option>
    </select>
    <p class="hint">Aparece como “Instalador oficial” com a logo da Leroy Merlin. Fica guardado nesta obra; publica de novo para atualizar o site.</p>
    <div class="status" id="partner-status"></div>

    <label>Pacote social</label>
    <details open><summary>Instagram <button class="copy" data-copy="ig">Copiar</button></summary><pre id="ig">${esc(content.instagram)}</pre></details>
    <details><summary>LinkedIn <button class="copy" data-copy="li">Copiar</button></summary><pre id="li">${esc(content.linkedin)}</pre></details>
    <details><summary>Google Business <button class="copy" data-copy="gbp">Copiar</button></summary><pre id="gbp">${esc(content.google_business)}</pre></details>

    <label class="consent"><input type="checkbox" id="consent"> Confirmo que tenho autorização do cliente para publicar estas fotos. Não há moradas nem rostos.</label>
    <button class="btn" id="publish" disabled>Publicar no site</button>
    <div class="status" id="publish-status"></div>
  </aside>
</div>
<script>
const slug = ${JSON.stringify(slug)};
const statusEl = document.getElementById('status');
const publishStatus = document.getElementById('publish-status');
const brief = document.getElementById('brief');
const regen = document.getElementById('regen');
const publish = document.getElementById('publish');
const consent = document.getElementById('consent');
const partner = document.getElementById('partner');
const partnerStatus = document.getElementById('partner-status');
const post = async (url, body) => {
  const res = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || ('HTTP ' + res.status));
  return json;
};
consent.addEventListener('change', () => { publish.disabled = !consent.checked; });
partner.addEventListener('change', async () => {
  partnerStatus.textContent = 'A guardar…';
  try {
    await post('/api/partner', {slug, show: partner.value === '1'});
    location.reload();
  } catch (err) {
    partnerStatus.textContent = err.message;
  }
});
regen.addEventListener('click', async () => {
  regen.disabled = true; statusEl.textContent = 'A gerar nova versão…';
  try { await post('/api/regenerate', {slug, brief: brief.value}); location.reload(); }
  catch (err) { statusEl.textContent = err.message; regen.disabled = false; }
});
publish.addEventListener('click', async () => {
  if (!consent.checked) return;
  publish.disabled = true; publishStatus.textContent = 'A publicar…';
  try {
    const out = await post('/api/publish', {slug, consent: true});
    publishStatus.textContent = 'Publicado em ' + out.target + '. Corre o build/deploy do site para ficar online.';
  } catch (err) { publishStatus.textContent = err.message; publish.disabled = false; }
});
document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', async (e) => {
  e.preventDefault();
  const el = document.getElementById(btn.dataset.copy);
  try { await navigator.clipboard.writeText(el.textContent); btn.textContent = 'Copiado'; setTimeout(() => { btn.textContent = 'Copiar'; }, 1400); }
  catch { btn.textContent = 'Falhou'; }
}));
</script>
</body></html>`;
}

function adminCss() {
  return `
:root{--orange:#F29122;--orange-dark:#D97706;--ink:#0B0B0C;--muted:#6B7280;--line:#E5E7EB;--soft:#F9FAFB}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5}
a{color:inherit}
.row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.muted{color:var(--muted);font-size:12px}
.admin-top{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.admin-top-inner{max-width:1400px;margin:0 auto;padding:12px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.admin-top-inner strong{font-size:15px;letter-spacing:-.02em}
.admin-top-inner span{color:var(--muted);font-size:12px;margin-left:10px}
.admin-main{max-width:1200px;margin:0 auto;padding:36px 24px 80px}
.admin-hero{padding:8px 0 30px}
.eyebrow{margin:0 0 12px;color:var(--orange-dark);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.admin-hero h1{margin:0;font-size:clamp(30px,4vw,46px);letter-spacing:-.04em;line-height:1.05}
.admin-hero p{margin:14px 0 18px;max-width:680px;color:#374151}
code{background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:5px 8px;font-size:12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 18px;border-radius:999px;background:var(--orange);color:#fff;text-decoration:none;font-weight:700;font-size:13px;border:1px solid transparent;cursor:pointer}
.btn:hover{background:var(--orange-dark)}
.btn-ghost{background:#fff;color:var(--ink);border-color:var(--line)}
.btn-ghost:hover{background:var(--soft)}
.btn-sm{padding:8px 14px;font-size:12px}
.admin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.admin-card{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff;display:flex;flex-direction:column}
.admin-card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--soft)}
.admin-card-body{padding:16px 18px 18px;display:flex;flex-direction:column;gap:8px}
.admin-card h2{margin:0;font-size:17px;letter-spacing:-.02em;line-height:1.25}
.admin-card p{margin:0;color:var(--muted);font-size:12.5px}
.pill{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:3px 9px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pill.ok{background:#ECFDF5;border-color:#A7F3D0;color:#047857}
.admin-card-body small{font-size:10px;color:#9CA3AF;word-break:break-all}
.actions{margin-top:6px}
.empty{border:1px dashed var(--line);border-radius:16px;padding:36px;text-align:center;color:var(--muted)}
.note{background:#FFF7ED;border:1px solid #FED7AA;color:#7C2D12;border-radius:10px;padding:10px 12px;font-size:12px}
.note.warn{background:#FEF2F2;border-color:#FECACA;color:#991B1B;margin-top:8px}
@media(max-width:900px){.admin-grid{grid-template-columns:1fr 1fr}}
@media(max-width:620px){.admin-grid{grid-template-columns:1fr}}
`;
}
