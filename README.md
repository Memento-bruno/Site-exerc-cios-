# Rumo aos 5 km

Web app de treino pessoal em português do Brasil: um plano de **24 semanas** para correr **5 km em menos de 30 minutos**, ganhar músculo, melhorar a postura, liberar os movimentos, reduzir as dores e chegar aos 77 kg.

- **PWA**: instala no celular, abre em tela cheia e funciona **100% offline** (inclusive as imagens dos exercícios).
- **Sem backend**: tudo fica no aparelho (IndexedDB). Backup em JSON para exportar e importar.
- **Mobile-first**, tema claro e escuro, botões grandes, acessível.
- Pronto para virar app nativo Android/iOS com **Capacitor**.

## Telas

| Tela | O que faz |
|---|---|
| **Hoje** | Semana, fase e treino do dia calculados pela data de início. Botão "Começar", "Hoje estou com dor" (troca por treino leve), lembrete de mobilidade, badge de semana leve e revisão de fim de semana ("As dores pioraram?" → repetir a semana). |
| **Treino** | Mobilidade com checklist, bike com cronômetro, exercícios com animação, séries × repetições, carga sugerida (última usada e regra de progressão), timer de descanso com som e vibração, "Trocar exercício", Wake Lock. Ao terminar: escala de dor 0–10 por região, esforço 1–10 e observação. |
| **Corrida** | Timer intervalado com blocos do plano (aquecimento, corre/anda × N, tiros com km/h e min/km, desaquecimento), tela grande colorida (correr = laranja, andar = verde), voz em pt-BR, bips e vibração. Corridas por distância usam cronômetro. Registro de distância, tempo, ritmo e sensação. |
| **Plano** | 5 fases, 24 semanas, checkpoints e dicas. Cada semana mostra os 7 treinos com as datas reais. |
| **Progresso** | Peso (com metas por fase e IMC), cintura, tempo dos 5 km (linha dos 30 min), cargas por exercício, dores por região por semana, heatmap de constância, checkpoints e fotos de progresso (só no aparelho). |
| **Biblioteca** | Busca e filtros por tipo e equipamento. Página do exercício com animação, passo a passo, erros comuns, músculos, substituições, cuidados com as dores e link para o YouTube. |
| **Configurações** | Tema, sons, voz, vibração, descanso padrão, data de início, dias de escritório, lembretes, backup (exportar/importar), apagar tudo, instalar app. Páginas Segurança, Hábitos e Sobre. |

## Rodar localmente

Requisitos: Node 20+ e npm.

```bash
npm install
npm run dev        # http://localhost:5173
```

Outros comandos:

```bash
npm run build      # gera dist/ (roda o relatório de mídia antes)
npm run preview    # serve o build
npm test           # Vitest (semana/fase, repetição de semana, km/h↔min/km, blocos do timer, backup)
npm run lint       # ESLint
npm run format     # Prettier
```

## Imagens e animações dos exercícios

Cada exercício tem demonstração visual, nesta ordem de prioridade:

1. **Vídeo próprio** em `public/media/exercises/<id>/demo.mp4` (ou `.webm`).
2. **Fotos do [free-exercise-db](https://github.com/yuhonas/free-exercise-db)** (domínio público), convertidas para WebP e animadas com crossfade.
3. **Boneco em SVG** animado (quadros em `src/data/svg-keyframes.ts`), para mobilidade, core e basquete.
4. Botão **"Ver vídeo no YouTube"** (busca, nada incorporado).

### Atualizar as mídias

```bash
npm run fetch-media            # baixa o que falta do free-exercise-db e converte para WebP
npm run fetch-media -- --force # rebaixa tudo
npm run media-report           # regenera src/data/media-manifest.json e docs/media-coverage.md
```

As imagens ficam versionadas em `public/media/exercises/` para o app funcionar offline sem depender de hotlink. O relatório de cobertura está em [`docs/media-coverage.md`](docs/media-coverage.md).

### Adicionar seus próprios vídeos

1. Grave o vídeo (vertical ou horizontal, curto, sem áudio importante).
2. Salve como `public/media/exercises/<id>/demo.mp4` (o `id` está na URL da Biblioteca, ex.: `terra-romeno`).
3. Rode `npm run media-report` (ou só `npm run build`, que já faz isso). O vídeo passa a ser usado no lugar da animação, em loop, mudo e sem controles durante o treino.

## Deploy no Netlify

1. Suba o repositório para o GitHub.
2. No Netlify: **Add new site → Import an existing project → GitHub** e escolha o repositório.
3. Configuração (já vem do `netlify.toml`, confira):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Cada push na branch principal publica de novo.

O `netlify.toml` já tem o redirect de SPA (`/* → /index.html 200`, para o refresh em rotas internas não dar 404), cache longo para `/assets/*` e `/media/*`, e `no-cache` para o `sw.js`.

Para testar a PWA, use sempre HTTPS (o Netlify já dá). No Lighthouse (Chrome → DevTools → Lighthouse → Mobile), as categorias PWA, Performance, Accessibility e Best Practices devem ficar ≥ 90.

## Instalar como app

- **Android (Chrome)**: abra o site, toque no botão **"Instalar app"** em Configurações (ou no menu ⋮ → *Instalar app* / *Adicionar à tela inicial*).
- **iPhone (Safari)**: toque em **Compartilhar** (quadrado com seta) → **Adicionar à Tela de Início**. Abra sempre pelo ícone para ter tela cheia, Wake Lock e notificações (iOS 16.4+).

### Limitações do PWA (principalmente no iOS)

- **Tela bloqueada**: os navegadores pausam timers e áudio com a tela bloqueada. O app usa **Wake Lock** para manter a tela acesa durante treinos e corridas; deixe o brilho baixo em vez de bloquear.
- **Voz**: a Web Speech API só fala com o app em primeiro plano. No iOS a primeira fala precisa acontecer depois de um toque (o botão "Iniciar" já faz isso).
- **Vibração**: o iOS não expõe a Vibration API; usamos bip e voz. No Android funciona.
- **Notificações**: sem servidor, os lembretes só disparam com o app aberto ou instalado em segundo plano (varia por aparelho). Para lembretes confiáveis, a versão nativa (Capacitor) com `@capacitor/local-notifications` é o caminho.
- **Armazenamento**: o iOS pode apagar dados de sites não usados por semanas; instalar na tela inicial reduz o risco. **Exporte backups.**

## Gerar o app nativo com Capacitor

O projeto já tem `@capacitor/core`, `@capacitor/cli` e `capacitor.config.ts` (`webDir: dist`). A camada `src/lib/device.ts` isola Vibration, Wake Lock, som e notificações para serem trocadas por plugins.

```bash
npm run build
npx cap add android        # uma vez
npx cap add ios            # uma vez (precisa de macOS + Xcode)
npx cap sync               # copia dist/ e plugins para os projetos nativos
npx cap open android       # abre no Android Studio
npx cap open ios           # abre no Xcode
```

Plugins sugeridos para a versão nativa (trocar em `src/lib/device.ts`):

- `@capacitor/haptics` (vibração no iOS)
- `@capacitor-community/keep-awake` (tela acesa)
- `@capacitor/local-notifications` (lembretes mesmo com o app fechado)
- `@capacitor-community/text-to-speech` (voz em segundo plano)

As pastas `android/` e `ios/` estão no `.gitignore`; gere-as localmente.

## Estrutura

```
src/
  app/            # rotas, layout, barra inferior, página de erro
  components/     # Icon, ExerciseAnimation, StickFigureAnimation, PainScale, PwaUpdatePrompt…
  features/       # today, workout, run-timer, progress, plan, library, settings, onboarding, health
  data/           # plan.ts (24 semanas), exercises.ts (catálogo), svg-keyframes.ts, types.ts, media-manifest.json
  db/             # Dexie: schema, settings, backup, hooks
  lib/            # dates (semana atual, repetição), units (km/h↔min/km), run-blocks, progression, timer, device, speech, theme
  styles/
public/
  media/exercises/<id>/   # 0.webp, 1.webp, demo.mp4 (opcional)
  icons/
scripts/
  fetch-exercise-media.ts # baixa e converte as fotos
  media-manifest.ts       # manifesto + docs/media-coverage.md
  make-icons.mjs          # PNGs dos ícones
docs/media-coverage.md
netlify.toml
capacitor.config.ts
```

## O plano (fonte de verdade)

Está todo em `src/data/plan.ts` e `src/data/exercises.ts`, como dados tipados (`Phase`, `Week`, `DayWorkout`, `ExerciseRef`, `RunWorkout`, `Exercise`). Nada de treino está escrito nos componentes. Para mudar um exercício, uma carga ou um bloco de corrida, edite esses arquivos; os testes em `src/data/plan.test.ts` conferem a integridade.

Decisões tomadas onde a especificação não detalhava:

- Quarta-feira nas Fases 4 e 5 repete a opção da Fase 3 (20 min de bike ou o treino mini).
- Basquete na Fase 5 com 30–40 min, como na Fase 4.
- Corridas definidas por distância (sábados da Fase 4 em diante, testes) usam cronômetro com a meta em km; as por tempo usam o timer de blocos.
- Nos tiros, a duração de cada tiro é calculada pela velocidade (400 m a 10,4 km/h ≈ 2:18) para o timer avisar o fim.
- Deload (semanas 4, 8, 12, 16, 20): uma série a menos quando há 3+, senão ~30% menos repetições; as corridas já vêm reduzidas na tabela.
- A sugestão de carga sobe 0,5 / 1 / 2 kg (até 10 / até 20 / acima) quando todas as séries chegaram ao topo da faixa.

## Pendências e próximos passos

- **Sincronização na nuvem** (Supabase ou similar) para usar em mais de um aparelho; hoje o caminho é exportar/importar o backup.
- **Integração com Strava / Google Fit / Apple Saúde** para importar corridas e peso.
- **Lembretes confiáveis** com o app fechado (precisa da versão nativa ou de push com servidor).
- **Vídeos próprios** dos exercícios: a estrutura está pronta, basta gravar e colocar em `public/media/exercises/<id>/demo.mp4`.
- Melhorar o boneco em SVG (mais quadros e articulações) para os exercícios sem foto.
- Medir no Lighthouse em produção e ajustar o que faltar.
- Testes de interface (Playwright) para o fluxo completo: onboarding → treino → corrida → progresso.
- Editar dias de escritório muda só os avisos de "dia leve"; a grade semanal (força segunda e sexta, corrida sábado) continua fixa como no plano.
