package dev.manosliod.battleship.game.domain;

public record Shot(Side side, Coordinate cell, Outcome outcome) {}
