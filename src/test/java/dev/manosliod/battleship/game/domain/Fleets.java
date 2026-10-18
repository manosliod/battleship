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
                new Placement(ShipType.BATTLESHIP, at("A3"), Orientation.HORIZONTAL),
                new Placement(ShipType.CRUISER, at("A5"), Orientation.HORIZONTAL),
                new Placement(ShipType.SUBMARINE, at("A7"), Orientation.HORIZONTAL),
                new Placement(ShipType.DESTROYER, at("A9"), Orientation.HORIZONTAL)));
    }

    public static Fleet columns() {
        return new Fleet(List.of(
                new Placement(ShipType.CARRIER, at("J1"), Orientation.VERTICAL),
                new Placement(ShipType.BATTLESHIP, at("H1"), Orientation.VERTICAL),
                new Placement(ShipType.CRUISER, at("F1"), Orientation.VERTICAL),
                new Placement(ShipType.SUBMARINE, at("D1"), Orientation.VERTICAL),
                new Placement(ShipType.DESTROYER, at("B1"), Orientation.VERTICAL)));
    }

    public static List<Coordinate> cellsOf(Fleet fleet) {
        return fleet.placements().stream().flatMap(p -> p.cells().stream()).toList();
    }
}
