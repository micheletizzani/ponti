import { MODULES } from '../data/content';
import { NATIVE_SCHEDULES } from '../data/adults';
import { StoryArt } from '../components/StoryArt';
import { useRecords, latestStory } from '../lib/records';
import { useAppStore } from '../lib/store';
import { relativeDay, todayIso } from '../lib/words';

const DEFAULT_SUGGESTED = ['sintassi', 'ritmo', 'racconto'];

/**
 * Oggi: la schermata del bambino. Tre porte grandi (la giornata, il racconto,
 * come sto) e tre attività. Le attività suggerite seguono gli obiettivi attivi
 * scelti da famiglia e scuola, quando ci sono.
 */
export function Today() {
  const profile = useAppStore((state) => state.profile);
  const activeScheduleId = useAppStore((state) => state.activeScheduleId);
  const progress = useAppStore((state) => state.agendaProgress);
  const { items: diary } = useRecords('diary');
  const { items: goals } = useRecords('goal');
  const { items: schedules } = useRecords('schedule');

  const schedule = [...schedules, ...NATIVE_SCHEDULES].find((item) => item.id === activeScheduleId) ?? null;
  const done =
    schedule && progress && progress.scheduleId === schedule.id && progress.date === todayIso() ? progress.done : [];
  const currentStep = schedule?.steps.find((step) => !done.includes(step.id)) ?? null;
  const story = latestStory(diary);

  const fromGoals = goals
    .filter((goal) => goal.status === 'attivo' && goal.activityPath)
    .map((goal) => MODULES.find((module) => module.path === goal.activityPath))
    .filter((module): module is (typeof MODULES)[number] => Boolean(module));
  const uniqueFromGoals = [...new Map(fromGoals.map((module) => [module.id, module])).values()].slice(0, 3);
  // Prima le attività legate agli obiettivi, poi quelle di partenza, sempre tre.
  const suggested = [
    ...uniqueFromGoals,
    ...MODULES.filter(
      (module) => DEFAULT_SUGGESTED.includes(module.id) && !uniqueFromGoals.some((item) => item.id === module.id),
    ),
  ].slice(0, 3);

  const name = profile.displayName.trim();

  return (
    <div className="space-y-8">
      <div className="max-w-reading">
        <p className="ponti-label">Oggi</p>
        <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{name ? `Ciao, ${name}!` : 'Ciao!'}</h1>
        <p className="mt-3 text-lg text-ink-soft">Scegli da dove partire. Nessuna attività ha un tempo limite.</p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3" aria-label="Per cominciare">
        <li>
          <a
            href="#/app/agenda"
            className="flex h-full min-h-48 flex-col gap-3 rounded-card border-2 border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <span className="ponti-label">La mia giornata</span>
            {schedule && currentStep ? (
              <>
                <StoryArt visual={currentStep.visual} decorative className="h-24 w-28" />
                <span className="text-2xl font-bold leading-tight">Adesso: {currentStep.label}</span>
                <span className="text-base text-ink-soft">{schedule.title}</span>
              </>
            ) : schedule ? (
              <>
                <span className="text-2xl font-bold leading-tight">Agenda finita</span>
                <span className="text-base text-ink-soft">{schedule.title}</span>
              </>
            ) : (
              <>
                <StoryArt visual={{ type: 'symbol', key: 'agenda', altText: '' }} decorative className="h-24 w-28" />
                <span className="text-2xl font-bold leading-tight">Guarda l’agenda</span>
                <span className="text-base text-ink-soft">Nessuna agenda scelta per oggi.</span>
              </>
            )}
          </a>
        </li>
        <li>
          <a
            href="#/app/racconta"
            className="flex h-full min-h-48 flex-col gap-3 rounded-card border-2 border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <span className="ponti-label">Racconta la giornata</span>
            {story ? (
              <>
                <span className="flex gap-2" aria-hidden="true">
                  {story.moments.slice(0, 3).map((moment) => (
                    <StoryArt
                      key={moment.id}
                      visual={{ type: 'symbol', key: moment.symbol, altText: '' }}
                      decorative
                      className="h-20 w-20"
                    />
                  ))}
                </span>
                <span className="text-2xl font-bold leading-tight first-letter:uppercase">
                  {relativeDay(story.date)} {story.author === 'scuola' ? 'a scuola' : 'a casa'}
                </span>
                <span className="text-base text-ink-soft">Le carte per raccontare</span>
              </>
            ) : (
              <>
                <StoryArt visual={{ type: 'symbol', key: 'parole', altText: '' }} decorative className="h-24 w-28" />
                <span className="text-2xl font-bold leading-tight">Ancora nessun racconto</span>
                <span className="text-base text-ink-soft">Arriva dal diario scuola-casa.</span>
              </>
            )}
          </a>
        </li>
        <li>
          <a
            href="#/app/come-sto"
            className="flex h-full min-h-48 flex-col gap-3 rounded-card border-2 border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <span className="ponti-label">Come sto</span>
            <StoryArt visual={{ type: 'symbol', key: 'respiro', altText: '' }} decorative className="h-24 w-28" />
            <span className="text-2xl font-bold leading-tight">Dimmi come stai</span>
            <span className="text-base text-ink-soft">Respiro, pausa, aiuto</span>
          </a>
        </li>
      </ul>

      <section aria-labelledby="attivita-oggi">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="attivita-oggi" className="text-2xl">
              Attività di oggi
            </h2>
            <p className="text-base text-ink-soft">
              {uniqueFromGoals.length > 0
                ? 'La prima viene dagli obiettivi di famiglia e scuola.'
                : 'Tre attività per cominciare.'}
            </p>
          </div>
          <a href="#/app/moduli" className="ponti-btn-quiet">
            Tutte le attività
          </a>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {suggested.map((module) => (
            <li key={module.id}>
              <a
                href={`#${module.path}`}
                className="flex h-full min-h-36 flex-col justify-between gap-3 rounded-tile border-2 border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-paper-deep"
              >
                <span className="text-xl font-bold leading-tight">{module.name}</span>
                <span className="text-base text-ink-soft">{module.trains}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card border border-line bg-paper-deep p-5" aria-labelledby="adulti-heading">
        <h2 id="adulti-heading" className="text-lg font-bold">
          Per gli adulti
        </h2>
        <p className="mt-1 max-w-reading text-base text-ink-soft">
          Diario scuola-casa, obiettivi condivisi, agende e consigli pratici. Serve la passphrase.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a href="#/app/famiglia" className="ponti-btn-secondary">
            Spazio famiglia
          </a>
          <a href="#/app/scuola" className="ponti-btn-secondary">
            Spazio scuola
          </a>
          <a href="#/app/progressi" className="ponti-btn-quiet">
            Progressi
          </a>
        </div>
      </section>
    </div>
  );
}

export function Modules() {
  return (
    <div className="space-y-6">
      <div className="max-w-reading">
        <p className="ponti-label">Attività</p>
        <h1 className="mt-2 text-4xl">Scegli un’attività</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Ogni attività allena una cosa precisa. Dentro ogni attività puoi cambiare quanto aiuto ricevere.
        </p>
      </div>

      <ul className="space-y-3">
        {MODULES.map((module) => (
          <li key={module.id}>
            <a
              href={`#${module.path}`}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-paper-deep sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span aria-hidden="true" className="mt-1 font-display text-2xl text-ink-soft">
                  {module.kicker.replace('Modulo ', '')}
                </span>
                <div>
                  <p className="ponti-label">{module.kicker}</p>
                  <p className="mt-1 text-xl font-bold">{module.name}</p>
                  <p className="mt-1 max-w-reading text-base text-ink-soft">{module.short}</p>
                  <p className="mt-2 text-sm font-bold text-accent-ink">Allena: {module.trains}</p>
                </div>
              </div>
              <span aria-hidden="true" className="ponti-label shrink-0 sm:pl-4">
                Apri →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="quotidiano-heading">
        <h2 id="quotidiano-heading" className="text-2xl">
          Ogni giorno
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ['#/app/agenda', 'La mia giornata', 'L’agenda con le carte: prima, poi.'],
            ['#/app/racconta', 'Racconta la giornata', 'Le carte dal diario per raccontare.'],
            ['#/app/come-sto', 'Come sto', 'Respiro, pausa, aiuto.'],
          ].map(([href, title, text]) => (
            <li key={href}>
              <a href={href} className="flex h-full flex-col gap-1 rounded-card border border-line bg-surface p-5 hover:border-accent">
                <span className="text-xl font-bold">{title}</span>
                <span className="text-base text-ink-soft">{text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
