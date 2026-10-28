import { useState } from 'react';
import { STANDARD_TUNING } from '../music';
import { playNote } from './audio';

const OPEN = [
  { n: 6, name: 'Mi', cifra: 'E' },
  { n: 5, name: 'Lá', cifra: 'A' },
  { n: 4, name: 'Ré', cifra: 'D' },
  { n: 3, name: 'Sol', cifra: 'G' },
  { n: 2, name: 'Si', cifra: 'B' },
  { n: 1, name: 'Mi', cifra: 'E' },
];

/** Botões com o som de cada corda solta afinada (afinação padrão). */
export function TuningButtons() {
  const [last, setLast] = useState<number | null>(null);
  return (
    <div className="tuning">
      {OPEN.map((c, i) => (
        <button
          key={c.n}
          className={`btn tuning-btn ${last === c.n ? 'on' : ''}`}
          onClick={() => {
            setLast(c.n);
            playNote(STANDARD_TUNING.strings[i], 'violao');
          }}
        >
          <strong>{c.n}ª</strong>
          <span>{c.name}</span>
          <span className="small muted">{c.cifra}</span>
        </button>
      ))}
    </div>
  );
}

/** Desenho simples do violão com as partes nomeadas. */
export function GuitarParts() {
  return (
    <figure className="panel" style={{ padding: 8, margin: '8px 0' }}>
      <svg viewBox="0 0 360 150" width="100%" role="img" aria-label="Partes do violão: cabeça com tarraxas, braço com trastes e casas, corpo com boca e cavalete">
        {/* corpo */}
        <path d="M200 30 C 225 10, 262 18, 270 40 C 278 24, 330 16, 344 50 C 356 78, 356 92, 344 108 C 330 134, 278 126, 270 110 C 262 132, 225 140, 200 120 C 186 108, 186 42, 200 30 Z" fill="var(--wood-light)" stroke="var(--wood-edge)" strokeWidth="2" />
        <circle cx="248" cy="75" r="17" fill="var(--wood-edge)" />
        <rect x="312" y="60" width="9" height="30" rx="2" fill="var(--wood-edge)" />
        {/* braço */}
        <rect x="56" y="64" width="150" height="22" fill="var(--wood)" />
        {[70, 90, 108, 125, 141, 156, 170, 183, 195].map((x) => <rect key={x} x={x} y="64" width="2" height="22" fill="var(--fret)" />)}
        <rect x="56" y="63" width="4" height="24" fill="var(--nut)" />
        {/* cabeça */}
        <path d="M14 58 L 56 62 L 56 88 L 14 92 Z" fill="var(--wood)" />
        {[22, 34, 46].map((x) => (
          <g key={x}>
            <circle cx={x} cy={56} r={4} fill="var(--fret)" />
            <circle cx={x} cy={94} r={4} fill="var(--fret)" />
          </g>
        ))}
        {/* cordas */}
        {[67, 70.5, 74, 77, 80, 83].map((y) => <line key={y} x1="56" x2="316" y1={y} y2={y} stroke="var(--string)" strokeWidth="0.9" />)}
        {/* rótulos */}
        <g className="parts-label">
          <text x="32" y="40" textAnchor="middle">cabeça</text>
          <text x="26" y="116" textAnchor="middle">tarraxas</text>
          <text x="62" y="112" textAnchor="start">casa 1</text>
          <line x1="65" y1="88" x2="65" y2="102" stroke="var(--muted)" />
          <text x="140" y="54" textAnchor="middle">braço e trastes</text>
          <text x="248" y="146" textAnchor="middle">boca</text>
          <line x1="248" y1="93" x2="248" y2="134" stroke="var(--muted)" />
          <text x="316" y="146" textAnchor="middle">cavalete</text>
          <text x="300" y="12" textAnchor="middle">corpo</text>
        </g>
      </svg>
    </figure>
  );
}
