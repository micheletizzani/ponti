import { useState } from 'react';
import type { ScaffoldLevel } from '../types/domain';
import { SOCIAL_TOPICS, type SocialTopic } from '../data/content';
import { TopicIcon } from '../components/Brand';
import { ExerciseHeader, Feedback, FinishSession, LockNotice, TaskPrompt } from '../components/ui';
import { useGuidedVoice, useSessionTracker } from '../lib/hooks';
import { useAppStore } from '../lib/store';
import { latestStory, useRecords } from '../lib/records';
import { childWords, genderize, relativeDay } from '../lib/words';

export function SocialDeck() {
  const [scaffold, setScaffold] = useState<ScaffoldLevel>(1);
  const [selected, setSelected] = useState<SocialTopic | null>(null);
  const [used, setUsed] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const dualUser = useAppStore((state) => state.preferences.dualUser);
  const profile = useAppStore((state) => state.profile);
  const { locked, read } = useGuidedVoice();
  const tracker = useSessionTracker('sociale', scaffold);

  const interests = profile.interests.length > 0 ? profile.interests : SOCIAL_TOPICS.map((topic) => topic.id);
  const { items: diary } = useRecords('diary');
  const story = latestStory(diary);
  const firstMoment = story?.moments[0];

  // La tessera Novità nasce dal diario: un argomento vero e nuovo, al posto della domanda già nota.
  const news: SocialTopic | null =
    story && firstMoment
      ? {
          id: 'novita',
          label: `Una novità di ${relativeDay(story.date)}`,
          script: `Sai cosa ho fatto ${relativeDay(story.date)}? ${genderize(firstMoment.text, profile.gender).replace(/\.$/, '')}! E tu cosa hai fatto?`,
          adultPrompt: 'Rispondi con una tua novità della giornata, poi chiedi un dettaglio: «Con chi?» oppure «Ti è piaciuto?».',
          icon: 'news',
        }
      : null;
  const topics = news ? [news, ...SOCIAL_TOPICS] : SOCIAL_TOPICS;

  return (
    <div className="space-y-6">
      <ExerciseHeader moduleId="sociale" scaffold={scaffold} onScaffold={setScaffold} />

      <TaskPrompt
        question="Di cosa vuoi parlare?"
        hint="Scegli un argomento. Poi leggi o ascolta la frase e dilla a qualcuno."
      />

      {selected === null ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Argomenti">
          {topics.map((topic) => {
            const preferred =
              topic.id === 'novita' || interests.includes(topic.label.toLowerCase()) || interests.includes(topic.id);
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  tracker.touch();
                  setSelected(topic);
                }}
                className={`flex min-h-32 flex-col items-start gap-3 rounded-card border-2 p-5 text-left transition-colors ${
                  preferred ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <span aria-hidden="true" className="text-accent">
                  <TopicIcon name={topic.icon} />
                </span>
                <span className="text-lg font-bold">{topic.label}</span>
                {preferred && (
                  <span className="text-sm font-bold text-accent-ink">
                    {topic.id === 'novita' ? 'Dal diario' : 'Un tuo interesse'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <section className="ponti-card p-5 sm:p-8" aria-labelledby="topic-heading">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="ponti-label">Il tuo argomento</p>
              <h2 id="topic-heading" className="mt-2 flex items-center gap-3 text-3xl">
                <span aria-hidden="true" className="text-accent">
                  <TopicIcon name={selected.icon} size={40} />
                </span>
                {selected.label}
              </h2>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="ponti-btn-quiet min-h-16 px-4">
              Cambia
            </button>
          </div>

          <p className="mt-6 max-w-reading rounded-card border-2 border-agent-line bg-agent-fill p-5 text-2xl leading-snug text-agent-ink">
            «{selected.script}»
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void read(selected.script)}
              className="ponti-btn-primary"
              disabled={locked}
            >
              <span aria-hidden="true">🔊</span> Ascolta la frase
            </button>
            <button
              type="button"
              onClick={() => {
                setUsed((list) => (list.includes(selected.id) ? list : [...list, selected.id]));
                tracker.recordRound(true);
                setSelected(null);
              }}
              className="ponti-btn-secondary"
            >
              L’ho detto a qualcuno
            </button>
          </div>
          <LockNotice locked={locked} />

          {dualUser && (
            <aside className="mt-6 rounded-card border border-line bg-paper-deep p-4" aria-label="Suggerimento per l’adulto">
              <p className="ponti-label">Per chi ti ascolta</p>
              <p className="mt-2 text-base text-ink-soft">{selected.adultPrompt}</p>
              <p className="mt-2 text-sm text-ink-soft">
                Se {childWords(profile.gender, '').noun} ripete una domanda a risposta nota, offri questa tessera come alternativa: serve a stare
                insieme, non a interrogare.
              </p>
            </aside>
          )}
        </section>
      )}

      {used.length > 0 && (
        <Feedback tone="confirm">
          Hai usato {used.length} {used.length === 1 ? 'argomento' : 'argomenti'}. Puoi continuare finché vuoi.
        </Feedback>
      )}

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
