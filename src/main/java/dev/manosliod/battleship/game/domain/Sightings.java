package dev.manosliod.battleship.game.domain;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public record Sightings(Map<Coordinate, Outcome> outcomes, List<Placement> sunk) {

    public Sightings {
        outcomes = Map.copyOf(outcomes);
        sunk = List.copyOf(sunk);
    }

    public boolean firedAt(Coordinate cell) {
        return outcomes.containsKey(cell);
    }

    public Optional<Outcome> outcomeAt(Coordinate cell) {
        return Optional.ofNullable(outcomes.get(cell));
    }

    public boolean partOfSunkShip(Coordinate cell) {
        return sunk.stream().anyMatch(p -> p.covers(cell));
    }
}
