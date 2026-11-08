import { useEffect, useState } from 'react';
import type { StorySymbolKey } from '../types/domain';
import { StoryArt } from '../components/StoryArt';
import { LockNotice } from '../components/ui';
import { useGuidedVoice } from '../lib/hooks';
import { useAppStore } from '../lib/store';
import { genderize } from '../lib/words';

type Feeling = 'bene' | 'stanco' | 'preoccupato' | 'arrabbiato';
type Helper = 'respiro' | 'pausa' | 'aiuto' | 'bene';

const FEELINGS: { id: Feeling; label: string; card: string }[] = [
  { id: 'bene', label: 'Sto bene', card: 'Sto bene.' },
  { id: 'stanco', label: 'Sono stanc{o|a}', card: 'Sono stanc{o|a}.' },
  { id: 'preoccupato', label: 'Sono preoccupat{o|a}', card: 'Sono preoccupat{o|a}.' },
  { id: 'arrabbiato', label: 'Sono arrabbiat{o|a}', card: 'Sono arrabbiat{o|a}.' },
];

const CARDS: Record<Exclude<Helper, 'respiro'>, { text: string; symbol: StorySymbolKey }> = {
  pausa: { text: 'Ho bisogno di una pausa.', symbol: 'pausa' },
  aiuto: { text: 'Mi aiuti, per favore?', symbol: 'aiuto' },
  bene: { text: 'Sto bene.', symbol: 'palla' },
};

/** Volti essenziali: la parola scritta accanto resta l'informazione principale. */
function Face({ feeling }: { feeling: Feeling }) {
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden="true" focusable="false">
      <circle cx="40" cy="40" r="34" fill="var(--patient-fill)" stroke="var(--patient-line)" strokeWidth="3" />
      {feeling === 'stanco' ? (
        <path d="M24 36h10M46 36h10" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="29" cy="35" r="3.5" fill="var(--ink)" />
          <circle cx="51" cy="35" r="3.5" fill="var(--ink)" />
        </>
      )}
      {feeling === 'bene' && <path d="M26 50c8 9 20 9 28 0" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />}
      {feeling === 'stanco' && <path d="M30 53h20" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />}
      {feeling === 'preoccupato' && (
        <>
          <path d="M28 55c6-5 18-5 24 0" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 26l10 3M58 26l-10 3" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {feeling === 'arrabbiato' && (
        <>
          <path d="M28 56c6-6 18-6 24 0" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 28l12 5M58 28l-12 5" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function Breathing({ onStop }: { onStop: () => void }) {
  const calm = useAppStore((state) => state.preferences.motion) === 'calm';
  const [phase, setPhase] = useState<'dentro' | 'fuori'>('dentro');

  // Un ritmo lento da seguire, non un conto alla rovescia: non finisce da solo.
  useEffect(() => {
    if (calm) return;
    const timer = window.setInterval(() => setPhase((value) => (value === 'dentro' ? 'fuori' : 'dentro')), 4000);
    return () => window.clearInterval(timer);
  }, [calm]);

  return (
    <section className="ponti-card flex flex-col items-center p-6 text-center sm:p-10" aria-labelledby="respiro-heading">
      <h2 id="respiro-heading" className="text-3xl">
        Respiro con il cerchio
      </h2>
      <p className="mt-2 max-w-reading text-lg text-ink-soft">
        Quando il cerchio è grande, prendi aria dal naso. Quando è piccolo, soffia piano dalla bocca.
      </p>
      <div className="my-8 flex h-64 w-64 items-center justify-center">
        <div
          aria-hidden="true"
          className="rounded-full border-4 border-place-line bg-place-fill"
          style={{
            width: phase === 'dentro' ? '15rem' : '7rem',
            height: phase === 'dentro' ? '15rem' : '7rem',
            transition: 'width 3.8s ease-in-out, height 3.8s ease-in-out',
          }}
        />
      </div>
      <p className="text-3xl font-bold" aria-live="polite">
        {phase === 'dentro' ? 'Prendi aria' : 'Soffia piano'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {calm && (
          <button
            type="button"
            onClick={() => setPhase((value) => (value === 'dentro' ? 'fuori' : 'dentro'))}
            className="ponti-btn-primary"
          >
            {phase === 'dentro' ? 'Ora soffio' : 'Ora prendo aria'}
          </button>
        )}
        <button type="button" onClick={onStop} className="ponti-btn-secondary">
          Basta così
        </button>
      </div>
    </section>
  );
}

/**
 * «Come sto»: il bambino dice come si sente e trova qualcosa che aiuta.
 * Nulla viene salvato: è uno strumento per il momento, non un registro.
 */
export function Feelings() {
  const gender = useAppStore((state) => state.profile.gender);
  const dualUser = useAppStore((state) => state.preferences.dualUser);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [helper, setHelper] = useState<Helper | null>(null);
  const { locked, read } = useGuidedVoice();
  const g = (text: string) => genderize(text, gender);

  const reset = () => {
    setFeeling(null);
    setHelper(null);
  };

  const card = helper && helper !== 'respiro' ? CARDS[helper] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-line pb-5">
        <a href="#/app" className="ponti-btn-quiet min-h-16 px-4">
          <span aria-hidden="true">←</span> Oggi
        </a>
        <div>
          <p className="ponti-label">Come sto</p>
          <h1 className="mt-1 text-2xl leading-tight sm:text-3xl">
            {feeling === null ? 'Come stai adesso?' : helper === null ? 'Cosa ti aiuta?' : helper === 'respiro' ? 'Respiriamo insieme' : 'La tua carta'}
          </h1>
        </div>
      </div>

      <LockNotice locked={locked} />

      {feeling === null && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {FEELINGS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setFeeling(item.id);
                  if (item.id === 'bene') setHelper('bene');
                }}
                className="flex min-h-32 w-full items-center gap-5 rounded-card border-2 border-line bg-surface p-5 text-left hover:border-accent"
              >
                <Face feeling={item.id} />
                <span className="text-2xl font-bold">{g(item.label)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {feeling !== null && helper === null && (
        <>
          <p className="text-xl">{g(FEELINGS.find((item) => item.id === feeling)?.label ?? '')}. Va bene sentirsi così.</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ['respiro', 'Respiro con il cerchio', 'respiro'],
                ['pausa', 'Chiedo una pausa', 'pausa'],
                ['aiuto', 'Chiedo aiuto', 'aiuto'],
              ] as const
            ).map(([id, label, symbol]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setHelper(id)}
                  className="flex h-full min-h-40 w-full flex-col items-center gap-3 rounded-card border-2 border-line bg-surface p-4 text-center hover:border-accent"
                >
                  <StoryArt visual={{ type: 'symbol', key: symbol, altText: label }} decorative className="h-24 w-28" />
                  <span className="text-xl font-bold">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {helper === 'respiro' && <Breathing onStop={reset} />}

      {card && (
        <section className="ponti-card flex flex-col items-center p-6 text-center sm:p-10" aria-labelledby="carta-heading">
          <StoryArt visual={{ type: 'symbol', key: card.symbol, altText: '' }} decorative className="h-36 w-44 sm:h-48 sm:w-56" />
          <h2 id="carta-heading" className="mt-4 text-4xl leading-tight sm:text-5xl">
            {helper === 'bene' && feeling ? g(FEELINGS.find((item) => item.id === feeling)?.card ?? card.text) : card.text}
          </h2>
          <p className="mt-3 text-lg text-ink-soft">Mostra questa carta a un adulto, oppure falla dire al tablet.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void read(helper === 'bene' ? 'Sto bene.' : card.text)}
              disabled={locked}
              className="ponti-btn-primary"
            >
              <span aria-hidden="true">🔊</span> Dillo ad alta voce
            </button>
            <button type="button" onClick={reset} className="ponti-btn-quiet">
              Ho finito
            </button>
          </div>
        </section>
      )}

      {feeling !== null && helper === null && (
        <button type="button" onClick={reset} className="ponti-btn-quiet">
          Torna indietro
        </button>
      )}

      {dualUser && (
        <aside className="rounded-card border border-line bg-paper-deep p-5" aria-label="Suggerimento per l’adulto">
          <p className="ponti-label">Per l’adulto</p>
          <p className="mt-2 text-base">
            Quando viene mostrata la carta della pausa, concedetela subito, anche breve: così la carta mantiene valore.
            Questa schermata non salva nulla. Se volete ricordare una giornata faticosa, scrivetelo nel diario.
          </p>
        </aside>
      )}
    </div>
  );
}
