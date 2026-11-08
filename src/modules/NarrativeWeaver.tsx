import { useEffect, useMemo, useState } from 'react';
import type { ConnectiveId, ScaffoldLevel } from '../types/domain';
import { CONNECTIVE_CONFIRMS, CONNECTIVE_LABELS, CONNECTIVE_REASONS, STORIES } from '../data/content';
import { FrameArt } from '../components/FrameArt';
import { ExerciseHeader, Feedback, FinishSession, LockNotice, StepDots, TaskPrompt } from '../components/ui';
import { useGuidedVoice, useSessionTracker } from '../lib/hooks';
import { playSoftConfirm } from '../lib/audio';

const CONNECTIVES: ConnectiveId[] = ['prima', 'dopo', 'perche', 'quindi'];

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function stripPeriod(text: string): string {
  return text.replace(/\.$/, '');
}

export function NarrativeWeaver() {
  const [scaffold, setScaffold] = useState<ScaffoldLevel>(1);
  const [storyIndex, setStoryIndex] = useState(0);
  const [links, setLinks] = useState<(ConnectiveId | null)[]>([null, null]);
  const [blocked, setBlocked] = useState<Record<number, ConnectiveId[]>>({});
  const [feedback, setFeedback] = useState<{ tone: 'confirm' | 'guide'; text: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const { locked, read } = useGuidedVoice();
  const tracker = useSessionTracker('racconto', scaffold);

  const story = STORIES[storyIndex] ?? STORIES[0]!;
  const complete = links[0] !== null && links[1] !== null;

  useEffect(() => {
    tracker.resetPromptClock();
    setLinks([null, null]);
    setBlocked({});
    setFeedback(null);
  }, [storyIndex, tracker.resetPromptClock]);

  const firstLink = links[0] ?? null;
  const secondLink = links[1] ?? null;

  const narration = useMemo(() => {
    const [first, second, third] = story.frames;
    if (firstLink === null || secondLink === null) return null;
    const firstWord = CONNECTIVE_LABELS[firstLink];
    const secondWord = CONNECTIVE_LABELS[secondLink];
    return `${stripPeriod(first.caption)}, ${firstWord.toLowerCase()} ${lowerFirst(
      stripPeriod(second.caption),
    )}. ${secondWord.charAt(0)}${secondWord.slice(1).toLowerCase()} ${lowerFirst(stripPeriod(third.caption))}.`;
  }, [firstLink, secondLink, story]);

  const placeConnective = (id: ConnectiveId) => {
    if (locked) return;
    const slot = links.findIndex((link) => link === null);
    if (slot === -1) return;
    tracker.touch();
    const expected = story.links[slot];

    if (id === expected) {
      const next = [...links];
      next[slot] = id;
      setLinks(next);
      setFeedback({ tone: 'confirm', text: CONNECTIVE_CONFIRMS[id] });
      tracker.recordRound(true);
      playSoftConfirm();
      return;
    }

    tracker.recordRound(false);
    setBlocked((current) => ({ ...current, [slot]: [...(current[slot] ?? []), id] }));
    setFeedback({
      tone: 'guide',
      text: `${CONNECTIVE_LABELS[id]}: ${story.reasons?.[slot === 0 ? 0 : 1]?.[id] ?? CONNECTIVE_REASONS[id]} Guarda il quadro ${slot + 1} e il quadro ${slot + 2}.`,
    });
  };

  const currentSlot = links.findIndex((link) => link === null);

  return (
    <div className="space-y-6">
      <ExerciseHeader moduleId="racconto" scaffold={scaffold} onScaffold={setScaffold} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskPrompt
          question="Collega i quadri con la parola giusta"
          hint="Tocca uno spazio tra i quadri, poi la tessera che spiega il legame."
        />
        <StepDots total={2} current={links.filter((link) => link !== null).length} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Scegli una storia">
        {STORIES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={index === storyIndex}
            onClick={() => setStoryIndex(index)}
            className={`min-h-16 rounded-full border-2 px-5 text-base font-bold ${
              index === storyIndex ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="ponti-card p-4 sm:p-6" aria-labelledby="storia-heading">
          <h2 id="storia-heading" className="text-base font-bold">
            {story.title}
          </h2>
          <ol className="mt-4 space-y-1">
            {story.frames.map((frame, index) => (
              <li key={frame.id}>
                <div className="flex items-center gap-4">
                  <div className="w-28 shrink-0 sm:w-36">
                    <FrameArt art={frame.art} className="w-full" />
                  </div>
                  <p className="text-lg leading-snug">{frame.caption}</p>
                </div>
                {index < 2 && (
                  <div className="flex items-center gap-3 py-2 pl-6">
                    <span aria-hidden="true" className="h-12 w-1 rounded-full bg-line-strong" />
                    <button
                      type="button"
                      onClick={() => {
                        tracker.touch();
                        const next = [...links];
                        next[index] = null;
                        setLinks(next);
                      }}
                      className={`flex min-h-16 min-w-40 items-center justify-center rounded-full border-2 border-dashed px-5 text-lg font-bold ${
                        links[index]
                          ? 'border-accent bg-accent-soft text-accent-ink'
                          : 'border-line-strong bg-paper-deep text-ink-soft'
                      }`}
                      aria-label={
                        links[index]
                          ? `Legame tra quadro ${index + 1} e ${index + 2}: ${CONNECTIVE_LABELS[links[index]]}. Tocca per togliere.`
                          : `Spazio vuoto tra quadro ${index + 1} e ${index + 2}`
                      }
                    >
                      {links[index] ? CONNECTIVE_LABELS[links[index]] : '?'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-4">
          <fieldset className="rounded-card border border-line bg-surface p-4 sm:p-5" disabled={locked || complete}>
            <legend className="ponti-label">Tessere connettivo</legend>
            <LockNotice locked={locked} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CONNECTIVES.map((id) => {
                const disabledHere =
                  (scaffold <= 2 && currentSlot >= 0 && id !== story.links[currentSlot]) ||
                  (currentSlot >= 0 && (blocked[currentSlot] ?? []).includes(id)) ||
                  complete;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => placeConnective(id)}
                    disabled={disabledHere}
                    aria-disabled={disabledHere}
                    className={`min-h-24 rounded-tile border-2 px-3 text-lg font-bold ${
                      disabledHere
                        ? 'border-line bg-paper-deep text-ink-soft opacity-50'
                        : 'border-place-line bg-place-fill text-place-ink hover:border-accent'
                    }`}
                  >
                    {CONNECTIVE_LABELS[id]}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              {scaffold <= 2
                ? 'Le tessere che non legano questi due quadri restano spente.'
                : 'Puoi provare tutte le tessere: se non legano, te lo spiego senza fretta.'}
            </p>
          </fieldset>

          {feedback && <Feedback tone={feedback.tone}>{feedback.text}</Feedback>}

          {complete && narration && (
            <Feedback tone="confirm">
              <span className="block">{narration}</span>
              <button
                type="button"
                onClick={() => void read(narration)}
                className="ponti-btn-secondary mt-3"
                disabled={locked}
              >
                Ascolta la storia intera
              </button>
            </Feedback>
          )}

          <div className="rounded-card border border-line bg-paper-deep p-4 text-base text-ink-soft">
            <p className="font-bold text-ink">La storia, una cosa per volta</p>
            <p className="mt-1">
              Prima succede una cosa. Poi ne succede un’altra. La parola che scegli dice che legame c’è tra le due.
            </p>
          </div>
        </div>
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
