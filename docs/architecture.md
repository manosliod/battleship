# Architecture

Battleship against the computer, played in the terminal or in the browser. The rules live in `game/` and are
described in `docs/rules.md`; the terminal game and the web app are two ways of showing the same game.

```mermaid
flowchart LR
    Main --> ConsoleGame
    ConsoleGame --> PlayerNameCollector
    PlayerNameCollector --> NameInput
    ConsoleNameInput -.implements.-> NameInput
    ConsoleGame --> Battle
    Battle --> Game
    Battle --> HuntTargetTargeting
```

- `app/Main` builds the parts and starts the program in the terminal.
- `app/cli/ConsoleGame` is the terminal game: name, fleet placement, battle, play again. It talks to the player only
  through `Console`, so tests can type for the player and read what was printed.
- `app/cli/BoardView` draws a board as text. `app/cli/ConsoleNameInput` asks for the name in the terminal.
- When the input ends (Ctrl+D, or the end of a piped file), the game stops at once without an error.
- `player/application/NameInput` is how the program asks for text. Tests use a scripted version.
- `player/domain/PlayerName` is a name with the spaces around it removed. A name made only of spaces is not a name.
- `player/application/PlayerNameCollector` asks for a name. A blank answer makes it ask again with a short
  explanation. Cancel ends the program without a name.

The old behaviour is pinned by the files in `docs/portfolio/before/`, which the tests read.

## The game

- `game/domain` holds the rules and nothing else: no screen, no keyboard, no randomness of its own.
  - `Coordinate` is one cell, `Placement` is one ship on the board, `Fleet` is the five ships of one side.
  - `Ocean` is a fleet together with the shots fired at it. It answers miss, hit or sunk.
  - `Sightings` is what the other side is allowed to know about an ocean: where it fired, what happened, and which
    ships sank.
  - `Game` is both oceans and whose turn it is. Every move returns a new `Game`; nothing is changed in place.
  - `FleetPlacer` places ships at random, using a `Dice` it is given, so tests can make it repeatable.
- `game/application/Battle` runs a game: your shot, then the computer's reply, chosen by a `Targeting`.
- `game/application/HuntTargetTargeting` is how the computer chooses (see "How the computer plays" in `docs/rules.md`).
  `RandomTargeting` fires anywhere it has not fired yet; tests use it as the simplest opponent.

## The browser engine

The web version does not copy the rules into TypeScript. TeaVM turns the same Java code into a JavaScript module,
`build/generated/teavm/js/battleship-engine.js`, with `./gradlew generateJavaScript`.

- `src/teavm/java/.../engine/Engine` is the list of functions the browser can call: open a session, place, remove,
  place the rest at random, clear, start, fire, rematch, read a snapshot, close.
- `Session` holds one game: the fleet being placed, then the battle. `Sessions` keeps the open ones by number.
- Every call answers with a short problem name (`OVERLAP`, `ALREADY_FIRED`, …) or an empty text when it worked.
  `snapshot` answers with the whole game as JSON, written by `Json`, so the browser never has to keep its own copy
  of the rules or of the game.

## The web app

The web app lives in `web/`. It is a React app built with Vite, and it can also be imported as one component,
`Battleship` from `web/src/app/battleship.tsx`, so the portfolio site can show it.

- `app/` puts the screens together: the name screen, then the game. The game part (placement and battle) and the
  engine load only when they are needed, and the name screen starts loading them as soon as you type or point at
  Continue.
- `features/setup` is the name screen. `features/placement` is fleet placement and `features/battle` is the battle.
  Each screen keeps its state in its own small store, made when the screen opens and dropped when it closes.
- `shared/services/engine-service.ts` loads the engine module and checks every value it returns before the app uses
  it. A value the engine should never return stops the app with an error instead of showing a wrong board.
- `shared/components/board` draws a 10 × 10 board; `shared/components/fleet-item.tsx` draws one ship in a list.
- `forest/` holds the Material 3 parts shared with the other projects: buttons, text field, dialog, snackbar, app bar.
- `shared/hooks/use-guard.ts` catches a failure in a button or board action (an engine answer the app does not
  understand) and shows "Something went wrong in the game" with Try again, instead of leaving a screen that no
  longer answers. A failed engine download shows "The game engine didn't start" instead.
- When the battle screen goes away, for any reason, it stops the computer's pending reply and hides the snackbar.
- `shared/hooks/use-reduced-motion.ts` follows the system "reduce motion" setting. When it is on, the computer's reply
  shows at once instead of after a short pause.
- `shared/components/theme/` is the Theme button, shown at the trailing end of every app bar, and the Theme panel it
  opens: a bottom sheet on a phone, a dialog on wider windows. `shared/stores/theme-store.ts` holds the choice (System,
  the default, Light or Dark) for the whole app, and `shared/services/theme-service.ts` is the only code that touches
  `localStorage` (key `theme`) and the page's `data-theme`, `color-scheme` and `theme-color` tags.
- **The theme is set before the app starts.** A short script in `index.html` reads the saved choice and marks the page
  (`data-theme`) before anything is drawn, so a returning player never sees the wrong colours flash. Choosing in the
  Theme panel saves the choice and marks the page again at once. On System the browser follows the device setting,
  live, through CSS; no code watches it. A choice made in another tab arrives through the browser's `storage` event;
  the store listens for it only while some part of the page shows the theme, and stops when nothing does. It also
  reads the saved choice again whenever something starts showing the theme and when the browser brings the page back
  from its back-forward cache, so a choice made elsewhere in the meantime is never missed.
- **There is one Theme panel for the whole app.** It lives in the app shell (`theme-panel-host.tsx`), next to the
  screens, and `shared/stores/theme-panel-store.ts` says whether it is open. The Theme button on each app bar only asks
  the store to open it. So a screen that changes while the panel is open (the engine finishing its download, for
  example) does not close it, and closing returns focus to the Theme button that is on screen now.
- **The Theme panel downloads on its own**, as soon as the pointer or keyboard focus reaches the Theme button. If it is
  still downloading when the button is pressed, a loading indicator fades in after a quarter of a second. Once
  downloaded, it opens at once. If the download fails, a snackbar says "Couldn’t open Theme. Try again." and the next
  press tries again.
- **The game-over dialog waits for the Theme panel.** If the computer's last shot lands while the Theme panel is open,
  the dialog opens only once the panel has closed, so only one modal is ever on screen.
- **Sheet or dialog is decided when Theme is pressed** (`shared/utils/window-class.ts`, which asks the browser for the
  600 dp medium breakpoint that `styles/tokens.css` sets, so the width is written in one place only). It stays the
  same until the panel closes, even if the window is resized, and closing always returns focus to the Theme button.

The engine answers your shot and the computer's reply in one call. The battle screen shows your shot at once and the
reply a moment later, so you can follow both.
