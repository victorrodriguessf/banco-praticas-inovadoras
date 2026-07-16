import { useEffect, useState } from 'react';

export function useCountdown(segundosIniciais: number, ativo: boolean) {
  const [segundosRestantes, setSegundosRestantes] = useState(segundosIniciais);

  useEffect(() => {
    if (!ativo) return;

    const interval = setInterval(() => {
      setSegundosRestantes((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [ativo]);

  return [segundosRestantes, setSegundosRestantes] as const;
}
