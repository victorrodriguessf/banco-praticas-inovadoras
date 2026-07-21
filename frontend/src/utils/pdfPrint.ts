import { asset } from './asset';

type PrintPracticePdfParams = {
  year: number | string;
  originalId: string;
};

export function printPracticePdf({ year, originalId }: PrintPracticePdfParams): void {
  const path = asset(`pdfs/practices/${String(year).trim()}/${originalId}.pdf`);
  window.open(path, '_blank');
}
