# Rodinha — contexto para o Claude Code

PWA para iniciante absoluta no violão (esposa do João). Ela nunca tocou; gosta de louvor
moderno, sertanejo universitário, pop rock nacional. Quer tocar e cantar junto.
Irmão do projeto `../guitar-lab` (de onde vieram o motor musical, áudio, PWA e CSS).

## Regras
- Português brasileiro, tom acolhedor, frases curtas, um passo por aula.
- Correção musical: desenhos de acorde em `src/music/shapes.ts` são escritos à mão, mas
  `shapes.test.ts` confere pela altura real (MIDI = afinação + casa) que soam as notas do
  acorde, com gabarito de notas escrito à mão. Desenho novo = gabarito novo no teste.
- Sem dados falsos: o app não escuta o violão. "Consegui fazer" é marcado por ela.
- Sem músicas/letras protegidas: só sequências de acordes genéricas, sem nome de música.
- Sem backend/login. Progresso em localStorage (`src/app/store.ts`).
- Não adicionar dependências sem necessidade.

## Estrutura
- `src/music/` motor (notas, braço, acordes) + `shapes.ts` (desenhos) + `songs.ts` (leitura de cifra e sugestão de capo)
- `src/content/lessons.ts` 15 aulas, batidas e sequências (conteúdo como dados)
- `src/ui/` ChordDiagram, afinação/partes do violão, áudio (Karplus-Strong, `PlayAlong`)
- `src/pages/` Início/Aulas/Aula/Afinar (`Lessons.tsx`), Tocar junto/Acordes/Músicas (`Tools.tsx`)

## Publicação
Todo push na `main` roda testes + build e publica no GitHub Pages
(`.github/workflows/deploy.yml`): https://arquitetojg-sudo.github.io/rodinha/
`gh` em `%LOCALAPPDATA%\Microsoft\WinGet\Links\gh.exe` (conta arquitetojg-sudo).
