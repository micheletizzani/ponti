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
      {art === 'tower' && (
        <g strokeWidth="2.5">
          <rect x="96" y="132" width="48" height="30" rx="4" fill="#D2684F" stroke="#7C2C1B" />
          <rect x="100" y="102" width="40" height="30" rx="4" fill="#5E8DB3" stroke="#1F4665" />
          <rect x="104" y="72" width="32" height="30" rx="4" fill="#E7BC4F" stroke="#6E5404" />
          <rect x="108" y="44" width="24" height="28" rx="4" fill="#7FB08A" stroke="#2C6A3C" />
          <path d="M60 164h120" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="62" cy="120" r="12" fill="#E4B58D" stroke="#4A2C16" />
          <path d="M62 132v24M62 140l14-8" stroke="#4A2C16" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}
      {art === 'tower-fallen' && (
        <g strokeWidth="2.5">
          <rect x="54" y="140" width="48" height="24" rx="4" fill="#D2684F" stroke="#7C2C1B" transform="rotate(-8 78 152)" />
          <rect x="108" y="138" width="40" height="26" rx="4" fill="#5E8DB3" stroke="#1F4665" transform="rotate(14 128 150)" />
          <rect x="152" y="136" width="30" height="28" rx="4" fill="#E7BC4F" stroke="#6E5404" transform="rotate(-20 167 150)" />
          <rect x="96" y="110" width="24" height="26" rx="4" fill="#7FB08A" stroke="#2C6A3C" transform="rotate(30 108 123)" />
          <path d="M40 166h160" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
          <g stroke="#6E5404" strokeWidth="3" strokeLinecap="round">
            <path d="M84 92l-8-12M120 84V68M156 92l8-12" />
          </g>
        </g>
      )}
      {art === 'bell' && (
        <g strokeWidth="2.5">
          <rect x="74" y="40" width="92" height="124" rx="12" fill="var(--surface)" stroke="var(--line-strong)" />
          <circle cx="120" cy="100" r="22" fill="#E7BC4F" stroke="#6E5404" />
          <circle cx="120" cy="100" r="8" fill="#6E5404" />
          <g stroke="#6E5404" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M176 82c8 10 8 26 0 36M188 72c14 16 14 40 0 56" />
            <path d="M64 82c-8 10-8 26 0 36M52 72c-14 16-14 40 0 56" />
          </g>
        </g>
      )}
      {art === 'door' && (
        <g strokeWidth="2.5">
          <rect x="70" y="34" width="100" height="136" rx="6" fill="#F4E9D6" stroke="#4A2C16" />
          <path d="M70 34l58 14v134l-58-12z" fill="#C9A17A" stroke="#4A2C16" />
          <circle cx="116" cy="112" r="5" fill="#4A2C16" />
          <circle cx="150" cy="84" r="13" fill="#E4B58D" stroke="#4A2C16" />
          <path d="M150 97v40M150 112l-16 10M150 137l-10 24M150 137l10 24" stroke="#4A2C16" strokeWidth="3" strokeLinecap="round" fill="none" />
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
    case 'tower':
      return 'Una torre alta di cubi colorati, accanto a una bambina';
    case 'tower-fallen':
      return 'I cubi della torre sono caduti sul pavimento';
    case 'bell':
      return 'Un campanello che suona';
    case 'door':
      return 'Una porta aperta e una persona sulla soglia';
  }
}
