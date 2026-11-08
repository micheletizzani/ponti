import { BrandMark, WaveMotif } from '../components/Brand';
import { TwoPeopleMotif } from '../components/CharacterArt';
import { MODULES } from '../data/content';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Landing({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="min-h-screen bg-paper">
      <button
        type="button"
        onClick={() => {
          const main = document.getElementById('contenuto-pubblico');
          main?.focus();
          main?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-5 focus:py-4 focus:text-lg focus:font-bold"
      >
        Vai al contenuto
      </button>

      <header className="border-b border-line">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#/" className="flex min-h-16 items-center gap-3 rounded-xl">
            <BrandMark size={44} />
            <span className="leading-tight">
              <span className="block font-display text-xl font-semibold tracking-tight">Ponti</span>
              <span className="block text-sm text-ink-soft">imparare insieme</span>
            </span>
          </a>
          <nav aria-label="Sezioni del sito" className="hidden items-center gap-1 md:flex">
            <button type="button" onClick={() => scrollTo('principi')} className="flex min-h-16 items-center rounded-xl px-4 text-base font-bold text-ink-soft hover:bg-paper-deep hover:text-ink">
              Principi
            </button>
            <button type="button" onClick={() => scrollTo('moduli')} className="flex min-h-16 items-center rounded-xl px-4 text-base font-bold text-ink-soft hover:bg-paper-deep hover:text-ink">
              Moduli
            </button>
            <button type="button" onClick={() => scrollTo('accessibilita')} className="flex min-h-16 items-center rounded-xl px-4 text-base font-bold text-ink-soft hover:bg-paper-deep hover:text-ink">
              Accessibilità
            </button>
            <a href="#/app/guida" className="flex min-h-16 items-center rounded-xl px-4 text-base font-bold text-ink-soft hover:bg-paper-deep hover:text-ink">
              Per i clinici
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onOpenSettings} className="ponti-btn-quiet min-h-16 px-4" aria-label="Impostazioni di lettura">
              <span aria-hidden="true" className="text-xl">Aa</span>
            </button>
            <a href="#/app" className="ponti-btn-primary min-h-16 px-5">
              Apri l’app
            </a>
          </div>
        </div>
      </header>

      <main id="contenuto-pubblico" tabIndex={-1}>
        {/* Hero: statement tipografico, onda come materiale di sfondo */}
        <section className="paper-texture relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute -right-40 top-16 hidden w-[58rem] opacity-60 lg:block" aria-hidden="true">
            <WaveMotif />
          </div>
          <div className="relative mx-auto max-w-shell px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
            <p className="ponti-label">White-Sutton · POGZ · ambiente di apprendimento</p>
            <h1 className="mt-6 max-w-[17ch] text-[clamp(2.7rem,7vw,5.2rem)] font-normal leading-[1.02] tracking-[-0.03em]">
              Imparare insieme, <span className="text-accent">senza fretta.</span>
            </h1>
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,30rem)_1fr] lg:items-end">
              <div>
                <p className="max-w-reading text-xl leading-relaxed text-ink-soft">
                  Sei attività per la logica, la frase, il ritmo della voce, il racconto, il dialogo e le storie sociali. Pensate per
                  un bambino o una bambina con disprassia verbale e funzioni esecutive fragili, da fare insieme a un adulto. Con
                  uno spazio per la famiglia e uno per la scuola, che parlano la stessa lingua.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a href="#/app" className="ponti-btn-primary px-7">
                    Inizia da qui
                  </a>
                  <button type="button" onClick={() => scrollTo('principi')} className="ponti-btn-secondary px-6">
                    Come funziona
                  </button>
                </div>
                <p className="mt-4 text-sm text-ink-soft">Nessun account. Nessun timer. I dati restano sul dispositivo, cifrati.</p>
              </div>
              <div className="lg:justify-self-end">
                <div className="lg:hidden">
                  <WaveMotif className="w-full max-w-lg" />
                </div>
                <p className="ponti-label mt-4 lg:text-right">Un’onda, non un cronometro</p>
                <p className="mt-2 max-w-xs text-base text-ink-soft lg:text-right">
                  La voce si appoggia a un ritmo continuo. Il tempo resta una cosa tua.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Principi: tre assenze deliberate */}
        <section id="principi" className="scroll-mt-8 border-b border-line">
          <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 sm:py-24">
            <p className="ponti-label">Quello che qui non troverai</p>
            <h2 className="mt-4 max-w-[24ch] text-3xl leading-tight sm:text-5xl">
              Tre cose che abbiamo tolto, per farne spazio a una.
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {[
                [
                  'Nessun timer.',
                  'Niente clessidre, barre che si svuotano, countdown. La pianificazione motoria richiede secondi che nessun cronometro può imporre.',
                ],
                [
                  'Nessun suono di errore.',
                  'Le scelte che non funzionano restano spente ai primi livelli. Quando si possono provare, l’app descrive cosa è successo: non boccia.',
                ],
                [
                  'Nessun punteggio veloce.',
                  'Conta la prova, il livello di aiuto, la latenza. La velocità non è un merito e non diventa una classifica.',
                ],
              ].map(([title, text], index) => (
                <div key={title} className="border-t-2 border-ink pt-5">
                  <p className="font-display text-5xl leading-none text-ink-soft" aria-hidden="true">
                    0{index + 1}
                  </p>
                  <h3 className="mt-4 text-2xl leading-snug">{title}</h3>
                  <p className="mt-2 text-base text-ink-soft">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Moduli: elenco editoriale, non card ripetute */}
        <section id="moduli" className="scroll-mt-8">
          <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-reading">
                <p className="ponti-label">Sei moduli</p>
                <h2 className="mt-3 text-3xl leading-tight sm:text-5xl">Un passo per volta, in sei direzioni.</h2>
              </div>
              <a href="#/app/moduli" className="ponti-link">
                Vedi tutti i moduli
              </a>
            </div>

            <ul className="mt-10 divide-y divide-line border-y border-line">
              {MODULES.map((module, index) => (
                <li key={module.id}>
                  <a
                    href={`#${module.path}`}
                    className="group grid gap-4 py-7 transition-colors hover:bg-surface sm:grid-cols-[4rem_1.1fr_1.4fr_auto] sm:items-baseline sm:px-3"
                  >
                    <span className="font-display text-2xl text-ink-soft" aria-hidden="true">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="ponti-label">{module.kicker}</p>
                      <h3 className="mt-1 text-2xl leading-snug">{module.name}</h3>
                    </div>
                    <p className="max-w-xl text-base text-ink-soft">{module.short}</p>
                    <span className="ponti-label text-accent-ink transition-transform group-hover:translate-x-1">
                      Apri →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Dati clinici: banda scura, contrasto di sezione */}
        <section className="bg-accent text-paper">
          <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] opacity-75">Il punto di partenza</p>
                <h2 className="mt-3 max-w-[20ch] text-3xl leading-tight sm:text-4xl">
                  Non è un’app di esercizi in più. È un modo per far entrare la parola dell’adulto nel compito.
                </h2>
                <p className="mt-5 max-w-reading text-base opacity-85">
                  Il profilo di riferimento mostra un ragionamento visuo-spaziale molto fragile in autonomia, che
                  recupera quando l’adulto verbalizza la consegna, e una produzione sintattica bloccata su schemi
                  minimi. Da qui nascono gli slot colorati, la scena che cambia con la frase e il fading dell’aiuto.
                </p>
              </div>
              <dl className="grid gap-8 sm:grid-cols-3">
                {[
                  ['>90%', 'dei bambini con White-Sutton presenta uno sviluppo linguistico compromesso, più severo del ritardo motorio.'],
                  ['~40%', 'non raggiunge un linguaggio verbale fluente entro i sei anni, o resta non verbale.'],
                  ['<4', 'il punteggio ponderato WPPSI-IV di ragionamento visivo nel caso di riferimento, con recupero marcato se guidato verbalmente.'],
                ].map(([value, text]) => (
                  <div key={value} className="border-t border-[rgba(250,246,238,0.35)] pt-4">
                    <dt className="font-display text-5xl leading-none">{value}</dt>
                    <dd className="mt-3 text-sm leading-relaxed opacity-85">{text}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-10 border-t border-[rgba(250,246,238,0.25)] pt-4 text-sm opacity-70">
              I primi due dati provengono dalla letteratura raccolta in <em>doc/</em> (GeneReviews; coorte italiana). Il
              terzo descrive il profilo clinico di riferimento del progetto, non una prevalenza di popolazione.
            </p>
          </div>
        </section>

        {/* Accessibilità: principi e chiave dei colori */}
        <section id="accessibilita" className="scroll-mt-8 border-b border-line">
          <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="ponti-label">Accessibilità cognitiva</p>
                <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
                  Non solo leggibile. Usabile con una memoria di lavoro fragile.
                </h2>
                <p className="mt-5 max-w-reading text-base text-ink-soft">
                  Atkinson Hyperlegible per il testo, Lexend per i titoli. Bersagli da 64 pixel, una consegna per
                  schermata, nessun elemento che si muove senza che tu lo abbia chiesto. Il progetto segue ISO
                  21801-1 e W3C COGA, non solo WCAG.
                </p>
                <div className="mt-6 rounded-card border border-line bg-surface p-5">
                  <p className="font-display text-xl">Atkinson Hyperlegible</p>
                  <p className="mt-1 text-base text-ink-soft">
                    Il gatto insegue il topo. La bambina saluta il bambino. 0 / O, 1 / I / l.
                  </p>
                  <p className="mt-4 font-display text-xl">Lexend</p>
                  <p className="mt-1 text-base text-ink-soft">Un’onda, non un cronometro.</p>
                </div>
              </div>

              <div>
                <p className="ponti-label">La chiave dei colori</p>
                <p className="mt-2 text-base text-ink-soft">
                  Ogni ruolo sintattico ha un colore stabile. Non è decorazione: è la struttura della frase, sempre
                  visibile.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Chi compie l’azione', 'Arancione', 'rounded-card border-2 p-5 border-agent-line bg-agent-fill text-agent-ink'],
                    ['L’azione', 'Verde', 'rounded-card border-2 p-5 border-verb-line bg-verb-fill text-verb-ink'],
                    ['Chi riceve l’azione', 'Giallo', 'rounded-card border-2 p-5 border-patient-line bg-patient-fill text-patient-ink'],
                    ['Dove, quando', 'Blu', 'rounded-card border-2 p-5 border-place-line bg-place-fill text-place-ink'],
                  ].map(([role, color, classes]) => (
                    <div key={role} className={classes}>
                      <p className="text-sm font-bold uppercase tracking-wide opacity-75">{color}</p>
                      <p className="mt-1 text-lg font-bold">{role}</p>
                    </div>
                  ))}
                </div>
                <ul className="mt-6 space-y-2 text-base text-ink-soft">
                  <li>· Le scelte incoerenti si spengono, non si puniscono.</li>
                  <li>· L’audio blocca i tocchi finché la spiegazione non è finita.</li>
                  <li>· La velocità non entra in nessun punteggio.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Co-learning */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-card border border-line bg-surface p-4 sm:p-6">
                  <TwoPeopleMotif />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="ponti-label">Co-learning</p>
                <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">La seduta è in tre.</h2>
                <p className="mt-4 max-w-reading text-base text-ink-soft">
                  Il tablet è il terzo vertice: il bambino, l’adulto, lo schermo. Gli esercizi chiedono di dire la
                  regola ad alta voce, di ascoltarsi, di farsi spiegare. I suggerimenti per l’adulto restano accanto al
                  compito, non in un manuale separato.
                </p>
                <div className="mt-6 space-y-3 text-base">
                  {[
                    'La registrazione vocale serve alla revisione del logopedista, non a un algoritmo.',
                    'Il livello di aiuto si alza e si abbassa senza penalità.',
                    'La sessione finisce quando l’attenzione cala, non quando scade un tempo.',
                  ].map((item) => (
                    <p key={item} className="flex gap-3 border-t border-line pt-3 text-ink-soft">
                      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="paper-texture">
          <div className="mx-auto max-w-shell px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="ponti-label">Si comincia da una scena</p>
                <h2 className="mt-3 max-w-[22ch] text-4xl leading-[1.05] sm:text-5xl">
                  «Il gatto insegue il topo.» E se fosse il topo?
                </h2>
                <p className="mt-4 max-w-reading text-lg text-ink-soft">
                  Il modulo di sintassi è pronto: tre spazi colorati, una scena che risponde, un passaggio al passivo
                  che non cambia il significato.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a href="#/app/sintassi" className="ponti-btn-primary px-7">
                  Prova la sintassi
                </a>
                <a href="#/app" className="ponti-btn-secondary px-6">
                  Tutti i moduli
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-shell gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size={36} />
              <p className="font-display text-lg">Ponti</p>
            </div>
            <p className="mt-3 max-w-sm text-sm text-ink-soft">
              Prototipo di ambiente di apprendimento per profili White-Sutton / POGZ. Non è un dispositivo medico e
              non sostituisce il percorso logopedico o neuropsichiatrico.
            </p>
          </div>
          <nav aria-label="Collegamenti" className="text-sm">
            <p className="ponti-label">Approfondisci</p>
            <ul className="mt-3 space-y-1">
              <li><a href="#/app/guida" className="ponti-link text-sm">Architettura e limiti</a></li>
              <li><a href="#/app/progressi" className="ponti-link text-sm">Progressi e dati locali</a></li>
              <li><a href="#/app/moduli" className="ponti-link text-sm">I sei moduli</a></li>
            </ul>
          </nav>
          <div className="text-sm text-ink-soft">
            <p className="ponti-label">Font accessibili</p>
            <p className="mt-3">
              Atkinson Hyperlegible (Braille Institute) e Lexend, auto-ospitati. Testo ridimensionabile dal pannello
              “Aa”.
            </p>
            <p className="mt-4">Prototipo v0.1 · novembre 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
