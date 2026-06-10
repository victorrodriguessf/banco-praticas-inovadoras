import { PDFDocument } from 'pdf-lib';

type PrintPracticePdfParams = {
  year: number | string;
  initialPage: number;
  situationPage: number;
  title: string;
};

const pdfCache = new Map<string, Promise<PDFDocument>>();

function getPdfPathByYear(year: number | string): string {
  const normalizedYear = String(year).trim();

  if (normalizedYear.length === 4) {
    return `/pdfs/praticas-inovadoras-${normalizedYear}.pdf`;
  }

  throw new Error(`Ano inválido para localizar PDF: ${year}`);
}

function loadPdf(pdfPath: string): Promise<PDFDocument> {
  const cached = pdfCache.get(pdfPath);
  if (cached) return cached;

  const promise = fetch(pdfPath)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Não foi possível carregar o PDF em: ${pdfPath}. Verifique se o arquivo existe em public/pdfs.`
        );
      }
      const bytes = await response.arrayBuffer();
      return PDFDocument.load(bytes);
    })
    .catch((err) => {
      pdfCache.delete(pdfPath);
      throw err;
    });

  pdfCache.set(pdfPath, promise);
  return promise;
}

function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function normalizePageRange(initialPage: number, situationPage: number) {
  const start = Number(initialPage);
  const end = Number(situationPage);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error(
      `Páginas inválidas. Página inicial: ${initialPage}. Página final: ${situationPage}.`
    );
  }

  const firstPage = Math.min(start, end);
  const lastPage = Math.max(start, end);

  return {
    firstPage,
    lastPage,
  };
}

export async function printPracticePdf({
  year,
  initialPage,
  situationPage,
  title,
}: PrintPracticePdfParams): Promise<void> {
  const pdfPath = getPdfPathByYear(year);
  const sourcePdf = await loadPdf(pdfPath);

  const newPdf = await PDFDocument.create();

  const { firstPage, lastPage } = normalizePageRange(
    initialPage,
    situationPage
  );

  const startIndex = firstPage - 1;
  const endIndex = lastPage - 1;
  const totalPages = sourcePdf.getPageCount();

  if (startIndex < 0 || endIndex >= totalPages) {
    throw new Error(
      `Páginas inválidas: ${firstPage} a ${lastPage}. O PDF possui ${totalPages} páginas.`
    );
  }

  const pageIndexes: number[] = [];

  for (let index = startIndex; index <= endIndex; index += 1) {
    pageIndexes.push(index);
  }

  const copiedPages = await newPdf.copyPages(sourcePdf, pageIndexes);

  copiedPages.forEach((page) => {
    newPdf.addPage(page);
  });

  const newPdfBytes = await newPdf.save();

  const pdfArrayBuffer = new ArrayBuffer(newPdfBytes.byteLength);
  const pdfUint8Array = new Uint8Array(pdfArrayBuffer);
  pdfUint8Array.set(newPdfBytes);

  const blob = new Blob([pdfArrayBuffer], {
    type: 'application/pdf',
  });

  const blobUrl = URL.createObjectURL(blob);
  const fileName = `${String(year).trim()}-${sanitizeFileName(title)}.pdf`;

  const printWindow = window.open(blobUrl, '_blank');

  if (!printWindow) {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    return;
  }

  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
  });
}
