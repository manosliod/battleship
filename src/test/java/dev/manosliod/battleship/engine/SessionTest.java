package dev.manosliod.battleship.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Random;
import org.junit.jupiter.api.Test;

class SessionTest {

    private static Session session() {
        return new Session(new Random(5)::nextInt);
    }

    private static Session placedRows() {
        Session session = session();
        assertThat(session.place("CARRIER", 0, 0, true)).isEmpty();
        assertThat(session.place("BATTLESHIP", 2, 0, true)).isEmpty();
        assertThat(session.place("CRUISER", 4, 0, true)).isEmpty();
        assertThat(session.place("SUBMARINE", 6, 0, true)).isEmpty();
        assertThat(session.place("DESTROYER", 8, 0, true)).isEmpty();
        return session;
    }

    @Test
    void newSessionIsPlacingWithEveryShipMissing() {
        assertThat(session().snapshot())
                .isEqualTo("{\"phase\":\"placing\",\"player\":null,\"fleet\":[],"
                        + "\"missing\":[\"CARRIER\",\"BATTLESHIP\",\"CRUISER\",\"SUBMARINE\",\"DESTROYER\"],"
                        + "\"home\":[],\"enemy\":[],\"enemySunk\":[],\"afloat\":{\"player\":[],\"computer\":[]},"
                        + "\"winner\":null,\"last\":null}");
    }

    @Test
    void placingNamesEveryProblem() {
        Session session = session();

        assertThat(session.place("CARRIER", 0, 6, true)).isEqualTo("OFF_BOARD");
        assertThat(session.place("CARRIER", 10, 0, true)).isEqualTo("OFF_BOARD");
        assertThat(session.place("YACHT", 0, 0, true)).isEqualTo("UNKNOWN_SHIP");
        assertThat(session.place("CARRIER", 0, 0, true)).isEmpty();
        assertThat(session.place("DESTROYER", 0, 4, false)).isEqualTo("OVERLAP");
        assertThat(session.snapshot())
                .contains("\"fleet\":[{\"ship\":\"CARRIER\",\"row\":0,\"column\":0,\"across\":true}]");
    }

    @Test
    void placingAPlacedShipAgainMovesIt() {
        Session session = session();
        session.place("CARRIER", 0, 0, true);

        assertThat(session.place("CARRIER", 0, 0, false)).isEmpty();
        assertThat(session.snapshot()).contains("{\"ship\":\"CARRIER\",\"row\":0,\"column\":0,\"across\":false}");
    }

    @Test
    void removeClearAndPlaceRest() {
        Session session = placedRows();
        session.remove("CRUISER");
        assertThat(session.snapshot()).contains("\"missing\":[\"CRUISER\"]");

        session.clear();
        assertThat(session.snapshot()).contains("\"fleet\":[]");

        session.placeRest();
        assertThat(session.snapshot()).contains("\"missing\":[]");
    }

    @Test
    void startNeedsANameAndTheWholeFleet() {
        Session session = session();

        assertThat(session.start("Ada")).isEqualTo("FLEET_INCOMPLETE");
        session.placeRest();
        assertThat(session.start(" \t ")).isEqualTo("BLANK_NAME");
        assertThat(session.start("  Ada  ")).isEmpty();
        assertThat(session.snapshot()).contains("\"phase\":\"battle\"").contains("\"player\":\"Ada\"");
        assertThat(session.start("Ada")).isEqualTo("BATTLE_STARTED");
        assertThat(session.place("CARRIER", 0, 0, true)).isEqualTo("BATTLE_STARTED");
    }

    @Test
    void fireReportsBothShots() {
        Session session = placedRows();
        assertThat(session.fire(0, 0)).isEqualTo("NOT_STARTED");
        session.start("Ada");

        assertThat(session.fire(4, 4)).isEmpty();
        assertThat(session.fire(4, 4)).isEqualTo("ALREADY_FIRED");
        assertThat(session.fire(-1, 4)).isEqualTo("OFF_BOARD");
        assertThat(session.snapshot())
                .contains("\"enemy\":[{\"row\":4,\"column\":4,\"result\":")
                .contains("\"last\":{\"yours\":{\"row\":4,\"column\":4,\"result\":")
                .contains("\"reply\":{\"row\":");
    }

    @Test
    void gameEndsWithAWinnerAndRematchStartsOver() {
        Session session = placedRows();
        session.start("Ada");
        for (int row = 0; row < 10; row++) {
            for (int column = 0; column < 10; column++) {
                session.fire(row, column);
            }
        }

        assertThat(session.snapshot())
                .contains("\"phase\":\"over\"")
                .containsPattern("\"winner\":\"(player|computer)\"");
        assertThat(session.snapshot().split("\"result\":\"sunk\"", -1).length - 1)
                .isGreaterThanOrEqualTo(17);
        assertThat(session.fire(0, 0)).isEqualTo("GAME_OVER");

        session.rematch();
        assertThat(session.snapshot()).contains("\"phase\":\"placing\"").contains("\"player\":\"Ada\"");
    }

    @Test
    void namesAreEscaped() {
        Session session = session();
        session.placeRest();
        session.start("A \"q\" \\ \u0001");

        assertThat(session.snapshot()).contains("\"player\":\"A \\\"q\\\" \\\\ \\u0001\"");
    }

    @Test
    void sessionsAreSeparateAndClosable() {
        Sessions sessions = new Sessions(new Random(1)::nextInt);
        int a = sessions.open();
        int b = sessions.open();
        sessions.get(a).placeRest();

        assertThat(sessions.get(b).snapshot()).contains("\"fleet\":[]");
        sessions.close(a);
        assertThat(sessions.size()).isEqualTo(1);
        assertThatThrownBy(() -> sessions.get(a)).isInstanceOf(IllegalArgumentException.class);
    }
}
