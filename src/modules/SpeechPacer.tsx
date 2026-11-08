import { useEffect, useMemo, useRef, useState } from 'react';
import type { ScaffoldLevel } from '../types/domain';
import { PACER_STIMULI } from '../data/content';
import { ExerciseHeader, Feedback, FinishSession, TaskPrompt } from '../components/ui';
import { RecorderPanel } from '../components/RecorderPanel';
import { useGuidedVoice, useSessionTracker } from '../lib/hooks';
import { playBeat } from '../lib/audio';
import { useAppStore } from '../lib/store';

const WAVE_WIDTH = 840;
const WAVE_HEIGHT = 300;

function wavePoint(t: number): { x: number; y: number } {
  return { x: 70 + t * 700, y: 158 - 52 * Math.sin(t * Math.PI * 2) };
}

export function SpeechPacer() {
  const [scaffold, setScaffold] = useState<ScaffoldLevel>(1);
  const [stimulusIndex, setStimulusIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);
  const [lastSsi, setLastSsi] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const calm = useAppStore((state) => state.preferences.motion) === 'calm';
  const { locked, read } = useGuidedVoice();
  const tracker = useSessionTracker('ritmo', scaffold);
  const lastBeat = useRef(-1);

  const stimulus = PACER_STIMULI[stimulusIndex] ?? PACER_STIMULI[0]!;

  const nodes = useMemo(() => {
    const count = stimulus.syllables.length;
    return stimulus.syllables.map((syllable, index) => {
      const t = count === 1 ? 0.5 : 0.28 + (index * 0.44) / (count - 1);
      return { ...wavePoint(t), t, ...syllable };
    });
  }, [stimulus]);

  const path = useMemo(() => {
    let d = '';
    for (let index = 0; index <= 120; index += 1) {
      const point = wavePoint(index / 120);
      d += `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)} `;
    }
    return d.trim();
  }, []);

  useEffect(() => {
    if (!playing || calm) return;
    let frame = 0;
    const started = performance.now();
    const duration = 3400 + stimulus.syllables.length * 500;

    const tick = (now: number) => {
      const t = ((now - started) % duration) / duration;
      setProgress(t);
      nodes.forEach((node, index) => {
        const next = nodes[index + 1]?.t ?? 1;
        if (t >= node.t && t < next && lastBeat.current !== index) {
          lastBeat.current = index;
          playBeat(node.stressed);
        }
      });
      if (t < (nodes[0]?.t ?? 0.28)) lastBeat.current = -1;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lastBeat.current = -1;
    };
  }, [calm, nodes, playing, stimulus]);

  const startPlaying = () => {
    lastBeat.current = -1;
    setProgress(0);
    setPlaying(true);
    const first = nodes[0];
    if (first) playBeat(first.stressed);
  };

  const stepForward = () => {
    const next = (stepIndex + 1) % nodes.length;
    setStepIndex(next);
    const node = nodes[next];
    if (node) {
      setProgress(node.t);
      playBeat(node.stressed);
    }
  };

  const cursor = wavePoint(progress);
  const activeNode = nodes.findIndex(
    (node, index) => progress >= node.t && progress < (nodes[index + 1]?.t ?? 1.01),
  );

  return (
    <div className="space-y-6">
      <ExerciseHeader moduleId="ritmo" scaffold={scaffold} onScaffold={setScaffold} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskPrompt
          question={`Ripeti: ${stimulus.label}`}
          hint="La voce resta attaccata all’onda. Nessuna fretta: puoi fermarla quando vuoi."
        />
        <div className="space-y-2">
          {(
            [
              ['sillabe', 'Sillabe'],
              ['parole', 'Parole'],
            ] as const
          ).map(([group, groupLabel]) => (
            <div key={group} className="flex flex-wrap items-center gap-2" role="group" aria-label={`Scegli: ${groupLabel.toLowerCase()}`}>
              <span className="ponti-label w-20">{groupLabel}</span>
              {PACER_STIMULI.map((item, index) =>
                item.group !== group ? null : (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={index === stimulusIndex}
                    onClick={() => {
                      setStimulusIndex(index);
                      setPlaying(false);
                      setProgress(0);
                      setStepIndex(-1);
                      setLastSsi(null);
                    }}
                    className={`min-h-16 rounded-full border-2 px-5 text-lg font-bold ${
                      index === stimulusIndex
                        ? 'border-accent bg-accent-soft text-accent-ink'
                        : 'border-line bg-surface text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <section className="ponti-card p-3 sm:p-5" aria-labelledby="onda-heading">
        <h2 id="onda-heading" className="px-1 text-base font-bold">
          L’onda della voce
        </h2>
        <svg viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`} className="mt-2 w-full" role="img" aria-label={`Onda continua con ${nodes.length} sillabe: ${stimulus.label}`}>
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="24" strokeLinecap="round" opacity="0.08" />
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
          {nodes.map((node, index) => {
            const active = index === activeNode;
            return (
              <g key={`${stimulus.id}-${index}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.stressed ? 38 : 24}
                  fill={node.stressed ? 'var(--accent)' : 'var(--surface)'}
                  stroke="var(--accent)"
                  strokeWidth={node.stressed ? 0 : 4}
                  opacity={active ? 1 : 0.92}
                />
                <text
                  x={node.x}
                  y={node.y + (node.stressed ? 7 : 5)}
                  textAnchor="middle"
                  fontSize={node.stressed ? 21 : 15}
                  fontWeight="700"
                  fontFamily="Atkinson Hyperlegible, sans-serif"
                  fill={node.stressed ? 'var(--paper)' : 'var(--accent-ink)'}
                >
                  {node.text}
                </text>
              </g>
            );
          })}
          <circle cx={cursor.x} cy={cursor.y} r="13" fill="var(--paper)" stroke="var(--focus)" strokeWidth="4" />
        </svg>

        <div className="flex flex-wrap items-center gap-3 px-1">
          {calm ? (
            <>
              <button type="button" onClick={stepForward} className="ponti-btn-primary">
                Sillaba successiva
              </button>
              <button
                type="button"
                onClick={() => {
                  setStepIndex(-1);
                  setProgress(0);
                }}
                className="ponti-btn-quiet"
              >
                Ricomincia
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={playing ? () => setPlaying(false) : startPlaying}
              className="ponti-btn-primary"
              disabled={locked}
            >
              {playing ? 'Ferma il ritmo' : 'Avvia il ritmo'}
            </button>
          )}
          <button
            type="button"
            onClick={() => void read(stimulus.model ?? stimulus.syllables.map((syllable) => syllable.text.toLowerCase()).join(''))}
            className="ponti-btn-secondary"
            disabled={locked}
          >
            Ascolta il modello
          </button>
          <p className="text-base text-ink-soft">{stimulus.hint}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-line px-1 pt-4 text-sm text-ink-soft">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-8 w-8 rounded-full bg-accent" />
            Sfera grande: sillaba forte
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-5 w-5 rounded-full border-4 border-accent bg-surface" />
            Sfera piccola: sillaba leggera
          </span>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Feedback tone="guide">
          Qui non si valuta l’articolazione: nessun riconoscimento vocale automatico. La registrazione serve al
          logopedista, che la ascolta e decide. Per l’adulto: usate solo sillabe e parole indicate in terapia e non
          correggete il suono, tenete solo il ritmo.
        </Feedback>
        <p className="rounded-tile border border-line bg-paper-deep px-4 py-3 text-base text-ink-soft">
          Prova a tenere la voce attaccata da una sfera all’altra, senza fermarti nel mezzo. Se ti fermi, va bene:
          ricomincia semplicemente l’onda.
        </p>
      </div>

      <RecorderPanel
        moduleId="ritmo"
        sessionId={tracker.sessionId}
        label="Registra la tua produzione"
        onSaved={(result) => {
          setLastSsi(result.ssi);
          tracker.recordRound(true);
        }}
      />

      {lastSsi !== null && (
        <p className="text-base text-ink-soft">
          Pausa più lunga stimata: {Math.round(lastSsi * 100)}% della durata. È un indicatore di andamento, non un
          punteggio.
        </p>
      )}

      <FinishSession
        items={tracker.items}
        correct={tracker.correct}
        finished={finished}
        onFinish={() => {
          void tracker.finish({
            items: tracker.items,
            correct: tracker.correct,
            ...(lastSsi !== null ? { syllableSegregationIndex: lastSsi } : {}),
          });
          setFinished(true);
        }}
      />
    </div>
  );
}
