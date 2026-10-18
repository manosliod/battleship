package dev.manosliod.battleship.game.domain;

import static dev.manosliod.battleship.game.domain.Fleets.at;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.manosliod.battleship.player.domain.PlayerName;
import java.util.List;
import org.junit.jupiter.api.Test;

class GameTest {

    private static final PlayerName ADA = new PlayerName("Ada");

    private static Game start() {
        return Game.start(ADA, Fleets.rows(), Fleets.columns());
    }

    @Test
    void playerMovesFirst() {
        assertThat(start().status()).isEqualTo(new Status.Turn(Side.PLAYER));
    }

    @Test
    void turnsAlternateWhateverTheOutcome() {
        Game.Move hit = start().fire(Side.PLAYER, at("J1"));

        assertThat(hit.shot()).isEqualTo(new Shot(Side.PLAYER, at("J1"), new Outcome.Hit()));
        assertThat(hit.game().status()).isEqualTo(new Status.Turn(Side.COMPUTER));

        Game.Move reply = hit.game().fire(Side.COMPUTER, at("J10"));

        assertThat(reply.shot().outcome()).isEqualTo(new Outcome.Miss());
        assertThat(reply.game().status()).isEqualTo(new Status.Turn(Side.PLAYER));
        assertThat(reply.game().home().firedAt(at("J10"))).isTrue();
        assertThat(reply.game().enemy().firedAt(at("J1"))).isTrue();
    }

    @Test
    void outOfTurnShotIsRefused() {
        Game game = start();

        assertThatThrownBy(() -> game.fire(Side.COMPUTER, at("A1"))).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void sinkingTheLastShipWinsAndEndsTheGame() {
        Game game = start();
        List<Coordinate> enemyCells = Fleets.cellsOf(Fleets.columns());
        List<Coordinate> water = Coordinate.all().stream()
                .filter(c -> Fleets.rows().at(c).isEmpty())
                .toList();
        for (int i = 0; i < enemyCells.size(); i++) {
            game = game.fire(Side.PLAYER, enemyCells.get(i)).game();
            if (i < enemyCells.size() - 1) {
                game = game.fire(Side.COMPUTER, water.get(i)).game();
            }
        }

        assertThat(game.status()).isEqualTo(new Status.Over(Side.PLAYER));
        assertThat(game.isOver()).isTrue();
        Game over = game;
        assertThatThrownBy(() -> over.fire(Side.COMPUTER, at("J10"))).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void computerWinsBySinkingThePlayersFleet() {
        Game game = start();
        List<Coordinate> homeCells = Fleets.cellsOf(Fleets.rows());
        List<Coordinate> water = Coordinate.all().stream()
                .filter(c -> Fleets.columns().at(c).isEmpty())
                .toList();
        for (Coordinate cell : homeCells) {
            game = game.fire(Side.PLAYER, water.get(homeCells.indexOf(cell))).game();
            game = game.fire(Side.COMPUTER, cell).game();
        }

        assertThat(game.status()).isEqualTo(new Status.Over(Side.COMPUTER));
    }
}
