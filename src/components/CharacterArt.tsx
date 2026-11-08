import type { ActionId, CharacterId } from '../types/domain';

interface CharacterStyle {
  name: string;
  fur: string;
  shade: string;
  cloth: string;
  ink: string;
}

const STYLES: Record<CharacterId, CharacterStyle> = {
  gatto: { name: 'Gatto', fur: '#E9A85E', shade: '#C97F36', cloth: '#E9A85E', ink: '#5B3208' },
  cane: { name: 'Cane', fur: '#C9A17A', shade: '#A4794F', cloth: '#C9A17A', ink: '#4A3018' },
  topo: { name: 'Topo', fur: '#B9B4A9', shade: '#8E897E', cloth: '#B9B4A9', ink: '#3D3A33' },
  bimba: { name: 'Bambina', fur: '#E4B58D', shade: '#C38F65', cloth: '#3F7A63', ink: '#4A2C16' },
  bimbo: { name: 'Bambino', fur: '#E0AE86', shade: '#BC855B', cloth: '#A9530F', ink: '#4A2C16' },
};

export function CharacterArt({
  id,
  size = 120,
  waving = false,
  pushing = false,
}: {
  id: CharacterId;
  size?: number;
  waving?: boolean;
  pushing?: boolean;
}) {
  const style = STYLES[id];
  const isAnimal = id === 'gatto' || id === 'cane' || id === 'topo';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={style.name}
      className="overflow-visible"
    >
      {/* corpo */}
      <path
        d="M32 108c0-19 12-31 28-31s28 12 28 31z"
        fill={style.cloth}
        stroke={style.ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {isAnimal ? (
        <>
          {/* zampe anteriori */}
          <rect x="36" y="94" width="12" height="16" rx="6" fill={style.shade} stroke={style.ink} strokeWidth="2.2" />
          <rect x="72" y="94" width="12" height="16" rx="6" fill={style.shade} stroke={style.ink} strokeWidth="2.2" />
          <circle cx="60" cy="56" r="27" fill={style.fur} stroke={style.ink} strokeWidth="2.5" />
          {id === 'gatto' && (
            <>
              <path d="M38 40l-3-18 17 10z" fill={style.fur} stroke={style.ink} strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M82 40l3-18-17 10z" fill={style.fur} stroke={style.ink} strokeWidth="2.5" strokeLinejoin="round" />
            </>
          )}
          {id === 'cane' && (
            <>
              <ellipse cx="32" cy="52" rx="10" ry="19" fill={style.shade} stroke={style.ink} strokeWidth="2.5" transform="rotate(16 32 52)" />
              <ellipse cx="88" cy="52" rx="10" ry="19" fill={style.shade} stroke={style.ink} strokeWidth="2.5" transform="rotate(-16 88 52)" />
            </>
          )}
          {id === 'topo' && (
            <>
              <circle cx="36" cy="38" r="14" fill={style.fur} stroke={style.ink} strokeWidth="2.5" />
              <circle cx="84" cy="38" r="14" fill={style.fur} stroke={style.ink} strokeWidth="2.5" />
              <circle cx="36" cy="38" r="7" fill="#E8B9AE" stroke={style.ink} strokeWidth="2" />
              <circle cx="84" cy="38" r="7" fill="#E8B9AE" stroke={style.ink} strokeWidth="2" />
            </>
          )}
          <circle cx="50" cy="53" r="3.2" fill={style.ink} />
          <circle cx="70" cy="53" r="3.2" fill={style.ink} />
          <path d="M60 60l-4 5h8z" fill={style.ink} />
          <path d="M54 70c3 3 9 3 12 0" fill="none" stroke={style.ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M48 64h-14M48 68h-14M72 64h14M72 68h14" stroke={style.ink} strokeWidth="1.4" opacity="0.55" />
        </>
      ) : (
        <>
          {/* testa */}
          <circle cx="60" cy="50" r="25" fill={style.fur} stroke={style.ink} strokeWidth="2.5" />
          {id === 'bimba' ? (
            <path d="M35 46c0-18 11-26 25-26s25 8 25 26c-7-8-16-11-25-11s-18 3-25 11z" fill={style.ink} />
          ) : (
            <path d="M36 44c2-16 11-23 24-23s22 7 24 23c-6-6-15-9-24-9s-18 3-24 9z" fill={style.ink} />
          )}
          <circle cx="51" cy="50" r="2.8" fill={style.ink} />
          <circle cx="69" cy="50" r="2.8" fill={style.ink} />
          <path d="M52 61c4 4 12 4 16 0" fill="none" stroke={style.ink} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="41" cy="58" r="4" fill="#E8A79A" opacity="0.7" />
          <circle cx="79" cy="58" r="4" fill="#E8A79A" opacity="0.7" />
        </>
      )}
      {/* braccio che saluta o spinge */}
      {waving && (
        <path
          d="M87 84c8-4 11-12 9-20"
          fill="none"
          stroke={style.ink}
          strokeWidth="2.6"
          strokeLinecap="round"
          className="motion-safe-pulse"
        />
      )}
      {pushing && <path d="M88 88h20" stroke={style.ink} strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
}

export function ScenarioStage({
  agent,
  patient,
  action,
  reversed = false,
  showRoles = false,
  compact = false,
}: {
  agent: CharacterId;
  patient: CharacterId;
  action: ActionId;
  reversed?: boolean;
  showRoles?: boolean;
  compact?: boolean;
}) {
  const left = reversed ? patient : agent;
  const right = reversed ? agent : patient;
  const motion = action === 'inseguire';

  return (
    <div className={compact ? 'relative' : 'relative mt-2'}>
      <svg
        viewBox="0 0 560 260"
        className="w-full"
        role="img"
        aria-label={`Scena: ${STYLES[left].name} e ${STYLES[right].name}. Azione: ${action}.`}
      >
        <rect x="18" y="10" width="524" height="238" rx="26" fill="var(--paper-deep)" opacity="0.6" />
        <path d="M40 226h480" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(86 78) scale(1.34)">
          <g className={motion ? 'scene-runner' : undefined}>
            <CharacterArt id={left} size={120} waving={action === 'salutare'} pushing={action === 'spingere'} />
          </g>
        </g>
        <g transform="translate(348 78) scale(1.34)">
          <g>
            <CharacterArt id={right} size={120} waving={action === 'salutare'} />
          </g>
        </g>

        {action === 'inseguire' && (
          <g stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M262 132h52" />
            <path d="M296 118l18 14-18 14" />
            <path d="M232 172c26 10 58 10 84 0" strokeDasharray="7 10" />
            <path d="M100 168c-16 6-28 6-40 0" strokeDasharray="5 9" />
          </g>
        )}
        {action === 'spingere' && (
          <g stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M300 150h48" />
            <path d="M332 134l20 16-20 16" />
            <path d="M270 196c20 6 44 6 64 0" strokeDasharray="7 10" />
          </g>
        )}
        {action === 'salutare' && (
          <g>
            <rect x="212" y="62" width="116" height="52" rx="18" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3" />
            <text x="270" y="96" textAnchor="middle" fontSize="24" fill="var(--accent-ink)" fontFamily="Atkinson Hyperlegible, sans-serif" fontWeight="700">
              Ciao!
            </text>
          </g>
        )}

        {showRoles && (
          <g fontFamily="Atkinson Hyperlegible, sans-serif" fontSize="16" fontWeight="700">
            <rect x="52" y="204" width="136" height="32" rx="16" fill="var(--agent-fill)" stroke="var(--agent-line)" strokeWidth="2" />
            <text x="120" y="225" textAnchor="middle" fill="var(--agent-ink)">fa l’azione</text>
            <rect x="368" y="204" width="140" height="32" rx="16" fill="var(--patient-fill)" stroke="var(--patient-line)" strokeWidth="2" />
            <text x="438" y="225" textAnchor="middle" fill="var(--patient-ink)">riceve l’azione</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function TwoPeopleMotif() {
  return (
    <svg viewBox="0 0 560 300" className="w-full" role="img" aria-label="Un adulto e un bambino seduti insieme davanti al tablet">
      <rect x="20" y="18" width="520" height="262" rx="30" fill="var(--paper-deep)" />
      <rect x="196" y="82" width="168" height="112" rx="14" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <path d="M213 164c22-34 44-34 66 0s44 34 68 0" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="268" cy="128" r="11" fill="var(--agent-fill)" stroke="var(--agent-line)" strokeWidth="2.5" />
      <circle cx="302" cy="146" r="8" fill="var(--verb-fill)" stroke="var(--verb-line)" strokeWidth="2.5" />
      <circle cx="332" cy="128" r="11" fill="var(--patient-fill)" stroke="var(--patient-line)" strokeWidth="2.5" />
      <g transform="translate(90 96) scale(0.95)">
        <CharacterArt id="bimba" size={120} />
      </g>
      <g transform="translate(368 66) scale(1.1)">
        <CharacterArt id="cane" size={120} />
      </g>
      <path d="M188 232c48 26 122 26 190 0" fill="none" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 9" />
    </svg>
  );
}
