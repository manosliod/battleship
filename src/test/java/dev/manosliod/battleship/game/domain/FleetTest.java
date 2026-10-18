package dev.manosliod.battleship.game.domain;

import static dev.manosliod.battleship.game.domain.Fleets.at;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class FleetTest {

    @Test
    void placementCoversItsLengthInItsDirection() {
        assertThat(new Placement(ShipType.CRUISER, at("B2"), Orientation.VERTICAL).cells())
                .containsExactly(at("B2"), at("C2"), at("D2"));
        assertThat(new Placement(ShipType.DESTROYER, at("B9"), Orientation.HORIZONTAL).cells())
                .containsExactly(at("B9"), at("B10"));
    }

    @Test
    void placementMayNotLeaveTheBoard() {
        assertThat(Placement.of(ShipType.CARRIER, at("A7"), Orientation.HORIZONTAL))
                .isEmpty();
        assertThat(Placement.of(ShipType.CARRIER, at("A6"), Orientation.HORIZONTAL))
                .isPresent();
        assertThat(Placement.of(ShipType.CARRIER, at("G1"), Orientation.VERTICAL))
                .isEmpty();
        assertThatThrownBy(() -> new Placement(ShipType.DESTROYER, at("J1"), Orientation.VERTICAL))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void checkNamesTheProblem() {
        Fleet fleet = Fleet.empty().with(new Placement(ShipType.CARRIER, at("A1"), Orientation.HORIZONTAL));

        assertThat(fleet.check(ShipType.BATTLESHIP, at("A5"), Orientation.VERTICAL))
                .contains(PlacementProblem.OVERLAP);
        assertThat(fleet.check(ShipType.CARRIER, at("C1"), Orientation.HORIZONTAL))
                .contains(PlacementProblem.ALREADY_PLACED);
        assertThat(fleet.check(ShipType.BATTLESHIP, at("A8"), Orientation.HORIZONTAL))
                .contains(PlacementProblem.OFF_BOARD);
        assertThat(fleet.check(ShipType.BATTLESHIP, at("B1"), Orientation.HORIZONTAL))
                .isEmpty();
    }

    @Test
    void shipsMayTouch() {
        Fleet fleet = Fleet.empty().with(new Placement(ShipType.CARRIER, at("A1"), Orientation.HORIZONTAL));

        assertThat(fleet.check(ShipType.DESTROYER, at("A6"), Orientation.HORIZONTAL))
                .isEmpty();
    }

    @Test
    void constructorRefusesAnInvalidLayout() {
        Placement carrier = new Placement(ShipType.CARRIER, at("A1"), Orientation.HORIZONTAL);
        assertThatThrownBy(() -> new Fleet(List.of(carrier, carrier))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() ->
                        new Fleet(List.of(carrier, new Placement(ShipType.DESTROYER, at("A2"), Orientation.VERTICAL))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void tracksWhatIsMissing() {
        Fleet full = Fleets.rows();

        assertThat(full.complete()).isTrue();
        assertThat(full.without(ShipType.SUBMARINE).missing()).containsExactly(ShipType.SUBMARINE);
        assertThat(Fleet.empty().missing()).containsExactly(ShipType.values());
        assertThat(full.at(at("C4")).map(Placement::type)).contains(ShipType.BATTLESHIP);
        assertThat(full.at(at("B1"))).isEmpty();
    }

    @Test
    void fleetHasSeventeenCells() {
        assertThat(Fleets.cellsOf(Fleets.rows())).hasSize(17).doesNotHaveDuplicates();
    }
}
