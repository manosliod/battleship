package dev.manosliod.battleship.game.application;

import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Dice;
import dev.manosliod.battleship.game.domain.Sightings;
import java.util.List;

public final class RandomTargeting implements Targeting {

    private final Dice dice;

    public RandomTargeting(Dice dice) {
        this.dice = dice;
    }

    @Override
    public Coordinate choose(Sightings sightings) {
        List<Coordinate> open =
                Coordinate.all().stream().filter(c -> !sightings.firedAt(c)).toList();
        return open.get(dice.roll(open.size()));
    }
}
