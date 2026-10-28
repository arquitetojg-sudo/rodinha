import { CHORD_QUALITIES } from './chords';
import { mod12, parseNote, pcOf } from './notes';
import { SHAPES, shapeRootPc, type ChordShape } from './shapes';

/**
 * Leitura de cifras e sugestão de capotraste.
 *
 * Ideia: com o capotraste na casa N, tudo soa N semitons mais agudo. Então,
 * para tocar uma música em Lá (A) com desenhos de Sol (G), basta pôr o capo
 * na casa 2. O app testa as casas 0–7 e escolhe a que usa os desenhos mais fáceis.
 */

export interface ParsedChord {
  /** Como estava escrito na cifra. */
  input: string;
  rootPc: number;
  quality: keyof typeof CHORD_QUALITIES;
  /** O acorde foi simplificado (baixo trocado, extensões ignoradas…). */
  simplified: boolean;
}

/** Sufixos usados em cifras brasileiras → qualidade. */
const SUFFIX: Record<string, { q: ParsedChord['quality']; simplified?: boolean }> = {
  '': { q: 'major' },
  m: { q: 'minor' },
  '7': { q: 'dom7' },
  m7: { q: 'm7' },
  '7m': { q: 'maj7' },
  '7M': { q: 'maj7' },
  maj7: { q: 'maj7' },
  sus4: { q: 'sus4' },
  sus: { q: 'sus4' },
  '4': { q: 'sus4' },
  sus2: { q: 'sus2' },
  '2': { q: 'sus2' },
  add9: { q: 'add9' },
  '9': { q: 'add9' },
  '(9)': { q: 'add9' },
  add2: { q: 'add9' },
  '5': { q: 'major', simplified: true },
  m9: { q: 'minor', simplified: true },
  'm(9)': { q: 'minor', simplified: true },
  m6: { q: 'minor', simplified: true },
  '6': { q: 'major', simplified: true },
  dim: { q: 'minor', simplified: true },
  '°': { q: 'minor', simplified: true },
  'm7(b5)': { q: 'minor', simplified: true },
};

/** Lê uma cifra como "F#m", "C9", "D/F#", "Bb7M". Devolve undefined se não reconhecer. */
export function parseChord(input: string): ParsedChord | undefined {
  const s = input.trim().replace('♯', '#').replace('♭', 'b');
  const m = /^([A-G])([#b]?)([^/]*)(?:\/([A-G][#b]?))?$/.exec(s);
  if (!m) return undefined;
  const root = parseNote(m[1] + m[2]);
  let suffix = m[3];
  let simplified = !!m[4];
  let hit = SUFFIX[suffix];
  if (!hit) {
    // extensões desconhecidas: fica com a base maior ou menor
    suffix = suffix.startsWith('m') && !suffix.startsWith('maj') ? 'm' : '';
    hit = SUFFIX[suffix];
    simplified = true;
  }
  return { input: input.trim(), rootPc: pcOf(root), quality: hit.q, simplified: simplified || !!hit.simplified };
}

/** Separa uma linha de cifras ("G  D/F#  Em  C") em acordes. */
export function parseChordLine(text: string): { chords: ParsedChord[]; unknown: string[] } {
  const chords: ParsedChord[] = [];
  const unknown: string[] = [];
  for (const tok of text.split(/[\s,;|–-]+/).filter(Boolean)) {
    const c = parseChord(tok);
    if (c) chords.push(c);
    else unknown.push(tok);
  }
  return { chords, unknown };
}

/** Acordes diferentes, na ordem em que aparecem. */
export function uniqueChords(chords: ParsedChord[]): ParsedChord[] {
  const seen = new Set<string>();
  return chords.filter((c) => {
    const k = `${c.rootPc}:${c.quality}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Desenhos que tocam esse acorde (mesma fundamental e qualidade). Os padrões vêm antes das variações. */
export function shapesFor(rootPc: number, quality: ParsedChord['quality']): ChordShape[] {
  return SHAPES.filter((s) => shapeRootPc(s) === mod12(rootPc) && s.quality === quality).sort(
    (a, b) => Number(!!a.variant) - Number(!!b.variant) || a.level - b.level,
  );
}

export interface CapoOption {
  capo: number;
  /** Para cada acorde da música: o desenho a usar (ou undefined se não houver desenho aberto). */
  items: { chord: ParsedChord; shape?: ChordShape }[];
  missing: number;
  /** Desenhos que ela ainda não aprendeu. */
  unknownShapes: number;
  difficulty: number;
}

/**
 * Testa o capotraste nas casas 0–maxCapo. Ordem de preferência:
 * menos acordes sem desenho → menos desenhos ainda não aprendidos → mais fácil → capo mais baixo.
 */
export function capoOptions(chords: ParsedChord[], known: Set<string> = new Set(), maxCapo = 7): CapoOption[] {
  const list = uniqueChords(chords);
  const out: CapoOption[] = [];
  for (let capo = 0; capo <= maxCapo; capo++) {
    const items = list.map((chord) => {
      const options = shapesFor(chord.rootPc - capo, chord.quality);
      const shape = options.find((s) => known.has(s.id)) ?? options[0];
      return { chord, shape };
    });
    const missing = items.filter((x) => !x.shape).length;
    const unknownShapes = items.filter((x) => x.shape && !known.has(x.shape.id)).length;
    const difficulty = items.reduce((s, x) => s + (x.shape?.level ?? 4), 0);
    out.push({ capo, items, missing, unknownShapes, difficulty });
  }
  return out.sort(
    (a, b) => a.missing - b.missing || a.unknownShapes - b.unknownShapes || a.difficulty - b.difficulty || a.capo - b.capo,
  );
}
