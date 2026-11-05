import type { ColorName, ShapeName } from '../types/domain';

const COLORS: Record<ColorName, { fill: string; line: string; label: string }> = {
  rosso: { fill: '#D2684F', line: '#7C2C1B', label: 'rosso' },
  blu: { fill: '#5E8DB3', line: '#1F4665', label: 'blu' },
  giallo: { fill: '#E7BC4F', line: '#6E5404', label: 'giallo' },
  verde: { fill: '#6FA37B', line: '#24512F', label: 'verde' },
};

export function ShapeArt({
  shape,
  color,
  size = 84,
  showLabel = true,
}: {
  shape: ShapeName;
  color: ColorName;
  size?: number;
  showLabel?: boolean;
}) {
  const palette = COLORS[color];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${shape} ${palette.label}`}
      className="shrink-0"
    >
      {shape === 'cerchio' && <circle cx="50" cy="50" r="36" fill={palette.fill} stroke={palette.line} strokeWidth="3.5" />}
      {shape === 'quadrato' && <rect x="16" y="16" width="68" height="68" rx="10" fill={palette.fill} stroke={palette.line} strokeWidth="3.5" />}
      {shape === 'triangolo' && (
        <path d="M50 14l38 68H12z" fill={palette.fill} stroke={palette.line} strokeWidth="3.5" strokeLinejoin="round" />
      )}
      {showLabel && (
        <text x="50" y="96" textAnchor="middle" fontFamily="Atkinson Hyperlegible, sans-serif" fontSize="11" fill="var(--ink-soft)">
          {palette.label}
        </text>
      )}
    </svg>
  );
}

export function colorLabel(color: ColorName): string {
  return COLORS[color].label;
}
