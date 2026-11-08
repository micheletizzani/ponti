import { useEffect, useState } from 'react';
import type { MatrixRound, ScaffoldLevel } from '../types/domain';
import { MATRIX_ROUNDS } from '../data/content';
import { ShapeArt } from '../components/ShapeArt';
import { ExerciseHeader, Feedback, FinishSession, LockNotice, StepDots, TaskPrompt } from '../components/ui';
import { RecorderPanel } from '../components/RecorderPanel';
import { useGuidedVoice, useSessionTracker } from '../lib/hooks';
import { playSoftConfirm } from '../lib/audio';

/**
 * Posizione della risposta giusta per ogni round. Nei dati è spesso la prima:
 * qui la spostiamo, così la posizione non diventa un indizio.
 */
const CORRECT_POSITION = [0, 2, 1, 2, 0, 1];

function arrange(round: MatrixRound, index: number): MatrixRound['options'] {
  const correct = round.options.find((option) => option.correct);
  const others = round.options.filter((option) => !option.correct);
  if (!correct) return round.options;
  const position = Math.min(CORRECT_POSITION[index % CORRECT_POSITION.length] ?? 0, others.length);
  return [...others.slice(0, position), correct, ...others.slice(position)];
}

export function MatrixTalk() {
  const [scaffold, setScaffold] = useState<ScaffoldLevel>(1);
  const [roundIndex, setRoundIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ tone: 'confirm' | 'guide'; text: string } | null>(null);
  const [selfTalkReady, setSelfTalkReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const { locked, read } = useGuidedVoice();
  const tracker = useSessionTracker('matrici', scaffold);

  const round: MatrixRound = MATRIX_ROUNDS[roundIndex] ?? MATRIX_ROUNDS[0]!;

  useEffect(() => {
    tracker.resetPromptClock();
    setSolved(false);
    setChosenId(null);
    setWrongIds([]);
    setFeedback(null);
    setSelfTalkReady(false);
  }, [roundIndex, tracker.resetPromptClock]);

  const chosen = round.options.find((option) => option.id === chosenId) ?? null;
  const options = arrange(round, roundIndex);

  const guideText = (): string => {
    if (scaffold === 1) return round.rule;
    if (scaffold === 2) return round.questionL2;
    if (scaffold === 3) return round.cue;
    return 'Prima dimmi a voce alta la regola che hai trovato. Poi tocca il pezzo giusto.';
  };

  const choose = (optionId: string) => {
    const option = round.options.find((item) => item.id === optionId);
    if (!option || solved) return;
    tracker.touch();

    if (option.correct) {
      setSolved(true);
      setChosenId(option.id);
      setFeedback({ tone: 'confirm', text: option.reason });
      tracker.recordRound(true);
      playSoftConfirm();
      return;
    }

    setWrongIds((ids) => [...ids, option.id]);
    setFeedback({ tone: 'guide', text: option.reason });
    tracker.recordRound(false);
  };

  const optionsLocked = locked || (scaffold === 4 && !selfTalkReady);

  return (
    <div className="space-y-6">
      <ExerciseHeader moduleId="matrici" scaffold={scaffold} onScaffold={setScaffold} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskPrompt
          question="Quale pezzo completa la matrice?"
          hint="Guarda la riga in alto e la colonna di sinistra. Poi scegli."
        />
        <StepDots total={MATRIX_ROUNDS.length} current={roundIndex} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="ponti-card p-5 sm:p-6" aria-labelledby="matrix-heading">
          <h2 id="matrix-heading" className="sr-only">
            Matrice da completare
          </h2>
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
            {round.cells.map((cell, index) =>
              cell === null ? (
                <div
                  key={`empty-${index}`}
                  className={`flex aspect-square items-center justify-center rounded-tile border-2 border-dashed ${
                    solved ? 'border-accent bg-accent-soft' : 'border-line-strong bg-paper-deep'
                  }`}
                >
                  {solved && chosen ? (
                    <ShapeArt shape={chosen.shape} color={chosen.color} size={104} showLabel={false} />
                  ) : (
                    <span className="text-4xl font-bold text-ink-soft" aria-label="Spazio mancante">
                      ?
                    </span>
                  )}
                </div>
              ) : (
                <div
                  key={`cell-${index}`}
                  className="flex aspect-square items-center justify-center rounded-tile border-2 border-line bg-surface"
                >
                  <ShapeArt shape={cell.shape} color={cell.color} size={104} showLabel={false} />
                </div>
              ),
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => void read(guideText())} className="ponti-btn-primary" disabled={locked}>
              <span aria-hidden="true">🔊</span> Ascolta la guida
            </button>
            {solved && (
              <button
                type="button"
                onClick={() => setRoundIndex((index) => (index + 1) % MATRIX_ROUNDS.length)}
                className="ponti-btn-secondary"
              >
                Prossima matrice
              </button>
            )}
          </div>
          <LockNotice locked={locked} />
        </section>

        <section aria-labelledby="options-heading" className="space-y-4">
          <h2 id="options-heading" className="ponti-label">
            Scegli un pezzo
          </h2>
          {scaffold === 4 && !selfTalkReady ? (
            <RecorderPanel
              moduleId="matrici"
              sessionId={tracker.sessionId}
              label="Prima la regola, a voce alta"
              onSaved={() => setSelfTalkReady(true)}
            />
          ) : (
            <fieldset disabled={optionsLocked || solved} className="grid gap-3 sm:grid-cols-1">
              <legend className="sr-only">Pezzi possibili</legend>
              {options.map((option) => {
                const disabledByScaffold = scaffold <= 2 && !option.correct;
                const disabled = disabledByScaffold || wrongIds.includes(option.id) || optionsLocked || solved;
                const isChosen = chosenId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    aria-disabled={disabled}
                    disabled={disabled}
                    aria-pressed={isChosen}
                    className={`flex min-h-24 items-center gap-4 rounded-tile border-2 px-4 py-3 text-left text-lg font-bold ${
                      isChosen
                        ? 'border-accent bg-accent-soft text-accent-ink'
                        : 'border-line bg-surface hover:border-line-strong'
                    } ${disabled && !isChosen ? 'opacity-40' : ''}`}
                  >
                    <ShapeArt shape={option.shape} color={option.color} size={64} showLabel={false} />
                    <span>
                      {option.shape} {option.color}
                      {disabledByScaffold && <span className="block text-sm font-normal text-ink-soft">Non serve qui.</span>}
                    </span>
                  </button>
                );
              })}
            </fieldset>
          )}

          {feedback ? (
            <Feedback tone={feedback.tone}>{feedback.text}</Feedback>
          ) : (
            <p className="text-base text-ink-soft">
              {scaffold <= 2
                ? 'Le scelte che non completano la regola restano spente: non è un errore, è un aiuto.'
                : 'Puoi provare tutte le scelte. Se una non completa la regola, te lo spiego io.'}
            </p>
          )}

          <div className="rounded-card border border-line bg-paper-deep p-4 text-base text-ink-soft">
            <p className="font-bold text-ink">La regola, se ti serve</p>
            <p className="mt-1">{round.rule}</p>
          </div>
        </section>
      </div>

      <FinishSession
        items={tracker.items}
        correct={tracker.correct}
        finished={finished}
        onFinish={() => {
          void tracker.finish({ items: tracker.items, correct: tracker.correct });
          setFinished(true);
        }}
      />
    </div>
  );
}
