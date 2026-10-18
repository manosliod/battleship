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

## Worst case (`break-ui`)

Names tried at 320 and 412: "Aleksandra Wiśniewska-Kowalczyk", a 37-letter name with no spaces, "👩🏽‍🚀 Ada", "أميرة الحسن"
and "J". The name has no length limit in the engine or the form.

| Found | Fix |
| --- | --- |
| At 320 the enemy ship list pushed the page 51 px wider than the screen | The fleet column gives way first: your small board shrinks (131 dp at 320, 171 at 360, 198 at 412) and the list keeps its width |
| A name with no spaces ran into "Enemy ships" | The fleet title and dialog titles break long words |
| An Arabic name moved "’s fleet" to the wrong side | The name is isolated from the text around it |
| Marks could be larger than a shrunken cell | Marks and miss dots are capped to the cell size |

Held up: one-letter names, emoji and accented names, every screen at 412 and wider.

## Theme choice (KAN-28)

Date: 2026-10-18. Build: `web/` on `feat/theme-choice`. Checked with Playwright (Chromium) at the Figma frame widths:
412 × 917 (Theme sheet, light and dark), 600 × 960 (medium battle with the dialog), 1024 × 768 (Theme dialog, light and
dark; setup with the Theme button), and at 320 and 360 for the worst case. Each screenshot was compared with the
`get_screenshot` render of the matching frame (sheet 83-10505 / 83-10562, dialog 92-11401 / 92-11499, setup 56-2 /
56-77, medium 58-7112).

| Behaviour | Checked by |
| --- | --- |
| Theme button in every app bar, icon = current choice | `theme-button.test.tsx`, screenshots |
| Compact opens the sheet, medium and expanded the dialog with Done | `theme-button.test.tsx`, `e2e/theme.spec.ts` |
| A choice applies at once and the panel stays open | unit and e2e |
| Escape, scrim tap, Done and a swipe down close it; focus returns to Theme | e2e |
| Sheet or dialog stays the same while open when the window is resized | unit and e2e |
| Radio group named "Theme"; arrow keys move the choice | e2e |
| Stored under `theme`; applied before the app script runs; `color-scheme` and `theme-color` follow | `pre-paint.test.ts`, `theme-service.test.ts`, e2e |
| A storage that throws or refuses writes falls back to System | unit and e2e |
| System follows a live change of the device theme | e2e |
| A choice in another tab reaches this one | e2e |
| A failed panel download shows a snackbar and the next press opens it | unit and e2e |

### Accepted differences

| Where | Difference | Why it is accepted |
| --- | --- | --- |
| Sheet and dialog | Text and segments sit 1–3 px off the frame (picker 306 px wide in code, 309 in Figma) | Roboto from `@fontsource` renders slightly narrower than Figma's |
| Loading indicator while the Theme panel downloads | Not in Figma | Needed so a slow download has feedback (`standards/web.md`, item 1); it is the Forest loading indicator and appears only after 250 ms. Open question: add a frame |
| Snackbar "Couldn’t open Theme. Try again." | Not in Figma | The existing Forest snackbar with the same voice as the other messages; open question: add a frame |
| Android Back | Does not close the sheet | No other screen uses history (`docs/decisions.md`); the Handoff note 59-9540 still lists Back and needs the same edit as DESIGN.md |
| Expanded setup | Continue sits 16 px lower than in frame 56-77 | Present before this branch and outside the theme change |

### Worst case (`break-ui`)

| Found | Decision |
| --- | --- |
| Below 320 CSS px (a 412 px phone at 200% zoom or font scale) the three segments shrink to 57 px and the check icon and "System" overlap the next segment | Accepted: below the WCAG 1.4.10 reflow width of 320 px. Fixing it needs a layout M3 does not define for segmented buttons (open question) |

Held up: the sheet at 320 and 360 (segments 95–102 px, no horizontal scroll); the placement app bar at 320 and at
200% zoom (title wraps inside the bar, Back and Theme stay reachable); dark theme at every width; keyboard path with no
console errors.

### Not checked here

- Swipe feel, tap delay and safe areas on a real phone: needs hardware.
- `review-animations` is not installed for agents; it needs to be started by hand.
