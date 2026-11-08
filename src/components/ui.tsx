import type { ReactNode } from 'react';
import type { ModuleId, ScaffoldLevel } from '../types/domain';
import { SCAFFOLD_LABELS, moduleInfo } from '../data/content';
import { navigate } from '../lib/router';
import { useAppStore } from '../lib/store';

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  id?: string;
}) {
  return (
    <div className="max-w-reading">
      <p className="ponti-label">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl leading-tight sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg text-ink-soft">{intro}</p>}
    </div>
  );
}

/** Selettore di aiuto: chiuso per non affollare, aperto al punto di bisogno. */
export function ScaffoldPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: ScaffoldLevel;
  onChange: (level: ScaffoldLevel) => void;
  disabled?: boolean;
}) {
  return (
    <details className="relative z-30">
      <summary
        className={`ponti-btn-quiet min-h-16 cursor-pointer list-none px-4 text-base [&::-webkit-details-marker]:hidden ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        Aiuto: <strong className="ml-1">{SCAFFOLD_LABELS[value - 1]}</strong>
      </summary>
      <div className="absolute right-0 mt-2 w-[min(20rem,88vw)] rounded-card border border-line bg-surface p-3 shadow-lift">
        <p className="px-2 pb-2 text-sm text-ink-soft">Quanta guida vuoi dare?</p>
        <div className="space-y-1">
          {([1, 2, 3, 4] as const).map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={value === level}
              onClick={() => onChange(level)}
              className={`flex min-h-16 w-full items-center gap-3 rounded-xl px-3 text-left text-base ${
                value === level ? 'bg-accent-soft text-accent-ink' : 'text-ink hover:bg-paper-deep'
              }`}
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-current font-bold"
              >
                {level}
              </span>
              <span>
                <span className="block font-bold">{SCAFFOLD_LABELS[level - 1]}</span>
                <span className="block text-sm text-ink-soft">
                  {level === 1 && 'La voce descrive tutto, gli elementi si illuminano.'}
                  {level === 2 && 'La voce fa solo le domande chiave.'}
                  {level === 3 && 'Un segnale breve sui punti da guardare.'}
                  {level === 4 && 'Prima si dice la regola a voce, poi si sceglie.'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}

export function ExerciseHeader({
  moduleId,
  scaffold,
  onScaffold,
}: {
  moduleId: ModuleId;
  scaffold: ScaffoldLevel;
  onScaffold: (level: ScaffoldLevel) => void;
}) {
  const info = moduleInfo(moduleId);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/app')} className="ponti-btn-quiet min-h-16 px-4">
          <span aria-hidden="true">←</span> Oggi
        </button>
        <div>
          <p className="ponti-label">{info.kicker}</p>
          <h1 className="mt-1 text-2xl leading-tight sm:text-3xl">{info.name}</h1>
        </div>
      </div>
      <ScaffoldPicker value={scaffold} onChange={onScaffold} />
    </div>
  );
}

export function TaskPrompt({ question, hint }: { question: string; hint?: string }) {
  return (
    <div>
      <h2 className="text-2xl leading-snug sm:text-3xl">{question}</h2>
      {hint && <p className="mt-2 text-lg text-ink-soft">{hint}</p>}
    </div>
  );
}

export function Feedback({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'confirm' | 'guide';
  children: ReactNode;
}) {
  const palette =
    tone === 'confirm'
      ? 'border-verb-line bg-verb-fill text-verb-ink'
      : tone === 'guide'
        ? 'border-place-line bg-place-fill text-place-ink'
        : 'border-line bg-paper-deep text-ink';
  return (
    <div role="status" aria-live="polite" className={`rounded-tile border-2 px-4 py-3 text-base leading-snug ${palette}`}>
      {children}
    </div>
  );
}

export function LockNotice({ locked }: { locked: boolean }) {
  if (!locked) return null;
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-soft">
      <span aria-hidden="true" className="h-3 w-3 rounded-full bg-accent motion-safe-pulse" />
      Sto leggendo. Tra un attimo puoi toccare.
    </div>
  );
}

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <p className="flex items-center gap-2 text-sm font-bold text-ink-soft">
      <span>
        Passo {Math.min(current + 1, total)} di {total}
      </span>
      <span aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-2.5 w-6 rounded-full ${index <= current ? 'bg-accent' : 'bg-line'}`}
          />
        ))}
      </span>
    </p>
  );
}

export function FinishSession({
  items,
  correct,
  finished,
  onFinish,
}: {
  items: number;
  correct: number;
  finished: boolean;
  onFinish: () => void;
}) {
  const ephemeral = useAppStore((state) => state.ephemeral);

  if (finished) {
    return (
      <div className="rounded-card border border-line bg-surface p-6">
        <p className="ponti-label">Sessione conclusa</p>
        <p className="mt-2 text-xl">
          {items === 0 ? 'Nessuna prova completata: va bene così.' : `${items} prove, ${correct} senza aiuto.`}
        </p>
        <p className="mt-2 text-ink-soft">
          {ephemeral
            ? 'Modalità senza salvataggio: questa prova non verrà conservata.'
            : 'Il risultato è salvato su questo dispositivo, dentro la cassaforte cifrata.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="#/app/progressi" className="ponti-btn-primary">
            Guarda i progressi
          </a>
          <a href="#/app" className="ponti-btn-secondary">
            Torna a Oggi
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-paper-deep px-5 py-4">
      <p className="text-base text-ink-soft">
        {items === 0 ? 'Quando vuoi, puoi chiudere la sessione.' : `Prove completate: ${items}.`}
      </p>
      <button type="button" onClick={onFinish} className="ponti-btn-quiet">
        Ho finito per oggi
      </button>
    </div>
  );
}

export function OptionButton({
  selected = false,
  disabled = false,
  onClick,
  children,
  className = '',
  describedBy,
}: {
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-disabled={disabled}
      disabled={disabled}
      aria-describedby={describedBy}
      className={`flex min-h-24 items-center justify-center gap-2 rounded-tile border-2 px-4 py-3 text-lg font-bold leading-tight transition-colors ${
        selected ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface text-ink hover:border-line-strong'
      } ${disabled ? 'cursor-not-allowed opacity-45' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
