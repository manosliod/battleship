package dev.manosliod.battleship.game.application;

import static dev.manosliod.battleship.game.domain.Fleets.at;
import static org.assertj.core.api.Assertions.assertThat;

import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Fleet;
import dev.manosliod.battleship.game.domain.FleetPlacer;
import dev.manosliod.battleship.game.domain.Fleets;
import dev.manosliod.battleship.game.domain.Ocean;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.SplittableRandom;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.RepetitionInfo;
import org.junit.jupiter.api.Test;

class HuntTargetTargetingTest {

    private static Ocean fire(Ocean ocean, String... cells) {
        Ocean result = ocean;
        for (String cell : cells) {
            result = result.fire(at(cell)).ocean();
        }
        return result;
    }

    private static Set<Coordinate> choices(Ocean ocean) {
        Set<Coordinate> seen = new HashSet<>();
        for (int seed = 0; seed < 200; seed++) {
            seen.add(new HuntTargetTargeting(new SplittableRandom(seed)::nextInt).choose(ocean.sightings()));
        }
        return seen;
    }

    @Test
    void huntsOnACheckerboardWhileNothingIsWounded() {
        Ocean ocean = fire(Ocean.of(Fleets.rows()), "B2", "D4");

        assertThat(choices(ocean))
                .allSatisfy(c -> assertThat((c.row() + c.column()) % 2).isZero())
                .doesNotContain(at("B2"), at("D4"));
    }

    @Test
    void firesNextToASingleHit() {
        Ocean ocean = fire(Ocean.of(Fleets.rows()), "B5");

        assertThat(choices(ocean)).containsExactlyInAnyOrder(at("B4"), at("B6"), at("A5"), at("C5"));
    }

    @Test
    void followsTheLineOfTwoHits() {
        Ocean ocean = fire(Ocean.of(Fleets.rows()), "B3", "C3");

        assertThat(choices(ocean)).containsExactlyInAnyOrder(at("A3"), at("D3"));
    }

    @Test
    void turnsBackWhenTheLineMeetsWater() {
        Ocean ocean = fire(Ocean.of(Fleets.rows()), "D1", "E1", "F1");

        assertThat(choices(ocean)).containsExactly(at("C1"));
    }

    @Test
    void goesBackToHuntingSpacedForTheShortestShipLeftOnceTheShipSinks() {
        Ocean ocean = fire(Ocean.of(Fleets.rows()), "A9", "B9");

        assertThat(choices(ocean))
                .allSatisfy(c -> assertThat((c.row() + c.column()) % 3).isZero())
                .doesNotContain(at("A8"), at("A10"), at("C9"), at("B8"), at("B10"));
    }

    @Test
    void spacingGrowsWhenOnlyLongShipsAreLeft() {
        Fleet fleet = Fleets.rows();
        Ocean ocean = fire(Ocean.of(fleet), "A9", "B9", "A7", "B7", "C7", "A5", "B5", "C5");

        assertThat(choices(ocean))
                .allSatisfy(c -> assertThat((c.row() + c.column()) % 4).isZero());
    }

    @RepeatedTest(30)
    void sinksARandomFleetWithoutRepeatingAndFasterThanRandom(RepetitionInfo repetition) {
        int seed = repetition.getCurrentRepetition();
        Ocean ocean = Ocean.of(new FleetPlacer(new Random(seed)::nextInt).randomFleet());
        Targeting targeting = new HuntTargetTargeting(new Random(seed + 1000)::nextInt);
        int shots = 0;
        while (!ocean.allSunk()) {
            Coordinate cell = targeting.choose(ocean.sightings());
            assertThat(ocean.firedAt(cell)).isFalse();
            ocean = ocean.fire(cell).ocean();
            shots++;
        }
        assertThat(shots).isLessThanOrEqualTo(85);
    }

    @Test
    void averageGameIsWellUnderARandomShooter() {
        int total = 0;
        int games = 100;
        for (int seed = 0; seed < games; seed++) {
            Ocean ocean = Ocean.of(new FleetPlacer(new Random(seed)::nextInt).randomFleet());
            Targeting targeting = new HuntTargetTargeting(new Random(-seed)::nextInt);
            while (!ocean.allSunk()) {
                ocean = ocean.fire(targeting.choose(ocean.sightings())).ocean();
            }
            total += ocean.shots().size();
        }
        assertThat(total / games).isLessThan(70);
    }

    @Test
    void choosesTheLastOpenCell() {
        List<Coordinate> all = Coordinate.all();
        Ocean ocean = Ocean.of(Fleets.rows());
        for (Coordinate cell : all.subList(0, all.size() - 1)) {
            ocean = ocean.fire(cell).ocean();
        }
        assertThat(new HuntTargetTargeting(bound -> 0).choose(ocean.sightings()))
                .isEqualTo(at("J10"));
    }
}
