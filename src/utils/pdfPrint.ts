type PrintPracticePdfParams = {
  year: number | string;
  originalId: string;
};

export function printPracticePdf({ year, originalId }: PrintPracticePdfParams): void {
  const path = `/pdfs/practices/${String(year).trim()}/${originalId}.pdf`;
  window.open(path, '_blank');
}
