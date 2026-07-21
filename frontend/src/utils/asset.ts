// Resolve o caminho de um arquivo estático da pasta public/ respeitando o
// base do Vite (import.meta.env.BASE_URL), que é '/' no dev e
// '/bancodepraticas/' no build de produção.
//
// Uso: asset('covers/capa-2024.jpg') -> '/bancodepraticas/covers/capa-2024.jpg'
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
