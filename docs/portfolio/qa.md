# QA: web app against Figma and the behaviour checklist

Date: 2026-10-17. Build: `web/` on `feat/web-app`. Checked with Playwright (Chromium) at the Figma frame widths:
412 × 917 (compact), 600 × 960 (medium battle), 1024 × 768 (expanded), and dark at 412 and 1024. Every screenshot
was put side by side with the matching Figma frame's screenshot.

## Behaviour checklist (`audit.md`)

| Item | What the web app does | Checked by |
| --- | --- | --- |
| 1. Asks for the player's name first | The setup screen asks for "Your name" before anything else | `e2e/setup.spec.ts` |
| 2. A name with text is accepted | Continue goes on with the name, with the spaces around it removed | `setup-screen.test.tsx`, e2e |
| 3. Empty name accepted (bug) | Fixed in Phase 5: refused with "Enter a name to continue." | `setup-screen.test.tsx`, e2e |
| 4. Whitespace-only name accepted | Refused, same message | `setup-screen.test.tsx` |
| 5. Cancel loops forever | There is no cancel; Back from placement or a battle returns to the name screen with the name kept | e2e |
| 6. The name is never used | It is shown as "Ada's fleet" and in "You win, Ada" | e2e, screenshots |
| 7. Blocks until a name is given | The game does not start without a name | e2e |
| 8. No files, network or saving | Unchanged: the only download is the app and its engine | build output |

The game itself (placement, battle, the computer's play) follows `PRODUCT.md`: placement by hand with rotate, random,
reset and moving a placed ship; refusal of ships that leave the grid or overlap; aim then fire; the computer's reply
after a short pause; win and lose dialogs; play again with the same name; a question before leaving a battle; and the
engine's loading and error screens with a working retry. Each one is covered by `web/e2e/` at both widths.

## Fixed during QA

- Compact Start battle was full width; the frame shows a centred button.
- Expanded Continue was on the left; the frame puts it at the right end of the form.
- The final sinking shot showed a snackbar ("… 0 ships left") on top of the game-over dialog; the dialog alone now
  tells the result.
- The placement status jumped between one and two lines and moved the board; it now keeps room for two lines on
  compact.
- The refused-placement message vanished as soon as the pointer moved off the board; it now stays until another cell
  is tried.

## Accepted differences

| Where | Difference | Why it is accepted |
| --- | --- | --- |
| Status lines | Some texts are not in the frames: "Pick a cell on the enemy board, then fire." before the first shot, "The computer hit your ship at B7." and "The computer sank your Battleship at J10.", "Pick a cell" when nothing is aimed | The frames show one example per state; these follow the same voice and keep to one line at 380 dp |
| Computer sinking a ship | A snackbar also says "The computer sank your Destroyer. 4 of your ships left." | DESIGN.md says a sinking shot shows a snackbar; the frame only shows your own sinking shot |
| Placement on medium (600) | Uses the compact layout, centred at the board's width | Decided: medium changes only the battle screen |
| Placement on expanded | The disabled Start battle button is visible under the side pane | The frame has the button in its layers but it renders almost invisible in the screenshot; a visible disabled button tells you what comes next |
| Enemy ships on medium | The list starts level with the board, not with the "Enemy waters" label | The frame puts the label above the whole row; the gap matches within 4 dp |
| Boards below 412 dp | Cells shrink to fit the width | No frame exists below 412; keeps compact free of horizontal scroll |
| Game over, after Close | No Play again button outside the dialog; Back returns to the name screen with the name kept | No frame shows the closed state; adding a button would be a screen that is not in Figma (open question) |
| `index.html` theme colours | The two `theme-color` values repeat Surface Light and Dark | A meta tag cannot read CSS tokens |
| Fonts | Roboto from `@fontsource/roboto` 400 and 500 | Same family and weights as the kit; rendering differs slightly from Figma's |

## Not checked here

- Real phones (tap delay, safe areas, the on-screen keyboard): needs hardware.
- `review-animations` could not be run by an agent; it needs to be started by hand.
