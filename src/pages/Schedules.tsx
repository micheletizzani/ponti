import { useState, type FormEvent } from 'react';
import type { AdultRole, ScheduleStep, VisualSchedule } from '../types/domain';
import { NATIVE_SCHEDULES } from '../data/adults';
import { PageHeader } from '../components/PageHeader';
import { StoryArt } from '../components/StoryArt';
import { SymbolPicker } from '../components/SymbolPicker';
import { useRecords } from '../lib/records';
import { useAppStore } from '../lib/store';
import { deleteRecord, saveRecord } from '../lib/vault';
import { uid } from '../lib/metrics';
import { ROLE_INFO } from './AdultSpace';

const MAX_STEPS = 10;

function copySchedule(schedule: VisualSchedule, role: AdultRole): VisualSchedule {
  const now = new Date().toISOString();
  return {
    id: uid('schedule'),
    title: schedule.native ? `${schedule.title} (nostra)` : schedule.title,
    context: schedule.context ?? (role === 'scuola' ? 'scuola' : 'casa'),
    steps: schedule.steps.map((item) => ({ ...item, id: uid('step'), visual: { ...item.visual } })),
    createdAt: now,
    updatedAt: now,
  };
}

function emptySchedule(role: AdultRole): VisualSchedule {
  const now = new Date().toISOString();
  return {
    id: uid('schedule'),
    title: '',
    context: role === 'scuola' ? 'scuola' : 'casa',
    steps: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function Schedules({ role }: { role: AdultRole }) {
  const info = ROLE_INFO[role];
  const { items: custom, refresh } = useRecords('schedule');
  const activeScheduleId = useAppStore((state) => state.activeScheduleId);
  const setActiveSchedule = useAppStore((state) => state.setActiveSchedule);
  const [editing, setEditing] = useState<{ schedule: VisualSchedule; isNew: boolean } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const all = [...NATIVE_SCHEDULES, ...custom];
  const active = all.find((schedule) => schedule.id === activeScheduleId) ?? null;

  if (editing) {
    return (
      <ScheduleEditor
        role={role}
        initial={editing.schedule}
        isNew={editing.isNew}
        onCancel={() => setEditing(null)}
        onSaved={async (schedule) => {
          setEditing(null);
          setNotice(`Agenda «${schedule.title}» salvata.`);
          await refresh();
        }}
      />
    );
  }

  const card = (schedule: VisualSchedule) => {
    const inUse = schedule.id === activeScheduleId;
    return (
      <article key={schedule.id} className={`flex h-full flex-col rounded-card border-2 bg-surface p-5 ${inUse ? 'border-accent' : 'border-line'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="ponti-chip">{schedule.context === 'scuola' ? 'Scuola' : 'Casa'}</p>
          {schedule.native && <p className="ponti-chip">Pronta</p>}
          {inUse && <p className="ponti-chip border-accent bg-accent-soft text-accent-ink">In uso oggi</p>}
        </div>
        <h3 className="mt-3 text-xl leading-snug">{schedule.title}</h3>
        <p className="text-sm text-ink-soft">{schedule.steps.length} passi</p>
        <ol className="mt-3 flex flex-wrap gap-1" aria-label={`Passi di ${schedule.title}`}>
          {schedule.steps.slice(0, 6).map((item) => (
            <li key={item.id} className="w-14">
              <StoryArt visual={item.visual} decorative className="h-12 w-14" />
              <span className="sr-only">{item.label}</span>
            </li>
          ))}
          {schedule.steps.length > 6 && <li className="self-center text-sm text-ink-soft">+{schedule.steps.length - 6}</li>}
        </ol>
        <div className="mt-4 flex flex-1 flex-wrap items-end gap-2">
          {!inUse && (
            <button
              type="button"
              onClick={() => {
                setActiveSchedule(schedule.id);
                setNotice(`Oggi si usa «${schedule.title}». La trovi in Oggi, sotto «La mia giornata».`);
              }}
              className="ponti-btn-primary"
            >
              Usa oggi
            </button>
          )}
          {schedule.native ? (
            <button type="button" onClick={() => setEditing({ schedule: copySchedule(schedule, role), isNew: true })} className="ponti-btn-quiet">
              Copia e modifica
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setEditing({ schedule, isNew: false })} className="ponti-btn-secondary">
                Modifica
              </button>
              {deleting !== schedule.id ? (
                <button type="button" onClick={() => setDeleting(schedule.id)} className="ponti-btn-quiet">
                  Elimina
                </button>
              ) : (
                <span className="flex flex-wrap items-center gap-2 rounded-tile border-2 border-agent-line bg-agent-fill p-2">
                  <span className="text-base text-agent-ink">Elimino l’agenda?</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteRecord(schedule.id);
                      if (inUse) setActiveSchedule(null);
                      setDeleting(null);
                      setNotice('Agenda eliminata.');
                      await refresh();
                    }}
                    className="ponti-btn-primary"
                  >
                    Sì
                  </button>
                  <button type="button" onClick={() => setDeleting(null)} className="ponti-btn-quiet">
                    No
                  </button>
                </span>
              )}
            </>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`#${info.path}`}
        backLabel={info.title}
        eyebrow="Agende visive"
        title="La giornata, una carta alla volta"
        intro="Scegliete l’agenda di oggi: compare nella schermata Oggi. Prima di ogni cambio mostrate la carta successiva e dite «Prima… poi…»."
        action={
          <button type="button" onClick={() => setEditing({ schedule: emptySchedule(role), isNew: true })} className="ponti-btn-primary">
            Crea un’agenda
          </button>
        }
      />

      {notice && (
        <p role="status" className="rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink">
          {notice}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-paper-deep p-5">
        <p className="text-lg">
          Agenda di oggi: <strong>{active ? active.title : 'nessuna'}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="#/app/agenda" className="ponti-btn-secondary">
            Apri «La mia giornata»
          </a>
          {active && (
            <button type="button" onClick={() => setActiveSchedule(null)} className="ponti-btn-quiet">
              Non usare agende oggi
            </button>
          )}
        </div>
      </div>

      <section aria-labelledby="vostre-heading">
        <h2 id="vostre-heading" className="text-2xl">
          Le vostre agende
        </h2>
        {custom.length === 0 ? (
          <p className="mt-2 max-w-reading text-base text-ink-soft">
            Nessuna ancora. Copiate un’agenda pronta e cambiate i passi, oppure createne una da zero.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">{custom.map(card)}</div>
        )}
      </section>

      <section aria-labelledby="pronte-heading">
        <h2 id="pronte-heading" className="text-2xl">
          Agende pronte
        </h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">{NATIVE_SCHEDULES.map(card)}</div>
      </section>
    </div>
  );
}

function ScheduleEditor({
  role,
  initial,
  isNew,
  onCancel,
  onSaved,
}: {
  role: AdultRole;
  initial: VisualSchedule;
  isNew: boolean;
  onCancel: () => void;
  onSaved: (schedule: VisualSchedule) => Promise<void>;
}) {
  const info = ROLE_INFO[role];
  const [schedule, setSchedule] = useState<VisualSchedule>(initial);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const setSteps = (steps: ScheduleStep[]) => setSchedule((current) => ({ ...current, steps }));

  const move = (index: number, delta: -1 | 1) => {
    const next = [...schedule.steps];
    const a = next[index];
    const b = next[index + delta];
    if (!a || !b) return;
    next[index] = b;
    next[index + delta] = a;
    setSteps(next);
  };

  const addStep = () => {
    if (schedule.steps.length >= MAX_STEPS) return;
    const created: ScheduleStep = {
      id: uid('step'),
      label: '',
      visual: { type: 'symbol', key: 'gioco', altText: 'Gioco' },
    };
    setSteps([...schedule.steps, created]);
    setPickerFor(created.id);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!schedule.title.trim()) {
      setError('Dai un nome all’agenda, per esempio «Martedì a scuola».');
      return;
    }
    if (schedule.steps.length < 2) {
      setError('Servono almeno due passi: un’agenda mostra cosa viene prima e cosa viene dopo.');
      return;
    }
    if (schedule.steps.some((item) => !item.label.trim())) {
      setError('Ogni passo ha bisogno di due o tre parole, per esempio «Merenda».');
      return;
    }
    setBusy(true);
    const saved: VisualSchedule = {
      ...schedule,
      title: schedule.title.trim(),
      steps: schedule.steps.map((item) => ({ ...item, label: item.label.trim() })),
      updatedAt: new Date().toISOString(),
    };
    const ok = await saveRecord('schedule', saved);
    setBusy(false);
    if (!ok) {
      setError('Non riesco a salvare l’agenda. Controlla che la cassaforte sia aperta.');
      return;
    }
    await onSaved(saved);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <PageHeader
        backHref={`#${info.path}/agende`}
        backLabel="Agende"
        eyebrow="Agende visive"
        title={isNew ? 'Nuova agenda' : 'Modifica l’agenda'}
        intro={`Da due a ${MAX_STEPS} passi. Poche parole per passo, un’immagine chiara.`}
      />

      {error && (
        <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="schedule-title" className="block text-lg font-bold">
            Nome dell’agenda
          </label>
          <input
            id="schedule-title"
            type="text"
            value={schedule.title}
            onChange={(event) => setSchedule({ ...schedule, title: event.target.value })}
            placeholder="Martedì a scuola"
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
        <fieldset>
          <legend className="text-lg font-bold">Dove</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['casa', 'scuola'] as const).map((context) => (
              <button
                key={context}
                type="button"
                aria-pressed={schedule.context === context}
                onClick={() => setSchedule({ ...schedule, context })}
                className={`min-h-16 rounded-tile border-2 px-3 text-base font-bold capitalize ${
                  schedule.context === context ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
                }`}
              >
                {context}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <section aria-labelledby="passi-heading" className="space-y-3">
        <h2 id="passi-heading" className="text-2xl">
          Passi
        </h2>
        {schedule.steps.length === 0 && <p className="text-base text-ink-soft">Ancora nessun passo.</p>}
        <ol className="space-y-3">
          {schedule.steps.map((item, index) => (
            <li key={item.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-paper">
                  {index + 1}
                </span>
                <StoryArt visual={item.visual} decorative className="h-16 w-20" />
                <label htmlFor={`step-${item.id}`} className="sr-only">
                  Parole del passo {index + 1}
                </label>
                <input
                  id={`step-${item.id}`}
                  type="text"
                  value={item.label}
                  placeholder="Merenda"
                  onChange={(event) =>
                    setSteps(schedule.steps.map((other) => (other.id === item.id ? { ...other, label: event.target.value } : other)))
                  }
                  className="min-h-16 min-w-0 flex-1 rounded-tile border-2 border-line bg-surface px-3 text-lg"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-expanded={pickerFor === item.id}
                  onClick={() => setPickerFor(pickerFor === item.id ? null : item.id)}
                  className="ponti-btn-quiet min-h-16"
                >
                  {pickerFor === item.id ? 'Chiudi le immagini' : 'Cambia immagine'}
                </button>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="ponti-btn-quiet min-h-16 disabled:opacity-40">
                  Sposta su
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === schedule.steps.length - 1}
                  className="ponti-btn-quiet min-h-16 disabled:opacity-40"
                >
                  Sposta giù
                </button>
                <button type="button" onClick={() => setSteps(schedule.steps.filter((other) => other.id !== item.id))} className="ponti-btn-quiet min-h-16">
                  Togli
                </button>
              </div>
              {pickerFor === item.id && (
                <div className="mt-3 rounded-tile border border-line bg-paper-deep p-3">
                  <SymbolPicker
                    sceneId={item.id}
                    selected={item.visual}
                    cacheVersion={0}
                    onSelect={(visual) => {
                      setSteps(
                        schedule.steps.map((other) =>
                          other.id === item.id
                            ? { ...other, visual, label: other.label || (visual.type === 'photo' ? '' : visual.altText) }
                            : other,
                        ),
                      );
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
        {schedule.steps.length < MAX_STEPS ? (
          <button type="button" onClick={addStep} className="ponti-btn-secondary">
            Aggiungi un passo
          </button>
        ) : (
          <p className="text-base text-ink-soft">{MAX_STEPS} passi sono il massimo: un’agenda lunga si divide in due.</p>
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-line pt-5">
        <button type="submit" disabled={busy} className="ponti-btn-primary">
          {busy ? 'Salvo…' : 'Salva l’agenda'}
        </button>
        <button type="button" onClick={onCancel} className="ponti-btn-quiet">
          Annulla
        </button>
      </div>
    </form>
  );
}
