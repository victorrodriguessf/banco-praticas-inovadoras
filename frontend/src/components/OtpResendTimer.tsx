import { useEffect, useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';

// Deve casar com OTP_VALIDADE_MINUTOS em backend/src/controllers/authController.ts
const VALIDADE_SEGUNDOS = 10 * 60;
const COOLDOWN_SEGUNDOS = 60;

function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${resto.toString().padStart(2, '0')}`;
}

interface OtpResendTimerProps {
  ativo: boolean;
  resetKey: number;
  onReenviar: () => Promise<void>;
}

export function OtpResendTimer({ ativo, resetKey, onReenviar }: OtpResendTimerProps) {
  const [validadeSegundos, setValidadeSegundos] = useCountdown(VALIDADE_SEGUNDOS, ativo);
  const [cooldownSegundos, setCooldownSegundos] = useCountdown(COOLDOWN_SEGUNDOS, ativo);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    setValidadeSegundos(VALIDADE_SEGUNDOS);
    setCooldownSegundos(COOLDOWN_SEGUNDOS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const expirado = validadeSegundos === 0;
  const podeReenviar = cooldownSegundos === 0 && !reenviando;

  const handleReenviar = async () => {
    setReenviando(true);
    try {
      await onReenviar();
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="flex items-center justify-between text-xs mt-2">
      <span className={expirado ? 'text-red-500 font-semibold' : 'text-gray-400'}>
        {expirado ? 'Código expirado' : `Código válido por ${formatarTempo(validadeSegundos)}`}
      </span>
      <button
        type="button"
        onClick={handleReenviar}
        disabled={!podeReenviar}
        className={`font-bold ${
          podeReenviar ? 'text-[#003366] hover:underline' : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        {reenviando ? 'Reenviando...' : cooldownSegundos > 0 ? `Reenviar em ${cooldownSegundos}s` : 'Reenviar código'}
      </button>
    </div>
  );
}
