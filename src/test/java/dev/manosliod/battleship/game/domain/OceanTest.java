package dev.manosliod.battleship.game.domain;

import static dev.manosliod.battleship.game.domain.Fleets.at;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class OceanTest {

    @Test
    void waterIsAMiss() {
        assertThat(Ocean.of(Fleets.rows()).fire(at("B1")).outcome()).isEqualTo(new Outcome.Miss());
    }

    @Test
    void shipIsHitThenSunkOnItsLastCell() {
        Ocean.Volley first = Ocean.of(Fleets.rows()).fire(at("I1"));
        Ocean.Volley second = first.ocean().fire(at("I2"));

        assertThat(first.outcome()).isEqualTo(new Outcome.Hit());
        assertThat(second.outcome()).isEqualTo(new Outcome.Sunk(ShipType.DESTROYER));
        assertThat(second.ocean().isSunk(ShipType.DESTROYER)).isTrue();
        assertThat(second.ocean().afloat()).doesNotContain(ShipType.DESTROYER).hasSize(4);
    }

    @Test
    void cellCanBeFiredAtOnlyOnce() {
        Ocean ocean = Ocean.of(Fleets.rows()).fire(at("B1")).ocean();

        assertThat(ocean.firedAt(at("B1"))).isTrue();
        assertThatThrownBy(() -> ocean.fire(at("B1"))).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void allSunkAfterEveryShipCell() {
        Ocean ocean = Ocean.of(Fleets.rows());
        for (Coordinate cell : Fleets.cellsOf(Fleets.rows())) {
            assertThat(ocean.allSunk()).isFalse();
            ocean = ocean.fire(cell).ocean();
        }
        assertThat(ocean.allSunk()).isTrue();
        assertThat(ocean.afloat()).isEmpty();
    }

    @Test
    void sightingsShowOutcomesButNotHiddenShips() {
        Ocean ocean = Ocean.of(Fleets.rows());
        ocean = ocean.fire(at("B1")).ocean();
        ocean = ocean.fire(at("A1")).ocean();
        ocean = ocean.fire(at("I1")).ocean();
        ocean = ocean.fire(at("I2")).ocean();

        Sightings sightings = ocean.sightings();

        assertThat(sightings.outcomeAt(at("B1"))).contains(new Outcome.Miss());
        assertThat(sightings.outcomeAt(at("A1"))).contains(new Outcome.Hit());
        assertThat(sightings.outcomeAt(at("I1"))).contains(new Outcome.Hit());
        assertThat(sightings.outcomeAt(at("I2"))).contains(new Outcome.Sunk(ShipType.DESTROYER));
        assertThat(sightings.outcomeAt(at("A2"))).isEmpty();
        assertThat(sightings.sunk()).extracting(Placement::type).containsExactly(ShipType.DESTROYER);
        assertThat(sightings.partOfSunkShip(at("I1"))).isTrue();
        assertThat(sightings.partOfSunkShip(at("A1"))).isFalse();
    }

    @Test
    void battleNeedsTheWholeFleet() {
        assertThatThrownBy(() -> Ocean.of(Fleets.rows().without(ShipType.CARRIER)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
