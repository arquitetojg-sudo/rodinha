import { describe, expect, it } from 'vitest';
import {
  SHAPES, shapeById, shapeMidis, shapeName, shapePcs, shapeRootPc, chordNotes, shapeRoot, shapeQuality,
  parseChord, parseChordLine, capoOptions, mod12,
} from './index';

/** Gabarito escrito à mão: notas que soam em cada desenho, da corda grave para a aguda. */
const EXPECTED_NOTES: Record<string, string> = {
  Em: 'E B E G B E',
  Em7: 'E B D G B E',
  Am: 'A E A C E',
  Am7: 'A E G C E',
  E: 'E B E G# B E',
  A: 'A E A C# E',
  D: 'D A D F#',
  Dm: 'D A D F',
  C: 'C E G C E',
  G: 'G B D G B G',
  'G-ancora': 'G B D G D G',
  Cadd9: 'C E G D G',
  Dsus4: 'D A D G',
  Dsus2: 'D A D E',
  Asus2: 'A E A B E',
  Asus4: 'A E A D E',
  A7: 'A E G C# E',
  D7: 'D A C F#',
  E7: 'E B D G# B E',
  G7: 'G B D G B F',
  B7: 'B D# A B F#',
};

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

describe('desenhos de acordes', () => {
  it('cada desenho soa exatamente as notas do gabarito', () => {
    for (const s of SHAPES) {
      expect(EXPECTED_NOTES[s.id], `gabarito faltando para ${s.id}`).toBeDefined();
      expect(shapeMidis(s).map((m) => SHARP[mod12(m)]).join(' '), s.id).toBe(EXPECTED_NOTES[s.id]);
    }
  });

  it('as notas que soam são exatamente as notas do acorde', () => {
    for (const s of SHAPES) {
      const want = [...new Set(chordNotes(shapeRoot(s), shapeQuality(s)).map((n) => n.pc))].sort((a, b) => a - b);
      expect(shapePcs(s), s.id).toEqual(want);
    }
  });

  it('o baixo (nota mais grave) é a fundamental', () => {
    for (const s of SHAPES) expect(mod12(shapeMidis(s)[0]), s.id).toBe(shapeRootPc(s));
  });

  it('dedos só onde há casa apertada, e casa apertada sempre tem dedo', () => {
    for (const s of SHAPES) {
      s.frets.forEach((f, i) => {
        if (f > 0) expect(s.fingers[i], `${s.id} corda ${6 - i}`).toBeGreaterThan(0);
        else expect(s.fingers[i], `${s.id} corda ${6 - i}`).toBe(0);
      });
    }
  });

  it('nomes em cifra', () => {
    expect(shapeName(shapeById('Em')!)).toBe('Em');
    expect(shapeName(shapeById('Cadd9')!)).toBe('Cadd9');
    expect(shapeName(shapeById('Dsus4')!)).toBe('Dsus4');
    expect(shapeName(shapeById('G-ancora')!)).toBe('G');
    expect(shapeName(shapeById('B7')!)).toBe('B7');
  });
});

describe('leitura de cifras', () => {
  it('reconhece as cifras mais comuns', () => {
    expect(parseChord('F#m')).toMatchObject({ rootPc: 6, quality: 'minor', simplified: false });
    expect(parseChord('Bb')).toMatchObject({ rootPc: 10, quality: 'major' });
    expect(parseChord('C9')).toMatchObject({ rootPc: 0, quality: 'add9' });
    expect(parseChord('D4')).toMatchObject({ rootPc: 2, quality: 'sus4' });
    expect(parseChord('A2')).toMatchObject({ rootPc: 9, quality: 'sus2' });
    expect(parseChord('E7M')).toMatchObject({ rootPc: 4, quality: 'maj7' });
    expect(parseChord('Em7')).toMatchObject({ rootPc: 4, quality: 'm7' });
  });
  it('baixo trocado e extensões viram versão simplificada', () => {
    expect(parseChord('D/F#')).toMatchObject({ rootPc: 2, quality: 'major', simplified: true });
    expect(parseChord('Am7(11)')).toMatchObject({ rootPc: 9, quality: 'minor', simplified: true });
    expect(parseChord('G7(13)')).toMatchObject({ rootPc: 7, quality: 'major', simplified: true });
  });
  it('separa a linha e aponta o que não entendeu', () => {
    const r = parseChordLine('G  D/F#  Em  C  refrão');
    expect(r.chords.map((c) => c.input)).toEqual(['G', 'D/F#', 'Em', 'C']);
    expect(r.unknown).toEqual(['refrão']);
  });
});

describe('sugestão de capotraste', () => {
  const pick = (line: string, known?: string[]) => capoOptions(parseChordLine(line).chords, new Set(known))[0];

  it('música já em Sol: sem capo', () => {
    const o = pick('G D Em C');
    expect(o.capo).toBe(0);
    expect(o.items.map((x) => x.shape?.id)).toEqual(['G', 'D', 'Em', 'C']);
  });
  it('música em Lá (A E F#m D): capo 2 com desenhos de Sol', () => {
    const o = pick('A E F#m D', ['G', 'D', 'Em', 'C']);
    expect(o.capo).toBe(2);
    expect(o.items.map((x) => x.shape?.id)).toEqual(['G', 'D', 'Em', 'C']);
  });
  it('música em Si♭ (Bb F Gm Eb): capo 3 com desenhos de Sol', () => {
    const o = pick('Bb F Gm Eb', ['G', 'D', 'Em', 'C']);
    expect(o.capo).toBe(3);
    expect(o.items.map((x) => x.shape?.id)).toEqual(['G', 'D', 'Em', 'C']);
  });
  it('música em Ré (D A Bm G): capo 7 com desenhos de Sol (capo 2 cairia num F)', () => {
    const o = pick('D A Bm G', ['G', 'D', 'Em', 'C', 'Am']);
    expect(o.capo).toBe(7);
    expect(o.items.map((x) => x.shape?.id)).toEqual(['G', 'D', 'Em', 'C']);
  });
  it('prefere desenhos que ela já conhece', () => {
    const o = pick('Em C G D', ['G', 'D', 'Em', 'C']);
    expect(o.capo).toBe(0);
    expect(o.unknownShapes).toBe(0);
  });
  it('acorde sem desenho aberto é contado como faltando', () => {
    const all = capoOptions(parseChordLine('F').chords, new Set(), 0);
    expect(all[0].missing).toBe(1);
  });
});
