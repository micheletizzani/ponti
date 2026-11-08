import { useMemo, useState, type FormEvent } from 'react';
import type { AdultRole, GoalObservation, PeiDimension, ScaffoldLevel, SharedGoal } from '../types/domain';
import { GOAL_LIBRARY, PEI_DIMENSIONS, dimensionLabel, dimensionShort, type GoalPreset } from '../data/adults';
import { OBSERVATION_LABELS, observationLabel } from '../data/content';
import { PageHeader } from '../components/PageHeader';
import { useRecords } from '../lib/records';
import { useAppStore } from '../lib/store';
import { deleteRecord, saveRecord } from '../lib/vault';
import { uid } from '../lib/metrics';
import { genderize, relativeDay, todayIso } from '../lib/words';
import { ROLE_INFO } from './AdultSpace';

const LEVELS: ScaffoldLevel[] = [1, 2, 3, 4];
const MAX_ACTIVE_SUGGESTED = 4;
const CHART_POINTS = 10;

/*
 * Grafico delle osservazioni: due serie (casa, scuola) validate con lo script
 * della skill dataviz su #fffdf7 e #ffffff (tutti i controlli superati).
 * L'identità non è affidata solo al colore: casa = cerchio, scuola = quadrato,
 * legenda sempre visibile ed elenco testuale sotto.
 */
const SERIES = {
  famiglia: { label: 'Casa', color: '#2a78d6', shape: 'rounded-full' },
  scuola: { label: 'Scuola', color: '#eb6834', shape: 'rounded-[3px]' },
} as const;

function newGoalFromPreset(preset: GoalPreset, role: AdultRole): SharedGoal {
  const now = new Date().toISOString();
  return {
    id: uid('goal'),
    presetId: preset.id,
    title: preset.title,
    dimension: preset.dimension,
    activityPath: preset.activityPath,
    strategy: preset.strategy,
    createdBy: role,
    status: 'attivo',
    observations: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function Goals({ role }: { role: AdultRole }) {
  const info = ROLE_INFO[role];
  const { items, loading, refresh } = useRecords('goal');
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const active = items.filter((goal) => goal.status === 'attivo');
  const others = items.filter((goal) => goal.status !== 'attivo');
  const usedPresets = new Set(items.map((goal) => goal.presetId).filter(Boolean));

  const persist = async (goal: SharedGoal, message: string) => {
    const ok = await saveRecord('goal', { ...goal, updatedAt: new Date().toISOString() });
    setNotice(ok ? message : 'Non riesco a salvare. Controlla che la cassaforte sia aperta.');
    await refresh();
  };

  const grouped = useMemo(
    () =>
      PEI_DIMENSIONS.map((dimension) => ({
        dimension,
        goals: active.filter((goal) => goal.dimension === dimension.value),
      })).filter((group) => group.goals.length > 0),
    [active],
  );

  if (adding) {
    return (
      <AddGoal
        role={role}
        usedPresets={usedPresets}
        onCancel={() => setAdding(false)}
        onAdd={async (goal) => {
          setAdding(false);
          await persist(goal, 'Obiettivo aggiunto.');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`#${info.path}`}
        backLabel={info.title}
        eyebrow="Obiettivi condivisi"
        title="Pochi obiettivi, la stessa strada"
        intro="Ogni obiettivo ha una strategia uguale a casa e a scuola. Le osservazioni usano la stessa scala di aiuto delle attività."
        action={
          <button type="button" onClick={() => setAdding(true)} className="ponti-btn-primary">
            Aggiungi un obiettivo
          </button>
        }
      />

      <section aria-labelledby="scala-heading" className="rounded-card border border-line bg-paper-deep p-5">
        <h2 id="scala-heading" className="text-lg font-bold">
          La scala di aiuto
        </h2>
        <ol className="mt-2 grid gap-2 text-base sm:grid-cols-4">
          {OBSERVATION_LABELS.map((label, index) => (
            <li key={label} className="flex items-center gap-2">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-accent font-bold text-accent-ink">
                {index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-ink-soft">
          Non è un voto. Scendere di livello in una giornata faticosa è normale. Il PEI resta il documento del GLO:
          qui gli obiettivi sono ordinati con le sue quattro dimensioni solo per parlarne con la stessa lingua.
        </p>
      </section>

      {notice && (
        <p role="status" className="rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink">
          {notice}
        </p>
      )}

      {active.length > MAX_ACTIVE_SUGGESTED && (
        <p className="rounded-tile border-2 border-patient-line bg-patient-fill px-4 py-3 text-base text-patient-ink">
          Ci sono {active.length} obiettivi attivi. Con più di {MAX_ACTIVE_SUGGESTED} diventa difficile essere coerenti a
          casa e a scuola: valutate di metterne qualcuno in pausa.
        </p>
      )}

      {loading ? (
        <p role="status" className="text-lg text-ink-soft">
          Sto leggendo gli obiettivi…
        </p>
      ) : active.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-6">
          <h2 className="text-2xl">Nessun obiettivo attivo</h2>
          <p className="mt-2 max-w-reading text-base text-ink-soft">
            Scegliete insieme, famiglia e scuola, due o tre obiettivi dalla libreria. Sono proposte da discutere con
            logopedista e insegnanti, non obiettivi clinici già decisi.
          </p>
          <button type="button" onClick={() => setAdding(true)} className="ponti-btn-secondary mt-4">
            Apri la libreria
          </button>
        </div>
      ) : (
        grouped.map((group) => (
          <section key={group.dimension.value} aria-labelledby={`dim-${group.dimension.value}`}>
            <h2 id={`dim-${group.dimension.value}`} className="text-2xl">
              {group.dimension.short}
            </h2>
            <p className="text-sm text-ink-soft">Dimensione PEI: {group.dimension.label}</p>
            <ul className="mt-3 space-y-4">
              {group.goals.map((goal) => (
                <li key={goal.id}>
                  <GoalCard goal={goal} role={role} onChange={persist} onDelete={async () => {
                    await deleteRecord(goal.id);
                    setNotice('Obiettivo eliminato.');
                    await refresh();
                  }} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {others.length > 0 && (
        <details className="rounded-card border border-line bg-surface p-5">
          <summary className="min-h-16 cursor-pointer list-none text-lg font-bold [&::-webkit-details-marker]:hidden">
            Raggiunti o in pausa ({others.length})
          </summary>
          <ul className="mt-3 space-y-4">
            {others.map((goal) => (
              <li key={goal.id}>
                <GoalCard goal={goal} role={role} onChange={persist} onDelete={async () => {
                  await deleteRecord(goal.id);
                  setNotice('Obiettivo eliminato.');
                  await refresh();
                }} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function ObservationChart({ observations }: { observations: GoalObservation[] }) {
  const points = observations.slice(-CHART_POINTS);
  return (
    <figure className="mt-4">
      <figcaption className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
        <span className="font-bold text-ink">Ultime {points.length} osservazioni</span>
        {(['famiglia', 'scuola'] as const).map((key) => (
            <span key={key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block h-3.5 w-3.5 ${SERIES[key].shape}`}
                style={{ background: SERIES[key].color }}
              />
              {SERIES[key].label}
            </span>
          ))}
      </figcaption>
      <div className="mt-2 grid grid-cols-[6.5rem_1fr] gap-x-2" aria-hidden="true">
        {[...LEVELS].reverse().map((level) => (
          <div key={level} className="contents">
            <div className="flex h-8 items-center justify-end text-right text-xs text-ink-soft">
              {observationLabel(level)}
            </div>
            <div className="relative flex h-8 items-center border-b border-line">
              <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${CHART_POINTS}, minmax(0, 1fr))` }}>
                {Array.from({ length: CHART_POINTS }, (_, index) => {
                  const point = points[index];
                  const show = point && point.level === level;
                  return (
                    <div key={index} className="flex h-8 items-center justify-center">
                      {show && (
                        <span
                          title={`${relativeDay(point.date)} · ${SERIES[point.author].label} · ${observationLabel(level)}`}
                          className={`inline-block h-3.5 w-3.5 ${SERIES[point.author].shape}`}
                          style={{ background: SERIES[point.author].color, boxShadow: '0 0 0 2px var(--surface)' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        <div />
        <p className="pt-1 text-xs text-ink-soft">dalla più vecchia alla più recente →</p>
      </div>
    </figure>
  );
}

function GoalCard({
  goal,
  role,
  onChange,
  onDelete,
}: {
  goal: SharedGoal;
  role: AdultRole;
  onChange: (goal: SharedGoal, message: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const gender = useAppStore((state) => state.profile.gender);
  const [observing, setObserving] = useState(false);
  const [level, setLevel] = useState<ScaffoldLevel | null>(null);
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recent = [...goal.observations].slice(-3).reverse();
  const preset = GOAL_LIBRARY.find((item) => item.id === goal.presetId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (level === null) {
      setError('Scegli quanto aiuto è servito.');
      return;
    }
    const observation: GoalObservation = { id: uid('obs'), date: todayIso(), author: role, level, note: note.trim() };
    await onChange({ ...goal, observations: [...goal.observations, observation] }, 'Osservazione salvata.');
    setObserving(false);
    setLevel(null);
    setNote('');
    setError(null);
  };

  return (
    <article className="rounded-card border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="max-w-reading text-xl leading-snug">{genderize(goal.title, gender)}</h3>
        <p className="ponti-chip">{goal.status === 'attivo' ? dimensionShort(goal.dimension) : goal.status === 'raggiunto' ? 'Raggiunto' : 'In pausa'}</p>
      </div>
      <div className="mt-3 rounded-tile border-l-4 border-accent bg-paper-deep px-4 py-3">
        <p className="ponti-label">Come aiutare, a casa e a scuola</p>
        <p className="mt-1 text-base">{goal.strategy}</p>
      </div>

      {goal.observations.length > 0 ? (
        <>
          <ObservationChart observations={goal.observations} />
          <ul className="mt-3 space-y-1 text-base" aria-label="Osservazioni più recenti">
            {recent.map((item) => (
              <li key={item.id}>
                <span className="capitalize">{relativeDay(item.date)}</span>, {SERIES[item.author].label.toLowerCase()}:{' '}
                <strong>{observationLabel(item.level).toLowerCase()}</strong>
                {item.note ? ` — ${item.note}` : ''}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-base text-ink-soft">Ancora nessuna osservazione.</p>
      )}

      {observing ? (
        <form onSubmit={submit} noValidate className="mt-4 space-y-3 rounded-tile border-2 border-accent p-4">
          <fieldset>
            <legend className="text-base font-bold">Oggi, {role === 'scuola' ? 'a scuola' : 'a casa'}: quanto aiuto è servito?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {LEVELS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={level === value}
                  onClick={() => setLevel(value)}
                  className={`min-h-16 rounded-tile border-2 px-3 text-base font-bold ${
                    level === value ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
                  }`}
                >
                  {value}. {observationLabel(value)}
                </button>
              ))}
            </div>
          </fieldset>
          {error && (
            <p role="alert" className="text-base text-agent-ink">
              {error}
            </p>
          )}
          <div>
            <label htmlFor={`note-${goal.id}`} className="block text-base font-bold">
              Una nota <span className="font-normal text-ink-soft">(facoltativa)</span>
            </label>
            <input
              id={`note-${goal.id}`}
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="In giardino, con un compagno"
              className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="ponti-btn-primary">
              Salva l’osservazione
            </button>
            <button type="button" onClick={() => setObserving(false)} className="ponti-btn-quiet">
              Annulla
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {goal.status === 'attivo' && (
            <button type="button" onClick={() => setObserving(true)} className="ponti-btn-secondary">
              Aggiungi un’osservazione
            </button>
          )}
          {goal.activityPath && (
            <a href={`#${goal.activityPath}`} className="ponti-btn-quiet">
              Apri: {preset?.activityLabel ?? 'attività collegata'}
            </a>
          )}
          {goal.status === 'attivo' ? (
            <>
              <button type="button" onClick={() => void onChange({ ...goal, status: 'raggiunto' }, 'Obiettivo segnato come raggiunto.')} className="ponti-btn-quiet">
                Raggiunto
              </button>
              <button type="button" onClick={() => void onChange({ ...goal, status: 'in-pausa' }, 'Obiettivo in pausa.')} className="ponti-btn-quiet">
                Metti in pausa
              </button>
            </>
          ) : (
            <button type="button" onClick={() => void onChange({ ...goal, status: 'attivo' }, 'Obiettivo di nuovo attivo.')} className="ponti-btn-quiet">
              Riattiva
            </button>
          )}
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="ponti-btn-quiet">
              Elimina
            </button>
          ) : (
            <span className="flex flex-wrap items-center gap-2 rounded-tile border-2 border-agent-line bg-agent-fill p-2">
              <span className="text-base text-agent-ink">Elimino obiettivo e osservazioni?</span>
              <button type="button" onClick={() => void onDelete()} className="ponti-btn-primary">
                Sì, elimina
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="ponti-btn-quiet">
                No
              </button>
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function AddGoal({
  role,
  usedPresets,
  onCancel,
  onAdd,
}: {
  role: AdultRole;
  usedPresets: Set<string | undefined>;
  onCancel: () => void;
  onAdd: (goal: SharedGoal) => Promise<void>;
}) {
  const info = ROLE_INFO[role];
  const gender = useAppStore((state) => state.profile.gender);
  const [title, setTitle] = useState('');
  const [dimension, setDimension] = useState<PeiDimension>('comunicazione');
  const [strategy, setStrategy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const available = GOAL_LIBRARY.filter((preset) => !usedPresets.has(preset.id));

  const submitCustom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Scrivi l’obiettivo in una frase.');
      return;
    }
    if (!strategy.trim()) {
      setError('Scrivi come aiutare: è la parte che rende l’obiettivo uguale a casa e a scuola.');
      return;
    }
    const now = new Date().toISOString();
    await onAdd({
      id: uid('goal'),
      title: title.trim(),
      dimension,
      activityPath: null,
      strategy: strategy.trim(),
      createdBy: role,
      status: 'attivo',
      observations: [],
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`#${info.path}/obiettivi`}
        backLabel="Obiettivi"
        eyebrow="Obiettivi condivisi"
        title="Aggiungi un obiettivo"
        intro="Scegli dalla libreria oppure scrivine uno vostro. Meglio pochi e concreti."
        action={
          <button type="button" onClick={onCancel} className="ponti-btn-quiet">
            Annulla
          </button>
        }
      />

      <section aria-labelledby="libreria-heading">
        <h2 id="libreria-heading" className="text-2xl">
          Dalla libreria
        </h2>
        {available.length === 0 ? (
          <p className="mt-2 text-base text-ink-soft">Avete già aggiunto tutti gli obiettivi della libreria.</p>
        ) : (
          <ul className="mt-3 grid gap-3 lg:grid-cols-2">
            {available.map((preset) => (
              <li key={preset.id} className="flex h-full flex-col justify-between gap-3 rounded-card border border-line bg-surface p-5">
                <div>
                  <p className="ponti-chip">{dimensionShort(preset.dimension)}</p>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{genderize(preset.title, gender)}</h3>
                  <p className="mt-1 text-base text-ink-soft">{preset.strategy}</p>
                  {preset.activityLabel && <p className="mt-1 text-sm text-ink-soft">Attività collegata: {preset.activityLabel}</p>}
                </div>
                <button type="button" onClick={() => void onAdd(newGoalFromPreset(preset, role))} className="ponti-btn-secondary self-start">
                  Aggiungi questo
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={submitCustom} noValidate className="space-y-4 rounded-card border border-line bg-surface p-5">
        <h2 className="text-2xl">Scrivine uno vostro</h2>
        {error && (
          <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="goal-title" className="block text-base font-bold">
            L’obiettivo, in una frase
          </label>
          <input
            id="goal-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Saluta i compagni all’arrivo con la mano o con la voce"
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
        <div>
          <label htmlFor="goal-dimension" className="block text-base font-bold">
            Dimensione del PEI
          </label>
          <select
            id="goal-dimension"
            value={dimension}
            onChange={(event) => setDimension(event.target.value as PeiDimension)}
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          >
            {PEI_DIMENSIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {dimensionLabel(item.value)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="goal-strategy" className="block text-base font-bold">
            Come aiutare, uguale a casa e a scuola
          </label>
          <textarea
            id="goal-strategy"
            value={strategy}
            rows={3}
            onChange={(event) => setStrategy(event.target.value)}
            placeholder="Aspettiamo cinque secondi prima di salutare noi per primi."
            className="mt-2 w-full rounded-tile border-2 border-line bg-surface px-4 py-3 text-lg"
          />
        </div>
        <button type="submit" className="ponti-btn-primary">
          Aggiungi l’obiettivo
        </button>
      </form>
    </div>
  );
}
