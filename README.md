# Ponti

Ambiente di apprendimento accessibile per bambini con profilo **White-Sutton / POGZ**, disprassia verbale evolutiva e fragilità delle funzioni esecutive. Prototipo web-first (PWA) pensato per tablet e desktop, con un adulto accanto.

> Ponti non è un dispositivo medico e non formula diagnosi. È un supporto alla pratica guidata: le decisioni cliniche restano del logopedista e del neuropsichiatra.

## Avvio

```bash
npm install
npm run dev        # http://127.0.0.1:5180
npm run build      # typecheck + build di produzione
npm run preview    # anteprima del build
```

Il build è relativo (`base: './'`) e non richiede un server: può essere impacchettato con Capacitor senza riscrivere il frontend.

## Controlli automatici

Prima di ogni deploy il workflow esegue il typecheck, il build di produzione e un audit WCAG con Playwright e axe-core su landing, cassaforte, Oggi, Guida e impostazioni. L’audit apre davvero la cassaforte e controlla anche le sei schermate dei moduli: Sintassi, Matrix-Talk, Ritmo, Trama, Social Deck e Storie. Per ripeterlo in locale:

```bash
npm run build
npx playwright install chromium
npm run test:a11y
```

L’audit automatico copre i controlli WCAG rilevabili dal browser; non sostituisce una prova manuale con tastiera e lettore di schermo.

## Pubblicazione

Il sito è pubblicato su GitHub Pages a ogni push su `main`:

**https://micheletizzani.github.io/ponti/**

Il workflow `.github/workflows/deploy-pages.yml` esegue `npm ci`, `npm run build` e pubblica `dist/` tramite GitHub Actions. I percorsi relativi funzionano anche nella sottocartella `/ponti/`. L’anteprima Freebuff resta un ambiente separato.

## Stack

- **React 18 + Vite 5 + TypeScript strict** (`noUncheckedIndexedAccess` attivo).
- **Tailwind CSS** con token in variabili CSS per contrasto, scala testo e colori dei ruoli sintattici.
- **Zustand** (persistito) per profilo e preferenze; stato di esercizio locale ai moduli.
- **Dexie / IndexedDB** per sessioni e registrazioni: nessuna chiamata di rete.
- **Web Audio API** per metronomo e inviluppo di ampiezza; **MediaRecorder** per la voce.
- **SpeechSynthesis** con voce italiana, sempre avviata da un gesto dell’utente.
- Router hash-based e service worker per l’uso offline.

## Struttura

```
src/
  components/   AppShell, dialoghi, arte SVG, registratore, primitive accessibili
  data/         stimoli e contenuti clinici (nessuna logica)
  lib/          router, store, Dexie, audio, voce, metriche, export FHIR
  modules/      Matrix-Talk, Sintassi, Ritmo, Trama, Social Deck
  pages/        Oggi, Moduli, Progressi, Storie, Guida, Landing
  types/        dominio tipizzato (UserProfile, SessionMetric, SyntaxNode…)
public/         manifest PWA, service worker, icona
doc/            documentazione clinica di partenza
```

## Font e design system

- **Atkinson Hyperlegible** (Braille Institute) per testo e controlli: lettere differenziate (`I`, `l`, `1`; `O`, `0`), forme aperte, buona spaziatura. Auto-ospitato con `@fontsource`, nessuna chiamata a Google Fonts.
- **Lexend** per i titoli, progettato per ridurre lo stress visivo. Solo titoli brevi, peso medio, nessun maiuscolo esteso.
- Corpo 1,06 rem (≈18 px), interlinea 1,65, scala utente 100 / 112,5 / 125%.
- Bersagli di tocco ≥ 64 px; tessere di frase ≥ 96 px; bordi netti e stato di focus visibile da 3 px.
- Sfondo crema antiriflesso, texture appena percepibile, nessun bianco abbagliante.
- **Chiave di Fitzgerald** per i ruoli sintattici: arancione = agente, verde = verbo, giallo = paziente, blu = luogo/tempo. I colori non sono decorativi e restano leggibili in alto contrasto.

## Accessibilità cognitiva implementata

- Nessun timer, countdown, clessidra o punteggio basato sulla velocità.
- Massimo 3–4 elementi focali per schermata; nessuna decorazione animata.
- Errorless learning: ai livelli di aiuto 1–2 le scelte incoerenti sono disattivate; a 3–4 sono provabili con spiegazione neutra. Nessun suono di errore.
- Blocco dell’input durante la spiegazione vocale (impostazione `inputLockMs`, 2 s).
- L’audio parte solo su richiesta e ogni contenuto vocale è anche scritto.
- Modalità “Fermo” per disattivare le animazioni, oltre a `prefers-reduced-motion`.
- Alto contrasto, dimensione testo, velocità voce, audio on/off, suggerimenti adulto on/off.
- Co-learning: pannello adulto, self-talk registrato, registrazione per la revisione del logopedista.

## Moduli

1. **Matrix-Talk** — matrici 2×2 con quattro livelli di fading: guida completa, domande chiave, cue minimo, self-talk registrato.
2. **Sintassi dinamica** — slot Fitzgerald, scena 2D derivata dalla frase, conversione attivo ↔ passivo che conserva il significato, ruoli tematici espliciti.
3. **Ritmo e sillabe** — onda continua, sfere grandi/piccole per l’accento, metronomo discreto, registrazione locale con stima della pausa più lunga. Nessun ASR.
4. **Trama e nessi** — tre quadri e connettivi espliciti (`PRIMA`, `DOPO`, `PERCHÉ`, `QUINDI`), narrazione finale.
5. **Social Deck** — tessere di interessi e script aperti per avviare il dialogo, con domanda di ritorno per l’adulto.
6. **Storie sociali** — tre storie native ispirate a Gray 10.2, player a pagine con voce dell’adulto e parole evidenziate, domanda finale senza punteggio; Story Studio no-code per creare storie con foto, dodici simboli sempre offline e, su richiesta esplicita, la ricerca CAA ARASAAC per parola, con il rapporto descrittive/guida calcolato in tempo reale.

## Dati e privacy

- Local-first: sessioni e audio in IndexedDB, cancellabili dalla pagina Progressi.
- Nessun account e nessuna telemetria. Nessuna chiamata automatica a servizi esterni: la ricerca CAA ARASAAC parte solo quando l’adulto preme il pulsante e invia solo la parola cercata.
- **Cassaforte locale con AES-256-GCM.** La chiave è derivata dalla passphrase dell’adulto con PBKDF2-HMAC-SHA-256 (310.000 iterazioni, salt casuale), non è estraibile e resta solo in memoria. Ogni record ha IV casuale e dati associati legati al proprio id. La passphrase non viene salvata da nessuna parte.
- All’ingresso nelle attività l’adulto crea o inserisce la passphrase; “Continua senza salvare” permette di usare il prototipo senza conservare nulla. Ricaricando la pagina la cassaforte torna chiusa, oppure si blocca subito da Progressi.
- Da Progressi l’adulto può cambiare la passphrase: sessioni e registrazioni vengono decifrate e ri-cifrate con una nuova chiave e un nuovo salt in un’unica transazione. Se la passphrase attuale è errata o un record non si legge, il cambio si interrompe senza modificare nulla.
- I dati creati prima dell’attivazione vengono cifrati al primo sblocco. Se un record non può essere cifrato, resta in chiaro invece di essere cancellato e va segnalato al clinico.
- Le storie sociali personalizzate (testi, foto caricate, pittogrammi CAA, voci registrate) sono salvate nella tabella cifrata `storiesEnc`; le tre storie native vivono nel codice e non contengono dati del bambino. Lo Story Studio richiede la passphrase dell’adulto.
- I pittogrammi scelti vengono incorporati nella storia come data URL, quindi le immagini si vedono anche senza rete. La cache `caaSymbols` contiene al massimo 240 immagini e parole pubbliche ARASAAC (nessuna query, nessun dato del bambino), si popola solo con una ricerca esplicita e viene cancellata da “Cancella dati e passphrase”. Dallo Story Studio l’adulto vede il conteggio aggiornato e può svuotare la sola cache CAA, senza toccare storie, foto o voci; lo stesso conteggio compare nella libreria Storie, sotto l’attribuzione ARASAAC.
- Esportazione JSON con struttura vicina a FHIR (`Patient`, `CarePlan`, `Observation`); i codici sono locali finché non saranno validati LOINC/SNOMED CT. L’export è in chiaro.
- **Non ancora pronto per dati reali:** mancano autenticazione del pannello clinico, separazione dei ruoli, cifratura di nome/preferenze (localStorage) e validazione clinica delle soglie. Non esiste recupero della passphrase: se viene dimenticata, i dati non si riaprono.

## Limiti

- Il modulo ritmico non sostituisce il cueing tattile e propriocettivo di PROMPT o DTTC.
- Il riconoscimento vocale automatico è escluso per progetto: sui quadri DVE produce falsi negativi e frustrazione.
- Il posizionamento delle tessere è tap-to-place con spazio attivo e “Scambia i personaggi”, scelto al posto del trascinamento per ridurre il carico motorio fine; il drag-and-drop è un’evoluzione possibile.
- Lo Story Studio usa dodici simboli geometrici sempre offline e, solo su richiesta esplicita, la ricerca CAA ARASAAC. La libreria è esterna e può non essere raggiungibile: in quel caso restano i simboli di base e quelli già in cache. Pittogrammi ARASAAC: autore Sergio Palao, origine ARASAAC (arasaac.org), licenza CC BY-NC-SA 4.0, titolare Gobierno de Aragón; uso consentito solo senza scopo di lucro e con attribuzione. Il karaoke segue i confini della sintesi vocale; sulle voci registrate le parole chiave restano evidenziate ma non sincronizzate al campione audio.
- Le storie non producono metriche cliniche: la comprensione si osserva in coppia, senza punteggio.

## Documentazione

La pagina **Guida** dentro l’app (`#/app/guida`) raccoglie architettura, design system, tabella ISO 21801-1 / WCOG COGA, metriche e limiti. La cartella `doc/` contiene la documentazione clinica di partenza.
