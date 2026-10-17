package dev.manosliod.battleship.game.domain;

public enum Orientation {
    HORIZONTAL,
    VERTICAL;

    public Orientation rotated() {
        return this == HORIZONTAL ? VERTICAL : HORIZONTAL;
    }
}
