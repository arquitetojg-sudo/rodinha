import { useEffect, useMemo, useRef, useState } from 'react';
import { PATTERNS, PROGRESSIONS, learnedShapes, patternById, progressionById } from '../content/lessons';
import { actions, useData } from '../app/store';
import { href } from '../app/router';
import { SHAPES, capoOptions, parseChordLine, shapeById, shapeMidis, shapeName } from '../music';
import { ChordDiagram } from '../ui/ChordDiagram';
import { PlayAlong } from '../ui/audio';

function query(): URLSearchParams {
  return new URLSearchParams(window.location.hash.split('?')[1] ?? '');
}

const ARROW = { D: '↓', U: '↑', '-': '·' } as const;

export function PlayPage() {
  const d = useData();
  const q = query();
  const [progId, setProgId] = useState(q.get('p') ?? 'pop');
  const [patId, setPatId] = useState(q.get('b') ?? 'quatro');
  const [bpm, setBpm] = useState(Number(q.get('bpm')) || d.bpm);
  const [bars, setBars] = useState(Number(q.get('c')) || 1);
  const [running, setRunning] = useState(false);
  const [pos, setPos] = useState({ step: -1, chordIndex: 0, counting: false, beat: 0 });
  const player = useRef<PlayAlong | null>(null);
  const startedAt = useRef(0);

  const prog = progressionById(progId) ?? PROGRESSIONS[0];
  const pattern = patternById(patId);
  const shapes = useMemo(() => prog.chords.map((id) => shapeById(id)!).filter(Boolean), [prog]);

  // configura o player a cada mudança, mesmo tocando
  useEffect(() => {
    const p = (player.current ??= new PlayAlong());
    p.bpm = bpm;
    p.pattern = pattern.steps;
    p.chords = shapes.map(shapeMidis);
    p.barsPerChord = bars;
    p.click = d.click;
    p.strumSound = d.strumSound;
    p.onStep = (info) => setPos(info);
  }, [bpm, pattern, shapes, bars, d.click, d.strumSound]);

  const stop = () => {
    player.current?.stop();
    setRunning(false);
    setPos({ step: -1, chordIndex: 0, counting: false, beat: 0 });
    if (startedAt.current) actions.addMinutes((Date.now() - startedAt.current) / 60000);
    startedAt.current = 0;
  };
  useEffect(() => () => player.current?.stop(), []);

  const toggle = () => {
    if (running) return stop();
    player.current?.start();
    startedAt.current = Date.now();
    setRunning(true);
  };

  const cur = shapes[pos.chordIndex] ?? shapes[0];
  const nxt = shapes[(pos.chordIndex + 1) % shapes.length];

  return (
    <div className="stack-l">
      <div>
        <h1>Tocar junto</h1>
        <p className="muted">O app marca o tempo e mostra o acorde da vez. Toque junto no seu violão.</p>
      </div>

      <div className="panel stack play-stage">
        <div className="row between">
          <span className="small muted">{running ? (pos.counting ? 'Contagem…' : 'Agora') : 'Pronta?'}</span>
          {shapes.length > 1 && <span className="small muted">Depois: <strong>{shapeName(nxt)}</strong></span>}
        </div>
        <div className="chord-row big">{cur && <ChordDiagram shape={cur} size={1.35} playable={!running} />}</div>
        <div className="strum" aria-label={`Batida: ${pattern.say}`}>
          {pattern.steps.map((s, i) => (
            <span key={i} className={`${i === pos.step && running ? 'on' : ''} ${s === '-' ? 'rest' : ''}`}>
              {ARROW[s]}
              <small>{i % 2 === 0 ? i / 2 + 1 : 'e'}</small>
            </span>
          ))}
        </div>
        <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>{pattern.say}</p>
        <button className={`btn block ${running ? '' : 'primary'}`} onClick={toggle}>{running ? 'Parar' : 'Começar'}</button>
      </div>

      <div className="panel stack">
        <h2 style={{ margin: 0 }}>Sequência</h2>
        <div className="chips">
          {PROGRESSIONS.map((p) => (
            <button key={p.id} className="chip" aria-pressed={p.id === progId} onClick={() => setProgId(p.id)}>{p.label}</button>
          ))}
        </div>
        {prog.note && <p className="small muted" style={{ margin: 0 }}>{prog.note}</p>}

        <h2 style={{ margin: '8px 0 0' }}>Batida</h2>
        <div className="chips">
          {PATTERNS.map((p) => (
            <button key={p.id} className="chip" aria-pressed={p.id === patId} onClick={() => setPatId(p.id)}>{p.name}</button>
          ))}
        </div>

        <h2 style={{ margin: '8px 0 0' }}>Velocidade: <span className="num">{bpm}</span> BPM</h2>
        <div className="row">
          <button className="btn small" onClick={() => setBpm((b) => Math.max(40, b - 5))} aria-label="Mais devagar">−5</button>
          <input type="range" min={40} max={140} step={1} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} onPointerUp={() => actions.set('bpm', bpm)} style={{ flex: 1 }} aria-label="BPM" />
          <button className="btn small" onClick={() => setBpm((b) => Math.min(140, b + 5))} aria-label="Mais rápido">+5</button>
        </div>
        <p className="small muted" style={{ margin: 0 }}>Comece devagar (55–65). Só acelere quando a troca sair sem parar.</p>

        <div className="row">
          <span>Compassos por acorde:</span>
          <div className="seg" role="group">
            {[1, 2].map((n) => <button key={n} aria-pressed={bars === n} onClick={() => setBars(n)}>{n}</button>)}
          </div>
        </div>
        <label className="check"><input type="checkbox" checked={d.click} onChange={(e) => actions.set('click', e.target.checked)} /> <span>Clique do metrônomo</span></label>
        <label className="check"><input type="checkbox" checked={d.strumSound} onChange={(e) => actions.set('strumSound', e.target.checked)} /> <span>Violão do app tocando junto</span></label>
      </div>
    </div>
  );
}

export function ChordsPage() {
  const d = useData();
  const learned = learnedShapes(d.done);
  const mine = SHAPES.filter((s) => learned.has(s.id));
  const others = SHAPES.filter((s) => !learned.has(s.id));
  return (
    <div className="stack-l">
      <div>
        <h1>Meus acordes</h1>
        <p className="muted">Os números nas bolinhas são os dedos: 1 indicador, 2 médio, 3 anelar, 4 mindinho. × = não toque a corda; ○ = corda solta.</p>
      </div>
      <section className="stack">
        <h2>Já aprendi</h2>
        {mine.length ? (
          <div className="chord-row">{mine.map((s) => <ChordDiagram key={s.id} shape={s} />)}</div>
        ) : (
          <p className="muted">Ainda nenhum. O primeiro (Em) vem na aula 5.</p>
        )}
      </section>
      <section className="stack">
        <h2>Para depois</h2>
        <div className="chord-row">{others.map((s) => <ChordDiagram key={s.id} shape={s} />)}</div>
      </section>
    </div>
  );
}

export function SongsPage() {
  const d = useData();
  const [text, setText] = useState('');
  const learned = learnedShapes(d.done);
  const parsed = useMemo(() => parseChordLine(text), [text]);
  const options = useMemo(() => (parsed.chords.length ? capoOptions(parsed.chords, learned) : []), [parsed, learned]);
  const best = options[0];
  const simplified = parsed.chords.filter((c) => c.simplified);

  return (
    <div className="stack-l">
      <div>
        <h1>Essa música dá pra tocar?</h1>
        <p className="muted">Procure a cifra da música (no Cifra Club, por exemplo) e escreva aqui os acordes que aparecem. O app acha a casa do capotraste que deixa a música mais fácil.</p>
      </div>

      <div className="panel stack">
        <label className="field">
          <span>Acordes da música</span>
          <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: A E F#m D" />
        </label>
        <div className="chips">
          {['A E F#m D', 'Bb F Gm Eb', 'D A Bm G', 'C G Am F'].map((ex) => (
            <button key={ex} className="chip" onClick={() => setText(ex)}>{ex}</button>
          ))}
        </div>
        {parsed.unknown.length > 0 && <p className="small" style={{ margin: 0, color: 'var(--warn)' }}>Não entendi: {parsed.unknown.join(', ')}</p>}
      </div>

      {best && (
        <div className="panel stack">
          <h2 style={{ margin: 0 }}>{best.capo === 0 ? 'Sem capotraste' : `Capotraste na casa ${best.capo}`}</h2>
          {best.missing > 0 ? (
            <p className="notice bad" style={{ margin: 0 }}>Nenhuma casa resolve tudo: {best.missing === 1 ? 'um acorde fica' : `${best.missing} acordes ficam`} sem desenho fácil (provavelmente precisa de pestana, como F ou Bm). Dá para procurar uma versão "simplificada" da cifra.</p>
          ) : best.unknownShapes > 0 ? (
            <p className="small muted" style={{ margin: 0 }}>Dá para tocar! {best.unknownShapes === 1 ? 'Só falta aprender 1 desenho' : `Faltam ${best.unknownShapes} desenhos que ainda não apareceram nas suas aulas`}, marcados como (novo).</p>
          ) : (
            <p className="notice ok" style={{ margin: 0 }}>Dá para tocar só com acordes que você já aprendeu!</p>
          )}
          <table className="data">
            <thead><tr><th>Na cifra</th><th>Você toca</th></tr></thead>
            <tbody>
              {best.items.map((x) => (
                <tr key={x.chord.input}>
                  <td className="num">{x.chord.input}</td>
                  <td className="num"><strong>{x.shape ? shapeName(x.shape) : '—'}</strong>{x.shape && !learned.has(x.shape.id) && <span className="small muted"> (novo)</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="chord-row">
            {best.items.filter((x) => x.shape).map((x) => <ChordDiagram key={x.chord.input} shape={x.shape!} />)}
          </div>
          {simplified.length > 0 && (
            <p className="small muted" style={{ margin: 0 }}>Simplifiquei {simplified.map((c) => c.input).join(', ')}: usei o acorde base, sem o baixo trocado ou as notas extras. Soa um pouco diferente, mas combina.</p>
          )}
          {options.slice(1, 3).some((o) => o.missing === 0) && (
            <p className="small muted" style={{ margin: 0 }}>
              Outras opções:{' '}
              {options.slice(1, 3).filter((o) => o.missing === 0).map((o) => `capo ${o.capo} (${o.items.map((x) => shapeName(x.shape!)).join(' ')})`).join(' · ')}
            </p>
          )}
          <p className="small muted" style={{ margin: 0 }}>Se ficar agudo ou grave demais para cantar, teste uma das outras opções ou outra casa: o importante é caber na sua voz.</p>
        </div>
      )}

      {!best && (
        <p className="small muted">Dica: se a cifra já diz "Capo na 2ª casa", os acordes escritos já são os desenhos. Escreva-os aqui só para ver quais você já sabe. <a href={href('/acordes')}>Ver meus acordes</a>.</p>
      )}
    </div>
  );
}
