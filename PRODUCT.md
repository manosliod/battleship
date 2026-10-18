# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Register

product

## Users

Two groups, both on a phone more often than not:

- **Visitors from the portfolio**: a recruiter or engineer who opens the demo from a link and gives it a few minutes.
  They want to see quickly that the game works, that the computer plays a real game, and that it was built with care.
- **One player against the computer**: someone who wants a quick round of classic Battleship. They want to place a
  fleet in seconds, take shots without friction, and always know what happened and whose turn it is.

The job on every screen is the same: get to the boards, take a shot, read the result, see who is winning.

## Product Purpose

Battleship is a single-player game against the computer. The 2022 repository is a 34-line Swing stub that only asks for
a name in a `JOptionPane` dialog and never uses it (`docs/portfolio/audit.md`). It is rebuilt as a tested Java game core
that runs as a console app and, compiled with TeaVM, behind a React web front end.

Rules: classic Battleship on a 10×10 grid (columns A–J, rows 1–10). Each side has a fleet of five ships: Carrier 5,
Battleship 4, Cruiser 3, Submarine 3, Destroyer 2. Ships lie horizontally or vertically, inside the grid, without
overlapping. Players take turns firing one shot at a cell of the other's grid; each shot is a miss, a hit, or a hit that
sinks a ship. The first side to sink the whole enemy fleet wins.

Flow: setup (player name) → fleet placement → battle → game over (you win or the computer wins, play again).

Success: a visitor plays a full game on a phone without instructions, and every shot result is unmistakable.

## Positioning

The same tested Java engine plays the console game and the web demo; the web build does not reimplement the rules.

## Capabilities and Constraints

- **Name prompt** kept from 2022: the name is required. Blank or whitespace-only input is rejected with an error message
  (the 2022 dialog accepted both, audit items 3 and 4). Cancel in the console exits instead of re-asking forever
  (audit item 5). The web setup screen replaces the dialog.
- **Fleet placement**: random placement or manual placement, rotate a ship between horizontal and vertical, reset the
  layout. Start is enabled only when all five ships are placed.
- **Battle**: your fleet board and the enemy target board, a turn indicator, the result of every shot (miss, hit,
  sunk, with the ship's name on sunk) and the status of both fleets.
- **Computer opponent**: hunt/target. It fires at random untried cells until it hits, then tries the neighbours of the
  hit until the ship sinks.
- **Engine**: Java compiled with TeaVM; the web app shows a loading state while the engine starts and an error state
  with a retry if it fails.
- No accounts, no network play, no persistence (inferred from the audit: the 2022 program had none).
- Undecided (deferred to Manos): whether a hit grants another shot (classic rules: no; taken as no); whether the
  computer's shot is shown with a short delay (taken as yes, so the player can follow it).

## Brand Commitments

Personality (inferred from the brief and the score-4 sibling): calm, precise, clean. The tension lives in the shot and
its result, not in decoration. Voice is short and plain ("Your turn", "Hit", "You sank the Cruiser", "Computer wins").

## Evidence on Hand

- `docs/portfolio/audit.md` and `docs/portfolio/before/*.png`: the 2022 name dialog in five recorded flows.
- No real users, scores, testimonials or play data exist; none may be invented.

## Product Principles

1. **The boards are the screen.** Setup, turn and result serve the two grids and stay out of their way.
2. **Every shot answers.** Miss, hit and sunk each get clear, distinct feedback; nothing happens silently.
3. **Never by colour alone.** Miss, hit, sunk and ship cells differ by a mark or shape as well as colour.
4. **Same rules everywhere.** Console and web play the same game from the same tested engine.
5. **Material, not costume.** Standard Material 3 components and roles; no naval chrome, no military insignia.

## Anti-references

- Arcade and ad-network war games: explosions, camouflage, military badges, neon.
- Skeuomorphic 3D: rendered ships, water textures, metal plates.
- The bare framework demo: two grids of buttons with no care for states, feedback or turns.

## Accessibility & Inclusion

- WCAG 2.2 AA in light and dark themes.
- Colour-blind safe: shot results and ship cells carry distinct marks.
- Fully playable with a keyboard (arrow keys move across the target grid, Enter fires; R rotates while placing) and
  announced to screen readers (turn, shot coordinate, result, ship sunk, game over).
- `prefers-reduced-motion` respected.
- Touch targets: a 10-column board leaves 34 dp cells on a 412 dp window, below M3's 48 dp. A tap on a cell only aims;
  firing is the 48 dp Fire button (or a second tap on the aimed cell), so a mis-tap is never a wasted shot (`DESIGN.md`,
  "Interaction"). Inferred default; confirm with Manos.
