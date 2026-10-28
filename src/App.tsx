import { useRoute, href } from './app/router';
import { useUpdateBanner } from './app/pwa';
import { storageOk } from './app/store';
import { HomePage, LessonPage, LessonsPage, TunePage } from './pages/Lessons';
import { ChordsPage, PlayPage, SongsPage } from './pages/Tools';

const TABS = [
  { to: '/', label: 'Início', icon: '⌂' },
  { to: '/aulas', label: 'Aulas', icon: '☰' },
  { to: '/tocar', label: 'Tocar', icon: '♪' },
  { to: '/acordes', label: 'Acordes', icon: '▦' },
  { to: '/musicas', label: 'Músicas', icon: '♫' },
];

function Page({ parts }: { parts: string[] }) {
  const [a, b] = parts;
  switch (a) {
    case undefined: return <HomePage />;
    case 'aulas': return <LessonsPage />;
    case 'aula': return <LessonPage key={b} id={b ?? ''} />;
    case 'tocar': return <PlayPage />;
    case 'acordes': return <ChordsPage />;
    case 'musicas': return <SongsPage />;
    case 'afinar': return <TunePage />;
    default:
      return (
        <div className="panel stack">
          <h1>Página não encontrada</h1>
          <a className="btn" href={href('/')}>Voltar ao início</a>
        </div>
      );
  }
}

export function App() {
  const parts = useRoute();
  const update = useUpdateBanner();
  const current = '/' + (parts[0] === 'aula' ? 'aulas' : parts[0] ?? '');

  return (
    <div className="app">
      <main className="main" id="conteudo">
        <div className="topbar">
          <a className="brand" href={href('/')}>
            <img src="./icons/icon-192.png" alt="" /> Primeiros Acordes
          </a>
        </div>
        <div className="stack" style={{ marginBottom: 16 }}>
          {!storageOk && <div className="notice bad">Este navegador não está salvando o progresso.</div>}
          {update.needRefresh && (
            <div className="notice ok" role="status">
              Tem uma versão nova do app.{' '}
              <button className="btn small primary" onClick={update.apply}>Atualizar agora</button>{' '}
              <button className="btn small ghost" onClick={update.dismiss}>Depois</button>
            </div>
          )}
          {update.offlineReady && (
            <div className="notice ok" role="status">
              Pronto para usar sem internet.{' '}
              <button className="btn small ghost" onClick={update.dismiss}>Ok</button>
            </div>
          )}
        </div>
        <Page parts={parts} />
      </main>
      <nav className="tabbar" aria-label="Navegação principal">
        {TABS.map((t) => (
          <a key={t.to} href={href(t.to)} aria-current={current === t.to ? 'page' : undefined}>
            <span className="tab-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
