import { publishObra } from '../src/store.js';

const slug = process.argv[2];
const consent = process.argv.includes('--consent');

if (!slug) {
  console.error('Uso: npm run publish -- <slug> --consent');
  process.exit(1);
}

if (!consent) {
  console.error(
    'Falta confirmar o consentimento do cliente para publicar as fotos: acrescenta --consent.'
  );
  process.exit(1);
}

try {
  const target = await publishObra(slug);
  console.log(`Publicado em: ${target}`);
  console.log('Agora corre o build/deploy do site para ficar online.');
} catch (err) {
  console.error(`Falhou: ${err.message}`);
  process.exit(1);
}
