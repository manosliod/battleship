package dev.manosliod.battleship.game.domain;

import java.util.List;

public final class Fleets {

    private Fleets() {}

    public static Coordinate at(String label) {
        return Coordinate.parse(label).orElseThrow();
    }

    public static Fleet rows() {
        return new Fleet(List.of(
                new Placement(ShipType.CARRIER, at("A1"), Orientation.HORIZONTAL),
                new Placement(ShipType.BATTLESHIP, at("C1"), Orientation.HORIZONTAL),
                new Placement(ShipType.CRUISER, at("E1"), Orientation.HORIZONTAL),
                new Placement(ShipType.SUBMARINE, at("G1"), Orientation.HORIZONTAL),
                new Placement(ShipType.DESTROYER, at("I1"), Orientation.HORIZONTAL)));
    }

    public static Fleet columns() {
        return new Fleet(List.of(
                new Placement(ShipType.CARRIER, at("A10"), Orientation.VERTICAL),
                new Placement(ShipType.BATTLESHIP, at("A8"), Orientation.VERTICAL),
                new Placement(ShipType.CRUISER, at("A6"), Orientation.VERTICAL),
                new Placement(ShipType.SUBMARINE, at("A4"), Orientation.VERTICAL),
                new Placement(ShipType.DESTROYER, at("A2"), Orientation.VERTICAL)));
    }

    public static List<Coordinate> cellsOf(Fleet fleet) {
        return fleet.placements().stream().flatMap(p -> p.cells().stream()).toList();
    }
}
