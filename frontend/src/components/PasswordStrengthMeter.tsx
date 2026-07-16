import { calcularForcaSenha } from '../schemas/passwordSchema';

const NIVEIS = [
  { label: 'Fraca', barColor: 'bg-red-500', textColor: 'text-red-500' },
  { label: 'Razoável', barColor: 'bg-orange-500', textColor: 'text-orange-500' },
  { label: 'Boa', barColor: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { label: 'Forte', barColor: 'bg-green-500', textColor: 'text-green-600' },
] as const;

export function PasswordStrengthMeter({ senha }: { senha: string }) {
  if (!senha) return null;

  const nivel = calcularForcaSenha(senha);
  const atual = NIVEIS[nivel];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {NIVEIS.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= nivel ? atual.barColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 font-semibold ${atual.textColor}`}>{atual.label}</p>
    </div>
  );
}
