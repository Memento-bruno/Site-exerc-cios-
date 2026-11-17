# Rumo aos 5 km — app Android (Kotlin)

App nativo em Kotlin + Jetpack Compose. Três telas na barra inferior:

1. **Dashboard** — passos, calorias gastas e consumidas, peso, sono e FC de repouso do dia.
2. **Exercícios** — treino do dia e atalhos (plano, biblioteca, corrida, progresso, hábitos).
3. **Configurações** — conexões (Health Connect, Galaxy Ring, balança), metas, chave da IA e preferências.

## Como baixar o APK

Cada push que mexe em `android/` roda o workflow **Android APK** no GitHub Actions.
Abra a execução mais recente em *Actions → Android APK* e baixe o artefato
`rumo-aos-5km-debug-apk` (um .zip com o .apk). No celular, permita instalar
apps de fontes desconhecidas para o navegador ou gerenciador de arquivos.

## Rodar localmente

Abra a pasta `android/` no Android Studio, ou:

```bash
cd android
./gradlew assembleDebug        # APK em app/build/outputs/apk/debug/
./gradlew testDebugUnitTest    # testes de unidade
```

## Roteiro

- [x] Esqueleto das 3 telas e APK pelo GitHub Actions
- [ ] Health Connect: Galaxy Ring (passos, calorias, sono, FC) e balança (peso)
- [ ] Foto do prato com estimativa de calorias
- [ ] Widgets na tela inicial (passos e calorias do dia)
- [ ] Portar o plano de 24 semanas do app web (`src/data/plan.ts`)
