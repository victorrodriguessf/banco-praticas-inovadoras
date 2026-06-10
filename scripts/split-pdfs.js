/**
 * Gera PDFs individuais para cada prática a partir dos e-books completos.
 * Saída: public/pdfs/practices/{ano}/{id_projeto}.pdf
 *
 * Uso: node scripts/split-pdfs.js
 */

import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PDFS_DIR = join(ROOT, 'public/pdfs');
const OUT_DIR = join(PDFS_DIR, 'practices');
const DATA_DIR = join(ROOT, 'src/data');

const CATALOGS = [
  { year: 2022, file: 'catalogo_2022.json' },
  { year: 2023, file: 'catalogo_2023.json' },
  { year: 2024, file: 'catalogo_2024.json' },
  { year: 2025, file: 'catalogo_2025.json' },
];

async function splitYear(year, projects) {
  const pdfPath = join(PDFS_DIR, `praticas-inovadoras-${year}.pdf`);

  if (!existsSync(pdfPath)) {
    console.warn(`  ⚠️  PDF não encontrado: ${pdfPath} — pulando ${year}`);
    return;
  }

  process.stdout.write(`  Carregando ${year}.pdf...`);
  const pdfBytes = readFileSync(pdfPath);
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const totalPages = sourcePdf.getPageCount();
  console.log(` ${totalPages} páginas`);

  const outDir = join(OUT_DIR, String(year));
  mkdirSync(outDir, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const project of projects) {
    const outPath = join(outDir, `${project.id_projeto}.pdf`);

    if (existsSync(outPath)) {
      skipped++;
      continue;
    }

    const start = Math.min(project.pagina_inicial, project.pagina_situacao) - 1;
    const end   = Math.max(project.pagina_inicial, project.pagina_situacao) - 1;

    if (start < 0 || end >= totalPages) {
      console.warn(`\n  ⚠️  ${project.id_projeto}: páginas ${project.pagina_inicial}–${project.pagina_situacao} fora do range (total: ${totalPages})`);
      errors++;
      continue;
    }

    const newPdf = await PDFDocument.create();
    const indexes = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const copied = await newPdf.copyPages(sourcePdf, indexes);
    copied.forEach(p => newPdf.addPage(p));

    const bytes = await newPdf.save();
    writeFileSync(outPath, bytes);
    generated++;

    process.stdout.write(`\r  ${year}: ${generated + skipped}/${projects.length} (${generated} gerados, ${skipped} já existiam)   `);
  }

  console.log(`\r  ${year}: ✅ ${generated} gerados, ${skipped} já existiam${errors ? `, ${errors} erros` : ''}         `);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Destino: ${OUT_DIR}\n`);

  for (const { year, file } of CATALOGS) {
    console.log(`── ${year} ──`);
    const catalog = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
    await splitYear(year, catalog.projetos);
    console.log();
  }

  console.log('Concluído!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
