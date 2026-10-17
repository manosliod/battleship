# Rules

- The board is 10 by 10. Rows are letters A to J, columns are numbers 1 to 10, so a cell is written like `B7`.
- Each side has five ships: Carrier (5 cells), Battleship (4), Cruiser (3), Submarine (3) and Destroyer (2).
- A ship lies in a straight line, across or down, inside the board. Ships may touch but not overlap.
- You place your ships yourself or let the game place them at random. The computer's ships are always placed at
  random, and you cannot see them.
- You fire first. Then the computer fires, and so on, one shot each, whether the shot hits or not.
- A shot is a miss (water), a hit, or sinks a ship when it hits the last cell of that ship. When a ship sinks, its
  name is announced and its cells are shown.
- You cannot fire at the same cell twice.
- Whoever sinks all five enemy ships first wins.

## How the computer plays

The computer only sees what you would see: where it fired, what happened, and which ships sank.

- **Hunting.** While none of your ships is hit, it fires on a spaced pattern, like the black squares of a chess
  board. The gap matches the shortest ship still afloat, so no ship can hide between its shots.
- **Targeting.** After a hit it fires at the cells next to it. After two hits in a line it keeps going along that
  line, and turns back when it meets water or the edge.
- When the ship sinks it goes back to hunting.
- It picks at random among equally good cells, so no two games are the same.
