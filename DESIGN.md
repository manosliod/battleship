# Design

The source of truth is the Figma page [↳ battleship](https://www.figma.com/design/Qs0Ang2VyFUpVXaoHzgdr6?node-id=1-10),
built from the Material 3 Design Kit and the Forest patterns `Battleship / Cell`, `Board` and `Fleet item`. This file
mirrors its values so the web demo can be built without opening Figma. If the two disagree, Figma wins and this file is
updated.

## Theme

Kit colour mode **Teal**: a calm sea on a crisp naval plotting table. Light and Dark follow `prefers-color-scheme`
(`Teal LT` / `Teal DT`). Hits use the Error roles, misses the Outline role.

## Colour roles

| Role | Light | Dark | Used for |
| --- | --- | --- | --- |
| Primary | `#006b60` | `#82d5c7` | Aimed cell ring and mark, Fire button |
| On Primary | `#ffffff` | `#003731` | Fire button label |
| Primary Container | `#9ef2e3` | `#006b5f` | Water cells |
| Secondary | `#4b645f` | `#b1ccc6` | Ship cells, focus ring, placement preview ring |
| Secondary Container | `#cae6df` | `#334b47` | Placement preview cells, current ship in the fleet list |
| On Secondary Container | `#334b47` | `#cce8e2` | Current ship name |
| Error | `#b3261e` | `#f2b8b5` | Sunk cells, invalid placement ring, error text |
| On Error | `#ffffff` | `#601410` | Mark on sunk cells |
| Error Container | `#f9dedc` | `#8c1d18` | Hit cells, invalid placement cells |
| On Error Container | `#8c1d18` | `#f9dedc` | Mark on hit cells |
| Surface | `#f4fbf8` | `#0e1513` | Screen background and the gaps between cells |
| Surface Container Low | `#eff5f2` | `#171d1b` | Fleet card on Setup |
| Surface Container Highest | `#dde4e1` | `#303634` | Miss cells |
| On Surface | `#171d1b` | `#dde4e1` | Text |
| On Surface Variant | `#3f4946` | `#bec9c5` | Supporting text, board coordinates |
| Outline | `#6f7976` | `#88938f` | Miss dot |
| On Primary Container 8% | `#2e4c4714` | `#ffffff14` | Hovered water cell |
| On Primary Container 10% | `#2e4c471a` | `#ffffff1a` | Focused and pressed water cell |

Dialogs sit on the kit Scrim role at 32% opacity, as in score-4.

## Board

| Part | Value |
| --- | --- |
| Grid | 10 × 10, columns A–J, rows 1–10, 2 dp gaps |
| Cell corner | Extra-small (4) |
| Large board | 34 dp cells, 20 dp coordinate band, 380 × 380 |
| Medium board | 30 dp cells, 20 dp coordinate band, 340 × 340 |
| Small board | 18 dp cells, no coordinates, 198 × 198 |
| Fleet item segment | 12 dp cell, corner Extra-small; item corner Full |
| Miss mark | 8 dp dot (6 dp on Small) |
| Hit and sunk mark | `close` icon, 22 dp (Large), 20 dp (Medium), 14 dp (Small) |
| Aimed mark | `my_location` icon, 2 dp Primary ring inside the cell |
| Focus ring | 3 dp Secondary, inside the cell |

## Cell contents and states

| Content | Fill | Mark |
| --- | --- | --- |
| Water | Primary Container | none |
| Ship | Secondary | none |
| Miss | Surface Container Highest | Outline dot |
| Hit | Error Container | On Error Container `close` |
| Sunk | Error | On Error `close` |
| Aimed | Primary Container | Primary `my_location` and ring |
| Preview | Secondary Container | 2 dp Secondary ring |
| Invalid | Error Container | 2 dp Error ring |

- Water cells on the enemy board take the M3 states: Hovered, Focused (state layer and focus ring), Pressed and
  Disabled. Disabled (the computer's turn) adds no state layer, as score-4's full column does.
- Every result carries a mark, so nothing depends on colour alone. In Dark, Error is the lighter role, so a sunk cell
  reads lighter than a hit cell; both differ from water by luminance and by mark.
- Measured contrast (WCAG): miss dot on its tile 3.48 (Light) and 3.89 (Dark); ship on water 4.95 and 3.77; hit mark
  7.17 and 7.17; sunk mark 6.54 and 7.66; coordinates on surface 8.88 and 10.88.

## Interaction

- **Aim, then fire.** A tap or click on a water cell of the enemy board aims it. A second tap on the aimed cell, the
  Fire button or Enter fires. Arrow keys move the aim. This keeps a mis-tap recoverable, because a 34 dp cell is below
  M3's 48 dp touch target and the 48 dp Fire button is the committing action.
- **Placement.** The current ship is placed from the tapped cell in its current direction; Rotate turns it across or
  down; tapping a placed ship picks it up; Random places the whole fleet; Reset clears it. A ship that would leave the
  grid or overlap shows Invalid cells and an Error title. Start battle is disabled until all five ships are placed.
- **Feedback.** Shot results update the status line; a sinking shot also shows a snackbar. Game over opens a dialog
  (Close, Play again). Back during a battle opens "Leave this game?" (Cancel, Leave).

## Type scale

Roboto throughout, from the kit's M3 text styles.

| Style | Size / line height | Weight | Tracking |
| --- | --- | --- | --- |
| Headline medium | 28 / 36 | 400 | 0 |
| Headline small | 24 / 32 | 400 | 0 |
| Title large | 22 / 28 | 400 | 0 |
| Title medium | 16 / 24 | 500 | 0.15 |
| Title small | 14 / 20 | 500 | 0.1 |
| Body large | 16 / 24 | 400 | 0.5 |
| Body medium | 14 / 20 | 400 | 0.25 |
| Body small | 12 / 16 | 400 | 0.4 |
| Label large | 14 / 20 | 500 | 0.1 |
| Label medium | 12 / 16 | 500 | 0.5 |
| Label small | 11 / 16 | 500 | 0.5 |

## Shape

Corners come from the kit: Extra-small 4 for cells, Large 16 for the fleet card, Full 1000 for fleet items.

## Layout

Mobile first. Compact (designed at 412) is one column: status, the enemy board (Large), the aim and Fire row, then your
fleet (Small board) beside the enemy ship list. Medium (designed at 600) keeps the column and puts a ship list beside each
board. Expanded (designed at 1024, from 840) shows both Large boards side by side with the status and Fire row above.
Placement on Expanded uses a 360 dp side pane (status, ships, actions, Start battle) next to the board.

## Icons

Kit: `arrow_back`, `close`, `error`. Added to Forest from Material Symbols Outlined 400 (`@material-symbols/svg-400`
0.48.0), because the kit lacks them: `shuffle`, `rotate_right`, `restart_alt`, `my_location`.
