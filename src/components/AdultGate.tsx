import { useState, type FormEvent, type ReactNode } from 'react';
import { useAppStore } from '../lib/store';
import { verifyPassphrase } from '../lib/vault';
import { handoffLabel } from '../lib/words';

/**
 * Cancello dell'area adulti. Non è una separazione di ruoli: su un dispositivo
 * condiviso famiglia e scuola usano la stessa cassaforte. Serve a evitare che il
 * bambino entri per sbaglio in note e impostazioni.
 *
 * Si apre da solo quando l'adulto ha appena inserito la passphrase all'ingresso
 * e resta aperto finché non preme «Passa al bambino».
 */
export function AdultGate({
  title,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  const adultOpen = useAppStore((state) => state.adultOpen);
  const setAdultOpen = useAppStore((state) => state.setAdultOpen);
  const vaultUnlocked = useAppStore((state) => state.vaultUnlocked);
  const setEphemeral = useAppStore((state) => state.setEphemeral);
  const [passphrase, setPassphrase] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const handoff = useAppStore((state) => handoffLabel(state.profile.gender, state.profile.displayName));

  if (adultOpen && vaultUnlocked) return <>{children}</>;

  const back = backHref ? (
    <a href={backHref} className="ponti-btn-quiet min-h-16 px-4">
      <span aria-hidden="true">←</span> {backLabel ?? 'Indietro'}
    </a>
  ) : null;

  if (!vaultUnlocked) {
    return (
      <div className="mx-auto max-w-[42rem] space-y-4">
        {back}
        <section className="ponti-card p-6 sm:p-8" aria-labelledby="adult-gate-heading">
          <p className="ponti-label">Area adulti</p>
          <h1 id="adult-gate-heading" className="mt-2 text-3xl leading-tight">
            {title}
          </h1>
          <p className="mt-3 max-w-reading text-base text-ink-soft">
            Qui si scrivono note sulla giornata, obiettivi e agende. Sono dati personali, quindi vengono salvati solo
            nella cassaforte cifrata. In modalità senza salvataggio quest’area resta chiusa.
          </p>
          <button type="button" onClick={() => setEphemeral(false)} className="ponti-btn-primary mt-5">
            Apri la cassaforte per entrare
          </button>
        </section>
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!passphrase) {
      setError('Scrivi la passphrase della cassaforte.');
      return;
    }
    setBusy(true);
    const ok = await verifyPassphrase(passphrase);
    setBusy(false);
    if (!ok) {
      setError('Passphrase non corretta. È la stessa frase segreta usata per aprire Ponti. Riprova con calma.');
      return;
    }
    setPassphrase('');
    setAdultOpen(true);
  };

  return (
    <div className="mx-auto max-w-[42rem] space-y-4">
      {back}
      <section className="ponti-card p-6 sm:p-8" aria-labelledby="adult-gate-heading">
        <p className="ponti-label">Area adulti</p>
        <h1 id="adult-gate-heading" className="mt-2 text-3xl leading-tight">
          {title}
        </h1>
        <p className="mt-3 max-w-reading text-base text-ink-soft">
          Per entrare scrivi la passphrase della cassaforte. Serve a evitare che si entri qui per sbaglio mentre si
          gioca. Resta aperta finché non premi «{handoff}».
        </p>
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {error && (
            <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="adult-passphrase" className="block text-lg font-bold">
              Passphrase
            </label>
            <input
              id="adult-passphrase"
              type={show ? 'text' : 'password'}
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              autoComplete="current-password"
              disabled={busy}
              className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
            />
          </div>
          <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
            <input
              type="checkbox"
              checked={show}
              onChange={(event) => setShow(event.target.checked)}
              className="h-6 w-6 accent-[var(--accent)]"
            />
            <span className="text-base">Mostra la passphrase</span>
          </label>
          <button type="submit" disabled={busy} className="ponti-btn-primary">
            {busy ? 'Controllo la passphrase…' : 'Entra'}
          </button>
        </form>
      </section>
    </div>
  );
}
