type DiagonalDividerProps = {
  /** Inverte a direção do corte (rotaciona 180°), para alternar o lado espesso da faixa. */
  flip?: boolean;
  /** Cor de fundo do divisor — deve ser igual à seção seguinte para uma transição sem frestas. */
  className?: string;
};

export const DiagonalDivider = ({ flip = false, className = '' }: DiagonalDividerProps) => (
  <div
    aria-hidden="true"
    className={`relative w-full h-20 md:h-24 overflow-hidden ${className}`}
  >
    <svg
      className="absolute inset-0 block h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={flip ? { transform: 'rotate(180deg)' } : undefined}
    >
      <polygon points="0,0 100,0 100,9 0,100" fill="var(--color-divider-slate)" />
    </svg>
  </div>
);
