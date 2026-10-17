# Audit: battleship

Date: 2026-10-17. Source: `src/battleship/BattleShip.java` (8 lines) and `Display.java` (26 lines).

## What it is
A NetBeans 8.2 / Ant Swing project (Java source/target 1.8). It is not a game: `main` creates `Display`, which shows one modal
`JOptionPane` input dialog ("Please insert your name and press 'OK'") and stores the answer in `playerName`. Nothing reads
`playerName`. No board, ships, turns or win rule exist.

## Git history
- `1f91fc2` (2022-06-21) uploaded everything under `BattleShip/`; `a95d15f` (same minute) uploaded the same 14 files at the repo root.
- Blob-for-blob identical (checked with `cmp` on every file). `edd7090` deleted the `BattleShip/` copy.
- The deleted folder held no extra game code: same two classes, same 26 + 8 lines.

## Build and run
- Ant is not installed. Built with `javac -d $TMPDIR/classes src/battleship/*.java` (Temurin 21, via `bash -ic`); output outside the repo.
- Run: `java -cp $TMPDIR/classes battleship.BattleShip`. Needs a display; `DISPLAY=:0` was available. No Xvfb in the environment, so no virtual display.
- GUI capture: `before/Harness.java` (kept outside the app, not a source edit) starts `BattleShip.main`, finds the dialog, types text, clicks OK/Cancel through the Swing API and paints the dialog to PNG.
  Compile: `javac -cp classes -d h before/Harness.java`; run: `java -cp classes:h Harness <outprefix> '<step>|<step>'`; a step is the text to type or `CANCEL`.
- The PNGs are painted off-screen, so the title bar is black and OS decorations are missing. This is not a window screenshot.
- Committed `build/classes/*.class` is class-file version 52 (Java 8), so it differs from the Java 21 build only in the version byte.

## Behaviour checklist (8 items)
1. On start, one modal input dialog titled "Input" appears with message "Please insert your name and press 'OK'", a text field, OK and Cancel (flows `name-ok`).
2. OK with text: the dialog closes and the program ends (no window remains, JVM exits) (`name-ok`).
3. OK with empty text: accepted, program ends. The loop test `playerName == ""` compares references and is never true for the dialog's string. **bug** (`name-empty`).
4. OK with whitespace only: accepted, program ends (`name-whitespace`).
5. Cancel (or closing the dialog): `playerName` is `null`, so the dialog is shown again, forever, until a non-null value is entered (`name-cancel-then-ok`, `name-cancel-x3-then-ok`).
6. The entered name is stored in a private field and never used: no output, no state change.
7. Constructor blocks the calling thread until the loop ends.
8. No command-line arguments, files, network or persistence.

## Flows in `before/`
Each has `<flow>.in` (the steps), `<flow>.txt` (harness log: dialog title, component tree, prompts, final state) and `<flow>-promptN.png`.

| Flow | Input steps | Result |
| --- | --- | --- |
| name-ok | `Ada` | 1 prompt, ends |
| name-empty | (empty) | 1 prompt, ends; **bug** item 3 |
| name-whitespace | three spaces | 1 prompt, ends |
| name-cancel-then-ok | `CANCEL|Ada` | 2 prompts, ends |
| name-cancel-x3-then-ok | `CANCEL|CANCEL|CANCEL|Ada` | 4 prompts, ends |

- Cut rule for the cancel loop: a flow that only cancels never ends, so every flow is cut after its last scripted step; the output is the dialog log and the line `after steps: dialog visible=false threadAlive=false`. The marker is the line `prompt N input=...`, one per dialog shown.
- `name-empty` is **provisional**: it depends on checklist item 3 (bug). If Phase 5 fixes the comparison, the flow must be rewritten, not regenerated.
- There are no `as-built` flows: the program shows its intended behaviour with no undefined behaviour.
- These are GUI logs, not console output, so they are an oracle only for a Swing-level test (headless-capable harness), not for stdout comparison.

## Committed `build/` and `lib/`
- `build/classes/battleship/BattleShip.class` (476 B) and `Display.class` (663 B), Java 8 class files.
- `lib/CopyLibs/org-netbeans-modules-java-j2seproject-copylibstask.jar` (26,716 B, NetBeans CopyLibs Ant task, 2016) and `lib/nblibraries.properties`.
- Also committed IDE state: `nbproject/` (`build-impl.xml` 1445 lines, generated), `nbproject/private/` (machine-specific: `C:\Users\manli\AppData\Roaming\NetBeans\8.2\build.properties`, `private.xml`). Untracked `.idea/` left untouched.

## Debt and risks
1. There is no game: the product's core (boards, ship placement, turns, win) must be designed and built from nothing. PRODUCT.md and the plan need a product decision.
2. Committed binaries: class files and a jar in git; `nbproject/private/` and a local Windows path committed. No `.gitignore`.
3. Reference comparison `playerName == ""` (item 3): empty name is accepted; Cancel loops forever with no way to quit.
4. Dead state: `playerName` is never read; `Display` is a constructor-only class with a blocking loop, not a UI class.
5. Stack is obsolete: Ant + NetBeans 8.2, source level 1.8, no Gradle/Maven, no tests, no README, no licence, no CI.
6. Boilerplate comments in `Display.java` (NetBeans licence header, `@author`) and the JavaDoc block; the "no descriptive comments" rule applies.
7. UI is a `JOptionPane` dialog, not a window; not responsive; desktop Swing cannot be shown as a web demo, so the demo strategy needs a decision (web port or Java target).
8. Secrets/SQL: none found. Dependencies: none apart from the CopyLibs jar (build-time only).

## Not run
- Ant (`ant clean jar`): not installed; replaced with direct `javac`/`java`.
- Real window screenshots at OS level: no Xvfb; used off-screen painting through Swing instead.
- Rule mining agent: not required for this repo.
