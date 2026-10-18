package dev.manosliod.battleship.game.domain;

@FunctionalInterface
public interface Dice {

    int roll(int bound);
}
