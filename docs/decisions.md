# Decisions

## The name prompt rejects blank names and Cancel ends the program

In 2022 the prompt checked for an empty name with `==`, which compares objects, not text. So an empty name was
accepted, and Cancel brought the prompt back forever.

Now:

- A name made only of spaces, tabs or nothing is refused, and the prompt asks again with
  "Your name can't be blank. Please insert your name and press 'OK'".
- Spaces around a name are removed.
- Cancel (or closing the dialog) ends the program.

The recordings in `docs/portfolio/before/` stay as they were: they show the old program. The tests still check that
the first prompt shows the recorded message, and that a name is accepted on the first prompt (`name-ok`). The flows
whose result changed (`name-empty`, `name-whitespace`, `name-cancel-then-ok`, `name-cancel-x3-then-ok`) are tested
with new inputs in `PlayerNameCollectorTest`, so blank names and Cancel stay tested.

## The Swing dialog is gone; the game runs in the terminal and in the browser

The 2022 program was a single Swing dialog. The game now runs in the terminal, and a web version is built on the same
Java code. A Swing window would be a third screen to design and keep up to date, for no extra value.

The name question lost its "and press 'OK'" ending, because a terminal has no OK button. It now reads
"Please insert your name:". The tests check that this is the 2022 text without that ending.

## Running the terminal game

```sh
./gradlew installDist
build/install/battleship/bin/battleship
```

Ships go in with a start cell and a direction, for example `A1 across` or `B2 down`. `random` places the ships that
are left, and `reset` starts the placement again.

## Letters name the columns, numbers the rows

The terminal game first wrote the row as a letter (`B7` was row B, column 7, as on the boxed board game). The web
app and its Figma design put the letters across the top, so the same cell had two different names. Both now use
letters for columns and numbers for rows, so `B7` is column B, row 7 everywhere. The tests that name cells were
rewritten to name the same cells as before in the new way.

## The browser engine is the Java code, compiled with TeaVM

The plan allowed a TypeScript copy of the rules if TeaVM caused trouble. It did not, so the browser runs the same
Java code as the terminal game and the tests.

- The engine talks in plain numbers and texts, and returns the game as JSON, because those cross from Java to
  JavaScript without any conversion code.
- `Engine` keeps its sessions in a static field. The Java standard forbids static state, but a module that the
  browser imports needs one place to keep its games, and TeaVM exports only static methods. All the logic sits in
  `Session` and `Sessions`, which have no static state and are tested directly.
- JSON is written by a small `Json` class instead of a library, and without `String.format`: pulling in
  `String.format` made the engine about 74 KB gzipped; without it the engine is about 20 KB.
- TeaVM adds an annotation processor to the main code that only supports Java 11 sources. With `-Werror` its warning
  fails the build, and nothing in the main code needs it, so it is removed from `annotationProcessor`.

## Engine sessions are not closed when a screen goes away

A game's engine session is closed when you leave the game. If the game goes away another way (Try again after an
error, or a page that embeds the game removes it), the session is released when the browser frees the game's
objects (a `FinalizationRegistry` in `engine-service.ts`). Closing it from a clean-up on unmount would close it in
development too, where React mounts every component twice on purpose, and the second mount would then play on a
closed session.

## The web name check follows the Java one

The engine removes spaces around a name with Java's `strip()`, which also removes four rarely typed control
characters (U+001C to U+001F) that JavaScript's `trim()` keeps. The name screen refuses a name made only of those
characters too, so a name it accepts is never refused later by the engine.

## The theme choice is one store for the whole app

**Chose:** a module-level store in `web/src/shared/stores/`, read by the Theme button in every app bar.

**Instead of:** a store per screen, or a feature folder for the theme.

**Why:** the choice belongs to the whole app (`standards/react.md`, "State"), and setup, placement, battle and the
engine screens all show the button. Features may not import each other, so the button and its store live in `shared/`.
The store adds its `storage` listener when the first component subscribes and removes it when the last one leaves, so
no listener outlives the page's use of it and tests start clean.

## Dark colours are written once

**Chose:** a Tailwind `dark` custom variant used once around the dark token values. It matches an element when the page
(or an ancestor) has `data-theme='dark'`, and, under `@media (prefers-color-scheme: dark)`, when the page is not set to
Light: `:where([data-theme='dark'], [data-theme='dark'] *)` and `:where(:root:not([data-theme='light']),
:root:not([data-theme='light']) *)`. On `:root` these are the two rules `standards/web.md` asks for.

**Instead of:** copying the dark values into two blocks, or `light-dark()`.

**Why:** one copy of the Figma values cannot drift, and the same variant makes `dark:` utilities right on any element,
not only on `<html>`.

## The theme-color and color-scheme tags follow the choice

**Chose:** for Light or Dark, the matching `<meta name="theme-color">` gets `media="all"` and the other `not all`, and
`<meta name="color-scheme">` names the chosen scheme. System puts back the two `prefers-color-scheme` queries and
`light dark`.

**Instead of:** writing a colour into the tag from script.

**Why:** the colours stay in `index.html` once, the script holds no colour values, and on System the browser follows a
change of the device theme by itself. The tags are changed with `setAttribute`, which every browser and the test DOM
treat the same way.

## The Theme picker downloads on its own; the sheet and dialog do not

**Chose:** the Theme picker is its own chunk, fetched when the pointer or focus reaches the Theme button and again when
it is pressed. The sheet and dialog (the Base UI drawer and dialog) are in the first download. If the picker has not
arrived 250 ms after the press, the sheet or dialog opens in its Loading state (title "Theme", the Forest loading
indicator labelled "Loading Theme" where the picker goes, Done on the dialog), and the picker takes the indicator's
place in the same open surface when it arrives. Closing it while loading cancels the open. A failed download closes
the surface, returns focus to Theme and shows the snackbar "Couldn’t open Theme. Try again."; the next press tries
again.

**Instead of:** the whole panel as one chunk with the indicator alone over the screen, or the picker in the first
download as well.

**Why:** the Figma frames "Battle · Theme sheet · Compact · Loading" and "Battle · Theme dialog · Expanded · Loading"
show the surface open while the picker downloads, so the surface code must already be there. That costs about 27 kB
gzip in the first download (entry 104.5 kB of the 125 kB budget); the picker chunk stays separate because it is rarely
opened (`standards/react.md`, "Performance"). The 250 ms wait is read from `--motion-duration-medium1`, so a fast
download opens straight on the picker with no flash of the indicator. Both the indicator slot and the picker are
`--spacing-theme-picker` (310 px, the Figma Loading slot) wide, so the surface does not change size when the picker
arrives.

## Sheet or dialog is chosen once per opening

**Chose:** the window class is read when Theme is pressed, and the sheet or dialog stays the same until it closes.

**Instead of:** following the window width live.

**Why:** a resize (a phone turned sideways, a split screen) would otherwise swap the open sheet for a dialog under the
player's finger and lose focus. Reading the width only on press also means no listener runs while the panel is closed.

## Android Back does not close the sheet

**Chose:** scrim tap, swipe down and Escape close the Theme sheet; Done, Escape and scrim tap close the dialog.

**Instead of:** a history entry per opening so the system Back gesture closes it.

**Why:** the app has no router and no other screen uses history; adding one for this panel would make Back behave
differently here than everywhere else. DESIGN.md says the same.

## The game-over dialog waits until Theme closes

**Chose:** when the game ends while the Theme panel is open, the panel stays open and the game-over dialog opens once
the player closes it. The status line already says who won behind the panel.

**Instead of:** closing the Theme panel when the game ends.

**Why:** M3 shows one modal at a time and never takes a surface away from the player while they are using it; the
player opened Theme on purpose, and the result is not lost by waiting. Two modals at once would also give two focus
traps.
