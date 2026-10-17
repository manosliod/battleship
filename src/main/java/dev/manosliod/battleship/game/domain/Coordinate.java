package dev.manosliod.battleship.game.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public record Coordinate(int row, int column) {

    public static final int SIZE = 10;

    public Coordinate {
        if (!inside(row, column)) {
            throw new IllegalArgumentException("Off the board: row " + row + ", column " + column);
        }
    }

    public static boolean inside(int row, int column) {
        return row >= 0 && row < SIZE && column >= 0 && column < SIZE;
    }

    public static Optional<Coordinate> of(int row, int column) {
        return inside(row, column) ? Optional.of(new Coordinate(row, column)) : Optional.empty();
    }

    public static Optional<Coordinate> parse(String text) {
        String trimmed = text.strip().toUpperCase(java.util.Locale.ROOT);
        if (trimmed.length() < 2 || trimmed.length() > 3) {
            return Optional.empty();
        }
        int row = trimmed.charAt(0) - 'A';
        String digits = trimmed.substring(1);
        if (!digits.chars().allMatch(Character::isDigit)) {
            return Optional.empty();
        }
        return of(row, Integer.parseInt(digits) - 1);
    }

    public static List<Coordinate> all() {
        List<Coordinate> cells = new ArrayList<>(SIZE * SIZE);
        for (int row = 0; row < SIZE; row++) {
            for (int column = 0; column < SIZE; column++) {
                cells.add(new Coordinate(row, column));
            }
        }
        return List.copyOf(cells);
    }

    public String label() {
        return (char) ('A' + row) + Integer.toString(column + 1);
    }

    public List<Coordinate> neighbours() {
        List<Coordinate> cells = new ArrayList<>(4);
        of(row - 1, column).ifPresent(cells::add);
        of(row + 1, column).ifPresent(cells::add);
        of(row, column - 1).ifPresent(cells::add);
        of(row, column + 1).ifPresent(cells::add);
        return List.copyOf(cells);
    }

    public Optional<Coordinate> step(Orientation orientation, int distance) {
        return orientation == Orientation.HORIZONTAL ? of(row, column + distance) : of(row + distance, column);
    }
}
