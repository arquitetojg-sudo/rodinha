import { useSyncExternalStore } from 'react';

/**
 * Progresso salvo neste aparelho (localStorage). Sem conta, sem servidor.
 * Se o navegador bloquear o armazenamento, o app funciona e só não lembra.
 */
export interface Data {
  /** Aulas concluídas: id → data. */
  done: Record<string, number>;
  /** Itens marcados no "consegui fazer": `${aula}:${índice}`. */
  checks: Record<string, boolean>;
  bpm: number;
  click: boolean;
  strumSound: boolean;
  /** Minutos de prática no "Tocar junto", por dia (AAAA-MM-DD). */
  minutes: Record<string, number>;
}

const KEY = 'rodinha:v1';
const DEFAULT: Data = { done: {}, checks: {}, bpm: 60, click: true, strumSound: true, minutes: {} };

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const d = JSON.parse(raw) as Partial<Data>;
    return { ...DEFAULT, ...d };
  } catch {
    return DEFAULT;
  }
}

let data: Data = load();
export let storageOk = true;
const listeners = new Set<() => void>();

export function getData() {
  return data;
}

export function update(fn: (d: Data) => Data) {
  data = fn(data);
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    storageOk = true;
  } catch {
    storageOk = false;
  }
  listeners.forEach((l) => l());
}

export function useData(): Data {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => data,
  );
}

export const today = () => new Date().toLocaleDateString('sv-SE');

export const actions = {
  toggleCheck(key: string) {
    update((d) => ({ ...d, checks: { ...d.checks, [key]: !d.checks[key] } }));
  },
  markDone(lessonId: string) {
    update((d) => ({ ...d, done: { ...d.done, [lessonId]: d.done[lessonId] ?? Date.now() } }));
  },
  unmarkDone(lessonId: string) {
    update((d) => {
      const done = { ...d.done };
      delete done[lessonId];
      return { ...d, done };
    });
  },
  set<K extends keyof Data>(k: K, v: Data[K]) {
    update((d) => ({ ...d, [k]: v }));
  },
  addMinutes(min: number) {
    const k = today();
    update((d) => ({ ...d, minutes: { ...d.minutes, [k]: Math.round(((d.minutes[k] ?? 0) + min) * 10) / 10 } }));
  },
  reset() {
    update(() => DEFAULT);
  },
};
