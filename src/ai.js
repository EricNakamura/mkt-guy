import fs from 'node:fs/promises';
import path from 'node:path';
import { config, hasAi } from './config.js';

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function mimeFor(file) {
  return MIME[path.extname(file).toLowerCase()] ?? 'image/jpeg';
}

async function orFetch(pathname, body, timeoutMs = 120_000) {
  if (!hasAi()) throw new Error('OPENROUTER_API_KEY não configurada');
  const res = await fetch(`${config.baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.siteUrl,
      'X-Title': 'M&M Motor de Obras',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

export async function transcribeAudio(file) {
  const data = await fs.readFile(file);
  let format = path.extname(file).toLowerCase().replace('.', '') || 'ogg';
  if (format === 'oga' || format === 'opus') format = 'ogg';
  const json = await orFetch('/audio/transcriptions', {
    model: config.asrModel,
    input_audio: { data: data.toString('base64'), format },
    language: 'pt',
  });
  return (json.text ?? '').trim();
}

const SYSTEM = `És um copywriter português especializado em remodelações e construção.
Escreves em português de Portugal, com tom profissional, próximo e concreto.

REGRAS OBRIGATÓRIAS:
- Usa APENAS os factos do BRIEF e o que é visível nas FOTOS.
- Não inventes medidas, prazos, materiais, localização, nomes de clientes nem preços.
- Se um dado não estiver no brief/fotos, devolve null nesse campo.
- Não uses superlativos vazios ("incrível", "transformador") nem promessas.
- Não menciones a Leroy Merlin nos textos; o selo é da empresa, não desta obra.
- Frases curtas. Nada de linguagem de folheto.
- A intro tem de dizer o tipo de obra, a zona e 1-2 elementos concretos do brief.
  Não uses frases vagas ("espaço moderno e funcional", "diversas áreas") sem as
  concretizar.
- Cada post social começa com um gancho concreto (o que mudou) e termina com CTA.

Devolve APENAS JSON válido, sem markdown, com este formato:
{
  "title": "H1, ex.: Remodelação de quarto em Braga",
  "slug": "minusculas-sem-acentos-com-hifens",
  "meta_title": "até 60 caracteres",
  "meta_description": "até 155 caracteres",
  "location": "concelho/zona ou null",
  "type": "tipo curto, ex.: Remodelação de interior",
  "intro": "2-3 frases",
  "challenge": "1-2 frases ou null",
  "solution": "2-3 frases",
  "scope": ["3-6 trabalhos executados"],
  "materials": ["0-6 materiais visíveis ou mencionados"],
  "duration": "ex.: 3 semanas ou null",
  "highlights": ["3 destaques concretos"],
  "instagram": "80-150 palavras, com 5-8 hashtags PT",
  "linkedin": "80-150 palavras, tom B2B, no máximo 3 hashtags",
  "google_business": "40-80 palavras, com CTA",
  "image_alts": ["uma descrição por foto, na ordem"]
}`;

function parseJson(text) {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

function str(value, fallback = null) {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  return v || fallback;
}

function arr(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
}

export function normalizeContent(raw, brief) {
  const title = str(raw?.title, 'Obra de remodelação');
  const intro = str(raw?.intro, '');
  const metaDescription =
    str(raw?.meta_description) ||
    (intro ? `${intro.slice(0, 152).trim()}…` : 'Remodelação realizada pela M&M Remodelações.');

  return {
    title,
    slug: str(raw?.slug, ''),
    meta_title: str(raw?.meta_title, `${title} | M&M Remodelações`),
    meta_description: metaDescription,
    location: str(raw?.location),
    type: str(raw?.type, 'Remodelação'),
    intro,
    challenge: str(raw?.challenge),
    solution: str(raw?.solution, ''),
    scope: arr(raw?.scope),
    materials: arr(raw?.materials),
    duration: str(raw?.duration),
    highlights: arr(raw?.highlights),
    instagram: str(raw?.instagram, ''),
    linkedin: str(raw?.linkedin, ''),
    google_business: str(raw?.google_business, ''),
    image_alts: arr(raw?.image_alts),
    brief,
    model: config.model,
    generated_at: new Date().toISOString(),
  };
}

export async function generateContent({ brief, photos }) {
  if (!brief?.trim()) throw new Error('Brief vazio');
  if (!photos?.length) throw new Error('Sem fotos');

  const content = [
    {
      type: 'text',
      text: `BRIEF DA OBRA (factos fornecidos pelo utilizador):\n${brief.trim()}`,
    },
  ];

  for (const photo of photos) {
    const data = await fs.readFile(photo);
    content.push({
      type: 'image_url',
      image_url: { url: `data:${mimeFor(photo)};base64,${data.toString('base64')}` },
    });
  }

  const json = await orFetch('/chat/completions', {
    model: config.model,
    temperature: 0.2,
    max_tokens: 4000,
    usage: { include: true },
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content },
    ],
  });

  const text = json.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Resposta vazia do modelo');
  return normalizeContent(parseJson(text), brief);
}
