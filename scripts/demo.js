import fs from 'node:fs/promises';
import path from 'node:path';
import { config, DEMO_DIR, OBRAS_DIR } from '../src/config.js';
import { generateContent } from '../src/ai.js';
import { ensureDirs, obraDir, saveObra } from '../src/store.js';
import { hasAi } from '../src/config.js';

const demos = [
  {
    slug: 'remodelacao-quarto-braga',
    photo: path.join(DEMO_DIR, 'quarto.jpg'),
    show_partner: true,
    brief:
      'Obra concluída em Braga. Remodelação de um quarto: teto falso contínuo com spots LED, paredes pintadas de branco mate, pavimento flutuante em madeira e porta com revestimento decorativo. Duração: 3 semanas. Cliente particular.',
    fixture: {
      title: 'Remodelação de quarto em Braga',
      slug: 'remodelacao-quarto-braga',
      meta_title: 'Remodelação de quarto em Braga | M&M Remodelações',
      meta_description:
        'Quarto remodelado em Braga: teto falso com spots LED, pintura branca mate, pavimento flutuante em madeira e porta com revestimento decorativo.',
      location: 'Braga',
      type: 'Remodelação de interior',
      intro:
        'Um quarto em Braga que ganhou luz e conforto sem obras estruturais. O trabalho concentrou-se no teto, nas paredes e no pavimento, com acabamentos contínuos e uma paleta neutra.',
      challenge:
        'O teto existente era irregular e a iluminação não acompanhava o desenho do espaço.',
      solution:
        'Executámos um teto falso contínuo com spots LED, pintámos as paredes em branco mate e aplicámos pavimento flutuante em madeira. A porta recebeu um revestimento decorativo para integrar o ambiente.',
      scope: [
        'Teto falso contínuo com spots LED',
        'Pintura das paredes em branco mate',
        'Pavimento flutuante em madeira',
        'Revestimento decorativo da porta',
      ],
      materials: ['Pladur', 'Tinta branca mate', 'Pavimento flutuante em madeira', 'Perfis LED'],
      duration: '3 semanas',
      highlights: [
        'Iluminação LED integrada no teto',
        'Acabamento contínuo sem molduras',
        'Pavimento em madeira natural',
      ],
      instagram:
        'Um quarto com outra luz, em Braga. ✨\n\nTeto falso contínuo com spots LED, paredes em branco mate e pavimento flutuante em madeira. O detalhe final? A porta com revestimento decorativo, escolhida para dialogar com o resto do espaço.\n\nSe tens um quarto a pedir uma renovação, fala connosco. Orçamento gratuito e resposta em 24h.\n\n#remodelacao #braga #minho #pladur #tetofalso #pavimentoflutuante #interiores',
      linkedin:
        'Concluímos mais uma remodelação de interior em Braga.\n\nO projeto incluiu teto falso contínuo com iluminação LED integrada, pintura das paredes, pavimento flutuante em madeira e revestimento decorativo da porta. O objetivo era simples: mais conforto, menos ruído visual e uma execução limpa.\n\nPara empresas e particulares no Minho, trabalhamos remodelações de interiores e exteriores com planeamento e prazos definidos.\n\n#remodelacao #braga #construcao',
      google_business:
        'Remodelação de quarto em Braga concluída. Teto falso com spots LED, pintura, pavimento flutuante em madeira e revestimento decorativo da porta. Peça o seu orçamento gratuito — respondemos em 24 horas.',
      image_alts: ['Quarto remodelado em Braga com teto falso, spots LED e pavimento em madeira'],
      show_partner: true,
    },
  },
  {
    slug: 'remodelacao-loja-calcado-braga',
    photo: path.join(DEMO_DIR, 'loja.jpg'),
    show_partner: false,
    brief:
      'Obra concluída em Braga. Remodelação de uma loja de calçado: expositores em pladur, teto com pendente circular e iluminação LED, pavimento em grés porcelânico e pintura. Duração: 4 semanas. Cliente particular.',
    fixture: {
      title: 'Remodelação de loja de calçado em Braga',
      slug: 'remodelacao-loja-calcado-braga',
      meta_title: 'Remodelação de loja de calçado em Braga | M&M Remodelações',
      meta_description:
        'Loja de calçado remodelada em Braga: expositores em pladur, pendente circular, iluminação LED, pavimento em grés porcelânico e pintura.',
      location: 'Braga',
      type: 'Remodelação comercial',
      intro:
        'Uma loja de calçado em Braga com um percurso claro, expositores à medida e luz a acompanhar o produto. O pladur permitiu criar volumes e nichos sem perder área de circulação.',
      challenge: 'A loja precisava de mais superfícies de exposição sem tornar o espaço pesado.',
      solution:
        'Construímos expositores em pladur, criámos um teto com pendente circular e iluminação LED e renovámos pavimento e pintura. O resultado é um espaço luminoso, com zonas de destaque bem definidas.',
      scope: [
        'Expositores em pladur',
        'Teto com pendente circular',
        'Iluminação LED',
        'Pavimento em grés porcelânico',
        'Pintura geral',
      ],
      materials: ['Pladur', 'Perfis e iluminação LED', 'Grés porcelânico', 'Tinta branca'],
      duration: '4 semanas',
      highlights: [
        'Expositores à medida em pladur',
        'Iluminação suspensa como elemento central',
        'Circulação livre entre zonas de produto',
      ],
      instagram:
        'Uma loja pensada para o produto brilhar. 👟\n\nEm Braga, renovámos este espaço com expositores em pladur, um pendente circular que se tornou o centro da loja e iluminação LED em todo o percurso. Pavimento e pintura novos fecharam o conjunto.\n\nTens um espaço comercial a remodelar? Fala connosco. Orçamento gratuito.\n\n#remodelacaocomercial #braga #minho #pladur #iluminacao #retaildesign #loja',
      linkedin:
        'Concluímos a remodelação de uma loja de calçado em Braga.\n\nO projeto incluiu expositores em pladur desenhados à medida, teto com pendente circular, iluminação LED, pavimento em grés porcelânico e pintura geral. O desafio era aumentar a área de exposição sem comprometer a circulação.\n\nRemodelamos espaços comerciais em Braga e no Minho com foco em prazos, acabamentos e funcionamento do negócio.\n\n#remodelacao #retail #braga',
      google_business:
        'Remodelação de loja de calçado em Braga concluída. Expositores em pladur, pendente circular, iluminação LED, pavimento e pintura. A sua loja também precisa de uma renovação? Peça orçamento gratuito.',
      image_alts: [
        'Loja de calçado remodelada em Braga com expositores em pladur e pendente circular',
      ],
      show_partner: false,
    },
  },
];

const force = process.argv.includes('--force');
const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

await ensureDirs();

for (const demo of demos) {
  if (only && demo.slug !== only) continue;
  if (!force && (await exists(path.join(obraDir(demo.slug), 'content.json')))) {
    console.log(`↷ ${demo.slug} já existe (usa --force para regenerar)`);
    continue;
  }

  console.log(`\n→ ${demo.slug}`);
  let content = { ...demo.fixture, model: 'fixture' };

  if (hasAi()) {
    try {
      console.log('  a pedir à IA…');
      content = await generateContent({ brief: demo.brief, photos: [demo.photo] });
      console.log(`  IA ok: ${content.title}`);
    } catch (err) {
      console.warn(`  IA falhou (${err.message}); uso o fixture.`);
      content = { ...demo.fixture, model: 'fixture' };
    }
  } else {
    console.warn('  sem chave OpenRouter; uso o fixture.');
  }

  content.show_partner = demo.show_partner;

  const { slug } = await saveObra({
    content,
    brief: demo.brief,
    photos: [demo.photo],
    forceSlug: demo.slug,
    source: 'demo',
  });
  console.log(`  página: ${config.publicUrl}/obra/${slug}/`);
  console.log(`  aprovar: ${config.publicUrl}/preview/${slug}/`);
}

console.log(`\nAbre o painel: ${config.publicUrl}/\n`);
