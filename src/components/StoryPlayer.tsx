import { useEffect, useMemo, useRef, useState } from 'react';
import type { SocialStory, SocialStoryCheckOption } from '../types/domain';
import { categoryLabel, sentenceTypeLabel } from '../lib/socialStory';
import { speak, speechSupported, stopSpeaking } from '../lib/speech';
import { StoryArt } from './StoryArt';
import { LockNotice } from './ui';
import { useAppStore } from '../lib/store';

interface Token {
  value: string;
  start: number;
}

function tokenize(text: string): Token[] {
  const parts = text.match(/\S+|\s+/g) ?? [];
  let cursor = 0;
  return parts.map((value) => {
    const start = cursor;
    cursor += value.length;
    return { value, start };
  });
}

function wordIndexAt(tokens: Token[], charIndex: number): number | null {
  let seen = -1;
  let last: number | null = null;
  for (const token of tokens) {
    if (!/\S/.test(token.value)) continue;
    seen += 1;
    if (token.start <= charIndex) last = seen;
    else break;
  }
  return last;
}

/**
 * Player a pagine: nessun avanzamento automatico, una cosa per schermata.
 * La voce registrata dall'adulto ha la precedenza; altrimenti si usa la voce
 * di sistema, con evidenziazione della parola quando il browser la espone.
 */
function CaaCredit() {
  return (
    <p className="text-xs text-ink-soft">
      Pittogrammi: ARASAAC (arasaac.org), Sergio Palao / Gobierno de Aragón, licenza CC BY-NC-SA.
    </p>
  );
}

export function StoryPlayer({ story, onExit }: { story: SocialStory; onExit: () => void }) {
  const voiceRate = useAppStore((state) => state.preferences.voiceRate);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'read' | 'check' | 'done'>('read');
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scene = story.scenes[index];
  const hasCaa = story.scenes.some((item) => item.visual.type === 'aac');
  const tokens = useMemo(() => tokenize(scene?.text ?? ''), [scene]);
  const rendered = useMemo(() => {
    let wordIndex = -1;
    return tokens.map((token) => {
      if (!/\S/.test(token.value)) return { ...token, wordIndex: null as number | null };
      wordIndex += 1;
      return { ...token, wordIndex };
    });
  }, [tokens]);
  const keywordRanges = useMemo(() => {
    if (!scene) return [];
    const lower = scene.text.toLocaleLowerCase('it');
    return scene.highlightKeywords
      .map((keyword) => {
        const needle = keyword.toLocaleLowerCase('it');
        const start = lower.indexOf(needle);
        return start >= 0 ? { start, end: start + needle.length } : null;
      })
      .filter((range): range is { start: number; end: number } => range !== null);
  }, [scene]);

  useEffect(() => {
    stopSpeaking();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
    setActiveWord(null);
    setAudioMessage(null);
  }, [index, phase]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      audioRef.current?.pause();
    };
  }, []);

  if (!scene) {
    return (
      <div className="mx-auto max-w-reading py-12 text-center">
        <h1 className="text-3xl">Questa storia non ha ancora pagine.</h1>
        <button type="button" onClick={onExit} className="ponti-btn-primary mt-6">
          Torna alle storie
        </button>
      </div>
    );
  }

  const stopAudio = () => {
    stopSpeaking();
    audioRef.current?.pause();
    setPlaying(false);
    setActiveWord(null);
  };

  const play = () => {
    if (scene.narration.type === 'recorded') {
      const audio = audioRef.current;
      if (!audio) return;
      setAudioMessage(null);
      audio.currentTime = 0;
      void audio.play().catch(() => {
        setAudioMessage('Non riesco ad aprire la registrazione. Puoi leggere il testo con l’adulto.');
      });
      return;
    }
    if (!speechSupported()) {
      setAudioMessage('La voce di sistema non è disponibile: leggi il testo con l’adulto.');
      return;
    }
    setAudioMessage(null);
    setPlaying(true);
    void speak(scene.text, {
      rate: voiceRate,
      onBoundary: (charIndex) => setActiveWord(wordIndexAt(tokens, charIndex)),
    }).then(() => {
      setPlaying(false);
      setActiveWord(null);
    });
  };

  const next = () => {
    if (index < story.scenes.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    setPhase(story.check ? 'check' : 'done');
  };

  const answer = (option: SocialStoryCheckOption) => {
    setFeedback(option.feedback);
    if (option.correct) setPhase('done');
  };

  const restart = () => {
    setIndex(0);
    setPhase('read');
    setFeedback(null);
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-[46rem] space-y-5">
        <button type="button" onClick={onExit} className="ponti-btn-quiet min-h-16 px-4">
          <span aria-hidden="true">←</span> Storie
        </button>
        <section className="ponti-card overflow-hidden" aria-labelledby="story-cover-title">
          <div className="mx-auto w-full max-w-xl px-4 pt-4">
            <StoryArt visual={scene.visual} className="h-auto w-full" />
          </div>
          <div className="p-6 sm:p-8">
            <p className="ponti-label">{categoryLabel(story.category)}</p>
            <h1 id="story-cover-title" className="mt-2 text-3xl leading-tight sm:text-4xl">
              {story.title}
            </h1>
            {story.protagonist && <p className="mt-2 text-base text-ink-soft">Con {story.protagonist}.</p>}
            <p className="mt-4 max-w-reading text-lg text-ink-soft">
              Una pagina alla volta. Puoi ascoltare, rileggere e fermarti quando vuoi.
            </p>
            {story.goal && (
              <p className="mt-3 max-w-reading rounded-tile border border-line bg-paper-deep px-4 py-3 text-sm text-ink-soft">
                <strong className="text-ink">Per l’adulto:</strong> {story.goal}
              </p>
            )}
            {hasCaa && <CaaCredit />}
            <button type="button" onClick={() => setStarted(true)} className="ponti-btn-primary mt-6 w-full sm:w-auto">
              Inizia a leggere
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (phase === 'check' && story.check) {
    return (
      <div className="mx-auto max-w-reading space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <button type="button" onClick={onExit} className="ponti-btn-quiet min-h-16 px-4">
            <span aria-hidden="true">←</span> Storie
          </button>
          <p className="ponti-label">Domanda finale</p>
        </div>
        <section className="ponti-card p-5 sm:p-8" aria-labelledby="story-check-heading">
          <h1 id="story-check-heading" className="text-2xl leading-snug sm:text-3xl">
            {story.check.question}
          </h1>
          <p className="mt-2 text-base text-ink-soft">
            Non è un voto: serve a raccontare insieme che cosa succede nella storia.
          </p>
          <div className="mt-5 grid gap-3">
            {story.check.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => answer(option)}
                className="flex min-h-24 w-full items-center rounded-tile border-2 border-line bg-surface px-5 py-4 text-left text-lg font-bold leading-snug hover:border-line-strong"
              >
                {option.text}
              </button>
            ))}
          </div>
          {feedback && (
            <p role="status" aria-live="polite" className="mt-4 rounded-tile border-2 border-place-line bg-place-fill px-4 py-3 text-base text-place-ink">
              {feedback}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setIndex(story.scenes.length - 1);
              setPhase('read');
            }}
            className="ponti-btn-quiet mt-5"
          >
            Rileggi l’ultima pagina
          </button>
        </section>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="mx-auto max-w-reading space-y-5">
        <section className="ponti-card p-6 sm:p-8" aria-labelledby="story-done-heading">
          <p className="ponti-label">Storia finita</p>
          <h1 id="story-done-heading" className="mt-2 text-3xl leading-tight">
            Abbiamo letto insieme.
          </h1>
          <p className="mt-3 text-lg text-ink-soft">
            {feedback ?? 'Potete rileggerla quando volete, oppure provare la stessa situazione nella vita di ogni giorno.'}
          </p>
          {hasCaa && <CaaCredit />}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={restart} className="ponti-btn-primary">
              Rileggi dall’inizio
            </button>
            <button type="button" onClick={onExit} className="ponti-btn-secondary">
              Torna alle storie
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[46rem] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <button type="button" onClick={onExit} className="ponti-btn-quiet min-h-16 px-4">
          <span aria-hidden="true">←</span> Storie
        </button>
        <p className="ponti-label">
          Pagina {index + 1} di {story.scenes.length}
        </p>
      </div>

      <section className="ponti-card overflow-hidden" aria-labelledby="story-page-text">
        <div className="mx-auto w-full max-w-xl px-4 pt-4">
          <StoryArt visual={scene.visual} className="h-auto w-full" />
        </div>
        <div className="p-5 sm:p-7">
          <p className="ponti-label">
            {sentenceTypeLabel(scene.sentenceType)} · {categoryLabel(story.category)}
          </p>
          <p id="story-page-text" className="mt-3 text-2xl leading-relaxed sm:text-3xl">
            {rendered.map((token, tokenIndex) => {
              if (token.wordIndex === null) return token.value;
              const keyword = keywordRanges.some((range) => token.start >= range.start && token.start < range.end);
              const active = token.wordIndex === activeWord;
              return (
                <span
                  key={`${token.start}-${tokenIndex}`}
                  className={
                    active
                      ? 'rounded bg-accent-soft px-0.5 text-accent-ink'
                      : keyword
                        ? 'font-bold underline decoration-accent decoration-2 underline-offset-4'
                        : undefined
                  }
                >
                  {token.value}
                </span>
              );
            })}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={playing ? stopAudio : play} className="ponti-btn-primary">
          <span aria-hidden="true">{playing ? '■' : '🔊'}</span>
          {playing ? 'Ferma' : scene.narration.type === 'recorded' ? 'Ascolta la voce dell’adulto' : 'Ascolta la storia'}
        </button>
        <p className="text-sm text-ink-soft">Tocca «Avanti» solo quando sei pronto.</p>
      </div>
      <LockNotice locked={playing} />
      {audioMessage && (
        <p role="status" className="rounded-tile border border-line bg-paper-deep px-4 py-3 text-base text-ink-soft">
          {audioMessage}
        </p>
      )}
      {hasCaa && <CaaCredit />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0 || playing}
          className="ponti-btn-quiet"
        >
          <span aria-hidden="true">←</span> Indietro
        </button>
        <button type="button" onClick={next} disabled={playing} className="ponti-btn-primary">
          {index < story.scenes.length - 1 ? 'Avanti' : story.check ? 'Domanda finale' : 'Fine della storia'}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <audio
        ref={audioRef}
        src={scene.narration.type === 'recorded' ? scene.narration.dataUrl : undefined}
        onPlay={() => setPlaying(true)}
        onEnded={() => {
          setPlaying(false);
          setActiveWord(null);
        }}
        onPause={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
