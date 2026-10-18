# Battleship

Classic Battleship against a smart computer, from one tested Java engine.

![Battleship](docs/portfolio/cover.png)

Battleship on a 10 × 10 board, one player against the computer. You place five ships by hand or at random, then
take turns firing until one fleet is sunk. The rules live in one tested Java engine: it runs the terminal game, and
the browser plays the same engine compiled to JavaScript with TeaVM, behind a mobile-first React app.

**[Live demo](https://manosliod.github.io/battleship/)** · [Design (Figma)](https://www.figma.com/design/Qs0Ang2VyFUpVXaoHzgdr6?node-id=1-10) · [Case study](docs/portfolio/case-study.md)

## Features

- Classic fleet of five: Carrier 5, Battleship 4, Cruiser 3, Submarine 3, Destroyer 2
- Place ships by hand (rotate, move, reset) or let the game place them at random
- A computer that hunts on a spaced pattern and follows a line after a hit
- Plays in the terminal and in the browser, from the same Java code
- Phone first, with tablet and desktop layouts, light and dark themes
- Aim then fire on touch, full keyboard play, and every shot announced to screen readers

## Stack

- Java 25 (Temurin), Gradle 9.8 with the Kotlin DSL, JUnit 6 and AssertJ
- TeaVM 0.16 to compile the engine to a JavaScript module
- React 19 with the React Compiler, TypeScript, Vite, Zustand, Base UI and Tailwind CSS 4
- Vitest with Testing Library, and Playwright for browser tests
- Designed in Figma on Material 3 (the kit's Teal colour mode)

## Getting started

```bash
java -version          # 25 (Gradle's toolchain looks for an installed Java 25)
node -v                # 24
pnpm -v                # pnpm comes with corepack: corepack enable

./gradlew installDist
build/install/battleship/bin/battleship     # the terminal game

./gradlew generateJavaScript                 # builds the engine for the web app
cd web && pnpm install && pnpm dev           # the web app on http://localhost:5173
```

In the terminal, ships go in as a start cell and a direction, for example `A1 across` or `B2 down`; `random` places
the ships that are left and `reset` starts again.

## Development

| Task | Command |
| --- | --- |
| Format | `./gradlew spotlessApply` · `cd web && pnpm format` |
| Lint | `./gradlew spotlessCheck` · `cd web && pnpm lint && pnpm typecheck` |
| Test | `./gradlew test` · `cd web && pnpm test && pnpm e2e` |
| Build | `./gradlew build generateJavaScript` · `cd web && pnpm build` |

## Project structure

```
src/main/java/dev/manosliod/battleship/
  game/domain/        the rules: cells, ships, fleets, oceans, the game
  game/application/   a battle and the computer's targeting
  player/             the player's name
  app/                the terminal game
src/teavm/java/       the engine the browser calls, compiled by TeaVM
src/test/java/        JUnit tests, including the recorded 2022 behaviour
web/
  src/app/            the screens put together; exported as one Battleship component
  src/features/       setup, placement, battle
  src/shared/         board, engine service, hooks, types
  src/forest/         Material 3 parts shared with the other projects
  e2e/                Playwright tests at phone and desktop widths
docs/                 architecture, rules, decisions, tooling, portfolio assets
```

## History

Originally written in 2022 as a Java Swing project that only asked for a player name; rebuilt in 2026 as a full game
with a tested Java engine, a terminal game and a React web app designed in Figma. The before/after is in the
[case study](docs/portfolio/case-study.md).

## License

MIT © 2026 Manos Liodakis · [LinkedIn](https://www.linkedin.com/in/emmanouil-liodakis/) · [GitHub](https://github.com/manosliod)
