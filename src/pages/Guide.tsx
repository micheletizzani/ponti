import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'architettura', label: 'Architettura' },
  { id: 'design', label: 'Design system' },
  { id: 'accessibilita', label: 'Accessibilità' },
  { id: 'moduli', label: 'Moduli' },
  { id: 'metriche', label: 'Metriche e FHIR' },
  { id: 'privacy', label: 'Privacy e limiti' },
];

export function Guide() {
  const [active, setActive] = useState('architettura');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.4, 0.7] },
    );
    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-8">
      <header className="max-w-reading">
        <p className="ponti-label">Documentazione di progetto · prototipo v0.1</p>
        <h1 className="mt-2 text-4xl">Come è fatto Ponti, e perché</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Le scelte tecniche nascono dal profilo clinico descritto in <em>doc/</em>: disprassia verbale evolutiva,
          fragilità esecutiva, ragionamento visuo-spaziale che recupera con la mediazione verbale dell’adulto.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <nav aria-label="Indice della documentazione" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActive(section.id);
                  }}
                  aria-current={active === section.id ? 'true' : undefined}
                  className={`flex min-h-16 items-center whitespace-nowrap rounded-xl px-4 text-base font-bold ${
                    active === section.id ? 'bg-accent-soft text-accent-ink' : 'text-ink-soft hover:bg-paper-deep'
                  }`}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-14">
          <section id="architettura" className="scroll-mt-28" aria-labelledby="architettura-heading">
            <h2 id="architettura-heading" className="text-3xl">
              1. Architettura tecnica
            </h2>
            <p className="mt-3 max-w-reading text-base text-ink-soft">
              Web app React + TypeScript strict, impacchettabile come PWA e, in seguito, dentro Capacitor senza
              riscrivere l’interfaccia. Nessun server: la logica vive nel client e i dati restano sul dispositivo.
            </p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['Frontend', 'React 18, Vite 5, TypeScript strict (noUncheckedIndexedAccess).'],
                ['Stile', 'Tailwind CSS con token in variabili CSS: contrasto, scala testo e colori dei ruoli.'],
                ['Stato', 'Zustand persistito per profilo e preferenze; stato locale di esercizio nei moduli.'],
                ['Dati', 'Dexie (IndexedDB) con record cifrati AES-256-GCM; nessuna richiesta di rete.'],
                ['Audio', 'Web Audio API per il metronomo e la misura dell’inviluppo; MediaRecorder per la voce.'],
                ['Voce', 'SpeechSynthesis con voce italiana, sempre avviata da un gesto e mai automatica.'],
                ['Navigazione', 'Router hash-based: identico in browser, PWA installata e WebView.'],
                ['Offline', 'Service worker con navigazione network-first e asset cache-first.'],
              ].map(([term, description]) => (
                <div key={term} className="rounded-tile border border-line bg-surface p-4">
                  <dt className="ponti-label">{term}</dt>
                  <dd className="mt-1 text-base">{description}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-8 text-xl">Struttura delle cartelle</h3>
            <pre className="mt-3 overflow-x-auto rounded-card border border-line bg-surface p-4 text-sm leading-relaxed">
{`src/
  components/   shell, dialoghi, arte SVG, player e Story Studio, registratore
  data/         stimoli, storie native e contenuti clinici (nessuna logica)
  lib/          router, store, Dexie, audio, voce, metriche, storie, export FHIR
  modules/      Matrix-Talk, Sintassi, Ritmo, Trama, Social Deck
  pages/        Oggi, Moduli, Progressi, Storie, Guida, Landing
  types/        dominio tipizzato (UserProfile, SessionMetric, SyntaxNode…)
public/         manifest PWA, service worker, icona
doc/            documentazione clinica di partenza`}
            </pre>

            <h3 className="mt-8 text-xl">Flusso di una prova</h3>
            <ol className="mt-3 space-y-2 text-base text-ink-soft">
              <li>1. Il modulo mostra una sola consegna e registra il momento della comparsa.</li>
              <li>2. Il primo tocco fissa la latenza; nessun tocco viene valutato prima della fine dell’audio-guida.</li>
              <li>3. La composizione (tessere, matrice, connettivo) produce uno stato tipizzato e una scena derivata.</li>
              <li>4. La prova viene conteggiata una sola volta per composizione, con esito neutro e spiegazione.</li>
              <li>5. “Ho finito per oggi” scrive una <code>SessionMetric</code> in IndexedDB, esportabile come FHIR.</li>
            </ol>
          </section>

          <section id="design" className="scroll-mt-28" aria-labelledby="design-heading">
            <h2 id="design-heading" className="text-3xl">
              2. Design system
            </h2>
            <p className="mt-3 max-w-reading text-base text-ink-soft">
              Due famiglie tipografiche accessibili, entrambe auto-ospitate per funzionare offline: nessuna chiamata a
              Google Fonts.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="ponti-label">Testo — Atkinson Hyperlegible</p>
                <p className="mt-2 font-ui text-2xl">Il gatto insegue il topo.</p>
                <p className="mt-2 text-base text-ink-soft">
                  Disegnato dal Braille Institute: lettere differenziate in modo netto (I, l, 1; O, 0), spaziatura
                  ampia, forme aperte. Usato per corpo del testo e controlli.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-5">
                <p className="ponti-label">Titoli — Lexend</p>
                <p className="mt-2 font-display text-2xl">Imparare insieme</p>
                <p className="mt-2 text-base text-ink-soft">
                  Progettato per ridurre lo stress visivo durante la lettura. Usato solo per titoli brevi, con
                  tracking stretto e peso medio: nessun maiuscolo esteso.
                </p>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-tile border border-line bg-paper-deep p-4">
                <dt className="ponti-label">Corpo</dt>
                <dd className="mt-1 text-base">1,06 rem (≈18 px), interlinea 1,65, scala 100–125%.</dd>
              </div>
              <div className="rounded-tile border border-line bg-paper-deep p-4">
                <dt className="ponti-label">Tocco</dt>
                <dd className="mt-1 text-base">Minimo 64×64 px su ogni controllo; 96 px sulle tessere di frase.</dd>
              </div>
              <div className="rounded-tile border border-line bg-paper-deep p-4">
                <dt className="ponti-label">Sfondo</dt>
                <dd className="mt-1 text-base">Crema opaca, texture a puntini appena percepibile; nessun bianco abbagliante.</dd>
              </div>
            </dl>

            <h3 className="mt-8 text-xl">Chiave di Fitzgerald</h3>
            <p className="mt-2 max-w-reading text-base text-ink-soft">
              I colori non sono decorativi: identificano i ruoli sintattici. Ogni tessera ha bordo scuro e testo scuro
              sul pastello, con contrasto verificato in entrambe le modalità.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {[
                ['Chi / agente', 'Arancione', 'border-agent-line bg-agent-fill text-agent-ink'],
                ['Cosa fa / verbo', 'Verde', 'border-verb-line bg-verb-fill text-verb-ink'],
                ['Chi riceve / oggetto', 'Giallo', 'border-patient-line bg-patient-fill text-patient-ink'],
                ['Dove / quando', 'Blu', 'border-place-line bg-place-fill text-place-ink'],
              ].map(([role, color, classes]) => (
                <div key={role} className={`rounded-tile border-2 p-4 ${classes}`}>
                  <p className="text-sm font-bold uppercase tracking-wide opacity-80">{color}</p>
                  <p className="mt-1 text-base font-bold">{role}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-xl">Token principali</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left text-base">
                <caption className="sr-only">Token cromatici e ruolo</caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="py-3 pr-4 font-bold">Token</th>
                    <th scope="col" className="py-3 pr-4 font-bold">Valore</th>
                    <th scope="col" className="py-3 font-bold">Uso</th>
                  </tr>
                </thead>
                <tbody className="text-ink-soft">
                  {[
                    ['--paper', '#FAF6EE', 'Sfondo generale, antiriflesso'],
                    ['--surface', '#FFFDF7', 'Superfici dei compiti'],
                    ['--ink', '#1C231F', 'Testo primario'],
                    ['--accent', '#1E4F45', 'Azione primaria, onda, focus del percorso'],
                    ['--accent-soft', '#DCEBE3', 'Stato selezionato, intestazioni calme'],
                    ['--line', '#DDD1BD', 'Bordi sottili, separatori'],
                  ].map(([token, value, use]) => (
                    <tr key={token} className="border-b border-line align-top">
                      <th scope="row" className="py-3 pr-4 font-bold text-ink">{token}</th>
                      <td className="py-3 pr-4 font-mono text-sm">{value}</td>
                      <td className="py-3">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="accessibilita" className="scroll-mt-28" aria-labelledby="accessibilita-heading">
            <h2 id="accessibilita-heading" className="text-3xl">
              3. Accessibilità cognitiva
            </h2>
            <p className="mt-3 max-w-reading text-base text-ink-soft">
              WCAG 2.2 è il livello tecnico. ISO 21801-1 e W3C COGA sono il livello di progetto: qui sotto la
              corrispondenza tra principio e implementazione reale.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left text-base">
                <caption className="sr-only">Principi di accessibilità cognitiva e implementazione</caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="py-3 pr-4 font-bold">Principio</th>
                    <th scope="col" className="py-3 pr-4 font-bold">Vulnerabilità target</th>
                    <th scope="col" className="py-3 font-bold">Implementazione</th>
                  </tr>
                </thead>
                <tbody className="align-top text-ink-soft">
                  {[
                    [
                      'Nessuna ansia da tempo (WCAG 2.2.1, COGA Obj. 5)',
                      'Latenza di pianificazione motoria e sintattica 10–15 s',
                      'Nessun timer, nessuna clessidra, nessun punteggio di velocità; il cursore dell’onda parte solo su richiesta e si ferma quando vuoi.',
                    ],
                    [
                      'Target ampi e stabili (COGA Obj. 1)',
                      'Disprassia fine, coordinazione oculo-manuale incerta',
                      'Controlli ≥64 px, bordi netti, tap-to-place con spazio magnetico e “Scambia” al posto del trascinamento, aree inattive durante l’audio.',
                    ],
                    [
                      'Zero cluttering (ISO 21801-1)',
                      'Affaticamento esecutivo, attenzione labile',
                      'Massimo 3–4 elementi focali per schermata; nessun banner, nessuna decorazione animata, sfondi pastello a basso stimolo.',
                    ],
                    [
                      'Errorless learning (COGA Obj. 4)',
                      'Ansia da prestazione, blocco esecutivo',
                      'Scelte incoerenti disattivate ai livelli 1–2; nessun suono di errore; spiegazione neutra che descrive cosa fa la frase.',
                    ],
                    [
                      'Informazione al punto di bisogno (ISO 21801-1)',
                      'Memoria di lavoro fragile',
                      'Legenda dei colori sempre visibile, consegna unica in alto, regola disponibile nel pannello accanto.',
                    ],
                    [
                      'Adattabilità (COGA Obj. 8)',
                      'Diversi canali sensoriali e tempi',
                      'Testo 100–125%, alto contrasto, modalità ferma, velocità voce, audio on/off, suggerimenti adulto on/off.',
                    ],
                    [
                      'Co-learning / dual user',
                      'Rischio di isolamento e tapping compulsivo',
                      'Pannello adulto, registrazioni per la revisione, blocco dell’input durante l’audio; il dispositivo è il terzo vertice della triade.',
                    ],
                  ].map(([principle, vulnerability, implementation]) => (
                    <tr key={principle} className="border-b border-line align-top">
                      <th scope="row" className="py-3 pr-4 font-bold text-ink">{principle}</th>
                      <td className="py-3 pr-4">{vulnerability}</td>
                      <td className="py-3">{implementation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="moduli" className="scroll-mt-28" aria-labelledby="moduli-heading">
            <h2 id="moduli-heading" className="text-3xl">
              4. Moduli e razionale clinico
            </h2>
            <div className="mt-4 space-y-3">
              {[
                [
                  'Matrix-Talk',
                  'Ragionamento logico-visivo sotto la media (WPPSI-IV < 4) con recupero tramite scaffolding verbale.',
                  'Matrice 2×2, quattro livelli di fading: descrizione completa, domande chiave, cue minimo, registrazione del self-talk. Le scelte scorrette sono spente ai primi livelli.',
                ],
                [
                  'Sintassi dinamica',
                  'Produzione bloccata su SVO, incertezza sulle frasi reversibili.',
                  'Slot Fitzgerald, scena 2D derivata dalla frase, conversione attivo ↔ passivo che conserva il significato, ruoli tematici espliciti.',
                ],
                [
                  'Ritmo e sillabe',
                  'Segregazione sillabica, prosodia piatta, coarticolazione fragile (ReST / PML).',
                  'Onda continua con sfere grandi e piccole, metronomo discreto, registrazione locale con inviluppo e stima della pausa più lunga. Nessun ASR.',
                ],
                [
                  'Trama e nessi',
                  'Difficoltà a integrare cause e conseguenze nel racconto.',
                  'Tre quadri, connettivi espliciti da collocare, narrazione finale che unisce il testo.',
                ],
                [
                  'Social Deck',
                  'Domande a risposta nota come ancoraggio sociale a basso costo.',
                  'Tessere di interessi e script aperti da rivolgere all’adulto, con domanda di ritorno per sostenere lo scambio.',
                ],
                [
                  'Storie sociali',
                  'Rigidità pragmatica, domande a risposta nota, ansia da blocco della parola o da cambiamento.',
                  'Tre storie native secondo Gray 10.2, player a pagine con voce dell’adulto e parole evidenziate, domanda finale senza punteggio. Story Studio no-code con rapporto descrittive/guida calcolato mentre si scrive.',
                ],
              ].map(([name, need, solution]) => (
                <div key={name} className="rounded-card border border-line bg-surface p-5">
                  <h3 className="text-lg font-bold">{name}</h3>
                  <p className="mt-1 text-base text-ink-soft">
                    <strong className="text-ink">Bisogno:</strong> {need}
                  </p>
                  <p className="mt-1 text-base text-ink-soft">
                    <strong className="text-ink">Risposta:</strong> {solution}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-xl">Storie sociali e Story Studio</h3>
            <p className="mt-2 max-w-reading text-base text-ink-soft">
              Ogni scena è etichettata come descrittiva, prospettica, di guida o affermativa. Il rapporto (descrittive
              + prospettiche + affermative) / guida deve restare almeno 2: lo Studio lo calcola mentre si scrive e
              segnala anche il tono impositivo («devi», «fai») e le parole assolute («sempre», «mai»). Le tre storie
              native sono precaricate e non contengono dati del bambino. Le storie personalizzate, con foto e voci,
              vengono salvate in IndexedDB cifrate con AES-256-GCM; per aprire lo Studio serve di nuovo la passphrase
              dell’adulto, così il bambino non modifica le storie per caso.
            </p>
            <ul className="mt-3 max-w-reading space-y-2 text-base text-ink-soft">
              <li>Player: una pagina per schermata, nessun avanzamento automatico, testo grande e una sola immagine.</li>
              <li>
                Voce: registrazione dell’adulto con MediaRecorder; se manca, sintesi vocale con evidenziazione della
                parola quando il browser espone i confini (onboundary).
              </li>
              <li>
                Comprensione: due risposte, feedback neutro, nessun punteggio e nessuna SessionMetric. L’osservazione
                resta in coppia.
              </li>
              <li>
                Simboli: dodici segni geometrici e foto caricate dal dispositivo, sempre disponibili offline. In più la
                ricerca CAA nella libreria ARASAAC: la parola viene inviata solo quando l’adulto preme «Cerca nella
                libreria CAA online». I risultati restano in una cache pubblica sul dispositivo e il simbolo scelto
                viene incorporato nella storia, quindi le immagini restano visibili anche senza rete. Dallo Studio
                l’adulto vede quanti pittogrammi sono salvati e può svuotare la sola cache CAA, senza toccare storie,
                foto o voci. Lo stesso conteggio compare nella libreria delle storie, sotto l’attribuzione ARASAAC.
              </li>
            </ul>
            <p className="mt-3 max-w-reading text-sm text-ink-soft">
              Pittogrammi ARASAAC: autore Sergio Palao, origine ARASAAC (arasaac.org), licenza CC BY-NC-SA 4.0,
              titolare Gobierno de Aragón. La licenza consente l’uso solo senza scopo di lucro e con attribuzione;
              per questo Ponti resta un prototipo non commerciale. La cache contiene solo immagini e parole
              pubbliche: nessuna query e nessun dato del bambino.
            </p>
          </section>

          <section id="metriche" className="scroll-mt-28" aria-labelledby="metriche-heading">
            <h2 id="metriche-heading" className="text-3xl">
              5. Metriche e interoperabilità
            </h2>
            <p className="mt-3 max-w-reading text-base text-ink-soft">
              Il tracciato locale usa un modello tipizzato già vicino a FHIR. L’esportazione produce{" "}
              <code>Patient</code>, <code>CarePlan</code> e una <code>Observation</code> per sessione, con codici locali
              finché LOINC e SNOMED CT non saranno validati dall’équipe.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-left text-base">
                <caption className="sr-only">Metriche registrate e mappatura FHIR</caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="py-3 pr-4 font-bold">Metrica</th>
                    <th scope="col" className="py-3 pr-4 font-bold">Definizione nel prototipo</th>
                    <th scope="col" className="py-3 font-bold">Mappatura</th>
                  </tr>
                </thead>
                <tbody className="align-top text-ink-soft">
                  {[
                    ['Latenza di risposta', 'Primo tocco meno comparsa dello stimolo, in ms.', 'Observation.component (ms)'],
                    ['Livello di fading', '1–4, scelto dall’adulto e registrato a fine sessione.', 'Observation.component (valueInteger)'],
                    ['Accuratezza reversibili', 'Prove corrette / prove totali del modulo Sintassi.', 'Observation.component (%)'],
                    ['Pausa intersillabica', 'Pausa più lunga / durata attiva, stima dall’inviluppo.', 'Observation.component (ratio)'],
                    ['Sessioni e prove', 'Conteggi per modulo, senza giudizio di velocità.', 'Observation.valueInteger'],
                  ].map(([metric, definition, mapping]) => (
                    <tr key={metric} className="border-b border-line align-top">
                      <th scope="row" className="py-3 pr-4 font-bold text-ink">{metric}</th>
                      <td className="py-3 pr-4">{definition}</td>
                      <td className="py-3">{mapping}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Nessuna metrica è presentata come esito clinico: sono indicatori di pratica da discutere in seduta.
            </p>
          </section>

          <section id="privacy" className="scroll-mt-28" aria-labelledby="privacy-heading">
            <h2 id="privacy-heading" className="text-3xl">
              6. Privacy, limiti e prossimi passi
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-surface p-5">
                <h3 className="text-lg font-bold">Cosa è già privacy-by-design</h3>
                <ul className="mt-2 space-y-2 text-base text-ink-soft">
                  <li>Nessun account, nessuna telemetria, nessuna richiesta di rete.</li>
                  <li>Sessioni e audio cifrati con AES-256-GCM in IndexedDB, cancellabili in un tocco.</li>
                  <li>Storie personalizzate, foto e voci registrate cifrate con la stessa chiave della cassaforte.</li>
                  <li>Chiave derivata con PBKDF2-SHA-256 (310.000 iterazioni) e tenuta solo in memoria.</li>
                  <li>Pseudonimo nel profilo; l’esportazione non include audio.</li>
                  <li>Nessun ASR commerciale: il giudizio resta umano.</li>
                </ul>
              </div>
              <div className="rounded-card border-2 border-agent-line bg-agent-fill p-5">
                <h3 className="text-lg font-bold text-agent-ink">Cosa manca prima dell’uso reale</h3>
                <ul className="mt-2 space-y-2 text-base text-agent-ink">
                  <li>Non esiste autenticazione per il pannello clinico né separazione dei ruoli.</li>
                  <li>L’esportazione JSON è in chiaro: va condivisa solo con chi segue il bambino.</li>
                  <li>Nome e preferenze restano in localStorage, fuori dalla cassaforte.</li>
                  <li>Non esiste recupero della passphrase: se si dimentica, i dati non si riaprono.</li>
                  <li>Nessuna validazione clinica dei contenuti e delle soglie.</li>
                </ul>
              </div>
            </div>

            <h3 className="mt-8 text-xl">La cassaforte locale</h3>
            <p className="mt-2 max-w-reading text-base text-ink-soft">
              Prima di entrare nelle attività, l’adulto crea una passphrase. Ogni sessione e ogni registrazione viene
              cifrata singolarmente con AES-256-GCM (IV casuale, dati associati legati all’identificativo del record).
              La chiave è derivata con PBKDF2-HMAC-SHA-256, 310.000 iterazioni e salt casuale, non è estraibile e vive
              solo in memoria: ricaricando la pagina la cassaforte torna chiusa. La passphrase non viene mai salvata.
              I dati creati prima dell’attivazione vengono cifrati al primo sblocco; se la cifratura di un record non
              riesce, il record resta in chiaro invece di essere cancellato, e va segnalato al clinico. Da Progressi
              l’adulto può cambiare la passphrase: l’archivio viene decifrato e ri-cifrato con una nuova chiave e un
              nuovo salt in un’unica transazione; se un record non si legge, il cambio si interrompe e non viene scritto
              nulla. La modalità “Continua senza salvare” permette di provare le attività senza conservare nulla.
            </p>

            <h3 className="mt-8 text-xl">Limiti espliciti</h3>
            <ul className="mt-2 space-y-2 text-base text-ink-soft">
              <li>
                Ponti non è un dispositivo medico e non formula diagnosi. È un supporto alla pratica guidata
                dall’adulto.
              </li>
              <li>
                Il modulo ritmico non può sostituire il cueing tattile e propriocettivo di PROMPT o DTTC: allena
                timing e continuità, non riorganizza la propriocezione articolatoria.
              </li>
              <li>
                Il riconoscimento vocale automatico è escluso per progetto: sui quadri DVE produce falsi negativi e
                frustrazione.
              </li>
            </ul>

            <h3 className="mt-8 text-xl">Prossimi passi tecnici</h3>
            <ol className="mt-2 space-y-2 text-base text-ink-soft">
              <li>1. Cifratura anche del profilo locale e delle preferenze.</li>
              <li>2. Pannello clinico autenticato con ruoli separati e audit locale delle esportazioni.</li>
              <li>3. Endpoint FHIR e validazione dei mapping LOINC/SNOMED con il logopedista.</li>
              <li>4. Confronto sovrapposto modello/registrazione e revisione asincrona del clinico.</li>
              <li>5. Packaging Capacitor con permessi microfono dichiarati e test su tablet reali.</li>
              <li>6. Ampliamento degli stimoli con supervisione clinica e test di usabilità con la famiglia.</li>
            </ol>

            <p className="mt-6 text-sm text-ink-soft">
              Riferimenti di progetto: ISO 21801-1:2020, W3C COGA, WCAG 2.2, HL7 FHIR R4/R5, letteratura White-Sutton
              / POGZ raccolta in <em>doc/</em>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
