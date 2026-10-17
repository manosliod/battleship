package dev.manosliod.battleship.game.domain;

public sealed interface Outcome {

    record Miss() implements Outcome {}

    record Hit() implements Outcome {}

    record Sunk(ShipType type) implements Outcome {}
}
