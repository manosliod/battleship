package dev.manosliod.battleship.game.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public record Placement(ShipType type, Coordinate start, Orientation orientation) {

    public Placement {
        if (start.step(orientation, type.length() - 1).isEmpty()) {
            throw new IllegalArgumentException(type.displayName() + " at " + start.label() + " leaves the board");
        }
    }

    public static Optional<Placement> of(ShipType type, Coordinate start, Orientation orientation) {
        return start.step(orientation, type.length() - 1).isPresent()
                ? Optional.of(new Placement(type, start, orientation))
                : Optional.empty();
    }

    public List<Coordinate> cells() {
        List<Coordinate> cells = new ArrayList<>(type.length());
        for (int i = 0; i < type.length(); i++) {
            cells.add(start.step(orientation, i).orElseThrow());
        }
        return List.copyOf(cells);
    }

    public boolean covers(Coordinate cell) {
        return cells().contains(cell);
    }
}
