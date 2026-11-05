import type { StorySymbolKey, StoryVisual } from '../types/domain';

export const STORY_SYMBOLS: { key: StorySymbolKey; label: string }[] = [
  { key: 'palla', label: 'Palla' },
  { key: 'treno', label: 'Treno' },
  { key: 'respiro', label: 'Respiro' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'pallamorbida', label: 'Palla morbida' },
  { key: 'maestra', label: 'Maestra' },
  { key: 'bambino', label: 'Bambino' },
  { key: 'scuola', label: 'Scuola' },
  { key: 'parole', label: 'Parole' },
  { key: 'famiglia', label: 'Famiglia' },
  { key: 'cane', label: 'Cane' },
];

export function symbolLabel(key: StorySymbolKey): string {
  return STORY_SYMBOLS.find((symbol) => symbol.key === key)?.label ?? 'Simbolo';
}

/**
 * Illustrazioni minime, su fondo pastello: un solo soggetto per scena,
 * nessun dettaglio decorativo (principio Munari / ISO 21801-1).
 */
export function StoryArt({
  visual,
  className = '',
  decorative = false,
}: {
  visual: StoryVisual;
  className?: string;
  decorative?: boolean;
}) {
  if (visual.type === 'photo' || visual.type === 'aac') {
    const fallbackAlt = visual.type === 'aac' ? visual.label : 'Foto caricata dall’adulto';
    return (
      <img
        src={visual.dataUrl}
        alt={decorative ? '' : visual.altText || fallbackAlt}
        aria-hidden={decorative || undefined}
        className={`h-full w-full rounded-tile ${visual.type === 'aac' ? 'object-contain' : 'object-cover'} ${className}`}
      />
    );
  }

  const label = visual.altText || symbolLabel(visual.key);
  return (
    <svg
      viewBox="0 0 240 200"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      <rect width="240" height="200" rx="20" fill="var(--paper-deep)" />
      <g fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {visual.key === 'palla' && (
          <>
            <circle cx="120" cy="96" r="42" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M84 78c22 16 52 16 74 0M88 118c20-14 46-14 66 0M120 54v84" stroke="var(--agent-line)" />
            <path d="M54 158c24-14 46-14 66 0s42 14 66 0" />
          </>
        )}
        {visual.key === 'treno' && (
          <>
            <rect x="52" y="62" width="102" height="66" rx="10" fill="var(--place-fill)" stroke="var(--place-line)" />
            <rect x="154" y="86" width="38" height="42" rx="8" fill="var(--place-fill)" stroke="var(--place-line)" />
            <path d="M66 44h20V62H66zM96 44h20V62H96z" fill="var(--surface)" stroke="var(--place-line)" />
            <circle cx="82" cy="136" r="12" fill="var(--surface)" stroke="var(--place-line)" />
            <circle cx="126" cy="136" r="12" fill="var(--surface)" stroke="var(--place-line)" />
            <circle cx="172" cy="136" r="10" fill="var(--surface)" stroke="var(--place-line)" />
            <path d="M36 152h172" />
          </>
        )}
        {visual.key === 'respiro' && (
          <>
            <path d="M120 52c-24 0-38 18-38 38 0 18 14 30 30 30 13 0 22-9 22-20 0-10-8-17-17-17-8 0-13 5-13 12 0 6 4 10 10 10 4 0 7-2 8-6" />
            <path d="M88 146c-14 10-22 20-26 30M152 146c14 10 22 20 26 30" opacity="0.65" />
            <path d="M156 56l14-10M160 70h18" />
          </>
        )}
        {visual.key === 'tablet' && (
          <>
            <rect x="66" y="42" width="108" height="116" rx="12" fill="var(--surface)" stroke="var(--place-line)" />
            <rect x="78" y="58" width="84" height="70" rx="6" fill="var(--place-fill)" stroke="var(--place-line)" />
            <circle cx="102" cy="86" r="13" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M128 76h24M128 92h24M92 112h44" stroke="var(--place-line)" />
            <circle cx="120" cy="146" r="4" fill="var(--place-line)" />
          </>
        )}
        {visual.key === 'agenda' && (
          <>
            <rect x="62" y="48" width="116" height="104" rx="10" fill="var(--surface)" stroke="var(--patient-line)" />
            <path d="M62 76h116M88 40v18M152 40v18" stroke="var(--patient-line)" />
            <g stroke="var(--patient-line)">
              <rect x="78" y="90" width="28" height="22" rx="4" fill="var(--patient-fill)" />
              <rect x="114" y="90" width="28" height="22" rx="4" fill="var(--patient-fill)" />
              <rect x="78" y="120" width="28" height="22" rx="4" fill="var(--patient-fill)" />
            </g>
            <path d="M118 126l8 8 16-18" />
          </>
        )}
        {visual.key === 'pallamorbida' && (
          <>
            <circle cx="120" cy="108" r="34" fill="var(--verb-fill)" stroke="var(--verb-line)" />
            <path d="M120 74v68M86 108h68" stroke="var(--verb-line)" opacity="0.55" />
            <path d="M64 132c-8 4-12 10-12 18M176 132c8 4 12 10 12 18M78 150c-4 6-4 10-2 14M162 150c4 6 4 10 2 14" />
          </>
        )}
        {visual.key === 'maestra' && (
          <>
            <circle cx="104" cy="72" r="20" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M104 92v52M104 108l-24 16M104 108l24 16M104 144l-16 26M104 144l16 26" />
            <rect x="142" y="58" width="52" height="66" rx="6" fill="var(--surface)" stroke="var(--agent-line)" />
            <path d="M152 80h32M152 96h24" stroke="var(--agent-line)" />
            <path d="M68 54c10-8 24-8 34 0" opacity="0.7" />
          </>
        )}
        {visual.key === 'bambino' && (
          <>
            <circle cx="104" cy="82" r="22" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M104 104v42M104 118l-20 12M104 118l20 12M104 146l-14 22M104 146l14 22" />
            <path d="M136 54c14 0 24 8 24 18s-10 18-24 18c8-12 8-24 0-36z" fill="var(--surface)" stroke="var(--agent-line)" />
            <circle cx="156" cy="62" r="2.5" fill="var(--agent-line)" />
            <circle cx="156" cy="70" r="2.5" fill="var(--agent-line)" />
          </>
        )}
        {visual.key === 'scuola' && (
          <>
            <path d="M58 96l62-42 62 42v66H58z" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <rect x="96" y="120" width="30" height="42" fill="var(--surface)" stroke="var(--patient-line)" />
            <rect x="138" y="112" width="20" height="20" fill="var(--surface)" stroke="var(--patient-line)" />
            <path d="M72 112h16v20H72zM72 140h16v10H72z" fill="var(--surface)" stroke="var(--patient-line)" />
            <path d="M120 54v-14M112 46l8-8 8 8" />
          </>
        )}
        {visual.key === 'parole' && (
          <>
            <path d="M54 62h78a10 10 0 0110 10v40a10 10 0 01-10 10H92l-20 18v-18H54a10 10 0 01-10-10V72a10 10 0 0110-10z" fill="var(--surface)" stroke="var(--accent)" />
            <path d="M140 96h46a10 10 0 0110 10v30a10 10 0 01-10 10h-18v14l-16-14h-12a10 10 0 01-10-10v-30a10 10 0 0110-10z" fill="var(--accent-soft)" stroke="var(--accent)" />
            <path d="M66 84h44M66 100h56M156 116h24M156 130h16" stroke="var(--accent)" />
          </>
        )}
        {visual.key === 'famiglia' && (
          <>
            <circle cx="86" cy="78" r="18" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M86 96v46M86 110l-18 12M86 110l18 12M86 142l-12 20M86 142l12 20" />
            <circle cx="150" cy="78" r="18" fill="var(--verb-fill)" stroke="var(--verb-line)" />
            <path d="M150 96v46M150 110l-18 12M150 110l18 12M150 142l-12 20M150 142l12 20" />
            <circle cx="118" cy="118" r="13" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <path d="M118 131v26M118 138l-12 8M118 138l12 8M118 157l-8 14M118 157l8 14" />
          </>
        )}
        {visual.key === 'cane' && (
          <>
            <ellipse cx="120" cy="158" rx="46" ry="10" fill="var(--line)" opacity="0.7" />
            <path d="M88 150c0-26 12-42 32-42s32 16 32 42z" fill="#C9A17A" stroke="#4A3018" />
            <circle cx="120" cy="92" r="26" fill="#C9A17A" stroke="#4A3018" />
            <ellipse cx="98" cy="86" rx="8" ry="16" fill="#A4794F" stroke="#4A3018" />
            <ellipse cx="142" cy="86" rx="8" ry="16" fill="#A4794F" stroke="#4A3018" />
            <circle cx="111" cy="90" r="2.5" fill="#4A3018" />
            <circle cx="129" cy="90" r="2.5" fill="#4A3018" />
            <circle cx="120" cy="100" r="3.5" fill="#4A3018" />
            <path d="M120 110c-6 8-14 8-18 2M120 110c6 8 14 8 18 2" />
          </>
        )}
      </g>
    </svg>
  );
}
