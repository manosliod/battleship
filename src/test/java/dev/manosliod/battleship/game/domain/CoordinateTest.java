package dev.manosliod.battleship.game.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

class CoordinateTest {

    @ParameterizedTest
    @CsvSource({"A1,0,0", "a1,0,0", " J10 ,9,9", "B7,6,1", "j1,0,9"})
    void parsesLetterColumnAndNumberRow(String text, int row, int column) {
        assertThat(Coordinate.parse(text)).contains(new Coordinate(row, column));
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "A", "A0", "A11", "K1", "11", "AA", "A1x", "A-1", "A 1", "A100"})
    void rejectsTextOutsideTheBoard(String text) {
        assertThat(Coordinate.parse(text)).isEmpty();
    }

    @Test
    void labelIsTheInverseOfParse() {
        assertThat(Coordinate.all())
                .allSatisfy(c -> assertThat(Coordinate.parse(c.label())).contains(c));
    }

    @Test
    void boardHasOneHundredCells() {
        assertThat(Coordinate.all()).hasSize(100).doesNotHaveDuplicates();
    }

    @Test
    void constructorRefusesCellsOffTheBoard() {
        assertThatThrownBy(() -> new Coordinate(10, 0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Coordinate(0, -1)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void neighboursStayOnTheBoard() {
        assertThat(new Coordinate(0, 0).neighbours())
                .containsExactlyInAnyOrder(new Coordinate(1, 0), new Coordinate(0, 1));
        assertThat(new Coordinate(5, 5).neighbours()).hasSize(4);
    }
}
