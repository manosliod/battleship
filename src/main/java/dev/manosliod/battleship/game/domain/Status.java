package dev.manosliod.battleship.game.domain;

public sealed interface Status {

    record Turn(Side side) implements Status {}

    record Over(Side winner) implements Status {}
}
