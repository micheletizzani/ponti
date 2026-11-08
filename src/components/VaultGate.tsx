import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useAppStore } from '../lib/store';
import { clearAllData, setupVault, unlockVault, vaultStatus, VaultError } from '../lib/vault';

type GateStatus = 'checking' | 'missing' | 'locked' | 'unlocked';

/**
 * Cancello della cassaforte: prima di entrare nelle attività con dati,
 * l'adulto crea o inserisce la passphrase. La modalità senza salvataggio
 * resta disponibile, ma è dichiarata in modo esplicito e non conserva nulla.
 */
export function VaultGate({ children }: { children: ReactNode }) {
  const vaultUnlocked = useAppStore((state) => state.vaultUnlocked);
  const setVaultUnlocked = useAppStore((state) => state.setVaultUnlocked);
  const ephemeral = useAppStore((state) => state.ephemeral);
  const setEphemeral = useAppStore((state) => state.setEphemeral);
  const setAdultOpen = useAppStore((state) => state.setAdultOpen);

  const [status, setStatus] = useState<GateStatus>('checking');
  const [passphrase, setPassphrase] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    let active = true;
    void vaultStatus().then((value) => {
      if (!active) return;
      setStatus(value);
      setVaultUnlocked(value === 'unlocked');
    });
    return () => {
      active = false;
    };
  }, [setVaultUnlocked]);

  // Se la cassaforte viene bloccata da un'altra pagina, lo stato locale può
  // essere ancora "unlocked": senza chiave in memoria va trattata come chiusa.
  const effectiveStatus: GateStatus = status === 'unlocked' && !vaultUnlocked ? 'locked' : status;
  const isSetup = effectiveStatus === 'missing';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setDeleted(false);

    if (isSetup) {
      if (passphrase.trim().length < 8) {
        setError('La passphrase deve avere almeno 8 caratteri. Una frase facile da ricordare va benissimo.');
        return;
      }
      if (passphrase !== confirmation) {
        setError('Le due passphrase non coincidono. Scrivila di nuovo con calma.');
        return;
      }
      setBusy(true);
      try {
        await setupVault(passphrase);
        setStatus('unlocked');
        setVaultUnlocked(true);
        // Chi ha appena scritto la passphrase è un adulto: l'area adulti resta aperta
        // finché non passa il tablet al bambino.
        setAdultOpen(true);
        setEphemeral(false);
        setPassphrase('');
        setConfirmation('');
      } catch (caught) {
        setError(
          caught instanceof VaultError
            ? caught.message
            : 'Non riesco a creare la cassaforte su questo dispositivo. Riprova.',
        );
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!passphrase) {
      setError('Scrivi la passphrase per sbloccare i dati.');
      return;
    }
    setBusy(true);
    try {
      const ok = await unlockVault(passphrase);
      if (!ok) {
        setError('La passphrase non è corretta. Riprova con calma: non ci sono limiti di tentativi.');
        return;
      }
      setStatus('unlocked');
      setVaultUnlocked(true);
      setAdultOpen(true);
      setEphemeral(false);
      setPassphrase('');
    } catch (caught) {
      setError(caught instanceof VaultError ? caught.message : 'Non riesco a leggere la cassaforte. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const removeEverything = async () => {
    setBusy(true);
    setError(null);
    try {
      await clearAllData();
      setStatus('missing');
      setVaultUnlocked(false);
      setEphemeral(false);
      setConfirmDelete(false);
      setDeleted(true);
    } finally {
      setBusy(false);
    }
  };

  if (vaultUnlocked) return <>{children}</>;

  if (ephemeral) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3">
          <p className="max-w-reading text-base text-agent-ink">
            <strong>Modalità senza salvataggio.</strong> Le prove e le registrazioni di questa sessione non verranno
            conservate sul dispositivo.
          </p>
          <button type="button" onClick={() => setEphemeral(false)} className="ponti-btn-quiet min-h-16">
            Apri la cassaforte
          </button>
        </div>
        {children}
      </div>
    );
  }

  if (status === 'checking' || vaultUnlocked) {
    return (
      <div role="status" className="ponti-card mx-auto max-w-reading p-6">
        <p className="text-lg text-ink-soft">Controllo la cassaforte locale…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[42rem] py-4">
      <section className="ponti-card p-6 sm:p-8" aria-labelledby="vault-heading">
        <p className="ponti-label">Cassaforte locale · AES-256-GCM</p>
        <h1 id="vault-heading" className="mt-2 text-3xl leading-tight sm:text-4xl">
          {isSetup ? 'Proteggi i dati della seduta' : 'Sblocca i dati'}
        </h1>
        <p className="mt-3 max-w-reading text-base text-ink-soft">
          {isSetup
            ? 'Sessioni e registrazioni vocali vengono cifrate sul dispositivo. La chiave nasce dalla passphrase scelta dall’adulto e resta solo in memoria: dopo un ricaricamento va reinserita.'
            : 'Le sessioni e le registrazioni vocali di questo dispositivo sono cifrate. Inserisci la passphrase scelta dall’adulto per aprirle.'}
        </p>

        {deleted && (
          <p role="status" className="mt-4 rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink">
            Dati, registrazioni e passphrase sono stati cancellati. Puoi crearne una nuova quando vuoi.
          </p>
        )}

        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          {error && (
            <p role="alert" className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="vault-passphrase" className="block text-lg font-bold">
              Passphrase
            </label>
            <p id="vault-passphrase-help" className="mt-1 text-sm text-ink-soft">
              Una frase segreta che conoscono solo gli adulti, di almeno 8 caratteri (per esempio «gatto blu sul
              tetto»). Non viene salvata da nessuna parte.
            </p>
            <input
              id="vault-passphrase"
              type={showPassphrase ? 'text' : 'password'}
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              autoComplete={isSetup ? 'new-password' : 'current-password'}
              aria-describedby="vault-passphrase-help"
              disabled={busy}
              className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
            />
          </div>

          {isSetup && (
            <div>
              <label htmlFor="vault-confirmation" className="block text-lg font-bold">
                Ripeti la passphrase
              </label>
              <input
                id="vault-confirmation"
                type={showPassphrase ? 'text' : 'password'}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
                disabled={busy}
                className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
              />
            </div>
          )}

          <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
            <input
              type="checkbox"
              checked={showPassphrase}
              onChange={(event) => setShowPassphrase(event.target.checked)}
              className="h-6 w-6 accent-[var(--accent)]"
            />
            <span className="text-base">Mostra la passphrase</span>
          </label>

          <button type="submit" disabled={busy} className="ponti-btn-primary w-full sm:w-auto">
            {busy ? 'Sto aprendo la cassaforte…' : isSetup ? 'Crea la cassaforte' : 'Sblocca'}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setEphemeral(true);
            }}
            className="ponti-btn-quiet"
          >
            Continua senza salvare
          </button>
          <a href="#/app/guida" className="ponti-link text-sm">
            Leggi come funziona la cifratura
          </a>
        </div>

        {isSetup ? (
          <p className="mt-5 text-sm text-ink-soft">
            Se dimentichi la passphrase, i dati cifrati non si possono recuperare: non esiste una copia della chiave.
            Puoi comunque cancellarli e ricominciare.
          </p>
        ) : (
          <details className="mt-6 rounded-card border border-line bg-paper-deep p-4">
            <summary className="min-h-16 cursor-pointer list-none text-base font-bold [&::-webkit-details-marker]:hidden">
              Ho dimenticato la passphrase
            </summary>
            <p className="mt-2 text-base text-ink-soft">
              Senza passphrase i dati non sono recuperabili. Puoi cancellare sessioni, registrazioni e cassaforte, poi
              creare una nuova passphrase.
            </p>
            {!confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)} className="ponti-btn-quiet mt-3 min-h-16">
                Cancella dati e passphrase
              </button>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-tile border-2 border-agent-line bg-agent-fill p-3">
                <p className="text-base text-agent-ink">Cancello tutto? L’operazione non si può annullare.</p>
                <button type="button" onClick={() => void removeEverything()} disabled={busy} className="ponti-btn-primary">
                  Sì, cancella tutto
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="ponti-btn-quiet">
                  No, lascia tutto
                </button>
              </div>
            )}
          </details>
        )}
      </section>
    </div>
  );
}
