package dev.manosliod.battleship.game.application;

import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Dice;
import dev.manosliod.battleship.game.domain.Orientation;
import dev.manosliod.battleship.game.domain.Outcome;
import dev.manosliod.battleship.game.domain.Placement;
import dev.manosliod.battleship.game.domain.ShipType;
import dev.manosliod.battleship.game.domain.Sightings;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public final class HuntTargetTargeting implements Targeting {

    private final Dice dice;

    public HuntTargetTargeting(Dice dice) {
        this.dice = dice;
    }

    @Override
    public Coordinate choose(Sightings sightings) {
        List<Coordinate> wounded = Coordinate.all().stream()
                .filter(cell -> isHit(sightings, cell) && !sightings.partOfSunkShip(cell))
                .toList();
        List<Coordinate> candidates = wounded.isEmpty() ? hunt(sightings) : target(sightings, wounded);
        return candidates.get(dice.roll(candidates.size()));
    }

    private static List<Coordinate> target(Sightings sightings, List<Coordinate> wounded) {
        Set<Coordinate> alongLines = new LinkedHashSet<>();
        for (Coordinate hit : wounded) {
            for (Orientation orientation : Orientation.values()) {
                if (isWounded(sightings, hit, orientation, 1) || isWounded(sightings, hit, orientation, -1)) {
                    lineEnd(sightings, hit, orientation, 1).ifPresent(alongLines::add);
                    lineEnd(sightings, hit, orientation, -1).ifPresent(alongLines::add);
                }
            }
        }
        if (!alongLines.isEmpty()) {
            return List.copyOf(alongLines);
        }
        Set<Coordinate> around = new LinkedHashSet<>();
        for (Coordinate hit : wounded) {
            hit.neighbours().stream().filter(n -> !sightings.firedAt(n)).forEach(around::add);
        }
        return around.isEmpty() ? hunt(sightings) : List.copyOf(around);
    }

    private static Optional<Coordinate> lineEnd(
            Sightings sightings, Coordinate from, Orientation orientation, int direction) {
        Coordinate cell = from;
        while (true) {
            Optional<Coordinate> next = cell.step(orientation, direction);
            if (next.isEmpty()) {
                return Optional.empty();
            }
            if (!sightings.firedAt(next.get())) {
                return next;
            }
            if (!isHit(sightings, next.get()) || sightings.partOfSunkShip(next.get())) {
                return Optional.empty();
            }
            cell = next.get();
        }
    }

    private static boolean isWounded(Sightings sightings, Coordinate from, Orientation orientation, int direction) {
        return from.step(orientation, direction)
                .filter(n -> isHit(sightings, n) && !sightings.partOfSunkShip(n))
                .isPresent();
    }

    private static List<Coordinate> hunt(Sightings sightings) {
        int shortest = Arrays.stream(ShipType.values())
                .filter(type -> sightings.sunk().stream().map(Placement::type).noneMatch(type::equals))
                .mapToInt(ShipType::length)
                .min()
                .orElse(1);
        List<Coordinate> open =
                Coordinate.all().stream().filter(c -> !sightings.firedAt(c)).toList();
        List<Coordinate> spaced = open.stream()
                .filter(c -> (c.row() + c.column()) % shortest == 0)
                .toList();
        return spaced.isEmpty() ? open : spaced;
    }

    private static boolean isHit(Sightings sightings, Coordinate cell) {
        return sightings
                .outcomeAt(cell)
                .filter(o -> !(o instanceof Outcome.Miss))
                .isPresent();
    }
}
