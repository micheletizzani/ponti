import { useEffect, useRef } from 'react';
import type { ChildGender, ContrastMode, MotionMode, TextSize } from '../types/domain';
import { useAppStore } from '../lib/store';

const TEXT_OPTIONS: { value: TextSize; label: string; sample: string }[] = [
  { value: 's', label: 'Normale', sample: 'Aa' },
  { value: 'm', label: 'Grande', sample: 'Aa' },
  { value: 'l', label: 'Molto grande', sample: 'Aa' },
];

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const preferences = useAppStore((state) => state.preferences);
  const profile = useAppStore((state) => state.profile);
  const setPreference = useAppStore((state) => state.setPreference);
  const setDisplayName = useAppStore((state) => state.setDisplayName);
  const setGender = useAppStore((state) => state.setGender);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="settings-title"
      className="ponti-dialog w-[min(42rem,92vw)] rounded-card border border-line bg-paper p-0 text-ink"
    >
      <form method="dialog" className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ponti-label">Impostazioni</p>
            <h2 id="settings-title" className="mt-2 text-3xl">
              Come vuoi leggere
            </h2>
          </div>
          <button type="submit" className="ponti-btn-quiet min-h-16 px-5" aria-label="Chiudi le impostazioni">
            Chiudi
          </button>
        </div>

        <fieldset className="mt-8">
          <legend className="text-lg font-bold">Dimensione del testo</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {TEXT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreference('textSize', option.value)}
                aria-pressed={preferences.textSize === option.value}
                className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-tile border-2 px-3 py-3 ${
                  preferences.textSize === option.value
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <span aria-hidden="true" className={option.value === 'l' ? 'text-3xl font-bold' : option.value === 'm' ? 'text-2xl font-bold' : 'text-xl font-bold'}>
                  {option.sample}
                </span>
                <span className="text-base font-bold">{option.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="text-lg font-bold">Contrasto</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: 'soft', label: 'Pastello, riposante', detail: 'Sfondo crema, bordi morbidi' },
                { value: 'high', label: 'Alto contrasto', detail: 'Bianco, testo nero, bordi spessi' },
              ] as { value: ContrastMode; label: string; detail: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreference('contrast', option.value)}
                aria-pressed={preferences.contrast === option.value}
                className={`min-h-24 rounded-tile border-2 px-4 py-3 text-left ${
                  preferences.contrast === option.value
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <span className="block text-base font-bold">{option.label}</span>
                <span className="block text-sm text-ink-soft">{option.detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="text-lg font-bold">Movimento</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: 'full', label: 'Animazioni calme', detail: 'Un solo movimento alla volta' },
                { value: 'calm', label: 'Fermo', detail: 'Nessuna animazione, nessun movimento' },
              ] as { value: MotionMode; label: string; detail: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreference('motion', option.value)}
                aria-pressed={preferences.motion === option.value}
                className={`min-h-24 rounded-tile border-2 px-4 py-3 text-left ${
                  preferences.motion === option.value
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <span className="block text-base font-bold">{option.label}</span>
                <span className="block text-sm text-ink-soft">{option.detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="voice-rate" className="block text-lg font-bold">
              Velocità della voce
            </label>
            <p className="mt-1 text-sm text-ink-soft">Lenta è meglio: {preferences.voiceRate.toFixed(2)}×</p>
            <input
              id="voice-rate"
              type="range"
              min={0.6}
              max={1.1}
              step={0.02}
              value={preferences.voiceRate}
              onChange={(event) => setPreference('voiceRate', Number(event.target.value))}
              className="mt-3 h-16 w-full accent-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="profile-name" className="block text-lg font-bold">
              Nome di chi usa Ponti
            </label>
            <p className="mt-1 text-sm text-ink-soft">Compare nel saluto. Resta su questo dispositivo.</p>
            <input
              id="profile-name"
              type="text"
              defaultValue={profile.displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-3 min-h-16 w-full rounded-tile border-2 border-line bg-surface px-4 text-lg"
              autoComplete="off"
            />
          </div>
        </div>

        <fieldset className="mt-8">
          <legend className="text-lg font-bold">Bambina o bambino</legend>
          <p className="mt-1 text-sm text-ink-soft">Serve solo all’italiano: «stanca» o «stanco».</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(
              [
                { value: 'f', label: 'Bambina' },
                { value: 'm', label: 'Bambino' },
                { value: 'n', label: 'Non indicato' },
              ] as { value: ChildGender; label: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGender(option.value)}
                aria-pressed={profile.gender === option.value}
                className={`min-h-16 rounded-tile border-2 px-4 text-base font-bold ${
                  profile.gender === option.value
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 space-y-2">
          <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
            <input
              type="checkbox"
              checked={preferences.voiceEnabled}
              onChange={(event) => setPreference('voiceEnabled', event.target.checked)}
              className="h-6 w-6 accent-[var(--accent)]"
            />
            <span className="text-base">Leggi ad alta voce i testi di aiuto</span>
          </label>
          <label className="flex min-h-16 items-center gap-3 rounded-tile border border-line bg-surface px-4">
            <input
              type="checkbox"
              checked={preferences.dualUser}
              onChange={(event) => setPreference('dualUser', event.target.checked)}
              className="h-6 w-6 accent-[var(--accent)]"
            />
            <span className="text-base">Mostra i suggerimenti per l’adulto</span>
          </label>
        </div>

        <p className="mt-8 border-t border-line pt-5 text-sm text-ink-soft">
          Ponti non sostituisce il logopedista o il neuropsichiatra. I dati e le registrazioni restano su questo
          dispositivo. <a className="ponti-link text-sm" href="#/app/guida" onClick={onClose}>Leggi come funziona</a>
        </p>
      </form>
    </dialog>
  );
}
