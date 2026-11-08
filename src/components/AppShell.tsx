import type { ReactNode } from 'react';
import { BrandMark } from './Brand';
import { PrototypeNotice } from './PrototypeNotice';
import { navigate } from '../lib/router';
import { useAppStore } from '../lib/store';
import { handoffLabel } from '../lib/words';

/**
 * Cinque voci, sempre le stesse: due per il bambino (Oggi, Attività), due per
 * gli adulti (Famiglia, Scuola) e la Guida. Le aree adulti chiedono la
 * passphrase se non sono già aperte.
 */
const NAV = [
  { href: '#/app', label: 'Oggi', match: (path: string) => path === '/app' },
  {
    href: '#/app/moduli',
    label: 'Attività',
    match: (path: string) =>
      ['/app/moduli', '/app/sintassi', '/app/matrici', '/app/ritmo', '/app/racconto', '/app/sociale', '/app/storie'].includes(
        path,
      ),
  },
  { href: '#/app/famiglia', label: 'Famiglia', match: (path: string) => path.startsWith('/app/famiglia') },
  { href: '#/app/scuola', label: 'Scuola', match: (path: string) => path.startsWith('/app/scuola') },
  { href: '#/app/guida', label: 'Guida', match: (path: string) => path === '/app/guida' },
];

function NavLinks({ current }: { current: string }) {
  return (
    <>
      {NAV.map((item) => {
        const active = item.match(current);
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-16 items-center rounded-xl px-4 text-base font-bold ${
              active ? 'bg-accent-soft text-accent-ink' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </>
  );
}

/** Striscia visibile solo quando l'area adulti è aperta: il passaggio del tablet diventa un gesto esplicito. */
function AdultBar() {
  const adultOpen = useAppStore((state) => state.adultOpen);
  const vaultUnlocked = useAppStore((state) => state.vaultUnlocked);
  const setAdultOpen = useAppStore((state) => state.setAdultOpen);
  const handoff = useAppStore((state) => handoffLabel(state.profile.gender, state.profile.displayName));
  if (!adultOpen || !vaultUnlocked) return null;
  return (
    <div className="border-b border-place-line bg-place-fill">
      <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <p className="text-base text-place-ink">
          <strong>Modalità adulto.</strong> Famiglia e Scuola sono aperte senza passphrase.
        </p>
        <button
          type="button"
          onClick={() => {
            setAdultOpen(false);
            navigate('/app');
          }}
          className="ponti-btn-quiet min-h-16 px-4"
        >
          {handoff}
        </button>
      </div>
    </div>
  );
}

export function AppShell({
  current,
  children,
  onOpenSettings,
}: {
  current: string;
  children: ReactNode;
  onOpenSettings: () => void;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <button
        type="button"
        onClick={() => {
          const main = document.getElementById('contenuto');
          main?.focus();
          main?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-5 focus:py-4 focus:text-lg focus:font-bold"
      >
        Vai al contenuto
      </button>
      <PrototypeNotice />
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#/app" className="flex min-h-16 items-center gap-3 rounded-xl pr-2">
            <BrandMark size={44} />
            <span className="leading-tight">
              <span className="block font-display text-xl font-semibold tracking-tight">Ponti</span>
              <span className="hidden text-sm text-ink-soft sm:block">imparare insieme</span>
            </span>
          </a>
          <nav aria-label="Sezioni dell’app" className="hidden items-center gap-1 lg:flex">
            <NavLinks current={current} />
          </nav>
          <button type="button" onClick={onOpenSettings} className="ponti-btn-quiet min-h-16 px-4">
            <span aria-hidden="true" className="text-xl">Aa</span>
            <span className="hidden sm:inline">Impostazioni</span>
            <span className="sr-only sm:hidden">Impostazioni di lettura</span>
          </button>
        </div>
        <AdultBar />
      </header>

      <main id="contenuto" tabIndex={-1} className="mx-auto w-full max-w-shell px-4 pb-32 pt-6 sm:px-6 lg:pb-16">
        {children}
      </main>

      <nav
        aria-label="Sezioni dell’app"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {NAV.map((item) => {
            const active = item.match(current);
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center rounded-xl px-1 text-sm font-bold ${
                  active ? 'bg-accent-soft text-accent-ink' : 'text-ink-soft'
                }`}
              >
                <span aria-hidden="true" className={`mb-1 h-2.5 w-2.5 rounded-full ${active ? 'bg-accent' : 'bg-line-strong'}`} />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
