import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { SettingsDialog } from './components/SettingsDialog';
import { VaultGate } from './components/VaultGate';
import { usePath } from './lib/router';
import { useAppStore } from './lib/store';
import { Landing } from './pages/Landing';
import { Modules, Today } from './pages/Today';
import { Progress } from './pages/Progress';
import { Guide } from './pages/Guide';
import { Stories } from './pages/Stories';
import { MatrixTalk } from './modules/MatrixTalk';
import { SyntaxEngine } from './modules/SyntaxEngine';
import { SpeechPacer } from './modules/SpeechPacer';
import { NarrativeWeaver } from './modules/NarrativeWeaver';
import { SocialDeck } from './modules/SocialDeck';
import { AdultRoutes } from './pages/AdultSpace';
import { Agenda } from './pages/Agenda';
import { Retell } from './pages/Retell';
import { Feelings } from './pages/Feelings';

function NotFound() {
  return (
    <div className="mx-auto max-w-reading py-16 text-center">
      <p className="ponti-label">Pagina non trovata</p>
      <h1 className="mt-3 text-4xl">Questa pagina non c’è.</h1>
      <p className="mt-3 text-lg text-ink-soft">Puoi tornare alle attività: nessun problema.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="#/app" className="ponti-btn-primary">
          Torna a Oggi
        </a>
        <a href="#/" className="ponti-btn-secondary">
          Vai alla pagina iniziale
        </a>
      </div>
    </div>
  );
}

function AppRoutes({ path }: { path: string }) {
  const adult = /^\/app\/(famiglia|scuola)(?:\/([a-z-]+))?$/.exec(path);
  if (adult) {
    const role = adult[1] === 'scuola' ? 'scuola' : 'famiglia';
    return <AdultRoutes key={role} role={role} sub={adult[2] ?? ''} />;
  }
  switch (path) {
    case '/app':
      return <Today />;
    case '/app/moduli':
      return <Modules />;
    case '/app/sintassi':
      return <SyntaxEngine />;
    case '/app/matrici':
      return <MatrixTalk />;
    case '/app/ritmo':
      return <SpeechPacer />;
    case '/app/racconto':
      return <NarrativeWeaver />;
    case '/app/sociale':
      return <SocialDeck />;
    case '/app/storie':
      return <Stories />;
    case '/app/progressi':
      return <Progress />;
    case '/app/agenda':
      return <Agenda />;
    case '/app/racconta':
      return <Retell />;
    case '/app/come-sto':
      return <Feelings />;
    case '/app/guida':
      return <Guide />;
    default:
      return <NotFound />;
  }
}

export default function App() {
  const path = usePath();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const textSize = useAppStore((state) => state.preferences.textSize);
  const contrast = useAppStore((state) => state.preferences.contrast);
  const motion = useAppStore((state) => state.preferences.motion);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.size = textSize;
    root.dataset.contrast = contrast;
    root.dataset.motion = motion;
  }, [contrast, motion, textSize]);

  const isApp = path.startsWith('/app');

  return (
    <>
      {isApp ? (
        <AppShell current={path} onOpenSettings={() => setSettingsOpen(true)}>
          {path === '/app/guida' ? (
            <AppRoutes path={path} />
          ) : (
            <VaultGate>
              <AppRoutes path={path} />
            </VaultGate>
          )}
        </AppShell>
      ) : path === '/' ? (
        <Landing onOpenSettings={() => setSettingsOpen(true)} />
      ) : (
        <NotFound />
      )}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
