import { midiToFrequency } from '../music';
import type { Instrument } from '../music/fretboard';

/**
 * Áudio sintetizado no navegador (Web Audio API), sem arquivos de som.
 * Corda: algoritmo de Karplus-Strong. Metrônomo: cliques agendados com antecedência.
 * Navegadores só liberam áudio depois de um toque do usuário — por isso o contexto
 * é criado sob demanda, dentro de um clique.
 */

let ctx: AudioContext | null = null;
const cache = new Map<string, AudioBuffer>();

export function audioSupported(): boolean {
  return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
}

export function getAudio(): AudioContext | null {
  if (!audioSupported()) return null;
  if (!ctx) {
    const C = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function pluckBuffer(ac: AudioContext, midi: number, instrument: Instrument): AudioBuffer {
  const key = `${midi}-${instrument}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const sr = ac.sampleRate;
  const freq = midiToFrequency(midi);
  const dur = 2.2;
  const buf = ac.createBuffer(1, Math.floor(sr * dur), sr);
  const out = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(period);
  // ruído inicial filtrado: violão (nylon) mais escuro, guitarra mais brilhante
  const bright = instrument === 'violao' ? 0.45 : 0.75;
  let prev = 0;
  for (let i = 0; i < period; i++) {
    const n = Math.random() * 2 - 1;
    prev = prev + bright * (n - prev);
    ring[i] = prev;
  }
  const decay = instrument === 'violao' ? 0.994 : 0.997;
  let idx = 0;
  for (let i = 0; i < out.length; i++) {
    const next = (idx + 1) % period;
    const v = ring[idx];
    ring[idx] = decay * 0.5 * (v + ring[next]);
    out[i] = v * 0.5;
    idx = next;
  }
  // fade-out curto no fim do buffer
  const fade = Math.floor(sr * 0.05);
  for (let i = 0; i < fade; i++) out[out.length - 1 - i] *= i / fade;
  cache.set(key, buf);
  return buf;
}

export function playNote(midi: number, instrument: Instrument = 'guitarra', when = 0) {
  const ac = getAudio();
  if (!ac) return;
  const src = ac.createBufferSource();
  src.buffer = pluckBuffer(ac, midi, instrument);
  const gain = ac.createGain();
  gain.gain.value = 0.8;
  src.connect(gain).connect(ac.destination);
  src.start(ac.currentTime + when);
}

export function playSequence(midis: number[], instrument: Instrument = 'guitarra', gap = 0.35) {
  midis.forEach((m, i) => playNote(m, instrument, i * gap));
}

/** Metrônomo com agendamento antecipado (estável mesmo com a interface ocupada). */
export class Metronome {
  bpm = 80;
  beatsPerBar = 4;
  onBeat?: (beat: number) => void;
  private timer: number | null = null;
  private nextTime = 0;
  private beat = 0;

  get running() {
    return this.timer !== null;
  }

  start() {
    const ac = getAudio();
    if (!ac || this.timer !== null) return;
    this.beat = 0;
    this.nextTime = ac.currentTime + 0.08;
    const tick = () => {
      while (this.nextTime < ac.currentTime + 0.12) {
        this.click(ac, this.nextTime, this.beat % this.beatsPerBar === 0);
        const b = this.beat % this.beatsPerBar;
        const delay = Math.max(0, (this.nextTime - ac.currentTime) * 1000);
        window.setTimeout(() => this.onBeat?.(b), delay);
        this.nextTime += 60 / this.bpm;
        this.beat++;
      }
    };
    tick();
    this.timer = window.setInterval(tick, 25);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private click(ac: AudioContext, t: number, accent: boolean) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.frequency.value = accent ? 1600 : 1000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(accent ? 0.6 : 0.35, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}

/**
 * Batida sintetizada: toca as cordas do acorde em sequência rápida.
 * Para baixo = da grave para a aguda; para cima = só as 4 mais agudas, ao contrário.
 */
export function strum(midis: number[], dir: 'down' | 'up' = 'down', when = 0, spread = 0.018) {
  const notes = dir === 'down' ? midis : midis.slice(-4).reverse();
  notes.forEach((m, i) => playNote(m, 'violao', when + i * spread));
}

export type StrumStep = 'D' | 'U' | '-';

/**
 * "Tocar junto": conta os tempos em colcheias (2 por tempo) e chama `onStep`
 * no momento certo, com o clique e a batida sintetizada agendados no áudio.
 */
export class PlayAlong {
  bpm = 70;
  /** Padrão de batida, 8 colcheias por compasso de 4 tempos. */
  pattern: StrumStep[] = ['D', '-', 'D', '-', 'D', '-', 'D', '-'];
  /** Acordes (alturas MIDI) na ordem; cada um dura `barsPerChord` compassos. */
  chords: number[][] = [];
  barsPerChord = 1;
  click = true;
  strumSound = true;
  /** Compassos de contagem antes de começar. */
  countIn = 1;
  onStep?: (info: { step: number; beat: number; chordIndex: number; counting: boolean }) => void;
  private timer: number | null = null;
  private nextTime = 0;
  private n = 0;

  get running() {
    return this.timer !== null;
  }

  start() {
    const ac = getAudio();
    if (!ac || this.timer !== null || !this.chords.length) return;
    this.n = 0;
    this.nextTime = ac.currentTime + 0.1;
    const tick = () => {
      while (this.nextTime < ac.currentTime + 0.15) {
        this.schedule(ac, this.n, this.nextTime);
        this.nextTime += 30 / this.bpm; // colcheia
        this.n++;
      }
    };
    tick();
    this.timer = window.setInterval(tick, 25);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private schedule(ac: AudioContext, n: number, t: number) {
    const stepsPerBar = 8;
    const countSteps = this.countIn * stepsPerBar;
    const counting = n < countSteps;
    const k = counting ? n : n - countSteps;
    const step = k % stepsPerBar;
    const beat = Math.floor(step / 2);
    const bar = Math.floor(k / stepsPerBar);
    const chordIndex = counting ? 0 : Math.floor(bar / this.barsPerChord) % this.chords.length;
    if (step % 2 === 0 && (this.click || counting)) this.clickAt(ac, t, beat === 0);
    const s = this.pattern[step];
    if (!counting && this.strumSound && s !== '-') strum(this.chords[chordIndex], s === 'D' ? 'down' : 'up', t - ac.currentTime);
    const delay = Math.max(0, (t - ac.currentTime) * 1000);
    window.setTimeout(() => this.onStep?.({ step, beat, chordIndex, counting }), delay);
  }

  private clickAt(ac: AudioContext, t: number, accent: boolean) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.frequency.value = accent ? 1600 : 1000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(accent ? 0.35 : 0.2, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}
