import { shapeById, shapeMidis, shapeName, type ChordShape } from '../music';
import { strum } from './audio';

const FRETS = 4;

/**
 * Desenho de acorde no padrão das revistas de cifra: cordas em pé (6ª à esquerda),
 * trastes deitados, pestana do braço no topo, número do dedo dentro da bolinha.
 */
export function ChordDiagram({ shape, size = 1, annotate = false, playable = true, label }: {
  shape: ChordShape | string;
  size?: number;
  annotate?: boolean;
  playable?: boolean;
  label?: string;
}) {
  const s = typeof shape === 'string' ? shapeById(shape) : shape;
  if (!s) return null;
  const name = label ?? shapeName(s);
  const gap = 22;
  const fretH = 28;
  const left = annotate ? 58 : 18;
  const top = 34;
  const w = left + gap * 5 + 18;
  const h = top + fretH * FRETS + (annotate ? 34 : 10);
  const x = (i: number) => left + i * gap; // i: 0 = 6ª corda
  const y = (f: number) => top + (f - 0.5) * fretH;

  const svg = (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * size} height={h * size} role="img" aria-label={`Acorde ${name}`} className="chord-svg">
      {/* trastes */}
      <rect x={x(0)} y={top - 4} width={gap * 5} height={5} rx={1} fill="var(--ink)" />
      {Array.from({ length: FRETS }, (_, k) => (
        <line key={k} x1={x(0)} x2={x(5)} y1={top + (k + 1) * fretH} y2={top + (k + 1) * fretH} stroke="var(--line-strong)" strokeWidth={1.5} />
      ))}
      {/* cordas: as graves um pouco mais grossas */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={x(i)} x2={x(i)} y1={top} y2={top + fretH * FRETS} stroke="var(--line-strong)" strokeWidth={2.2 - i * 0.25} />
      ))}
      {/* X / O */}
      {s.frets.map((f, i) =>
        f === -1 ? (
          <text key={i} x={x(i)} y={top - 12} textAnchor="middle" className="chord-mark bad">×</text>
        ) : f === 0 ? (
          <circle key={i} cx={x(i)} cy={top - 16} r={5.5} fill="none" stroke="var(--ink)" strokeWidth={1.6} />
        ) : null,
      )}
      {/* dedos */}
      {s.frets.map((f, i) =>
        f > 0 ? (
          <g key={i}>
            <circle cx={x(i)} cy={y(f)} r={9.5} fill="var(--dot)" />
            <text x={x(i)} y={y(f) + 4.5} textAnchor="middle" className="chord-finger">{s.fingers[i]}</text>
          </g>
        ) : null,
      )}
      {annotate && (
        <>
          {Array.from({ length: FRETS }, (_, k) => (
            <text key={k} x={left - 10} y={y(k + 1) + 4} textAnchor="end" className="chord-ann">casa {k + 1}</text>
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <text key={i} x={x(i)} y={top + fretH * FRETS + 18} textAnchor="middle" className="chord-ann">{6 - i}ª</text>
          ))}
          <text x={x(0)} y={top + fretH * FRETS + 32} className="chord-ann">grossa</text>
          <text x={x(5)} y={top + fretH * FRETS + 32} textAnchor="end" className="chord-ann">fina</text>
        </>
      )}
    </svg>
  );

  return (
    <figure className="chord">
      <figcaption className="chord-name">{name}</figcaption>
      {svg}
      {playable && (
        <button className="btn small ghost" onClick={() => strum(shapeMidis(s), 'down', 0, 0.06)} aria-label={`Ouvir ${name}`}>
          ▶ Ouvir
        </button>
      )}
      {s.tip && !annotate && <p className="small muted chord-tip">{s.tip}</p>}
    </figure>
  );
}

export function ChordRow({ ids }: { ids: string[] }) {
  return (
    <div className="chord-row">
      {ids.map((id, k) => <ChordDiagram key={`${id}-${k}`} shape={id} />)}
    </div>
  );
}
