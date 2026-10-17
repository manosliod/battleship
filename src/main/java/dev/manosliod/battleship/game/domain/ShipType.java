package dev.manosliod.battleship.game.domain;

public enum ShipType {
    CARRIER("Carrier", 5),
    BATTLESHIP("Battleship", 4),
    CRUISER("Cruiser", 3),
    SUBMARINE("Submarine", 3),
    DESTROYER("Destroyer", 2);

    private final String displayName;
    private final int length;

    ShipType(String displayName, int length) {
        this.displayName = displayName;
        this.length = length;
    }

    public String displayName() {
        return displayName;
    }

    public int length() {
        return length;
    }
}
