import { MODULES } from '../data/content';
import { useAppStore } from '../lib/store';

const SUGGESTED = ['sintassi', 'ritmo', 'racconto'] as const;

export function Today() {
  const profile = useAppStore((state) => state.profile);
  const dualUser = useAppStore((state) => state.preferences.dualUser);

  const suggested = MODULES.filter((module) => SUGGESTED.includes(module.id as (typeof SUGGESTED)[number]));

  return (
    <div className="space-y-8">
      <section className="ponti-card overflow-hidden" aria-labelledby="oggi-heading">
        <div className="border-b border-line bg-accent-soft px-6 py-8 sm:px-8">
          <p className="ponti-label text-accent-ink">Oggi</p>
          <h1 id="oggi-heading" className="mt-2 text-4xl leading-tight text-accent-ink sm:text-5xl">
            Ciao, {profile.displayName}.
          </h1>
          <p className="mt-3 max-w-reading text-lg text-accent-ink">
            Scegli un’attività e prenditi il tempo che serve. Nessuna attività ha un tempo limite e nessuna toglie
            punti.
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          {suggested.map((module) => (
            <a
              key={module.id}
              href={`#${module.path}`}
              className="flex min-h-40 flex-col justify-between gap-4 rounded-tile border-2 border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-paper-deep"
            >
              <div>
                <p className="ponti-label">{module.kicker}</p>
                <p className="mt-2 text-xl font-bold leading-tight">{module.name}</p>
              </div>
              <p className="text-base text-ink-soft">{module.trains}</p>
              <span className="ponti-label text-accent-ink">Apri →</span>
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-5">
          <p className="text-base text-ink-soft">
            Ci sono altre {MODULES.length - suggested.length} attività nel tuo elenco.
          </p>
          <a href="#/app/moduli" className="ponti-btn-secondary">
            Tutti i moduli
          </a>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface p-6" aria-labelledby="adult-heading">
          <p className="ponti-label">Co-learning</p>
          <h2 id="adult-heading" className="mt-2 text-2xl">
            State imparando in due
          </h2>
          <ul className="mt-4 space-y-3 text-base text-ink-soft">
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
              Prima di toccare, chiedi: «Che cosa succede qui?». La frase dell’adulto è l’aiuto più efficace.
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
              Se il bambino si blocca, non suggerire la risposta: scegli un livello di aiuto più alto dal pulsante
              “Aiuto”.
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
              Chiudete quando l’attenzione cala. La sessione si salva sul dispositivo.
            </li>
          </ul>
          {!dualUser && (
            <p className="mt-4 text-sm text-ink-soft">
              I suggerimenti per l’adulto sono nascosti. Puoi riattivarli dalle impostazioni.
            </p>
          )}
        </section>

        <section className="rounded-card border border-line bg-paper-deep p-6" aria-labelledby="come-heading">
          <p className="ponti-label">Come funziona</p>
          <h2 id="come-heading" className="mt-2 text-2xl">
            Un’onda, non un cronometro
          </h2>
          <p className="mt-3 text-base text-ink-soft">
            Ponti nasce per un profilo White-Sutton / POGZ con disprassia verbale e fragilità esecutive. Le attività
            usano la parola dell’adulto come appoggio, mostrano una cosa per volta e non giudicano la velocità.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#/app/guida" className="ponti-btn-quiet">
              Perché queste scelte
            </a>
            <a href="#/app/progressi" className="ponti-btn-quiet">
              I tuoi progressi
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export function Modules() {
  return (
    <div className="space-y-6">
      <div className="max-w-reading">
        <p className="ponti-label">Sei attività</p>
        <h1 className="mt-2 text-4xl">Scegli un modulo</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Ogni modulo allena una cosa precisa. Puoi cambiare livello di aiuto dentro ogni attività.
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
    </div>
  );
}
