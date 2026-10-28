import { LESSONS, lessonById, learnedShapes, patternById, progressionById } from '../content/lessons';
import { actions, useData } from '../app/store';
import { href, navigate } from '../app/router';
import { ChordDiagram, ChordRow } from '../ui/ChordDiagram';
import { GuitarParts, TuningButtons } from '../ui/Extras';
import { installInstructions, useInstallPrompt } from '../app/pwa';

export function nextLessonId(done: Record<string, number>) {
  return LESSONS.find((l) => !done[l.id])?.id;
}

export function HomePage() {
  const d = useData();
  const doneCount = LESSONS.filter((l) => d.done[l.id]).length;
  const next = nextLessonId(d.done);
  const nextL = next ? lessonById(next) : undefined;
  const learned = learnedShapes(d.done);
  const week = Object.entries(d.minutes)
    .filter(([k]) => Date.now() - new Date(k).getTime() < 7 * 86400000)
    .reduce((s, [, v]) => s + v, 0);
  const install = useInstallPrompt();
  const inst = installInstructions();

  return (
    <div className="stack-l">
      <div>
        <h1>Oi! Bora tocar?</h1>
        <p className="muted">Um passo de cada vez. 10 minutos por dia já fazem muita diferença.</p>
      </div>

      {nextL ? (
        <a className="panel hero-next" href={href(`/aula/${nextL.id}`)}>
          <span className="small muted">{doneCount === 0 ? 'Comece por aqui' : 'Próxima aula'}</span>
          <strong style={{ fontSize: '1.2rem' }}>{nextL.title}</strong>
          <span className="small muted">{nextL.summary} · ~{nextL.minutes} min</span>
        </a>
      ) : (
        <div className="notice ok">Você terminou todas as aulas! Agora é tocar músicas: use a tela Músicas com as cifras que você gosta.</div>
      )}

      <div className="panel stack">
        <div className="meter" aria-label={`${doneCount} de ${LESSONS.length} aulas`}><i style={{ width: `${(doneCount / LESSONS.length) * 100}%` }} /></div>
        <p className="small muted num" style={{ margin: 0 }}>
          {doneCount} de {LESSONS.length} aulas · {learned.size} acordes aprendidos · {Math.round(week)} min tocando junto nesta semana
        </p>
      </div>

      <div className="grid2">
        <a className="panel tile" href={href('/tocar')}><strong>Tocar junto</strong><span className="small muted">Clique e batida para treinar as trocas</span></a>
        <a className="panel tile" href={href('/afinar')}><strong>Afinar</strong><span className="small muted">O som de cada corda</span></a>
        <a className="panel tile" href={href('/acordes')}><strong>Meus acordes</strong><span className="small muted">Todos os desenhos</span></a>
        <a className="panel tile" href={href('/musicas')}><strong>Essa música dá?</strong><span className="small muted">Cole a cifra e veja o capo</span></a>
      </div>

      {!install.installed && (
        <details className="panel">
          <summary><strong>Instalar no celular</strong></summary>
          {install.canPrompt ? (
            <button className="btn primary" style={{ marginTop: 10 }} onClick={() => void install.prompt()}>Instalar app</button>
          ) : (
            <ol className="small">{inst.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          )}
          <p className="small muted">Instalado, funciona sem internet. O progresso fica salvo só neste aparelho.</p>
        </details>
      )}
    </div>
  );
}

export function LessonsPage() {
  const d = useData();
  const next = nextLessonId(d.done);
  return (
    <div className="stack-l">
      <div>
        <h1>Aulas</h1>
        <p className="muted">Na ordem, cada uma usa o que veio antes. Pode voltar em qualquer uma quando quiser.</p>
      </div>
      <ul className="clean panel">
        {LESSONS.map((l, i) => {
          const done = !!d.done[l.id];
          return (
            <li key={l.id}>
              <a className="lesson-row" href={href(`/aula/${l.id}`)}>
                <span className={`state ${done ? 'done' : l.id === next ? 'current' : ''}`} aria-hidden="true">{done ? '✓' : i + 1}</span>
                <span>
                  <strong>{l.title}</strong>
                  <span className="small muted" style={{ display: 'block' }}>{done ? 'Feita' : l.summary} · ~{l.minutes} min</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LessonPage({ id }: { id: string }) {
  const d = useData();
  const lesson = lessonById(id);
  if (!lesson) {
    return (
      <div className="panel stack">
        <h1>Aula não encontrada</h1>
        <a className="btn" href={href('/aulas')}>Ver aulas</a>
      </div>
    );
  }
  const idx = LESSONS.indexOf(lesson);
  const nextL = LESSONS[idx + 1];
  const done = !!d.done[lesson.id];
  const allChecked = lesson.checklist.every((_, i) => d.checks[`${lesson.id}:${i}`]);
  const p = lesson.practice;
  const prog = p ? progressionById(p.progression) : undefined;

  return (
    <div className="stack-l">
      <div>
        <a href={href('/aulas')} className="small">Aulas</a>
        <p className="small muted" style={{ margin: '6px 0 0' }}>Aula {idx + 1} de {LESSONS.length} · ~{lesson.minutes} min</p>
        <h1 style={{ marginTop: 2 }}>{lesson.title}</h1>
        {done && <span className="badge ok">Feita</span>}
      </div>

      {lesson.blocks.map((b, i) => (
        <section key={i} className="stack">
          {b.title && <h2>{b.title}</h2>}
          {b.parts && <GuitarParts />}
          {b.howToRead && (
            <div className="chord-row"><ChordDiagram shape="Em" annotate size={1.25} playable={false} label="Exemplo: Em" /></div>
          )}
          {b.text.map((t, k) => <p key={k}>{t}</p>)}
          {b.shapes && <ChordRow ids={b.shapes} />}
          {b.tuning && <TuningButtons />}
        </section>
      ))}

      {p && prog && (
        <section className="panel stack">
          <h2 style={{ margin: 0 }}>Pratique no violão</h2>
          <p style={{ margin: 0 }}><strong>{prog.label}</strong> · {patternById(p.pattern).name} · {p.bpm} BPM</p>
          <p className="small muted" style={{ margin: 0 }}>{p.hint}</p>
          <div className="row">
            <button className="btn primary" onClick={() => navigate(`/tocar?p=${p.progression}&b=${p.pattern}&bpm=${p.bpm}&c=${p.barsPerChord}`)}>Abrir no Tocar junto</button>
          </div>
        </section>
      )}

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>Consegui fazer</h2>
        <p className="small muted" style={{ margin: 0 }}>O app não escuta o violão: marque você mesma quando conseguir.</p>
        {lesson.checklist.map((c, i) => {
          const key = `${lesson.id}:${i}`;
          return (
            <label key={key} className="check">
              <input type="checkbox" checked={!!d.checks[key]} onChange={() => actions.toggleCheck(key)} />
              <span>{c}</span>
            </label>
          );
        })}
        {done ? (
          <div className="row">
            {nextL && <a className="btn primary" href={href(`/aula/${nextL.id}`)}>Próxima: {nextL.title}</a>}
            <button className="btn small ghost" onClick={() => actions.unmarkDone(lesson.id)}>Desmarcar como feita</button>
          </div>
        ) : (
          <div className="row">
            <button className="btn primary" disabled={!allChecked} onClick={() => actions.markDone(lesson.id)}>Concluí esta aula</button>
            {!allChecked && <span className="small muted">Marque os itens acima primeiro.</span>}
          </div>
        )}
      </section>
    </div>
  );
}

export function TunePage() {
  return (
    <div className="stack-l">
      <div>
        <h1>Afinar</h1>
        <p className="muted">Toque cada botão e compare com a corda solta. Para afinar de verdade, use um afinador (de clipe ou um app gratuito): este app não escuta o violão.</p>
      </div>
      <TuningButtons />
      <div className="panel stack">
        <p style={{ margin: 0 }}>No afinador, a corda deve mostrar:</p>
        <p className="num" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>6ª E · 5ª A · 4ª D · 3ª G · 2ª B · 1ª E</p>
        <p className="small muted" style={{ margin: 0 }}>Gire a tarraxa bem devagar. Se passar do ponto, afrouxe um pouco e suba de novo até o ponto.</p>
      </div>
    </div>
  );
}
