# Tooling

## Java build

The project builds with Gradle (the wrapper in `gradlew`, Kotlin DSL). Versions live in `gradle/libs.versions.toml`.

- Gradle's toolchain pins Java 25. It looks for an installed Java 25 (for example from SDKMAN) and does not
  download one, so another Java on your path is fine as long as 25 is installed too.
- Every compile runs with `-Xlint:all -Werror`: any compiler warning fails the build.
- TeaVM adds an annotation processor to the main code. It only supports Java 11 sources, so with `-Werror` its
  warning would fail the build. Nothing in the main code uses it, so `build.gradle.kts` removes it from
  `annotationProcessor`.

```sh
./gradlew spotlessCheck build
./gradlew generateJavaScript     # the engine, in build/generated/teavm/js/battleship-engine.js
./gradlew installDist            # the terminal game, in build/install/battleship/bin/battleship
```

## Java formatting

Spotless with palantir-java-format, plus removal of unused imports, trailing spaces removed and a newline at the end
of every file. `./gradlew spotlessCheck` fails on any difference; `./gradlew spotlessApply` fixes it.

## Java tests

JUnit 6 (through its BOM) and AssertJ. `./gradlew test` runs them; `build` runs them too.

## Web app

The web app in `web/` uses pnpm (the version is in `package.json`, `packageManager`) and Node 24 (`web/.nvmrc`).
Before the first run, build the engine: `pnpm run engine` calls `./gradlew generateJavaScript`.

| Command | What it does |
| --- | --- |
| `pnpm lint` | ESLint, then Prettier's check, then a check that no JavaScript file is in the project |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest with Testing Library, in jsdom |
| `pnpm build` | Vite build, then a size check: the entry script must stay under 125 kB gzip and the CSS under 12 kB |
| `pnpm e2e` | Playwright in Chromium at 412 × 917 (phone) and 1024 × 768 (desktop), with reduced motion on |
| `E2E_BASE_URL=https://manosliod.github.io/battleship/ pnpm e2e` | The same tests against the live demo, without starting a local server. Keep the slash at the end of the address |

### TypeScript

`strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`,
`noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` and `erasableSyntaxOnly`. None is switched
off.

### ESLint

typescript-eslint's strict and stylistic type-checked sets, React Hooks, jsx-a11y (the maintained `jsx-a11y-x` fork,
since the original does not support ESLint 10) and Prettier's config to turn off formatting rules. On top:

- `useEffect`, `useLayoutEffect` and `useInsertionEffect` can only be imported in `src/shared/hooks/`.
- Types are written with `type`, not `interface`.
- No default exports, except in `*.config.ts` files, where the tools ask for one.
- Imports are grouped and sorted.
- A feature may not import another feature; `shared/` and `forest/` may not import features or `app/`; `forest/` may
  not import `shared/`.
- File and folder names in `src/` are kebab-case.

No rule is switched off in app code.

### Prettier

Tabs, width 4, no semicolons, single quotes, no trailing commas, lines up to 120 characters.

### pnpm

`pnpm-workspace.yaml` refuses the build script of `unrs-resolver`: it only downloads a faster native resolver that
ESLint's import plugin can do without.

## CI

`.github/workflows/ci.yml` runs on every pull request, and the release workflow runs it once more before it deploys
(see "Releases"). A push to `main` does not run it on its own: the branch protection only lets a pull request merge
when it is up to date with `main` and its checks pass, so `main` only ever holds code CI has already passed. A newer
push to the same pull request cancels the run before it.

| Job | What it runs |
| --- | --- |
| `no-comments` | The shared check from `manosliod/dev-tooling` (`@v1.3`): no comment written for people in any tracked file |
| `java` | `./gradlew spotlessCheck build generateJavaScript` on Java 25 |
| `web` | Builds the engine, then `pnpm lint`, `typecheck`, `test`, `build` and `e2e` |

`pull-request.yml` checks that each pull request title is a conventional commit with a `KAN-` Jira key.

## Releases

`release.yml` runs release-please (from `manosliod/dev-tooling`) on every push to `main`. It keeps one release pull
request open that collects the changes; merging it makes the tag, the GitHub release and the changelog. The version in
`build.gradle.kts` is updated through its `x-release-please-version` marker. The first release, `v0.1.0`, is the
untouched 2022 code (`bootstrap-sha` in `release-please-config.json`).

When a release is made, the same workflow first runs the whole of `ci.yml` on the released commit (its checks show as
`ci / java`, `ci / web` and so on). Only when it passes does it build the web app and publish it to GitHub Pages at
https://manosliod.github.io/battleship/. It builds the engine first, then the app with `BATTLESHIP_BASE` set to
`/battleship/` so its files load from that folder. If CI fails, nothing is deployed and the live demo stays on the
previous release. The deploy can also be started by hand from the Actions tab ("Release" → "Run workflow"); a
hand-started run runs CI and deploys, and never makes a release.
