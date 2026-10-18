package dev.manosliod.battleship.game.domain;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public record Fleet(List<Placement> placements) {

    public Fleet {
        placements = List.copyOf(placements);
        List<Placement> checked = new ArrayList<>();
        for (Placement placement : placements) {
            Optional<PlacementProblem> problem = problemWith(checked, placement);
            if (problem.isPresent()) {
                throw new IllegalArgumentException(placement + ": " + problem.get());
            }
            checked.add(placement);
        }
    }

    public static Fleet empty() {
        return new Fleet(List.of());
    }

    public Optional<PlacementProblem> check(ShipType type, Coordinate start, Orientation orientation) {
        return Placement.of(type, start, orientation)
                .map(placement -> problemWith(placements, placement))
                .orElse(Optional.of(PlacementProblem.OFF_BOARD));
    }

    public Fleet with(Placement placement) {
        List<Placement> next = new ArrayList<>(placements);
        next.add(placement);
        return new Fleet(next);
    }

    public Fleet without(ShipType type) {
        return new Fleet(placements.stream().filter(p -> p.type() != type).toList());
    }

    public Optional<Placement> placementOf(ShipType type) {
        return placements.stream().filter(p -> p.type() == type).findFirst();
    }

    public Optional<Placement> at(Coordinate cell) {
        return placements.stream().filter(p -> p.covers(cell)).findFirst();
    }

    public List<ShipType> missing() {
        return Arrays.stream(ShipType.values())
                .filter(type -> placementOf(type).isEmpty())
                .toList();
    }

    public boolean complete() {
        return missing().isEmpty();
    }

    private static Optional<PlacementProblem> problemWith(List<Placement> placed, Placement candidate) {
        if (placed.stream().anyMatch(p -> p.type() == candidate.type())) {
            return Optional.of(PlacementProblem.ALREADY_PLACED);
        }
        boolean overlaps = placed.stream().anyMatch(p -> p.cells().stream().anyMatch(candidate::covers));
        return overlaps ? Optional.of(PlacementProblem.OVERLAP) : Optional.empty();
    }
}
