import { useState } from 'react';
import type { AdultRole, ChildGender } from '../types/domain';
import { AdultGate } from '../components/AdultGate';
import { FAMILY_GUIDES, SCHOOL_GUIDES, moodLabel, type GuideCard } from '../data/adults';
import { useRecords, sortDiary } from '../lib/records';
import { useAppStore } from '../lib/store';
import { genderize, relativeDay } from '../lib/words';
import { Diary } from './Diary';
import { Goals } from './Goals';
import { Schedules } from './Schedules';
import { Exchange } from './Exchange';

export const ROLE_INFO: Record<
  AdultRole,
  { title: string; other: string; fromOther: string; otherSpace: string; path: string }
> = {
  famiglia: {
    title: 'Spazio famiglia',
    other: 'la scuola',
    fromOther: 'dalla scuola',
    otherSpace: 'Spazio scuola',
    path: '/app/famiglia',
  },
  scuola: {
    title: 'Spazio scuola',
    other: 'la famiglia',
    fromOther: 'dalla famiglia',
    otherSpace: 'Spazio famiglia',
    path: '/app/scuola',
  },
};

/** Instrada le sotto-pagine: /app/famiglia/diario, /app/scuola/obiettivi… */
export function AdultRoutes({ role, sub }: { role: AdultRole; sub: string }) {
  const info = ROLE_INFO[role];
  const back = { backHref: `#${info.path}`, backLabel: info.title };
  return (
    <AdultGate title={info.title} {...(sub ? back : {})}>
      {sub === '' && <AdultHub role={role} />}
      {sub === 'diario' && <Diary role={role} />}
      {sub === 'obiettivi' && <Goals role={role} />}
      {sub === 'agende' && <Schedules role={role} />}
      {sub === 'scambio' && <Exchange role={role} />}
      {!['', 'diario', 'obiettivi', 'agende', 'scambio'].includes(sub) && (
        <div className="py-10">
          <h1 className="text-3xl">Questa pagina non c’è.</h1>
          <a href={`#${info.path}`} className="ponti-btn-primary mt-4">
            Torna allo {info.title.toLowerCase()}
          </a>
        </div>
      )}
    </AdultGate>
  );
}

function ProfileCard() {
  const profile = useAppStore((state) => state.profile);
  const setDisplayName = useAppStore((state) => state.setDisplayName);
  const setGender = useAppStore((state) => state.setGender);
  const [name, setName] = useState(profile.displayName);
  const options: { value: ChildGender; label: string }[] = [
    { value: 'f', label: 'Una bambina' },
    { value: 'm', label: 'Un bambino' },
    { value: 'n', label: 'Preferisco non indicarlo' },
  ];
  const incomplete = !profile.displayName || profile.gender === 'n';

  return (
    <details className="rounded-card border border-line bg-surface p-5" open={incomplete}>
      <summary className="min-h-16 cursor-pointer list-none text-lg font-bold [&::-webkit-details-marker]:hidden">
        {incomplete ? 'Completa il profilo (un minuto)' : `Profilo: ${profile.displayName}`}
      </summary>
      <p className="mt-1 max-w-reading text-base text-ink-soft">
        Il nome compare nel saluto. Bambina o bambino serve solo all’italiano: «stanca» o «stanco», «Passa a…». Restano
        su questo dispositivo.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hub-name" className="block text-base font-bold">
            Nome
          </label>
          <input
            id="hub-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setDisplayName(name)}
            autoComplete="off"
            className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
          />
        </div>
        <fieldset>
          <legend className="text-base font-bold">Chi usa Ponti</legend>
          <div className="mt-2 grid gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={profile.gender === option.value}
                onClick={() => setGender(option.value)}
                className={`min-h-16 rounded-tile border-2 px-4 text-left text-base font-bold ${
                  profile.gender === option.value ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <button type="button" onClick={() => setDisplayName(name)} className="ponti-btn-secondary mt-4">
        Salva il nome
      </button>
    </details>
  );
}

function GuideList({ guides }: { guides: GuideCard[] }) {
  const gender = useAppStore((state) => state.profile.gender);
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {guides.map((guide) => (
        <li key={guide.id} className="rounded-card border border-line bg-surface p-5">
          <h3 className="text-xl leading-snug">{guide.title}</h3>
          <ul className="mt-3 space-y-2 text-base">
            {guide.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span>{genderize(point, gender)}</span>
              </li>
            ))}
          </ul>
          <details className="mt-3">
            <summary className="ponti-link cursor-pointer text-sm">Perché lo consigliamo</summary>
            <p className="mt-2 text-sm text-ink-soft">{guide.why}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

function AdultHub({ role }: { role: AdultRole }) {
  const info = ROLE_INFO[role];
  const { items: diary } = useRecords('diary');
  const { items: goals } = useRecords('goal');
  const latestFromOther = sortDiary(diary).find((entry) => entry.author !== role) ?? null;
  const activeGoals = goals.filter((goal) => goal.status === 'attivo').length;
  const base = info.path;

  const tools = [
    {
      href: `#${base}/diario`,
      title: 'Diario scuola-casa',
      text:
        role === 'scuola'
          ? 'Due minuti a fine giornata: com’è andata, cosa avete fatto. Diventa il racconto per casa.'
          : 'Leggete cosa è successo a scuola e scrivete cosa deve sapere la maestra.',
      status: latestFromOther
        ? `Ultima nota ${info.fromOther}: ${relativeDay(latestFromOther.date)} · ${moodLabel(latestFromOther.mood)}`
        : `Ancora nessuna nota ${info.fromOther}.`,
    },
    {
      href: `#${base}/obiettivi`,
      title: 'Obiettivi condivisi',
      text: 'Pochi obiettivi, la stessa strategia a casa e a scuola, osservazioni sulla stessa scala di aiuto.',
      status: activeGoals === 0 ? 'Nessun obiettivo attivo.' : `${activeGoals} ${activeGoals === 1 ? 'obiettivo attivo' : 'obiettivi attivi'}.`,
    },
    {
      href: `#${base}/agende`,
      title: 'Agende visive',
      text: 'Scegliete l’agenda di oggi o createne una con i vostri simboli e le vostre foto.',
      status: 'Cinque agende pronte da usare o copiare.',
    },
    {
      href: `#${base}/scambio`,
      title: role === 'scuola' ? 'Invia o ricevi dalla famiglia' : 'Invia o ricevi dalla scuola',
      text: 'Se usate due tablet diversi: un file cifrato con una parola che vi dite a voce.',
      status: 'Nessun server: il file passa da voi.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="max-w-reading">
        <p className="ponti-label">Area adulti</p>
        <h1 className="mt-2 text-4xl">{info.title}</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {role === 'scuola'
            ? 'Per insegnanti curricolari e di sostegno ed educatori. Quello che scrivete qui aiuta la famiglia a parlare della giornata.'
            : 'Per genitori e chi si occupa della bambina o del bambino a casa. Qui trovate cosa arriva da scuola e come esercitarvi senza fatica.'}
        </p>
      </div>

      <ProfileCard />

      <section aria-labelledby="strumenti-heading">
        <h2 id="strumenti-heading" className="text-2xl">
          Strumenti
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.href}>
              <a
                href={tool.href}
                className="flex h-full min-h-40 flex-col justify-between gap-3 rounded-card border-2 border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-paper-deep"
              >
                <span>
                  <span className="block text-xl font-bold leading-tight">{tool.title}</span>
                  <span className="mt-2 block text-base text-ink-soft">{tool.text}</span>
                </span>
                <span className="text-sm font-bold text-accent-ink">{tool.status}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#/app/progressi" className="ponti-btn-quiet">
            Progressi nelle attività
          </a>
          <a href="#/app/storie" className="ponti-btn-quiet">
            Crea una storia sociale
          </a>
          <a href={`#${role === 'scuola' ? '/app/famiglia' : '/app/scuola'}`} className="ponti-btn-quiet">
            Vai allo {info.otherSpace.toLowerCase()}
          </a>
        </div>
      </section>

      <section aria-labelledby="consigli-heading">
        <h2 id="consigli-heading" className="text-2xl">
          {role === 'scuola' ? 'In classe: sei indicazioni' : 'A casa: sei indicazioni'}
        </h2>
        <p className="mt-1 max-w-reading text-base text-ink-soft">
          Ogni indicazione dice da dove viene e quanto è solida. Dove le prove sono deboli, lo scriviamo.
        </p>
        <div className="mt-4">
          <GuideList guides={role === 'scuola' ? SCHOOL_GUIDES : FAMILY_GUIDES} />
        </div>
      </section>
    </div>
  );
}
