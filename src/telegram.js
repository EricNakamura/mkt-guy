import fs from 'node:fs/promises';
import path from 'node:path';
import { config, UPLOADS_DIR } from './config.js';
import { generateContent, transcribeAudio } from './ai.js';
import { ensureDirs, publishObra, saveObra } from './store.js';

if (!config.telegramToken) {
  console.error(
    'Falta TELEGRAM_BOT_TOKEN no .env. Cria um bot com @BotFather e cola o token.'
  );
  process.exit(1);
}

const sessions = new Map();
const uploadRoot = path.join(UPLOADS_DIR, 'telegram');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${config.telegramToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(70_000),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`${method}: ${json.description ?? res.status}`);
  return json.result;
}

const send = (chatId, text) =>
  api('sendMessage', { chat_id: chatId, text, disable_web_page_preview: true });

function allowed(chatId) {
  return config.allowedChatIds.includes(String(chatId));
}

function session(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, { photos: [], brief: '', lastSlug: null, pendingPublish: null, busy: false });
  }
  return sessions.get(chatId);
}

async function download(fileId, dest) {
  const file = await api('getFile', { file_id: fileId });
  const res = await fetch(
    `https://api.telegram.org/file/bot${config.telegramToken}/${file.file_path}`,
    { signal: AbortSignal.timeout(120_000) }
  );
  if (!res.ok) throw new Error(`Download falhou: HTTP ${res.status}`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

const HELP = `Motor de Obras · M&M

1. /nova
2. Envia 3-10 fotos da obra
3. Envia um áudio ou texto com: tipo de obra, zona, o que foi feito, duração
4. /gerar
5. Abre o preview, revê e /publicar

Comandos: /nova /gerar /publicar /estado /ajuda`;

async function handleMessage(msg) {
  if (!msg?.chat?.id) return;
  const chatId = String(msg.chat.id);
  const s = session(chatId);

  if (!allowed(chatId)) {
    await send(
      chatId,
      `Chat ID: ${chatId}\n\nAdiciona este ID a ALLOWED_CHAT_IDS no .env e reinicia o bot.`
    );
    return;
  }

  const text = (msg.text ?? '').trim();
  const command = text.toLowerCase();

  if (command === '/start' || command === '/ajuda' || command === '/help') {
    return send(chatId, HELP);
  }

  if (command === '/nova') {
    s.photos = [];
    s.brief = '';
    s.lastSlug = null;
    s.pendingPublish = null;
    return send(
      chatId,
      'Nova obra.\n\nEnvia 3-10 fotos. Depois um áudio ou texto com os factos: tipo de obra, zona, o que foi feito e duração. No fim, /gerar.'
    );
  }

  if (command === '/estado') {
    return send(
      chatId,
      `Fotos: ${s.photos.length}\nBrief: ${s.brief ? 'sim' : 'não'}\nÚltima obra: ${s.lastSlug ?? '—'}`
    );
  }

  if (command === '/gerar') {
    if (s.busy) return send(chatId, 'Ainda estou a gerar a versão anterior. Aguarda.');
    if (!s.photos.length) return send(chatId, 'Faltam fotos. Envia pelo menos 1 e tenta /gerar.');
    if (!s.brief.trim()) {
      return send(chatId, 'Falta o brief. Envia um áudio ou texto com os factos da obra.');
    }

    s.busy = true;
    await send(chatId, 'A gerar a página e os posts… pode levar 30-60 segundos.');
    try {
      const content = await generateContent({ brief: s.brief, photos: s.photos });
      const { slug } = await saveObra({
        content,
        brief: s.brief,
        photos: s.photos,
        forceSlug: s.lastSlug,
        source: 'telegram',
      });
      s.lastSlug = slug;
      await send(
        chatId,
        `Obra gerada: ${content.title}\n\nPreview: ${config.publicUrl}/preview/${slug}/\n\nRevê os textos. Para publicar no site: /publicar`
      );
    } catch (err) {
      await send(chatId, `Falhou: ${err.message}`);
    } finally {
      s.busy = false;
    }
    return;
  }

  if (command === '/publicar') {
    if (!s.lastSlug) return send(chatId, 'Gera primeiro com /gerar.');
    s.pendingPublish = s.lastSlug;
    return send(
      chatId,
      'Confirmas que tens autorização do cliente para publicar estas fotos (sem moradas nem rostos)?\n\nResponde /sim ou /nao.'
    );
  }

  if (command === '/sim') {
    if (!s.pendingPublish) return send(chatId, 'Não há nada pendente para publicar.');
    const slug = s.pendingPublish;
    s.pendingPublish = null;
    try {
      const target = await publishObra(slug);
      await send(
        chatId,
        `Publicado em ${target}.\n\nFalta o build/deploy do site para ficar online.`
      );
    } catch (err) {
      await send(chatId, `Falhou a publicar: ${err.message}`);
    }
    return;
  }

  if (command === '/nao') {
    s.pendingPublish = null;
    return send(chatId, 'Publicação cancelada.');
  }

  if (msg.photo?.length) {
    if (s.photos.length >= 10) return send(chatId, 'Já tens 10 fotos. Usa as melhores ou /nova.');
    const photo = msg.photo[msg.photo.length - 1];
    const dest = path.join(uploadRoot, chatId, `${Date.now()}.jpg`);
    try {
      await download(photo.file_id, dest);
      s.photos.push(dest);
      if (msg.caption?.trim()) s.brief = [s.brief, msg.caption.trim()].filter(Boolean).join('\n');
      await send(
        chatId,
        `Foto ${s.photos.length} recebida. Envia mais fotos, um áudio/texto com os factos e depois /gerar.`
      );
    } catch (err) {
      await send(chatId, `Não consegui descarregar a foto: ${err.message}`);
    }
    return;
  }

  if (msg.voice || msg.audio) {
    const file = msg.voice ?? msg.audio;
    const ext = (file.file_name?.split('.').pop() ?? 'oga').toLowerCase();
    const dest = path.join(uploadRoot, chatId, `${Date.now()}.${ext}`);
    try {
      await download(file.file_id, dest);
      await send(chatId, 'A transcrever o áudio…');
      const transcript = await transcribeAudio(dest);
      if (!transcript) return send(chatId, 'Não consegui transcrever. Envia a informação por texto.');
      s.brief = [s.brief, transcript].filter(Boolean).join('\n');
      await send(chatId, `Transcrito:\n\n${transcript}\n\nEnvia mais detalhes ou /gerar.`);
    } catch (err) {
      await send(chatId, `Falhou a transcrição: ${err.message}\n\nEnvia os factos por texto.`);
    }
    return;
  }

  if (text && !text.startsWith('/')) {
    s.brief = [s.brief, text].filter(Boolean).join('\n');
    return send(chatId, 'Anotado. Envia mais detalhes ou /gerar.');
  }

  if (text.startsWith('/')) return send(chatId, `Comando desconhecido.\n\n${HELP}`);
}

await ensureDirs();
console.log('Bot a correr. Ctrl+C para parar.');

let offset = 0;
while (true) {
  try {
    const updates = await api('getUpdates', {
      offset,
      timeout: 50,
      allowed_updates: ['message'],
    });
    for (const update of updates ?? []) {
      offset = update.update_id + 1;
      if (update.message) await handleMessage(update.message);
    }
  } catch (err) {
    console.error('Polling:', err.message);
    await sleep(3000);
  }
}
