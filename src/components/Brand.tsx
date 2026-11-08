import type { TopicIconName } from '../data/content';
/** Onda continua: il segno grafico che lega fra loro i sei moduli. */
export function WaveMotif({ className = '', nodes = true }: { className?: string; nodes?: boolean }) {
  return (
    <svg viewBox="0 0 720 320" className={className} aria-hidden="true" focusable="false">
      <path
        d="M20 190C92 76 168 76 240 190s148 114 220 0 148-114 220 0"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M20 190C92 76 168 76 240 190s148 114 220 0 148-114 220 0"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="22"
        strokeLinecap="round"
        opacity="0.07"
      />
      {nodes && (
        <>
          <circle cx="144" cy="118" r="26" fill="var(--agent-fill)" stroke="var(--agent-line)" strokeWidth="4" />
          <circle cx="322" cy="234" r="15" fill="var(--verb-fill)" stroke="var(--verb-line)" strokeWidth="4" />
          <circle cx="460" cy="118" r="26" fill="var(--patient-fill)" stroke="var(--patient-line)" strokeWidth="4" />
          <circle cx="600" cy="196" r="12" fill="var(--place-fill)" stroke="var(--place-line)" strokeWidth="4" />
        </>
      )}
    </svg>
  );
}

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Ponti">
      <rect width="64" height="64" rx="16" fill="var(--paper-deep)" />
      <path d="M8 40c8-13 16-13 24 0s16 13 24 0" fill="none" stroke="var(--accent)" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="20" cy="40" r="5" fill="var(--agent-fill)" stroke="var(--agent-line)" strokeWidth="2" />
      <circle cx="32" cy="31" r="3.5" fill="var(--verb-fill)" stroke="var(--verb-line)" strokeWidth="2" />
      <circle cx="44" cy="40" r="5" fill="var(--patient-fill)" stroke="var(--patient-line)" strokeWidth="2" />
    </svg>
  );
}

/** Piccole icone di argomento, geometriche e coerenti, senza emoji di sistema. */
export function TopicIcon({ name, size = 48 }: { name: TopicIconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {name === 'dino' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 34c0-8 5-13 11-13 4 0 6 2 6 5v8H12z" />
          <path d="M29 22h6v10M35 22c3 0 5 2 5 5" />
          <path d="M16 21l2-6 4 4M23 19l1-6 4 5" />
          <circle cx="33" cy="18" r="1.4" fill="currentColor" />
        </g>
      )}
      {name === 'train' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="16" width="28" height="18" rx="4" />
          <path d="M36 22h5v12H8M14 34l-3 6M30 34l3 6M14 10h14" />
          <circle cx="16" cy="25" r="2.4" fill="currentColor" />
          <circle cx="27" cy="25" r="2.4" fill="currentColor" />
        </g>
      )}
      {name === 'cat' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 21l-2-9 8 5M35 21l2-9-8 5" />
          <circle cx="24" cy="28" r="11" />
          <path d="M20 27h.1M28 27h.1M24 32l-2 2h4zM9 31h8M31 31h8" />
        </g>
      )}
      {name === 'pencil' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 36l4-12L30 10l8 8-14 14-12 4z" />
          <path d="M26 14l8 8M16 24l8 8" />
        </g>
      )}
      {name === 'music' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 34V14l16-4v20" />
          <ellipse cx="14" cy="34" rx="5" ry="4" />
          <ellipse cx="30" cy="30" rx="5" ry="4" />
        </g>
      )}
      {name === 'ball' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="14" />
          <path d="M12 18c8 4 16 4 24 0M12 30c8-4 16-4 24 0M24 10v28" />
        </g>
      )}
      {name === 'book' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 14c-5-3-11-4-16-3v24c5-1 11 0 16 3 5-3 11-4 16-3V11c-5-1-11 0-16 3z" />
          <path d="M24 14v24" />
        </g>
      )}
      {name === 'food' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 16c-8-4-15 2-15 10 0 9 7 14 15 12 8 2 15-3 15-12 0-8-7-14-15-10z" />
          <path d="M24 16c0-4 2-6 5-7" />
        </g>
      )}
      {name === 'news' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 8l4 9 10 1-8 7 3 10-9-6-9 6 3-10-8-7 10-1z" />
        </g>
      )}
      {name === 'wave' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M6 20c5-8 10-8 15 0s10 8 15 0 10-8 10 0" />
          <path d="M6 31c5-8 10-8 15 0s10 8 15 0 10-8 10 0" />
        </g>
      )}
    </svg>
  );
}
