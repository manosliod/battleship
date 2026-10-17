package dev.manosliod.battleship.game.domain;

import static dev.manosliod.battleship.game.domain.Fleets.at;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.RepetitionInfo;
import org.junit.jupiter.api.Test;

class FleetPlacerTest {

    @RepeatedTest(200)
    void randomFleetIsAlwaysComplete(RepetitionInfo repetition) {
        Random random = new Random(repetition.getCurrentRepetition());
        Fleet fleet = new FleetPlacer(random::nextInt).randomFleet();

        assertThat(fleet.complete()).isTrue();
        assertThat(Fleets.cellsOf(fleet)).hasSize(17).doesNotHaveDuplicates();
    }

    @Test
    void completeKeepsTheShipsAlreadyPlaced() {
        Placement carrier = new Placement(ShipType.CARRIER, at("E3"), Orientation.VERTICAL);
        Fleet fleet =
                new FleetPlacer(new Random(7)::nextInt).complete(Fleet.empty().with(carrier));

        assertThat(fleet.complete()).isTrue();
        assertThat(fleet.placementOf(ShipType.CARRIER)).contains(carrier);
    }

    @Test
    void differentDiceGiveDifferentFleets() {
        Set<Fleet> fleets = new HashSet<>();
        for (int seed = 0; seed < 20; seed++) {
            fleets.add(new FleetPlacer(new Random(seed)::nextInt).randomFleet());
        }
        assertThat(fleets).hasSizeGreaterThan(15);
    }

    @Test
    void optionsAreEveryLegalPlacement() {
        assertThat(FleetPlacer.options(Fleet.empty(), ShipType.CARRIER)).hasSize(2 * 10 * 6);
    }
}
