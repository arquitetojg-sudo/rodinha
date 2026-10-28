import { CHORD_QUALITIES, chordSymbol, type ChordQuality } from './chords';
import { midiAt } from './fretboard';
import { mod12, parseNote, pcOf, type SpelledNote } from './notes';

/**
 * Desenhos de acordes abertos para iniciantes.
 *
 * As casas de cada desenho são escritas à mão (é assim que se aprende), mas os
 * testes conferem, pela altura real de cada corda (MIDI = afinação + casa),
 * que as notas que soam são exatamente as notas do acorde e que o baixo é a
 * fundamental. Um desenho errado não passa nos testes.
 */
export interface ChordShape {
  id: string;
  /** Fundamental, grafada (ex.: 'C', 'F#'). */
  root: string;
  quality: keyof typeof CHORD_QUALITIES;
  /** Casas da 6ª corda (Mi grave) até a 1ª (Mi aguda). -1 = não tocar. */
  frets: [number, number, number, number, number, number];
  /** Dedo em cada corda (1 indicador … 4 mínimo), mesma ordem. 0 = solta ou não tocada. */
  fingers: [number, number, number, number, number, number];
  /** 1 = bem fácil … 3 = exige mais prática. */
  level: 1 | 2 | 3;
  /** Observação curta, quando o desenho tem um "jeito". */
  tip?: string;
  /** Desenho alternativo do mesmo acorde (não é o padrão sugerido). */
  variant?: boolean;
}

const S = (
  id: string, root: string, quality: ChordShape['quality'], frets: ChordShape['frets'], fingers: ChordShape['fingers'],
  level: ChordShape['level'], extra: Partial<ChordShape> = {},
): ChordShape => ({ id, root, quality, frets, fingers, level, ...extra });

export const SHAPES: ChordShape[] = [
  S('Em', 'E', 'minor', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0], 1, { tip: 'Só dois dedos. Todas as cordas soam.' }),
  S('Em7', 'E', 'm7', [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0], 1, { tip: 'Um dedo só. Soa "aberto", muito usado em louvor.' }),
  S('Am', 'A', 'minor', [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0], 1, { tip: 'Mesmo desenho do Em, uma corda abaixo, mais o dedo 1.' }),
  S('Am7', 'A', 'm7', [-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0], 1),
  S('E', 'E', 'major', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0], 1, { tip: 'É o Em com o dedo 1 na 3ª corda.' }),
  S('A', 'A', 'major', [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0], 2, { tip: 'Três dedos lado a lado na casa 2. Fica apertado no começo.' }),
  S('D', 'D', 'major', [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2], 2, { tip: 'Toque só as 4 cordas mais finas.' }),
  S('Dm', 'D', 'minor', [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1], 2, { tip: 'Toque só as 4 cordas mais finas.' }),
  S('C', 'C', 'major', [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0], 2, { tip: 'Não toque a 6ª corda.' }),
  S('G', 'G', 'major', [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3], 2, { tip: 'Abre bem a mão: o dedo 3 vai lá na 1ª corda.' }),
  S('G-ancora', 'G', 'major', [3, 2, 0, 0, 3, 3], [2, 1, 0, 0, 3, 4], 3, { variant: true, tip: 'Dedos 3 e 4 presos nas cordas 1 e 2: é a "âncora" do louvor.' }),
  S('Cadd9', 'C', 'add9', [-1, 3, 2, 0, 3, 3], [0, 2, 1, 0, 3, 4], 3, { tip: 'Nas cifras aparece como C9 ou C(9). Âncora nas cordas 1 e 2.' }),
  S('Dsus4', 'D', 'sus4', [-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 3, 4], 2, { tip: 'Nas cifras aparece como D4 ou Dsus. Toque só as 4 cordas finas.' }),
  S('Dsus2', 'D', 'sus2', [-1, -1, 0, 2, 3, 0], [0, 0, 0, 1, 3, 0], 2, { tip: 'Nas cifras aparece como D2.' }),
  S('Asus2', 'A', 'sus2', [-1, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0], 1, { tip: 'Nas cifras aparece como A2 ou A9. Dois dedos só.' }),
  S('Asus4', 'A', 'sus4', [-1, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0], 2, { tip: 'Nas cifras aparece como A4.' }),
  S('A7', 'A', 'dom7', [-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0], 1),
  S('D7', 'D', 'dom7', [-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3], 2),
  S('E7', 'E', 'dom7', [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0], 1),
  S('G7', 'G', 'dom7', [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1], 2),
  S('B7', 'B', 'dom7', [-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4], 3, { tip: 'Usa os quatro dedos. Comum em músicas no tom de Mi.' }),
];

export const shapeById = (id: string) => SHAPES.find((s) => s.id === id);

export function shapeRoot(shape: ChordShape): SpelledNote {
  return parseNote(shape.root);
}

export function shapeQuality(shape: ChordShape): ChordQuality {
  return CHORD_QUALITIES[shape.quality];
}

/** Nome em cifra (ex.: 'Cadd9', 'Em7'). */
export function shapeName(shape: ChordShape): string {
  return chordSymbol(shapeRoot(shape), shapeQuality(shape));
}

/** Alturas MIDI que soam, da corda mais grave para a mais aguda. */
export function shapeMidis(shape: ChordShape): number[] {
  const out: number[] = [];
  shape.frets.forEach((f, i) => {
    if (f >= 0) out.push(midiAt(6 - i, f));
  });
  return out;
}

/** Classes de altura (sem repetição) que soam no desenho. */
export function shapePcs(shape: ChordShape): number[] {
  return [...new Set(shapeMidis(shape).map(mod12))].sort((a, b) => a - b);
}

/** Classe de altura da fundamental. */
export function shapeRootPc(shape: ChordShape): number {
  return pcOf(shapeRoot(shape));
}
