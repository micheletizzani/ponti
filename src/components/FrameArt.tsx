import type { StoryFrame } from '../types/domain';

/** Illustrazioni essenziali: nessun dettaglio decorativo, un solo evento per quadro. */
export function FrameArt({ art, className = '' }: { art: StoryFrame['art']; className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} role="img" aria-label={artLabel(art)}>
      <rect width="240" height="200" rx="20" fill="var(--paper-deep)" />
      {art === 'rain' && (
        <g>
          <path d="M62 92a28 28 0 0154-10 24 24 0 0136 22H58a22 22 0 014-12z" fill="#C9D9E4" stroke="#2A5A84" strokeWidth="2.5" />
          <g stroke="#2A5A84" strokeWidth="3" strokeLinecap="round">
            <path d="M78 120l-8 22M108 120l-8 22M138 120l-8 22M168 120l-8 22" />
          </g>
          <path d="M168 164c3-18 12-26 24-26s21 8 24 26z" fill="var(--accent)" opacity="0.85" />
        </g>
      )}
      {art === 'umbrella' && (
        <g>
          <path d="M46 96c0-38 30-58 74-58s74 20 74 58z" fill="#D2684F" stroke="#7C2C1B" strokeWidth="2.5" />
          <path d="M120 96v52c0 10 8 16 18 14" fill="none" stroke="#4A2C16" strokeWidth="4" strokeLinecap="round" />
          <path d="M96 74h48" stroke="#7C2C1B" strokeWidth="2.5" />
          <rect x="60" y="150" width="120" height="8" rx="4" fill="var(--accent)" opacity="0.7" />
          <circle cx="120" cy="140" r="12" fill="#E4B58D" stroke="#4A2C16" strokeWidth="2" />
        </g>
      )}
      {art === 'sun' && (
        <g>
          <circle cx="120" cy="86" r="34" fill="#E7BC4F" stroke="#6E5404" strokeWidth="3" />
          <g stroke="#6E5404" strokeWidth="3" strokeLinecap="round">
            <path d="M120 34v-14M120 152v-14M68 86H54M186 86h-14M83 49L73 39M157 123l10 10M157 49l10-10M83 123l-10 10" />
          </g>
          <ellipse cx="84" cy="164" rx="26" ry="8" fill="#A9C4D4" />
          <ellipse cx="162" cy="172" rx="34" ry="9" fill="#A9C4D4" />
        </g>
      )}
      {art === 'dog' && (
        <g>
          <ellipse cx="120" cy="168" rx="46" ry="9" fill="var(--line)" opacity="0.7" />
          <path d="M84 160c0-30 14-48 36-48s36 18 36 48z" fill="#C9A17A" stroke="#4A3018" strokeWidth="2.5" />
          <circle cx="120" cy="96" r="30" fill="#C9A17A" stroke="#4A3018" strokeWidth="2.5" />
          <ellipse cx="92" cy="92" rx="10" ry="20" fill="#A4794F" stroke="#4A3018" strokeWidth="2.5" />
          <ellipse cx="148" cy="92" rx="10" ry="20" fill="#A4794F" stroke="#4A3018" strokeWidth="2.5" />
          <circle cx="110" cy="94" r="3" fill="#4A3018" />
          <circle cx="130" cy="94" r="3" fill="#4A3018" />
          <circle cx="120" cy="104" r="4" fill="#4A3018" />
          <path d="M120 118c-8 10-20 8-26 0" fill="none" stroke="#4A3018" strokeWidth="3" strokeLinecap="round" transform="rotate(6 120 112)" />
          <path d="M152 122c10-4 16-12 14-22" fill="none" stroke="#4A3018" strokeWidth="2.5" />
        </g>
      )}
      {art === 'bowl' && (
        <g>
          <ellipse cx="120" cy="150" rx="66" ry="18" fill="#5E8DB3" stroke="#1F4665" strokeWidth="3" />
          <path d="M58 148c0 26 26 38 62 38s62-12 62-38z" fill="#5E8DB3" stroke="#1F4665" strokeWidth="3" />
          <path d="M76 126c14-8 28-4 40 4s26 10 48 0" fill="none" stroke="#DCEBF7" strokeWidth="4" strokeLinecap="round" />
          <g fill="#DCEBF7" opacity="0.9">
            <circle cx="88" cy="66" r="7" />
            <circle cx="112" cy="50" r="5" />
            <circle cx="150" cy="62" r="6" />
          </g>
        </g>
      )}
      {art === 'dog-happy' && (
        <g>
          <ellipse cx="120" cy="168" rx="46" ry="9" fill="var(--line)" opacity="0.7" />
          <path d="M84 160c0-30 14-48 36-48s36 18 36 48z" fill="#C9A17A" stroke="#4A3018" strokeWidth="2.5" />
          <circle cx="120" cy="96" r="30" fill="#C9A17A" stroke="#4A3018" strokeWidth="2.5" />
          <ellipse cx="92" cy="90" rx="10" ry="20" fill="#A4794F" stroke="#4A3018" strokeWidth="2.5" />
          <ellipse cx="148" cy="90" rx="10" ry="20" fill="#A4794F" stroke="#4A3018" strokeWidth="2.5" />
          <path d="M105 92c3-4 7-4 10 0M125 92c3-4 7-4 10 0" fill="none" stroke="#4A3018" strokeWidth="3" strokeLinecap="round" />
          <path d="M120 104v6M108 116c6 8 18 8 24 0" fill="none" stroke="#4A3018" strokeWidth="3" strokeLinecap="round" />
          <path d="M120 108c-4 6-10 6-12 0" fill="#D2684F" stroke="#7C2C1B" strokeWidth="1.6" />
          <path d="M154 126c14 4 18 16 12 26" fill="none" stroke="#4A3018" strokeWidth="3" strokeLinecap="round" className="motion-safe-pulse" />
        </g>
      )}
    </svg>
  );
}

function artLabel(art: StoryFrame['art']): string {
  switch (art) {
    case 'rain':
      return 'Piove e una bambina si avvicina';
    case 'umbrella':
      return 'Una bambina con l’ombrello aperto';
    case 'sun':
      return 'Il sole splende sulle pozzanghere';
    case 'dog':
      return 'Un cane con la lingua fuori';
    case 'bowl':
      return 'Una ciotola piena d’acqua';
    case 'dog-happy':
      return 'Il cane scodinzola, contento';
  }
}
