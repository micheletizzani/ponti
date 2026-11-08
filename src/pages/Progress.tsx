import { useEffect, useState, type FormEvent } from 'react';
import type { RecordingMeta, SessionMetric } from '../types/domain';
import { changePassphrase, clearAllData, loadRecordings, loadSessions, lockVault, VaultError } from '../lib/vault';
import { formatPercent, formatSeconds, summarizeByModule } from '../lib/metrics';
import { buildExport } from '../lib/fhir';
import { useAppStore } from '../lib/store';
import { MODULES } from '../data/content';
import { childWords } from '../lib/words';

export function Progress() {
  const profile = useAppStore((state) => state.profile);
  const vaultUnlocked = useAppStore((state) => state.vaultUnlocked);
  const setVaultUnlocked = useAppStore((state) => state.setVaultUnlocked);
  const setEphemeral = useAppStore((state) => state.setEphemeral);
  const [sessions, setSessions] = useState<SessionMetric[]>([]);
  const [recordings, setRecordings] = useState<RecordingMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [currentPassphrase, setCurrentPassphrase] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrases, setShowPassphrases] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState<string | null>(null);

  const refresh = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const [loadedSessions, loadedRecordings] = await Promise.all([loadSessions(), loadRecordings()]);
    setSessions(loadedSessions);
    setRecordings(loadedRecordings);
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const summaries = summarizeByModule(sessions);
  const totalItems = sessions.reduce((sum, session) => sum + session.items, 0);
  const totalCorrect = sessions.reduce((sum, session) => sum + session.correct, 0);

  const download = () => {
    const payload = buildExport(sessions, profile);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ponti-esportazione-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordChanged(null);

    if (!currentPassphrase) {
      setPasswordError('Scrivi la passphrase attuale.');
      return;
    }
    if (newPassphrase.trim().length < 8) {
      setPasswordError('La nuova passphrase deve avere almeno 8 caratteri.');
      return;
    }
    if (newPassphrase !== confirmPassphrase) {
      setPasswordError('Le due nuove passphrase non coincidono. Scrivila di nuovo con calma.');
      return;
    }
    if (newPassphrase === currentPassphrase) {
      setPasswordError('La nuova passphrase deve essere diversa da quella attuale.');
      return;
    }

    setPasswordBusy(true);
    try {
      const result = await changePassphrase(currentPassphrase, newPassphrase);
      // Senza stato di caricamento: il modulo resta aperto e mostra l’esito.
      await refresh(false);
      setCurrentPassphrase('');
      setNewPassphrase('');
      setConfirmPassphrase('');
      setPasswordChanged(
        `Passphrase cambiata. Ho ri-cifrato ${result.sessions} sessioni, ${result.recordings} registrazioni, ${result.stories} storie e ${result.records} note dell’area adulti: restano tutte leggibili.`,
      );
    } catch (caught) {
      setPasswordError(
        caught instanceof VaultError
          ? caught.message
          : 'Non riesco a cambiare la passphrase. Non ho modificato nulla.',
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-reading">
        <p className="ponti-label">Progressi</p>
        <h1 className="mt-2 text-4xl">Quello che è successo</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Le sessioni sono salvate solo su questo dispositivo. Qui non trovi punteggi di velocità, solo cose utili da
          rivedere con il clinico.
        </p>
      </div>

      {!vaultUnlocked && (
        <section className="rounded-card border-2 border-agent-line bg-agent-fill p-5 sm:p-6" aria-labelledby="cassaforte-chiusa">
          <h2 id="cassaforte-chiusa" className="text-2xl text-agent-ink">
            I dati sono nella cassaforte
          </h2>
          <p className="mt-2 max-w-reading text-base text-agent-ink">
            Sessioni e registrazioni sono cifrate. Per vederle serve la passphrase dell’adulto; se non l’hai ancora
            creata, puoi farlo ora.
          </p>
          <button type="button" onClick={() => setEphemeral(false)} className="ponti-btn-primary mt-4">
            Sblocca o crea la passphrase
          </button>
        </section>
      )}

      {!vaultUnlocked ? null : loading ? (
        <p role="status" className="text-lg text-ink-soft">
          Sto leggendo i dati sul dispositivo…
        </p>
      ) : sessions.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-2xl">Ancora nessuna sessione</h2>
          <p className="mt-2 max-w-reading text-base text-ink-soft">
            Quando concludi un’attività con “Ho finito per oggi”, qui compaiono le prove, la latenza e il livello di
            aiuto raggiunto.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#/app/moduli" className="ponti-btn-primary">
              Scegli un modulo
            </a>
            <a href="#/app/guida" className="ponti-btn-quiet">
              Come leggere questi dati
            </a>
          </div>
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3" aria-label="Sintesi">
            <div className="rounded-card border border-line bg-surface p-5">
              <p className="ponti-label">Sessioni</p>
              <p className="mt-2 text-4xl">{sessions.length}</p>
            </div>
            <div className="rounded-card border border-line bg-surface p-5">
              <p className="ponti-label">Prove completate</p>
              <p className="mt-2 text-4xl">{totalItems}</p>
            </div>
            <div className="rounded-card border border-line bg-surface p-5">
              <p className="ponti-label">Senza aiuto</p>
              <p className="mt-2 text-4xl">{totalCorrect}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {totalItems > 0 ? formatPercent(totalCorrect / totalItems) : '—'} delle prove
              </p>
            </div>
          </section>

          <section aria-labelledby="per-modulo">
            <h2 id="per-modulo" className="text-2xl">
              Per modulo
            </h2>
            <div className="mt-4 space-y-3">
              {summaries.map((summary) => {
                const info = MODULES.find((module) => module.id === summary.moduleId);
                return (
                  <div key={summary.moduleId} className="rounded-card border border-line bg-surface p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold">{info?.name ?? summary.moduleId}</h3>
                      <p className="text-sm text-ink-soft">{summary.sessions} sessioni</p>
                    </div>
                    <dl className="mt-3 grid gap-3 text-base sm:grid-cols-4">
                      <div>
                        <dt className="text-sm text-ink-soft">Prove</dt>
                        <dd className="font-bold">{summary.items}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-ink-soft">Senza aiuto</dt>
                        <dd className="font-bold">{formatPercent(summary.accuracy)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-ink-soft">Latenza media</dt>
                        <dd className="font-bold">{formatSeconds(summary.averageLatencyMs)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-ink-soft">Aiuto minimo raggiunto</dt>
                        <dd className="font-bold">{summary.bestScaffold ? `Livello ${summary.bestScaffold}` : '—'}</dd>
                      </div>
                    </dl>
                    {summary.moduleId === 'sintassi' && summary.reversibleAccuracy !== null && (
                      <p className="mt-3 text-sm text-ink-soft">
                        Accuratezza media su frasi reversibili: {formatPercent(summary.reversibleAccuracy)}.
                      </p>
                    )}
                    {summary.moduleId === 'ritmo' && summary.lastSsi !== null && (
                      <div className="mt-3 flex items-center gap-3">
                        <p className="text-sm text-ink-soft">Pausa intersillabica stimata</p>
                        <div className="h-3 w-40 overflow-hidden rounded-full bg-paper-deep" aria-hidden="true">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(summary.lastSsi * 100)}%` }} />
                        </div>
                        <span className="text-sm font-bold">{Math.round(summary.lastSsi * 100)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>


          <details className="rounded-card border border-line bg-surface p-5">
            <summary className="min-h-16 cursor-pointer list-none text-lg font-bold [&::-webkit-details-marker]:hidden">
              Come si leggono queste metriche
            </summary>
            <dl className="mt-4 space-y-3 text-base text-ink-soft">
              <div>
                <dt className="font-bold text-ink">Latenza di risposta</dt>
                <dd>Tempo tra la comparsa dello stimolo e il primo tocco. Non è un voto: serve a capire il carico.</dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Livello di aiuto</dt>
                <dd>Da 1 (guida completa) a 4 (la regola viene detta a voce senza aiuto). Più alto è meglio è, ma si scende quando serve.</dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Frasi reversibili</dt>
                <dd>Quota di frasi in cui {childWords(profile.gender, '').noun} assegna correttamente agente e paziente, in forma attiva o passiva.</dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Pausa intersillabica</dt>
                <dd>
                  Stima calcolata sulla traccia audio: non è un indice clinico validato e va letta dal logopedista
                  insieme all’ascolto.
                </dd>
              </div>
            </dl>
          </details>
        </>
      )}

      {vaultUnlocked && !loading && (
        <>
        <section className="rounded-card border border-line bg-paper-deep p-5 sm:p-6" aria-labelledby="dati-heading">
          <h2 id="dati-heading" className="text-2xl">
            I tuoi dati
          </h2>
          <p className="mt-2 max-w-reading text-base text-ink-soft">
            {recordings.length === 0
              ? 'Nessuna registrazione vocale sul dispositivo.'
              : `${recordings.length} registrazioni vocali sul dispositivo, in attesa di revisione.`}{' '}
            L’esportazione contiene dati pseudonimizzati e non è cifrata: condividila solo con chi segue {childWords(profile.gender, '').noun}.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Cassaforte locale <strong>{vaultUnlocked ? 'aperta' : 'chiusa'}</strong>: AES-256-GCM, chiave derivata
            dalla passphrase e tenuta solo in memoria.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={download} className="ponti-btn-secondary">
              Esporta JSON per il clinico
            </button>
            {vaultUnlocked && (
              <button
                type="button"
                onClick={() => {
                  lockVault();
                  setVaultUnlocked(false);
                }}
                className="ponti-btn-quiet"
              >
                Blocca la cassaforte ora
              </button>
            )}
            {!confirmClear ? (
              <button type="button" onClick={() => setConfirmClear(true)} className="ponti-btn-quiet">
                Cancella dati e passphrase
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3">
                <p className="text-base text-agent-ink">Cancello sessioni, registrazioni, storie, diario, obiettivi, agende e passphrase? Non si può annullare.</p>
                <button
                  type="button"
                  onClick={() => {
                    void clearAllData().then(async () => {
                      setConfirmClear(false);
                      setCleared(true);
                      setVaultUnlocked(false);
                      setEphemeral(false);
                      await refresh();
                    });
                  }}
                  className="ponti-btn-primary"
                >
                  Sì, cancella
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="ponti-btn-quiet">
                  No, lascia tutto
                </button>
              </div>
            )}
          </div>
          {cleared && (
            <p role="status" className="mt-3 text-base text-accent-ink">
              Dati, registrazioni e passphrase cancellati. Al prossimo accesso potrai crearne una nuova.
            </p>
          )}
        </section>

        {vaultUnlocked && (
          <details className="rounded-card border border-line bg-surface p-5">
            <summary className="min-h-16 cursor-pointer list-none text-lg font-bold [&::-webkit-details-marker]:hidden">
              Cambia la passphrase
            </summary>
            <p className="mt-2 max-w-reading text-base text-ink-soft">
              Serve la passphrase attuale. Sessioni, registrazioni, storie e note dell’area adulti vengono decifrate e
              ri-cifrate con la nuova; se qualcosa non si legge, il cambio si interrompe e l’archivio resta com’era.
            </p>
            <form onSubmit={changePassword} noValidate className="mt-4 space-y-4">
              {passwordError && (
                <p
                  role="alert"
                  className="rounded-tile border-2 border-agent-line bg-agent-fill px-4 py-3 text-base text-agent-ink"
                >
                  {passwordError}
                </p>
              )}
              {passwordChanged && (
                <p
                  role="status"
                  className="rounded-tile border-2 border-verb-line bg-verb-fill px-4 py-3 text-base text-verb-ink"
                >
                  {passwordChanged}
                </p>
              )}
              <div>
                <label htmlFor="current-passphrase" className="block text-base font-bold">
                  Passphrase attuale
                </label>
                <input
                  id="current-passphrase"
                  type={showPassphrases ? 'text' : 'password'}
                  value={currentPassphrase}
                  onChange={(event) => setCurrentPassphrase(event.target.value)}
                  autoComplete="current-password"
                  disabled={passwordBusy}
                  className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
                />
              </div>
              <div>
                <label htmlFor="new-passphrase" className="block text-base font-bold">
                  Nuova passphrase
                </label>
                <p className="mt-1 text-sm text-ink-soft">Almeno 8 caratteri, diversa da quella attuale.</p>
                <input
                  id="new-passphrase"
                  type={showPassphrases ? 'text' : 'password'}
                  value={newPassphrase}
                  onChange={(event) => setNewPassphrase(event.target.value)}
                  autoComplete="new-password"
                  disabled={passwordBusy}
                  className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
                />
              </div>
              <div>
                <label htmlFor="confirm-new-passphrase" className="block text-base font-bold">
                  Ripeti la nuova passphrase
                </label>
                <input
                  id="confirm-new-passphrase"
                  type={showPassphrases ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={(event) => setConfirmPassphrase(event.target.value)}
                  autoComplete="new-password"
                  disabled={passwordBusy}
                  className="mt-2 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
                />
              </div>
              <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
                <input
                  type="checkbox"
                  checked={showPassphrases}
                  onChange={(event) => setShowPassphrases(event.target.checked)}
                  className="h-6 w-6 accent-[var(--accent)]"
                />
                <span className="text-base">Mostra le passphrase</span>
              </label>
              <button type="submit" disabled={passwordBusy} className="ponti-btn-primary">
                {passwordBusy ? 'Sto ri-cifrando l’archivio…' : 'Cambia la passphrase'}
              </button>
            </form>
          </details>
        )}
        </>
      )}
    </div>
  );
}
