import { useEffect, useState } from 'react';
import type { VisualSchedule } from '../types/domain';
import { NATIVE_SCHEDULES } from '../data/adults';
import { StoryArt } from '../components/StoryArt';
import { LockNotice } from '../components/ui';
import { useGuidedVoice } from '../lib/hooks';
import { useRecords } from '../lib/records';
import { useAppStore } from '../lib/store';
import { todayIso } from '../lib/words';
import { playSoftConfirm } from '../lib/audio';

/**
 * Vista del bambino: l'agenda scelta dall'adulto, con il passo di adesso in
 * evidenza. Due modi: tutta la giornata, oppure solo «Prima / Poi».
 */
export function Agenda() {
  const { items: custom } = useRecords('schedule');
  const activeScheduleId = useAppStore((state) => state.activeScheduleId);
  const setActiveSchedule = useAppStore((state) => state.setActiveSchedule);
  const progress = useAppStore((state) => state.agendaProgress);
  const setProgress = useAppStore((state) => state.setAgendaProgress);
  const [mode, setMode] = useState<'tutto' | 'prima-poi'>('prima-poi');
  const { locked, read } = useGuidedVoice();

  const all: VisualSchedule[] = [...custom, ...NATIVE_SCHEDULES];
  const schedule = all.find((item) => item.id === activeScheduleId) ?? null;
  const today = todayIso();
  const done = progress && schedule && progress.scheduleId === schedule.id && progress.date === today ? progress.done : [];

  // Un nuovo giorno o un'altra agenda ripartono dal primo passo.
  useEffect(() => {
    if (schedule && progress && (progress.scheduleId !== schedule.id || progress.date !== today)) {
      setProgress(null);
    }
  }, [progress, schedule, setProgress, today]);

  if (!schedule) {
    return (
      <div className="space-y-6">
        <a href="#/app" className="ponti-btn-quiet min-h-16 px-4">
          <span aria-hidden="true">←</span> Oggi
        </a>
        <div className="max-w-reading">
          <p className="ponti-label">La mia giornata</p>
          <h1 className="mt-2 text-4xl">Quale agenda usiamo oggi?</h1>
          <p className="mt-3 text-lg text-ink-soft">La sceglie l’adulto. Si può cambiare quando serve.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {all.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveSchedule(item.id)}
                className="flex h-full min-h-32 w-full flex-col items-start gap-3 rounded-card border-2 border-line bg-surface p-5 text-left hover:border-accent"
              >
                <span className="text-xl font-bold">{item.title}</span>
                <span className="flex gap-1" aria-hidden="true">
                  {item.steps.slice(0, 5).map((step) => (
                    <StoryArt key={step.id} visual={step.visual} decorative className="h-10 w-12" />
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const currentIndex = schedule.steps.findIndex((step) => !done.includes(step.id));
  const finished = currentIndex === -1;
  const current = finished ? null : schedule.steps[currentIndex];
  const next = finished ? null : schedule.steps[currentIndex + 1] ?? null;

  const markDone = () => {
    if (!current) return;
    playSoftConfirm();
    setProgress({ scheduleId: schedule.id, date: today, done: [...done, current.id] });
  };

  const undo = () => {
    if (done.length === 0) return;
    setProgress({ scheduleId: schedule.id, date: today, done: done.slice(0, -1) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <a href="#/app" className="ponti-btn-quiet min-h-16 px-4">
            <span aria-hidden="true">←</span> Oggi
          </a>
          <div>
            <p className="ponti-label">La mia giornata</p>
            <h1 className="mt-1 text-2xl leading-tight sm:text-3xl">{schedule.title}</h1>
          </div>
        </div>
        <div className="flex gap-2" role="group" aria-label="Come vedere l’agenda">
          {(
            [
              ['prima-poi', 'Prima e poi'],
              ['tutto', 'Tutta la giornata'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`min-h-16 rounded-full border-2 px-4 text-base font-bold ${
                mode === value ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <LockNotice locked={locked} />

      {finished ? (
        <section className="ponti-card p-6 text-center sm:p-10" aria-labelledby="agenda-finita">
          <h2 id="agenda-finita" className="text-3xl">
            L’agenda di oggi è finita.
          </h2>
          <p className="mt-2 text-lg text-ink-soft">Tutti i passi sono fatti.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setProgress(null)} className="ponti-btn-secondary">
              Ricomincia l’agenda
            </button>
            <a href="#/app" className="ponti-btn-quiet">
              Torna a Oggi
            </a>
          </div>
        </section>
      ) : mode === 'prima-poi' && current ? (
        <section aria-label="Prima e poi" className="grid grid-cols-2 gap-3 sm:gap-4">
          <article className="flex flex-col rounded-card border-4 border-accent bg-surface p-3 sm:p-5">
            <p className="font-display text-2xl font-semibold text-accent-ink sm:text-3xl">PRIMA</p>
            <button
              type="button"
              onClick={() => void read(`Prima: ${current.label}.`)}
              disabled={locked}
              className="mb-4 mt-3 block w-full rounded-tile text-left"
              aria-label={`Ascolta: prima ${current.label}`}
            >
              <StoryArt visual={current.visual} decorative className="aspect-[6/5] w-full" />
              <span className="mt-3 block text-xl font-bold leading-tight sm:text-3xl">{current.label}</span>
            </button>
            <button type="button" onClick={markDone} className="ponti-btn-primary mt-auto w-full text-2xl">
              Fatto
            </button>
          </article>
          <article className="rounded-card border-2 border-line bg-paper-deep p-3 sm:p-5">
            <p className="font-display text-2xl font-semibold text-ink-soft sm:text-3xl">POI</p>
            {next ? (
              <button
                type="button"
                onClick={() => void read(`Poi: ${next.label}.`)}
                disabled={locked}
                className="mt-3 block w-full rounded-tile text-left"
                aria-label={`Ascolta: poi ${next.label}`}
              >
                <StoryArt visual={next.visual} decorative className="aspect-[6/5] w-full opacity-90" />
                <span className="mt-3 block text-xl font-bold leading-tight sm:text-3xl">{next.label}</span>
              </button>
            ) : (
              <p className="mt-6 text-xl sm:text-2xl">È l’ultimo passo.</p>
            )}
          </article>
        </section>
      ) : (
        <ol className="space-y-3" aria-label="Tutti i passi">
          {schedule.steps.map((step, index) => {
            const isDone = done.includes(step.id);
            const isCurrent = index === currentIndex;
            return (
              <li
                key={step.id}
                className={`flex flex-wrap items-center gap-4 rounded-card border-2 p-3 ${
                  isCurrent ? 'border-accent bg-accent-soft' : isDone ? 'border-line bg-paper-deep' : 'border-line bg-surface'
                }`}
              >
                <button
                  type="button"
                  onClick={() => void read(step.label)}
                  disabled={locked}
                  className="flex min-w-0 flex-1 items-center gap-4 rounded-tile text-left"
                  aria-label={`${step.label}${isDone ? ', fatto' : isCurrent ? ', adesso' : ''}. Tocca per ascoltare.`}
                >
                  <StoryArt visual={step.visual} decorative className={`h-20 w-24 shrink-0 ${isDone ? 'opacity-50' : ''}`} />
                  <span className={`text-xl font-bold ${isDone ? 'text-ink-soft line-through decoration-2' : ''}`}>{step.label}</span>
                </button>
                {isDone && <span className="ponti-chip">Fatto</span>}
                {isCurrent && (
                  <button type="button" onClick={markDone} className="ponti-btn-primary">
                    Fatto
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex flex-wrap gap-3">
        {done.length > 0 && !finished && (
          <button type="button" onClick={undo} className="ponti-btn-quiet">
            Torna al passo prima
          </button>
        )}
        <p className="self-center text-base text-ink-soft">
          Passi fatti: {done.length} di {schedule.steps.length}. Tocca un’immagine per ascoltarla.
        </p>
      </div>
    </div>
  );
}
