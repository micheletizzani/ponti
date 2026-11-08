import type { StorySymbolKey, StoryVisual } from '../types/domain';

export const STORY_SYMBOLS: { key: StorySymbolKey; label: string }[] = [
  { key: 'bambina', label: 'Bambina' },
  { key: 'zaino', label: 'Zaino' },
  { key: 'mangiare', label: 'Mangiare' },
  { key: 'bagno', label: 'Lavarsi le mani' },
  { key: 'gioco', label: 'Gioco' },
  { key: 'libro', label: 'Libro' },
  { key: 'musica', label: 'Musica' },
  { key: 'disegno', label: 'Disegno' },
  { key: 'giardino', label: 'Giardino' },
  { key: 'casa', label: 'Casa' },
  { key: 'auto', label: 'Viaggio in auto' },
  { key: 'letto', label: 'Letto' },
  { key: 'cuffie', label: 'Cuffie' },
  { key: 'pausa', label: 'Pausa' },
  { key: 'logopedia', label: 'Logopedia' },
  { key: 'cerchio', label: 'Cerchio' },
  { key: 'vestirsi', label: 'Vestirsi' },
  { key: 'denti', label: 'Lavare i denti' },
  { key: 'aiuto', label: 'Aiuto' },
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
        {visual.key === 'bambina' && (
          <>
            <path d="M80 70c0-24 16-34 34-34s34 10 34 34c0 14-4 24-10 30H90c-6-6-10-16-10-30z" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <circle cx="114" cy="76" r="21" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M114 97l-24 50h48z" fill="var(--verb-fill)" stroke="var(--verb-line)" />
            <path d="M102 147v22M126 147v22M100 112l-20 14M128 112l20 14" />
            <circle cx="106" cy="76" r="2.5" fill="var(--agent-line)" />
            <circle cx="122" cy="76" r="2.5" fill="var(--agent-line)" />
          </>
        )}
        {visual.key === 'zaino' && (
          <>
            <path d="M84 70c0-18 16-28 36-28s36 10 36 28v78a12 12 0 01-12 12H96a12 12 0 01-12-12z" fill="var(--place-fill)" stroke="var(--place-line)" />
            <path d="M104 46c0-10 32-10 32 0" stroke="var(--place-line)" />
            <rect x="98" y="104" width="44" height="34" rx="8" fill="var(--surface)" stroke="var(--place-line)" />
            <path d="M98 118h44" stroke="var(--place-line)" />
          </>
        )}
        {visual.key === 'mangiare' && (
          <>
            <circle cx="120" cy="104" r="46" fill="var(--surface)" stroke="var(--patient-line)" />
            <circle cx="120" cy="104" r="30" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <path d="M54 62v36M46 62v18c0 8 16 8 16 0V62M54 98v54" />
            <path d="M186 62c-12 6-14 30-2 38v52" />
          </>
        )}
        {visual.key === 'bagno' && (
          <>
            <path d="M80 60h46a14 14 0 0114 14v8" />
            <path d="M70 52h24v16H70z" fill="var(--surface)" />
            <path d="M136 92c0 8 8 12 8 18a8 8 0 01-16 0c0-6 8-10 8-18z" fill="var(--place-fill)" stroke="var(--place-line)" />
            <path d="M84 124c18 22 54 22 72 0" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M70 160h100" stroke="var(--place-line)" />
            <path d="M152 132l8 6M88 132l-8 6" stroke="var(--place-line)" />
          </>
        )}
        {visual.key === 'gioco' && (
          <>
            <rect x="70" y="118" width="40" height="40" rx="6" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <rect x="114" y="118" width="40" height="40" rx="6" fill="var(--place-fill)" stroke="var(--place-line)" />
            <rect x="92" y="74" width="40" height="40" rx="6" fill="var(--verb-fill)" stroke="var(--verb-line)" />
            <path d="M100 138h10M124 138h20M104 94h16" opacity="0.6" />
            <path d="M54 162h132" />
          </>
        )}
        {visual.key === 'libro' && (
          <>
            <path d="M120 64c-18-10-40-12-60-8v96c20-4 42-2 60 8 18-10 40-12 60-8V56c-20-4-42-2-60 8z" fill="var(--surface)" stroke="var(--place-line)" />
            <path d="M120 64v96" stroke="var(--place-line)" />
            <path d="M74 80h32M74 96h32M74 112h24M134 80h32M134 96h32M134 112h24" stroke="var(--place-line)" opacity="0.7" />
          </>
        )}
        {visual.key === 'musica' && (
          <>
            <path d="M96 140V66l60-14v74" strokeWidth="5" />
            <ellipse cx="84" cy="142" rx="16" ry="12" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <ellipse cx="144" cy="128" rx="16" ry="12" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M96 84l60-14" strokeWidth="5" />
          </>
        )}
        {visual.key === 'disegno' && (
          <>
            <rect x="52" y="52" width="104" height="104" rx="8" fill="var(--surface)" stroke="var(--patient-line)" />
            <circle cx="88" cy="88" r="14" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <path d="M64 138c16-20 34-20 50 0" stroke="var(--verb-line)" />
            <path d="M150 156l10-30 32-32 16 16-32 32z" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M182 98l16 16" stroke="var(--agent-line)" />
          </>
        )}
        {visual.key === 'giardino' && (
          <>
            <circle cx="176" cy="54" r="16" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <path d="M96 156v-40" stroke="#4A3018" strokeWidth="6" />
            <circle cx="96" cy="88" r="34" fill="var(--verb-fill)" stroke="var(--verb-line)" />
            <path d="M40 158h160" stroke="var(--verb-line)" />
            <path d="M150 158v-14M146 138a6 6 0 1012 0 6 6 0 00-12 0" stroke="var(--agent-line)" />
          </>
        )}
        {visual.key === 'casa' && (
          <>
            <path d="M60 100l60-50 60 50" stroke="var(--agent-line)" />
            <path d="M74 92v66h92V92" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <rect x="106" y="118" width="28" height="40" rx="4" fill="var(--surface)" stroke="var(--agent-line)" />
            <rect x="140" y="104" width="18" height="18" fill="var(--surface)" stroke="var(--agent-line)" />
            <path d="M44 160h152" />
          </>
        )}
        {visual.key === 'auto' && (
          <>
            <path d="M48 128v-18c0-6 4-10 10-10h18l18-24h52l20 24h16c6 0 10 4 10 10v18z" fill="var(--place-fill)" stroke="var(--place-line)" />
            <path d="M100 84h18v16H90zM126 84h18l12 16h-30z" fill="var(--surface)" stroke="var(--place-line)" />
            <circle cx="84" cy="130" r="14" fill="var(--surface)" stroke="var(--place-line)" />
            <circle cx="160" cy="130" r="14" fill="var(--surface)" stroke="var(--place-line)" />
            <path d="M36 158h168" />
          </>
        )}
        {visual.key === 'letto' && (
          <>
            <path d="M48 150V82M192 150v-36M48 124h144" stroke="var(--place-line)" strokeWidth="5" />
            <rect x="56" y="98" width="40" height="22" rx="10" fill="var(--surface)" stroke="var(--place-line)" />
            <path d="M96 120c10-16 80-16 96-6v10H96z" fill="var(--place-fill)" stroke="var(--place-line)" />
            <path d="M150 48h18l-18 20h18M176 30h12l-12 14h12" stroke="var(--accent)" />
          </>
        )}
        {visual.key === 'cuffie' && (
          <>
            <path d="M72 120v-20c0-30 22-50 48-50s48 20 48 50v20" strokeWidth="6" stroke="var(--place-line)" />
            <rect x="56" y="112" width="30" height="46" rx="12" fill="var(--place-fill)" stroke="var(--place-line)" />
            <rect x="154" y="112" width="30" height="46" rx="12" fill="var(--place-fill)" stroke="var(--place-line)" />
            <path d="M104 134h32" opacity="0.4" />
          </>
        )}
        {visual.key === 'pausa' && (
          <>
            <path d="M92 152v-62a10 10 0 0120 0v-14a10 10 0 0120 0v8a10 10 0 0120 0v16a10 10 0 0120 0v32c0 22-16 38-40 38h-8c-18 0-32-8-40-24l-14-24a10 10 0 0118-8l4 6" fill="var(--agent-fill)" stroke="var(--agent-line)" />
          </>
        )}
        {visual.key === 'logopedia' && (
          <>
            <circle cx="92" cy="90" r="30" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M80 102c8 6 18 6 26 0" stroke="var(--agent-line)" />
            <circle cx="82" cy="84" r="3" fill="var(--agent-line)" />
            <circle cx="102" cy="84" r="3" fill="var(--agent-line)" />
            <path d="M136 70h50a10 10 0 0110 10v24a10 10 0 01-10 10h-26l-16 14v-14h-8a10 10 0 01-10-10V80a10 10 0 0110-10z" fill="var(--surface)" />
            <path d="M146 92c6-8 12-8 18 0s12 8 18 0" />
            <path d="M92 120v38" />
          </>
        )}
        {visual.key === 'cerchio' && (
          <>
            <circle cx="120" cy="104" r="50" stroke="var(--line-strong)" strokeDasharray="6 10" />
            <circle cx="120" cy="54" r="13" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <circle cx="170" cy="104" r="13" fill="var(--verb-fill)" stroke="var(--verb-line)" />
            <circle cx="120" cy="154" r="13" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <circle cx="70" cy="104" r="13" fill="var(--place-fill)" stroke="var(--place-line)" />
          </>
        )}
        {visual.key === 'vestirsi' && (
          <>
            <path d="M96 52l-38 22 14 26 14-8v66h68V92l14 8 14-26-38-22c-4 12-14 18-24 18s-20-6-24-18z" fill="var(--verb-fill)" stroke="var(--verb-line)" />
          </>
        )}
        {visual.key === 'denti' && (
          <>
            <path d="M52 128l96-58" strokeWidth="10" stroke="var(--place-line)" />
            <rect x="140" y="50" width="40" height="24" rx="6" fill="var(--surface)" stroke="var(--place-line)" transform="rotate(-30 160 62)" />
            <path d="M146 48v-10M156 44v-10M166 40v-10" stroke="var(--place-line)" transform="rotate(-30 160 40)" />
            <path d="M120 124c0-10 8-16 18-16 6 0 8 4 12 4s6-4 12-4c10 0 18 6 18 16 0 14-6 26-10 36-2 4-6 4-8 0l-6-14c-2-4-10-4-12 0l-6 14c-2 4-6 4-8 0-4-10-10-22-10-36z" fill="var(--surface)" stroke="var(--accent)" />
          </>
        )}
        {visual.key === 'aiuto' && (
          <>
            <path d="M56 120c10-10 24-16 38-14l26 4c8 2 8 14 0 16l-22 2" fill="var(--agent-fill)" stroke="var(--agent-line)" />
            <path d="M184 120c-10-10-24-16-38-14l-26 4" fill="var(--patient-fill)" stroke="var(--patient-line)" />
            <path d="M120 70c-8-14-30-10-30 6 0 14 30 28 30 28s30-14 30-28c0-16-22-20-30-6z" fill="var(--surface)" stroke="var(--accent)" />
          </>
        )}
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
