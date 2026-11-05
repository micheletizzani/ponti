import { useEffect, useRef, useState } from 'react';
import type { CharacterId, ScaffoldLevel, SentenceForm, SyntaxRole } from '../types/domain';
import { CHARACTER_NAMES, SYNTAX_ROUNDS } from '../data/content';
import { ScenarioStage } from '../components/CharacterArt';
import { ExerciseHeader, Feedback, FinishSession, LockNotice, StepDots, TaskPrompt } from '../components/ui';
import { RecorderPanel } from '../components/RecorderPanel';
import { useGuidedVoice, useSessionTracker } from '../lib/hooks';
import { playSoftConfirm } from '../lib/audio';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function daForm(name: string): string {
  if (name.startsWith('il ')) return `dal ${name.slice(3)}`;
  if (name.startsWith('la ')) return `dalla ${name.slice(3)}`;
  return `da ${name}`;
}

function agreeParticiple(base: string, subject: CharacterId): string {
  return subject === 'bimba' ? base.replace(/o$/, 'a') : base;
}

const ROLE_STYLES: Record<SyntaxRole, { label: string; detail: string; className: string }> = {
  agent: { label: 'Chi', detail: 'arancione', className: 'border-agent-line bg-agent-fill text-agent-ink' },
  verb: { label: 'Cosa fa', detail: 'verde', className: 'border-verb-line bg-verb-fill text-verb-ink' },
  patient: { label: 'Chi / cosa', detail: 'giallo', className: 'border-patient-line bg-patient-fill text-patient-ink' },
  place: { label: 'Dove / quando', detail: 'blu', className: 'border-place-line bg-place-fill text-place-ink' },
};

export function SyntaxEngine() {
  const [scaffold, setScaffold] = useState<ScaffoldLevel>(1);
  const [roundIndex, setRoundIndex] = useState(0);
  const [first, setFirst] = useState<CharacterId | null>(null);
  const [last, setLast] = useState<CharacterId | null>(null);
  const [form, setForm] = useState<SentenceForm | null>(null);
  const [focusSlot, setFocusSlot] = useState<0 | 1>(0);
  const [showTarget, setShowTarget] = useState(true);
  const [selfTalkReady, setSelfTalkReady] = useState(false);
  const [message, setMessage] = useState<{ tone: 'confirm' | 'guide'; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const scored = useRef<Set<string>>(new Set());
  const { locked, read } = useGuidedVoice();
  const tracker = useSessionTracker('sintassi', scaffold);

  const round = SYNTAX_ROUNDS[roundIndex] ?? SYNTAX_ROUNDS[0]!;
  const characters: CharacterId[] = [round.agent, round.patient];
  const passiveStem = round.verbPassive.replace(/ da$/, '');

  const complete = first !== null && last !== null && form !== null;
  const key = `${round.id}|${first ?? '-'}|${form ?? '-'}|${last ?? '-'}`;

  const scene =
    first !== null && last !== null && form !== null
      ? form === 'active'
        ? { agent: first, patient: last }
        : { agent: last, patient: first }
      : null;

  const matches = scene !== null && scene.agent === round.agent && scene.patient === round.patient;

  useEffect(() => {
    tracker.resetPromptClock();
    scored.current = new Set();
    setFirst(null);
    setLast(null);
    setForm(null);
    setFocusSlot(0);
    setShowTarget(true);
    setSelfTalkReady(false);
    setMessage(null);
  }, [roundIndex, tracker.resetPromptClock]);

  useEffect(() => {
    if (!complete || scene === null || scored.current.has(key)) return;
    scored.current.add(key);
    setShowTarget(false);
    tracker.recordRound(matches);
    if (matches) {
      playSoftConfirm();
      setMessage({ tone: 'confirm', text: 'Sì. La tua frase racconta proprio questa scena.' });
    } else {
      setMessage({
        tone: 'guide',
        text: `La tua frase dice che ${CHARACTER_NAMES[scene.agent]} fa l’azione e ${CHARACTER_NAMES[scene.patient]} la riceve. Nella scena da raccontare, invece, è ${CHARACTER_NAMES[round.agent]} che fa l’azione.`,
      });
    }
    // La chiave identifica la composizione: non rivalutiamo la stessa frase.
  }, [complete, key, matches, round.agent, scene, tracker.recordRound]);

  const placeCharacter = (id: CharacterId) => {
    tracker.touch();
    setMessage(null);
    if (focusSlot === 0) {
      setFirst(id);
      if (last === id) setLast(null);
      setFocusSlot(1);
    } else {
      setLast(id);
      if (first === id) setFirst(null);
      setFocusSlot(0);
    }
  };

  const swapCharacters = () => {
    tracker.touch();
    if (first === null && last === null) return;
    setFirst(last);
    setLast(first);
    setMessage(null);
  };

  const applyForm = (next: SentenceForm) => {
    tracker.touch();
    if (next === form) return;
    if (first !== null && last !== null) {
      setFirst(last);
      setLast(first);
    }
    setForm(next);
    setShowTarget(false);
    setMessage(null);
  };

  const sentence = (): string | null => {
    if (first === null || last === null || form === null) return null;
    if (form === 'active') return `${capitalize(CHARACTER_NAMES[first])} ${round.verbActive} ${CHARACTER_NAMES[last]}.`;
    const verb = agreeParticiple(passiveStem, first);
    return `${capitalize(CHARACTER_NAMES[first])} ${verb} ${daForm(CHARACTER_NAMES[last])}.`;
  };

  const guideText = (): string => {
    const a = capitalize(CHARACTER_NAMES[round.agent]);
    const p = CHARACTER_NAMES[round.patient];
    if (scaffold === 1) {
      return `Guarda la scena. ${a} si muove verso ${p}. Nella prima tessera metti ${CHARACTER_NAMES[round.agent]}: è chi fa l’azione. Nella seconda metti ${round.verbActive}. Nella terza metti ${p}: è chi riceve l’azione.`;
    }
    if (scaffold === 2) {
      return `Chi fa l’azione? Chi la riceve? Guarda dove punta la freccia, poi scegli le tessere.`;
    }
    if (scaffold === 3) {
      return `La freccia parte da ${CHARACTER_NAMES[round.agent]} e arriva a ${p}.`;
    }
    return `Prima dimmi a voce alta chi fa l’azione. Poi componi la frase.`;
  };

  const readSentence = async () => {
    if (locked) return;
    const text = sentence();
    if (!text) {
      await read('La frase non è ancora completa. Scegli chi fa l’azione, cosa fa, e chi la riceve.');
      return;
    }
    const roles =
      scene === null
        ? ''
        : ` ${capitalize(CHARACTER_NAMES[scene.agent])} fa l’azione. ${capitalize(CHARACTER_NAMES[scene.patient])} la riceve.`;
    await read(`${text}${roles}`);
  };

  const nextRound = () => {
    setRoundIndex((index) => (index + 1) % SYNTAX_ROUNDS.length);
  };

  return (
    <div className="space-y-6">
      <ExerciseHeader moduleId="sintassi" scaffold={scaffold} onScaffold={setScaffold} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskPrompt question={round.question} hint="Guarda la scena, poi componi la frase con le tessere." />
        <StepDots total={SYNTAX_ROUNDS.length} current={roundIndex} />
      </div>

      {/* Informazione al punto di bisogno: la chiave dei colori resta sempre visibile. */}
      <ul className="flex flex-wrap gap-2" aria-label="Che cosa significa ogni colore">
        {(['agent', 'verb', 'patient'] as SyntaxRole[]).map((role) => {
          const style = ROLE_STYLES[role];
          return (
            <li key={role} className={`rounded-full border px-4 py-2 text-sm font-bold ${style.className}`}>
              {style.label} <span className="font-normal opacity-80">· {style.detail}</span>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="ponti-card overflow-hidden p-4 sm:p-5" aria-labelledby="scena-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="scena-heading" className="text-base font-bold">
              {complete && !showTarget ? 'La tua frase' : 'La scena da raccontare'}
            </h2>
            {complete && (
              <button type="button" onClick={() => setShowTarget((value) => !value)} className="ponti-btn-quiet min-h-16 px-4 text-base">
                {showTarget ? 'Guarda la tua frase' : 'Rivedi la scena'}
              </button>
            )}
          </div>
          <ScenarioStage
            agent={complete && !showTarget && scene ? scene.agent : round.agent}
            patient={complete && !showTarget && scene ? scene.patient : round.patient}
            action={round.action}
            showRoles={scaffold <= 2 || !complete}
          />
          <p className="mt-1 text-sm text-ink-soft">
            {complete && !showTarget
              ? 'L’animazione segue le tessere che hai scelto. Se cambia scena, cambia anche la frase.'
              : 'Una sola azione per volta: chi si muove e verso chi.'}
          </p>
        </section>

        <div className="space-y-4">
          <div className="rounded-card border border-line bg-surface p-4 sm:p-5">
            <p className="ponti-label">La frase</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  tracker.touch();
                  if (first !== null) setFirst(null);
                  setFocusSlot(0);
                }}
                aria-label={first ? `Prima tessera: ${CHARACTER_NAMES[first]}. Tocca per togliere.` : 'Prima tessera vuota: chi?'}
                className={`slot slot-agent ${focusSlot === 0 ? 'ring-4 ring-offset-2 ring-offset-surface ring-[color:var(--focus)]' : ''}`}
              >
                <span className="text-xs font-normal uppercase tracking-wide opacity-80">Chi?</span>
                <span className="wrap-anywhere">{first ? CHARACTER_NAMES[first] : '…'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  tracker.touch();
                  setForm(null);
                }}
                aria-label={form ? `Seconda tessera: ${form === 'active' ? round.verbActive : `${passiveStem} da`}. Tocca per togliere.` : 'Seconda tessera vuota: cosa fa?'}
                className="slot slot-verb"
              >
                <span className="text-xs font-normal uppercase tracking-wide opacity-80">Cosa fa?</span>
                <span className="wrap-anywhere">
                  {form === 'active' ? round.verbActive : null}
                  {form === 'passive' ? `${first ? agreeParticiple(passiveStem, first) : passiveStem} da` : null}
                  {form === null ? '…' : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  tracker.touch();
                  if (last !== null) setLast(null);
                  setFocusSlot(1);
                }}
                aria-label={last ? `Terza tessera: ${CHARACTER_NAMES[last]}. Tocca per togliere.` : 'Terza tessera vuota: chi riceve?'}
                className={`slot slot-patient ${focusSlot === 1 ? 'ring-4 ring-offset-2 ring-offset-surface ring-[color:var(--focus)]' : ''}`}
              >
                <span className="text-xs font-normal uppercase tracking-wide opacity-80">Chi riceve?</span>
                <span className="wrap-anywhere">{last ? CHARACTER_NAMES[last] : '…'}</span>
              </button>
            </div>

            {sentence() && (
              <p className="mt-4 rounded-xl bg-paper-deep px-3 py-2 text-lg leading-snug" aria-live="polite">
                «{sentence()}»
              </p>
            )}

            <p className="mt-3 text-sm text-ink-soft">
              {form === 'passive'
                ? 'In forma passiva la frase comincia da chi riceve l’azione: il soggetto grammaticale non è chi agisce.'
                : 'Tocca una tessera: entra nello spazio illuminato. Tocca lo spazio per toglierla.'}
            </p>
          </div>

          <fieldset
            className="rounded-card border border-line bg-surface p-4 sm:p-5"
            disabled={locked || (scaffold === 4 && !selfTalkReady)}
          >
            <legend className="ponti-label">Tessere</legend>
            <LockNotice locked={locked} />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {characters.map((id) => {
                const selected = first === id || last === id;
                return (
                  <button
                    key={`character-${id}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => placeCharacter(id)}
                    className={`flex min-h-16 items-center gap-2 rounded-tile border-2 px-3 text-base font-bold tile-agent ${
                      selected ? 'opacity-50' : ''
                    }`}
                  >
                    {capitalize(CHARACTER_NAMES[id])}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={form === 'active'}
                onClick={() => applyForm('active')}
                className="flex min-h-16 items-center rounded-tile border-2 border-verb-line bg-verb-fill px-3 text-base font-bold text-verb-ink"
              >
                {round.verbActive}
              </button>
              <button
                type="button"
                aria-pressed={form === 'passive'}
                onClick={() => applyForm('passive')}
                className="flex min-h-16 items-center rounded-tile border-2 border-verb-line bg-verb-fill px-3 text-base font-bold text-verb-ink"
              >
                {round.verbPassive}
              </button>
            </div>
          </fieldset>
        </div>
      </div>

      {message && <Feedback tone={message.tone}>{message.text}</Feedback>}
      {!message && complete && (
        <Feedback tone="confirm">Frase completa. Ascoltala o guarda la scena che hai costruito.</Feedback>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void read(guideText())}
          className="ponti-btn-primary"
          disabled={locked}
        >
          <span aria-hidden="true">🔊</span> Ascolta la guida
        </button>
        <button type="button" onClick={() => void readSentence()} className="ponti-btn-secondary" disabled={locked}>
          Racconta la frase
        </button>
        <button type="button" onClick={swapCharacters} className="ponti-btn-quiet">
          Scambia i personaggi
        </button>
        <button type="button" onClick={nextRound} className="ponti-btn-quiet">
          {matches ? 'Prossima scena' : 'Nuova scena'}
        </button>
      </div>

      {scaffold === 4 && (
        <RecorderPanel
          moduleId="sintassi"
          sessionId={tracker.sessionId}
          label="La regola detta da te"
          onSaved={() => setSelfTalkReady(true)}
        />
      )}
      {scaffold === 4 && !selfTalkReady && (
        <p className="text-base text-ink-soft">Prima registra la regola a voce alta, poi completa la frase.</p>
      )}

      <FinishSession
        items={tracker.items}
        correct={tracker.correct}
        finished={finished}
        onFinish={() => {
          void tracker.finish({
            items: tracker.items,
            correct: tracker.correct,
            reversibleAccuracy: tracker.items > 0 ? tracker.correct / tracker.items : 0,
          });
          setFinished(true);
        }}
      />
    </div>
  );
}
