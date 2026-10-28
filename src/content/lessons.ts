import type { StrumStep } from '../ui/audio';

/**
 * Trilha para quem nunca tocou. Conteúdo como dados.
 * Um passo por aula; cada aula termina com algo para fazer no violão.
 * O app não escuta o instrumento: o "consegui" é marcado por ela mesma.
 */

export interface Pattern {
  id: string;
  name: string;
  /** Como falar a batida em voz alta. */
  say: string;
  steps: StrumStep[];
}

export const PATTERNS: Pattern[] = [
  { id: 'um', name: '1 por compasso', say: 'BAIXO (2, 3, 4)', steps: ['D', '-', '-', '-', '-', '-', '-', '-'] },
  { id: 'dois', name: '2 por compasso', say: 'BAIXO (2) BAIXO (4)', steps: ['D', '-', '-', '-', 'D', '-', '-', '-'] },
  { id: 'quatro', name: '4 para baixo', say: 'baixo, baixo, baixo, baixo', steps: ['D', '-', 'D', '-', 'D', '-', 'D', '-'] },
  { id: 'pop', name: 'Batida pop', say: 'baixo, baixo-cima, cima-baixo-cima', steps: ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'] },
];

export const patternById = (id: string) => PATTERNS.find((p) => p.id === id) ?? PATTERNS[2];

export interface Progression {
  id: string;
  label: string;
  /** Ids de desenhos (src/music/shapes.ts). */
  chords: string[];
  note?: string;
}

export const PROGRESSIONS: Progression[] = [
  { id: 'em', label: 'Só Em', chords: ['Em'] },
  { id: 'em-am', label: 'Em e Am', chords: ['Em', 'Am'] },
  { id: 'c-am', label: 'C e Am', chords: ['C', 'Am'] },
  { id: 'g-em', label: 'G e Em', chords: ['G', 'Em'] },
  { id: 'g-c', label: 'G e C', chords: ['G', 'C'] },
  { id: 'd-g', label: 'D e G', chords: ['D', 'G'] },
  { id: 'pop', label: 'G D Em C', chords: ['G', 'D', 'Em', 'C'], note: 'A sequência mais usada no pop, no sertanejo e no louvor atual.' },
  { id: 'pop2', label: 'Em C G D', chords: ['Em', 'C', 'G', 'D'], note: 'A mesma sequência começando do Em: clima mais emotivo.' },
  { id: 'romantica', label: 'G Em C D', chords: ['G', 'Em', 'C', 'D'], note: 'Clássica de baladas e sertanejo romântico.' },
  { id: 'louvor', label: 'G Cadd9 Em7 Dsus4', chords: ['G-ancora', 'Cadd9', 'Em7', 'Dsus4'], note: 'O som do louvor moderno: dedos 3 e 4 ficam parados nas cordas 1 e 2.' },
  { id: 'rock', label: 'Em C D', chords: ['Em', 'C', 'D', 'D'], note: 'Pegada de pop rock nacional. Toque com mais força.' },
  { id: 'mi', label: 'E A B7', chords: ['E', 'A', 'B7', 'E'], note: 'Tom de Mi. O B7 é o mais difícil daqui.' },
];

export const progressionById = (id: string) => PROGRESSIONS.find((p) => p.id === id);

export interface Block {
  title?: string;
  text: string[];
  /** Desenhos de acordes para mostrar. */
  shapes?: string[];
  /** Mostra os botões de som das cordas soltas. */
  tuning?: boolean;
  /** Mostra o diagrama explicado (como ler um acorde). */
  howToRead?: boolean;
  /** Mostra as partes do violão. */
  parts?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  blocks: Block[];
  /** O que ela deve conseguir fazer no violão para marcar como feita. */
  checklist: string[];
  /** Acordes que esta aula ensina (vão para "Meus acordes"). */
  teaches?: string[];
  practice?: { progression: string; pattern: string; bpm: number; barsPerChord: number; hint: string };
}

export const LESSONS: Lesson[] = [
  {
    id: 'conhecendo',
    title: 'Conhecendo o violão',
    summary: 'As partes do violão e o nome das cordas.',
    minutes: 5,
    blocks: [
      {
        parts: true,
        text: [
          'O violão tem três partes principais: o corpo (a parte grande, que faz o som), o braço (onde a mão esquerda aperta as cordas) e a cabeça (onde ficam as tarraxas, que afinam as cordas).',
          'No braço há filetes de metal chamados trastes. O espaço entre dois trastes é uma casa. A casa 1 é a mais perto da cabeça.',
        ],
      },
      {
        title: 'As 6 cordas',
        text: [
          'As cordas são numeradas de baixo para cima, olhando o violão no colo: a 1ª é a mais fina (fica embaixo, perto do chão) e a 6ª é a mais grossa (fica em cima, perto do seu rosto).',
          'Parece ao contrário, mas é assim em todo lugar. Toda cifra e todo vídeo vão falar "6ª corda" para a grossa.',
          'Soltas, elas são: 6ª Mi, 5ª Lá, 4ª Ré, 3ª Sol, 2ª Si, 1ª Mi. Uma frase para lembrar: "Meu Lindo Rei Salvou Sua Mãe".',
        ],
        tuning: true,
      },
    ],
    checklist: ['Sei onde fica a casa 1', 'Sei qual é a 1ª e qual é a 6ª corda'],
  },
  {
    id: 'postura',
    title: 'Como segurar o violão',
    summary: 'Postura, mão esquerda e mão direita, sem dor.',
    minutes: 8,
    blocks: [
      {
        title: 'Sentada',
        text: [
          'Sente na ponta de uma cadeira sem braço, costas retas. Apoie a cintura do violão (a curva do corpo) na perna direita.',
          'O braço do violão aponta para a esquerda, um pouco para cima. O violão fica encostado na sua barriga, de pé, sem deitar para trás: você não precisa enxergar as cordas de cima.',
        ],
      },
      {
        title: 'Mão esquerda (a que aperta)',
        text: [
          'O polegar fica atrás do braço, mais ou menos no meio. Os outros dedos ficam arredondados, como se segurassem uma bola pequena.',
          'Aperte com a ponta do dedo, bem perto do traste (o filete de metal), não no meio da casa. Assim precisa de bem menos força.',
          'Unhas da mão esquerda curtas. Com unha comprida, o dedo não fica em pé e a corda abafa.',
        ],
      },
      {
        title: 'Mão direita (a que toca)',
        text: [
          'O antebraço apoia na borda do corpo do violão. A mão fica solta, na altura da boca (o buraco).',
          'Pode tocar com uma palheta fina ou com a ponta do indicador. Nas batidas, quem se mexe é o pulso, não o braço inteiro.',
        ],
      },
      {
        title: 'Sobre a dor',
        text: [
          'Nas primeiras semanas a ponta dos dedos vai doer um pouco. É normal: está formando um calinho. Em duas ou três semanas melhora muito.',
          'Melhor 10 minutos todo dia do que 1 hora no fim de semana. Se doer de verdade (pulso, ombro), pare e descanse.',
        ],
      },
    ],
    checklist: ['Consigo segurar o violão sem ele escorregar', 'Aperto uma corda perto do traste e ela soa limpa'],
  },
  {
    id: 'afinar',
    title: 'Afinando o violão',
    summary: 'Por que afinar sempre e como fazer.',
    minutes: 8,
    blocks: [
      {
        text: [
          'Violão desafinado faz até o acorde certo soar errado. Afine toda vez que for tocar: leva um minuto.',
          'O jeito mais fácil é um afinador: pode ser um de clipe (preso na cabeça do violão) ou um app gratuito de afinador no celular. Este app não escuta o violão, então use um desses.',
          'No afinador, toque uma corda solta e gire a tarraxa dela devagar até ele mostrar a nota certa (E, A, D, G, B, E) e ficar verde. Gire pouco de cada vez.',
        ],
      },
      {
        title: 'Para comparar de ouvido',
        text: ['Os botões abaixo tocam o som de cada corda afinada. Bom para conferir se está "parecido", mas o afinador é mais preciso.'],
        tuning: true,
      },
    ],
    checklist: ['Afinei as 6 cordas com um afinador'],
  },
  {
    id: 'ler-acorde',
    title: 'Como ler um desenho de acorde',
    summary: 'Os números dos dedos e o que é X e O.',
    minutes: 5,
    blocks: [
      {
        howToRead: true,
        text: [
          'Acorde é um grupo de notas tocadas juntas. No violão, cada acorde é um "desenho" que a mão esquerda faz.',
          'No desenho, as linhas em pé são as cordas (a 6ª, grossa, à esquerda) e as linhas deitadas são os trastes. A linha grossa no topo é o começo do braço.',
          'As bolinhas mostram onde apertar, e o número dentro diz qual dedo usar: 1 indicador, 2 médio, 3 anelar, 4 mindinho.',
          'Em cima: O quer dizer corda solta (toca sem apertar); X quer dizer não toque essa corda.',
        ],
      },
    ],
    checklist: ['Sei qual dedo é o 1, o 2, o 3 e o 4', 'Sei o que é X e O no desenho'],
  },
  {
    id: 'em',
    title: 'Primeiro acorde: Em',
    summary: 'Mi menor, com dois dedos.',
    minutes: 10,
    teaches: ['Em', 'Em7'],
    blocks: [
      {
        shapes: ['Em'],
        text: [
          'Em (lê-se "Mi menor") é o acorde mais fácil do violão: dedo 2 na 5ª corda, casa 2, e dedo 3 na 4ª corda, casa 2. Todas as cordas soam.',
          'Monte o acorde e toque uma corda de cada vez, da 6ª até a 1ª. Se alguma sair abafada, ajeite o dedo: mais em pé, mais perto do traste, sem encostar na corda de baixo.',
          'Depois passe a mão direita em todas as cordas de uma vez, de cima para baixo.',
        ],
      },
      {
        title: 'Bônus: Em7',
        shapes: ['Em7'],
        text: ['Tire o dedo 3 e fica só o dedo 2: isso é o Em7. Soa mais aberto e aparece muito em louvor.'],
      },
    ],
    checklist: ['Toco Em e as 6 cordas soam limpas, uma por uma'],
    practice: { progression: 'em', pattern: 'um', bpm: 60, barsPerChord: 1, hint: 'Toque uma vez a cada 4 batidas do clique. Tire a mão e monte de novo a cada vez.' },
  },
  {
    id: 'batida-baixo',
    title: 'Primeira batida: para baixo',
    summary: 'Tocar no tempo, junto com o clique.',
    minutes: 10,
    blocks: [
      {
        text: [
          'Música tem um pulso, como um coração. O clique do app marca esse pulso: 4 batidas por compasso, com a primeira mais forte.',
          'Com o Em montado, toque para baixo junto com cada clique, contando em voz alta: "1, 2, 3, 4". O mais importante não é a força, é cair junto com o clique.',
          'Comece devagar. Quando ficar fácil, aumente um pouco a velocidade (os BPM).',
        ],
        shapes: ['Em'],
      },
    ],
    checklist: ['Toco 4 para baixo junto com o clique, sem atrasar'],
    practice: { progression: 'em', pattern: 'quatro', bpm: 60, barsPerChord: 1, hint: 'Uma batida para baixo em cada clique.' },
  },
  {
    id: 'am',
    title: 'Segundo acorde: Am e a primeira troca',
    summary: 'Lá menor e como trocar sem parar a música.',
    minutes: 12,
    teaches: ['Am'],
    blocks: [
      {
        shapes: ['Em', 'Am'],
        text: [
          'O Am (Lá menor) é quase o Em: os dedos 2 e 3 descem uma corda (vão para a 4ª e a 3ª, casa 2) e o dedo 1 entra na 2ª corda, casa 1. Não toque a 6ª corda.',
          'Para trocar: mova os dedos juntos, como um bloco, e não um de cada vez.',
        ],
      },
      {
        title: 'O segredo da troca',
        text: [
          'No começo a troca vai atrasar. O truque: na última batida antes da troca, já solte o acorde e vá para o próximo. Se uma corda soar solta nesse momento, tudo bem: o ritmo é mais importante que o acorde perfeito.',
          'Treine primeiro com 1 batida por compasso (tempo de sobra para trocar). Depois 2, depois 4.',
        ],
      },
    ],
    checklist: ['Troco Em ↔ Am sem parar o clique'],
    practice: { progression: 'em-am', pattern: 'um', bpm: 60, barsPerChord: 1, hint: 'Uma batida no "1" e use os tempos 2, 3 e 4 para trocar.' },
  },
  {
    id: 'c',
    title: 'O acorde C',
    summary: 'Dó maior, primo do Am.',
    minutes: 12,
    teaches: ['C'],
    blocks: [
      {
        shapes: ['Am', 'C'],
        text: [
          'O C (Dó maior) parece com o Am: os dedos 1 e 2 ficam no mesmo lugar, e só o dedo 3 muda, indo para a 5ª corda, casa 3. Não toque a 6ª corda.',
          'Por isso C ↔ Am é uma troca fácil: só um dedo se mexe. Deixe os outros parados.',
          'Atenção ao dedo 3: ele costuma encostar na 4ª corda e abafar. Deixe ele bem em pé.',
        ],
      },
    ],
    checklist: ['Toco C com todas as cordas certas soando', 'Troco C ↔ Am com 2 batidas por compasso'],
    practice: { progression: 'c-am', pattern: 'dois', bpm: 60, barsPerChord: 1, hint: 'Só o dedo 3 se mexe nessa troca.' },
  },
  {
    id: 'g',
    title: 'O acorde G',
    summary: 'Sol maior, o mais usado nas músicas atuais.',
    minutes: 12,
    teaches: ['G'],
    blocks: [
      {
        shapes: ['G'],
        text: [
          'O G (Sol maior) abre bem a mão: dedo 1 na 5ª corda casa 2, dedo 2 na 6ª corda casa 3, dedo 3 na 1ª corda casa 3. Todas as cordas soam.',
          'Pode parecer longe no começo. Monte, solte e monte de novo, umas 10 vezes, sem tocar. A mão aprende o caminho.',
        ],
      },
      {
        title: 'Troca com Em',
        shapes: ['Em', 'G'],
        text: ['Do Em para o G: o dedo 1 do G vai exatamente onde estava o dedo 2 do Em (5ª corda, casa 2). Use esse ponto como referência e encaixe os outros dois. Treine G ↔ Em e depois G ↔ C.'],
      },
    ],
    checklist: ['Toco G com as 6 cordas soando', 'Troco G ↔ Em no tempo'],
    practice: { progression: 'g-em', pattern: 'dois', bpm: 60, barsPerChord: 1, hint: 'Monte o G pensando nos dedos 2 e 3 primeiro.' },
  },
  {
    id: 'd',
    title: 'O acorde D',
    summary: 'Ré maior, o triângulo.',
    minutes: 12,
    teaches: ['D'],
    blocks: [
      {
        shapes: ['D'],
        text: [
          'O D (Ré maior) forma um triângulo nas 3 cordas mais finas: dedo 1 na 3ª corda casa 2, dedo 2 na 1ª corda casa 2, dedo 3 na 2ª corda casa 3.',
          'Toque só as 4 cordas mais finas (da 4ª para baixo). Começar a batida na 4ª corda leva prática; no começo, se pegar a 5ª de leve, não tem problema.',
        ],
      },
    ],
    checklist: ['Toco D sem abafar a 1ª corda', 'Troco D ↔ G no tempo'],
    practice: { progression: 'd-g', pattern: 'dois', bpm: 60, barsPerChord: 1, hint: 'Do G para o D a mão "encolhe". Pense no triângulo.' },
  },
  {
    id: 'sequencia',
    title: 'A sequência das músicas atuais',
    summary: 'G, D, Em e C: quatro acordes, centenas de músicas.',
    minutes: 15,
    blocks: [
      {
        shapes: ['G', 'D', 'Em', 'C'],
        text: [
          'Com G, D, Em e C você já tem a sequência mais usada da música de hoje. Ela aparece demais em louvor, sertanejo universitário e pop rock, às vezes com o capotraste em outra casa (tem uma aula sobre isso).',
          'Toque G → D → Em → C, um compasso de cada, e repita. Comece com 2 batidas por compasso e depois passe para 4.',
          'Muitas músicas usam a mesma sequência começando de outro lugar: Em → C → G → D, ou C → G → D → Em. Teste todas na tela Tocar junto.',
        ],
      },
    ],
    checklist: ['Toco G D Em C em sequência, 4 batidas cada, sem parar'],
    practice: { progression: 'pop', pattern: 'quatro', bpm: 65, barsPerChord: 1, hint: 'Se uma troca travar, treine só ela por um minuto e volte.' },
  },
  {
    id: 'batida-pop',
    title: 'A batida pop',
    summary: 'Baixo, baixo-cima, cima-baixo-cima.',
    minutes: 15,
    blocks: [
      {
        text: [
          'Essa é a batida que mais aparece em louvor, sertanejo e pop. Fale em voz alta: "baixo, baixo-cima, cima-baixo-cima".',
          'O segredo: a mão nunca para de balançar, para baixo e para cima, no ritmo. Em alguns momentos ela passa sem tocar as cordas (no tempo 3 ela "pula" a batida para baixo).',
          'Treine primeiro só com o Em, devagar, até sair sem pensar. Depois use a sequência G D Em C.',
        ],
        shapes: ['Em'],
      },
    ],
    checklist: ['Faço a batida pop com um acorde só, sem me perder', 'Faço a batida pop trocando G D Em C'],
    practice: { progression: 'pop', pattern: 'pop', bpm: 60, barsPerChord: 1, hint: 'Batida para cima: só nas cordas mais finas, de leve.' },
  },
  {
    id: 'louvor',
    title: 'O som do louvor moderno',
    summary: 'Em7, Cadd9 e Dsus4 com a "âncora".',
    minutes: 15,
    teaches: ['G-ancora', 'Cadd9', 'Dsus4'],
    blocks: [
      {
        shapes: ['G-ancora', 'Cadd9', 'Em7', 'Dsus4'],
        text: [
          'Muito louvor atual usa versões "abertas" dos acordes, com os dedos 3 e 4 parados nas cordas 1 e 2, casa 3. Essa é a âncora: os outros dedos mudam e ela fica.',
          'G (com âncora) → Cadd9: os dedos 1 e 2 descem uma corda cada. Em7: os dedos de cima saem e fica o dedo 2 (pode manter a âncora junto). Dsus4: mantenha a âncora e ponha o dedo 1 na 3ª corda, casa 2; toque só as 4 cordas finas.',
          'Nas cifras, o Cadd9 costuma aparecer como C9 e o Dsus4 como D4. É normal ver C9 e D4 em cifra de louvor.',
        ],
      },
    ],
    checklist: ['Toco G → Cadd9 → Em7 → Dsus4 mantendo a âncora'],
    practice: { progression: 'louvor', pattern: 'quatro', bpm: 65, barsPerChord: 1, hint: 'Dedos 3 e 4 não saem do lugar entre G e Cadd9.' },
  },
  {
    id: 'capo',
    title: 'Capotraste: tocar em qualquer tom',
    summary: 'Os mesmos desenhos, mais agudo, para caber na sua voz.',
    minutes: 10,
    blocks: [
      {
        text: [
          'O capotraste é uma braçadeira que prende todas as cordas numa casa. Com ele na casa 2, por exemplo, o desenho de G soa como A (Lá).',
          'Serve para duas coisas: tocar uma música no tom original usando os desenhos fáceis que você já sabe, e mudar o tom para caber na sua voz.',
          'Coloque o capo logo atrás do traste (do lado da casa), bem reto. Depois de colocar, confira a afinação.',
        ],
      },
      {
        title: 'Na prática',
        text: [
          'Achou uma cifra cheia de acordes difíceis (Bb, F#m, Bm…)? Cole os acordes na tela Músicas: o app testa o capo da casa 0 à 7 e mostra qual deixa a música com os desenhos que você já sabe.',
          'Em cifras de louvor e sertanejo é comum já vir escrito "Capo na 2ª casa" no topo. Nesse caso, os acordes da cifra já são os desenhos: é só pôr o capo e tocar.',
        ],
      },
    ],
    checklist: ['Coloquei o capo e o som saiu limpo', 'Usei a tela Músicas com uma cifra de verdade'],
  },
  {
    id: 'cantar',
    title: 'Tocar e cantar juntos',
    summary: 'O passo a passo para não se perder.',
    minutes: 15,
    blocks: [
      {
        text: [
          'Tocar e cantar ao mesmo tempo é uma habilidade à parte: no começo, todo mundo se perde. O caminho é por etapas.',
          '1. Toque a sequência da música até sair sem olhar para a mão.',
          '2. Tocando, cantarole a melodia só com "lá lá lá".',
          '3. Tocando, fale a letra no ritmo, sem cantar.',
          '4. Agora cante. Se travar, simplifique a batida: volte para "4 para baixo" e só depois a batida pop.',
        ],
      },
      {
        title: 'Onde trocar o acorde',
        text: [
          'Nas cifras, o acorde fica escrito em cima da sílaba onde ele entra. Normalmente cai no começo do compasso, numa sílaba forte.',
          'Ouça a música original algumas vezes prestando atenção só nas trocas. Muitas vezes a troca acontece um pouco antes do que parece.',
        ],
      },
    ],
    checklist: ['Toquei uma sequência inteira cantarolando', 'Toquei e cantei um trecho de uma música que eu gosto'],
    practice: { progression: 'pop', pattern: 'quatro', bpm: 70, barsPerChord: 2, hint: 'Cantarole por cima, sem parar a mão.' },
  },
];

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);

/** Acordes já ensinados, a partir das aulas concluídas. */
export function learnedShapes(done: Record<string, number>): Set<string> {
  const out = new Set<string>();
  for (const l of LESSONS) if (done[l.id]) for (const s of l.teaches ?? []) out.add(s);
  return out;
}
