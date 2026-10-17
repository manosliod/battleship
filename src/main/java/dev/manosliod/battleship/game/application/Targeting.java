package dev.manosliod.battleship.game.application;

import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Sightings;

@FunctionalInterface
public interface Targeting {

    Coordinate choose(Sightings sightings);
}
