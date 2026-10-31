import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const DATA_DIR = path.join(ROOT, 'data');
export const OBRAS_DIR = path.join(DATA_DIR, 'obras');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const DEMO_DIR = path.join(ROOT, 'demo');

const siteRepo = process.env.SITE_REPO ?? '';

export const config = {
  openrouterKey: process.env.OPENROUTER_API_KEY ?? '',
  model: process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash',
  asrModel: process.env.OPENROUTER_ASR_MODEL ?? 'openai/whisper-large-v3',
  baseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  siteUrl: (process.env.SITE_URL ?? 'https://memremodelacoes.pt').replace(/\/+$/, ''),
  siteRepo,
  publishDir: process.env.PUBLISH_DIR ?? (siteRepo ? path.join(siteRepo, 'public') : ''),
  whatsapp: (process.env.WHATSAPP ?? '351933873125').replace(/\D/g, ''),
  port: Number(process.env.PREVIEW_PORT ?? 4321),
  host: process.env.HOST ?? '127.0.0.1',
  dashboardAuth: process.env.DASHBOARD_AUTH ?? '',
  publicUrl: (process.env.PUBLIC_URL ?? `http://localhost:${process.env.PREVIEW_PORT ?? 4321}`).replace(/\/+$/, ''),
  telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  allowedChatIds: (process.env.ALLOWED_CHAT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export const hasAi = () => config.openrouterKey.trim().length > 10;
