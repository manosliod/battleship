package dev.manosliod.battleship.game.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public record Ocean(Fleet fleet, List<Coordinate> shots) {

    public Ocean {
        if (!fleet.complete()) {
            throw new IllegalArgumentException(
                    "Every ship must be placed before the battle: missing " + fleet.missing());
        }
        shots = List.copyOf(shots);
        if (shots.stream().distinct().count() != shots.size()) {
            throw new IllegalArgumentException("A cell can only be fired at once");
        }
    }

    public static Ocean of(Fleet fleet) {
        return new Ocean(fleet, List.of());
    }

    public boolean firedAt(Coordinate cell) {
        return shots.contains(cell);
    }

    public Volley fire(Coordinate cell) {
        if (firedAt(cell)) {
            throw new IllegalStateException(cell.label() + " was already fired at");
        }
        List<Coordinate> next = new ArrayList<>(shots);
        next.add(cell);
        Ocean ocean = new Ocean(fleet, next);
        return new Volley(ocean, ocean.outcomeOf(cell));
    }

    public boolean isSunk(ShipType type) {
        return fleet.placementOf(type)
                .map(p -> p.cells().stream().allMatch(this::firedAt))
                .orElse(false);
    }

    public boolean allSunk() {
        return fleet.placements().stream().allMatch(p -> isSunk(p.type()));
    }

    public List<ShipType> afloat() {
        return fleet.placements().stream()
                .map(Placement::type)
                .filter(type -> !isSunk(type))
                .toList();
    }

    public Sightings sightings() {
        Map<Coordinate, Outcome> outcomes = new HashMap<>();
        Ocean replay = new Ocean(fleet, List.of());
        for (Coordinate shot : shots) {
            Volley volley = replay.fire(shot);
            outcomes.put(shot, volley.outcome());
            replay = volley.ocean();
        }
        List<Placement> sunk =
                fleet.placements().stream().filter(p -> isSunk(p.type())).toList();
        return new Sightings(outcomes, sunk);
    }

    private Outcome outcomeOf(Coordinate cell) {
        Optional<Placement> ship = fleet.at(cell);
        if (ship.isEmpty()) {
            return new Outcome.Miss();
        }
        ShipType type = ship.get().type();
        return isSunk(type) ? new Outcome.Sunk(type) : new Outcome.Hit();
    }

    public record Volley(Ocean ocean, Outcome outcome) {}
}
