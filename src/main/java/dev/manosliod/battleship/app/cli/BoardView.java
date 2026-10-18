package dev.manosliod.battleship.app.cli;

import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Fleet;
import dev.manosliod.battleship.game.domain.Ocean;
import dev.manosliod.battleship.game.domain.Outcome;
import dev.manosliod.battleship.game.domain.Sightings;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

final class BoardView {

    static final String GAP = "     ";

    private BoardView() {}

    static List<String> fleet(Fleet fleet) {
        return render(cell -> fleet.at(cell).isPresent() ? 'S' : '.');
    }

    static List<String> home(Ocean ocean) {
        Sightings sightings = ocean.sightings();
        return render(cell -> {
            Optional<Outcome> outcome = sightings.outcomeAt(cell);
            if (outcome.isPresent()) {
                return outcome.get() instanceof Outcome.Miss ? 'o' : 'X';
            }
            return ocean.fleet().at(cell).isPresent() ? 'S' : '.';
        });
    }

    static List<String> target(Ocean ocean) {
        Sightings sightings = ocean.sightings();
        return render(cell -> sightings
                .outcomeAt(cell)
                .map(outcome -> switch (outcome) {
                    case Outcome.Miss miss -> 'o';
                    case Outcome.Hit hit -> sightings.partOfSunkShip(cell) ? '#' : 'X';
                    case Outcome.Sunk sunk -> '#';
                })
                .orElse('.'));
    }

    static List<String> sideBySide(String leftTitle, List<String> left, String rightTitle, List<String> right) {
        int width = left.getFirst().length();
        List<String> lines = new ArrayList<>();
        lines.add(pad(leftTitle, width) + GAP + rightTitle);
        for (int i = 0; i < left.size(); i++) {
            lines.add(pad(left.get(i), width) + GAP + right.get(i));
        }
        return lines;
    }

    private static List<String> render(Function<Coordinate, Character> symbol) {
        List<String> lines = new ArrayList<>();
        StringBuilder header = new StringBuilder("  ");
        for (int column = 0; column < Coordinate.SIZE; column++) {
            header.append("  ").append((char) ('A' + column));
        }
        lines.add(header.toString());
        for (int row = 0; row < Coordinate.SIZE; row++) {
            StringBuilder line = new StringBuilder(String.format("%2d", row + 1));
            for (int column = 0; column < Coordinate.SIZE; column++) {
                line.append("  ").append(symbol.apply(new Coordinate(row, column)));
            }
            lines.add(line.toString());
        }
        return lines;
    }

    private static String pad(String text, int width) {
        return text + " ".repeat(Math.max(0, width - text.length()));
    }
}
