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

Prima di ogni deploy il workflow esegue il typecheck, il build di produzione e i test Playwright:

- **audit WCAG 2.2 AA con axe-core** su landing, cassaforte, Oggi, Guida, impostazioni, le sei attività, «La mia giornata», «Racconta la giornata», «Come sto», Spazio famiglia, Spazio scuola, diario, obiettivi, agende, scambio, Progressi e area adulti chiusa;
- **flusso casa-scuola end-to-end**: la scuola scrive una nota, il tablet passa alla bambina, il racconto mostra PRIMA e POI, il Social Deck propone la novità, gli adulti aggiungono un obiettivo e un’osservazione, l’agenda avanza di un passo, e la nota sopravvive al cambio di passphrase;
- **scambio cifrato tra due dispositivi**: file creato in un contesto, aperto in un altro con una cassaforte diversa; parola sbagliata rifiutata, doppia importazione senza duplicati.

Per ripeterli in locale:

```bash
npm run build
npx playwright install chromium
npm run test:a11y
# con un Chromium già installato in un'altra versione:
PW_CHROMIUM_PATH=/percorso/chrome npm run test:a11y
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
  pages/        Oggi, Attività, Progressi, Storie, Guida, Landing,
                Spazio famiglia/scuola, Diario, Obiettivi, Agende, Scambio,
                La mia giornata, Racconta la giornata, Come sto
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

## Famiglia e scuola

La navigazione ha cinque voci fisse: **Oggi** e **Attività** per la bambina o il bambino, **Famiglia** e **Scuola** per gli adulti, **Guida**. Chi apre la cassaforte all’ingresso entra in «modalità adulto»: una striscia blu lo ricorda e il pulsante «Passa a Giulia» (o «Passa alla bambina») chiude l’area adulti prima di dare il tablet. Per rientrare serve di nuovo la passphrase.

I due spazi hanno gli stessi strumenti, con testi scritti per chi li usa:

- **Diario scuola-casa.** Nota in pochi tocchi: com’è andata (quattro stati), fino a tre momenti in prima persona scelti da quattordici carte, una cosa bella, parole nuove, segnalazioni rapide (sonno, appetito, mal di pancia, cambi, rumore, fatica con le parole, pausa chiesta). L’anteprima mostra subito come lo vedrà l’altro adulto.
- **Racconta la giornata** (vista del bambino). I momenti del diario diventano carte PRIMA, POI, ALLA FINE, con voce e suggerimenti per chi ascolta. Sono gli stessi connettivi di Trama e nessi, applicati alla giornata vera. Il Social Deck propone la stessa notizia come tessera «Novità», al posto della domanda già nota.
- **Obiettivi condivisi.** Libreria di dieci obiettivi derivati dal profilo in `doc/`, ordinati con le quattro dimensioni del modello nazionale di PEI (D.I. 182/2020, corretto dal D.I. 153/2023). Ogni obiettivo ha una sola strategia per casa e scuola e osservazioni sulla stessa scala 1–4 delle attività, con un piccolo grafico casa/scuola (forma e colore, più elenco testuale). Le attività collegate agli obiettivi attivi diventano le prime suggerite in Oggi.
- **Agende visive.** Cinque agende pronte (mattina e pranzo a scuola, mattina e sera a casa, logopedia) e un editor con simboli offline o pittogrammi ARASAAC. Il bambino le vede in «La mia giornata»: tutta la giornata oppure solo «Prima / Poi», con «Fatto» e la possibilità di tornare indietro.
- **Come sto.** Quattro stati con volto e parola, poi tre aiuti: respiro guidato dal cerchio (manuale in modalità «Fermo»), carta «Ho bisogno di una pausa», carta «Mi aiuti?», leggibili ad alta voce. Non salva nulla.
- **Scambio cifrato.** Se famiglia e scuola usano due tablet: file `.ponti` cifrato con AES-256-GCM e chiave derivata da una parola di scambio concordata a voce. All’importazione le note nuove si aggiungono, le osservazioni degli obiettivi si sommano, vince la versione più recente; nulla viene cancellato.
- **Guide pratiche.** Sei indicazioni per casa e sei per la classe. Ognuna dice da dove viene e quanto è solida; dove le prove sono deboli o contrastanti (storie sociali, pratica dei genitori nella DVE) lo dice.

Il profilo chiede nome e «bambina / bambino / non indicato»: serve solo all’accordo dei testi italiani («stanca», «sono andata»). Le storie pronte usano il marcatore `{o|a}` e la figura della bambina quando serve.

## Dati e privacy

- Local-first: sessioni e audio in IndexedDB, cancellabili dalla pagina Progressi.
- Nessun account e nessuna telemetria. Nessuna chiamata automatica a servizi esterni: la ricerca CAA ARASAAC parte solo quando l’adulto preme il pulsante e invia solo la parola cercata.
- **Cassaforte locale con AES-256-GCM.** La chiave è derivata dalla passphrase dell’adulto con PBKDF2-HMAC-SHA-256 (310.000 iterazioni, salt casuale), non è estraibile e resta solo in memoria. Ogni record ha IV casuale e dati associati legati al proprio id. La passphrase non viene salvata da nessuna parte.
- All’ingresso nelle attività l’adulto crea o inserisce la passphrase; “Continua senza salvare” permette di usare il prototipo senza conservare nulla. Ricaricando la pagina la cassaforte torna chiusa, oppure si blocca subito da Progressi.
- Da Progressi l’adulto può cambiare la passphrase: sessioni e registrazioni vengono decifrate e ri-cifrate con una nuova chiave e un nuovo salt in un’unica transazione. Se la passphrase attuale è errata o un record non si legge, il cambio si interrompe senza modificare nulla.
- I dati creati prima dell’attivazione vengono cifrati al primo sblocco. Se un record non può essere cifrato, resta in chiaro invece di essere cancellato e va segnalato al clinico.
- Diario, obiettivi e agende personalizzate sono nella tabella cifrata `recordsEnc` (un record cifrato per voce; in chiaro restano solo id e tipo).
- Il cambio di passphrase ri-cifra sessioni, registrazioni, storie e record dell’area adulti. Prima di questa versione le storie personalizzate non venivano ri-cifrate e diventavano illeggibili dopo il cambio: corretto.
- Le storie sociali personalizzate (testi, foto caricate, pittogrammi CAA, voci registrate) sono salvate nella tabella cifrata `storiesEnc`; le tre storie native vivono nel codice e non contengono dati del bambino. Lo Story Studio richiede la passphrase dell’adulto.
- I pittogrammi scelti vengono incorporati nella storia come data URL, quindi le immagini si vedono anche senza rete. La cache `caaSymbols` contiene al massimo 240 immagini e parole pubbliche ARASAAC (nessuna query, nessun dato del bambino), si popola solo con una ricerca esplicita e viene cancellata da “Cancella dati e passphrase”. Dallo Story Studio l’adulto vede il conteggio aggiornato e può svuotare la sola cache CAA, senza toccare storie, foto o voci; lo stesso conteggio compare nella libreria Storie, sotto l’attribuzione ARASAAC.
- Esportazione JSON con struttura vicina a FHIR (`Patient`, `CarePlan`, `Observation`); i codici sono locali finché non saranno validati LOINC/SNOMED CT. L’export è in chiaro.
- **Non ancora pronto per dati reali:** Famiglia e Scuola non sono ruoli separati (stessa passphrase, stessi dati sullo stesso dispositivo: il cancello protegge dagli accessi per sbaglio, non da un adulto); nome, preferenze e avanzamento dell’agenda restano in localStorage; manca la validazione clinica delle soglie e dei contenuti. Non esiste recupero della passphrase: se viene dimenticata, i dati non si riaprono.
- **Scuola:** prima di usare Ponti per dati di un’alunna o un alunno serve l’assenso del dirigente e del responsabile della protezione dei dati. Il PEI resta il documento del GLO: Ponti ne usa solo le quattro dimensioni come etichette.

## Limiti

- Il modulo ritmico non sostituisce il cueing tattile e propriocettivo di PROMPT o DTTC.
- Il riconoscimento vocale automatico è escluso per progetto: sui quadri DVE produce falsi negativi e frustrazione.
- Il posizionamento delle tessere è tap-to-place con spazio attivo e “Scambia i personaggi”, scelto al posto del trascinamento per ridurre il carico motorio fine; il drag-and-drop è un’evoluzione possibile.
- Lo Story Studio usa dodici simboli geometrici sempre offline e, solo su richiesta esplicita, la ricerca CAA ARASAAC. La libreria è esterna e può non essere raggiungibile: in quel caso restano i simboli di base e quelli già in cache. Pittogrammi ARASAAC: autore Sergio Palao, origine ARASAAC (arasaac.org), licenza CC BY-NC-SA 4.0, titolare Gobierno de Aragón; uso consentito solo senza scopo di lucro e con attribuzione. Il karaoke segue i confini della sintesi vocale; sulle voci registrate le parole chiave restano evidenziate ma non sincronizzate al campione audio.
- Le storie non producono metriche cliniche: la comprensione si osserva in coppia, senza punteggio.

## Fonti

Le indicazioni nuove citano solo fonti verificate durante lo sviluppo (elenco completo e solidità nella Guida, sezione 8): Batzir e coll. 2020 sulla sindrome di White-Sutton (letto l’abstract), NCAEP 2020 sui supporti visivi, Knight e coll. 2015 e Spriggs e coll. 2016 sulle agende visive, Maas e coll. 2008 sui principi di apprendimento motorio, Thomas, McCabe e Ballard 2018 sulla pratica ReST condotta dai genitori, Kokina e Kern 2010 e Qi e coll. 2018 sulle storie sociali, D.I. 182/2020 e 153/2023 sul PEI, indicazioni del Garante privacy per la scuola. GeneReviews e la coorte italiana del 2025 non erano leggibili da questo ambiente: nessun dato numerico ne è stato ricavato.

## Documentazione

La pagina **Guida** dentro l’app (`#/app/guida`) raccoglie architettura, design system, tabella ISO 21801-1 / WCOG COGA, metriche e limiti. La cartella `doc/` contiene la documentazione clinica di partenza.
