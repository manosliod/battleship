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
