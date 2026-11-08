import { useRef, useState, type FormEvent } from 'react';
import type { AdultRole } from '../types/domain';
import { PageHeader } from '../components/PageHeader';
import {
  ExchangeError,
  createExchangeFile,
  mergeGoals,
  mergeLatest,
  readExchangeFile,
  validateExchangeWord,
} from '../lib/exchange';
import { loadRecords, saveRecords } from '../lib/vault';
import { todayIso } from '../lib/words';
import { ROLE_INFO } from './AdultSpace';

/**
 * Invio e ricezione tra due dispositivi, senza server. Il file è cifrato con
 * una parola di scambio che famiglia e scuola si dicono a voce.
 */
export function Exchange({ role }: { role: AdultRole }) {
  const info = ROLE_INFO[role];
  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`#${info.path}`}
        backLabel={info.title}
        eyebrow="Scambio casa-scuola"
        title={role === 'scuola' ? 'Invia o ricevi dalla famiglia' : 'Invia o ricevi dalla scuola'}
        intro="Serve solo se usate due tablet diversi. Se il tablet viaggia nello zaino, diario e obiettivi sono già condivisi."
      />

      <ol className="grid gap-3 text-base sm:grid-cols-3">
        {[
          'Concordate a voce una parola di scambio. Non scrivetela nello stesso messaggio del file.',
          'Chi invia crea il file cifrato e lo manda: email, chiavetta, registro elettronico se la scuola lo consente.',
          'Chi riceve apre il file qui e scrive la stessa parola. Le note nuove si aggiungono, nulla viene cancellato.',
        ].map((text, index) => (
          <li key={text} className="flex gap-3 rounded-card border border-line bg-surface p-4">
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-paper">
              {index + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-2">
        <SendPanel role={role} />
        <ReceivePanel />
      </div>

      <p className="max-w-reading text-sm text-ink-soft">
        Il file contiene diario, obiettivi con osservazioni e agende personalizzate. Non contiene sessioni delle attività,
        registrazioni vocali né storie. Prima di usarlo a scuola, chiedete al dirigente e al responsabile della protezione
        dei dati quale canale è autorizzato.
      </p>
    </div>
  );
}

function SendPanel({ role }: { role: AdultRole }) {
  const [word, setWord] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setDone(null);
    const problem = validateExchangeWord(word);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      const [diary, goals, schedules] = await Promise.all([
        loadRecords('diary'),
        loadRecords('goal'),
        loadRecords('schedule'),
      ]);
      if (diary.length + goals.length + schedules.length === 0) {
        setError('Non c’è ancora niente da inviare: scrivete prima una nota o un obiettivo.');
        return;
      }
      const blob = await createExchangeFile({ from: role, diary, goals, schedules }, word);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `ponti-scambio-${role}-${todayIso()}.ponti`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setWord('');
      setDone(
        `File creato: ${diary.length} note, ${goals.length} obiettivi, ${schedules.length} agende. Ricordate di dire la parola a voce.`,
      );
    } catch (caught) {
      setError(caught instanceof ExchangeError ? caught.message : 'Non riesco a creare il file. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-card border border-line bg-surface p-5">
      <h2 className="text-2xl">Invia</h2>
      {error && (
        <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink">
          {done}
        </p>
      )}
      <div>
        <label htmlFor="send-word" className="block text-base font-bold">
          Scegli una parola di scambio
        </label>
        <p id="send-word-help" className="mt-1 text-sm text-ink-soft">
          Almeno 8 caratteri. Non è la passphrase della cassaforte: usatene una diversa.
        </p>
        <input
          id="send-word"
          type={show ? 'text' : 'password'}
          value={word}
          onChange={(event) => setWord(event.target.value)}
          autoComplete="off"
          aria-describedby="send-word-help"
          className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
        />
      </div>
      <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
        <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} className="h-6 w-6 accent-[var(--accent)]" />
        <span className="text-base">Mostra la parola</span>
      </label>
      <button type="submit" disabled={busy} className="ponti-btn-primary">
        {busy ? 'Cifro il file…' : 'Crea il file cifrato'}
      </button>
    </form>
  );
}

function ReceivePanel() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setDone(null);
    if (!fileText) {
      setError('Scegli prima il file ricevuto.');
      return;
    }
    if (!word) {
      setError('Scrivi la parola di scambio.');
      return;
    }
    setBusy(true);
    try {
      const payload = await readExchangeFile(fileText, word);
      const [diary, goals, schedules] = await Promise.all([
        loadRecords('diary'),
        loadRecords('goal'),
        loadRecords('schedule'),
      ]);
      const diaryMerge = mergeLatest(diary, payload.diary);
      const goalMerge = mergeGoals(goals, payload.goals);
      const scheduleMerge = mergeLatest(schedules, payload.schedules);
      const ok = await saveRecords([
        ...diaryMerge.toSave.map((value) => ({ kind: 'diary' as const, value })),
        ...goalMerge.toSave.map((value) => ({ kind: 'goal' as const, value })),
        ...scheduleMerge.toSave.map((value) => ({ kind: 'schedule' as const, value })),
      ]);
      if (!ok) {
        setError('Non riesco a salvare nella cassaforte. Nulla è stato importato.');
        return;
      }
      const from = payload.from === 'scuola' ? 'dalla scuola' : 'dalla famiglia';
      setDone(
        `Ricevuto ${from}: ${diaryMerge.added} note nuove, ${goalMerge.added} obiettivi nuovi e ${goalMerge.updated} aggiornati, ${scheduleMerge.added + scheduleMerge.updated} agende. Il resto era già presente.`,
      );
      setWord('');
      setFileText(null);
      setFileName(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (caught) {
      setError(caught instanceof ExchangeError ? caught.message : 'Non riesco ad aprire il file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-card border border-line bg-surface p-5">
      <h2 className="text-2xl">Ricevi</h2>
      {error && (
        <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink">
          {done}
        </p>
      )}
      <div>
        <label htmlFor="receive-file" className="block text-base font-bold">
          File ricevuto (.ponti)
        </label>
        <input
          ref={fileInput}
          id="receive-file"
          type="file"
          accept=".ponti,application/json"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            setError(null);
            setDone(null);
            if (!file) {
              setFileText(null);
              setFileName(null);
              return;
            }
            setFileName(file.name);
            setFileText(await file.text());
          }}
          className="mt-2 block min-h-16 w-full rounded-tile border-2 border-dashed border-line-strong bg-paper-deep p-3 text-base"
        />
        {fileName && <p className="mt-1 text-sm text-ink-soft">Scelto: {fileName}</p>}
      </div>
      <div>
        <label htmlFor="receive-word" className="block text-base font-bold">
          La parola di scambio che vi siete detti
        </label>
        <input
          id="receive-word"
          type={show ? 'text' : 'password'}
          value={word}
          onChange={(event) => setWord(event.target.value)}
          autoComplete="off"
          className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
        />
      </div>
      <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
        <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} className="h-6 w-6 accent-[var(--accent)]" />
        <span className="text-base">Mostra la parola</span>
      </label>
      <button type="submit" disabled={busy} className="ponti-btn-primary">
        {busy ? 'Apro il file…' : 'Apri e aggiungi'}
      </button>
    </form>
  );
}
