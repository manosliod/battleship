package dev.manosliod.battleship.game.application;

import static dev.manosliod.battleship.game.domain.Fleets.at;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.FleetPlacer;
import dev.manosliod.battleship.game.domain.Fleets;
import dev.manosliod.battleship.game.domain.Outcome;
import dev.manosliod.battleship.game.domain.Side;
import dev.manosliod.battleship.game.domain.Status;
import dev.manosliod.battleship.player.domain.PlayerName;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import org.junit.jupiter.api.Test;

class BattleTest {

    private static Battle battle(Targeting targeting) {
        FleetPlacer placer = new FleetPlacer(new Random(1)::nextInt);
        return Battle.start(new PlayerName("Ada"), Fleets.rows(), placer, targeting);
    }

    @Test
    void computerRepliesAfterEveryShot() {
        Battle battle = battle(sightings -> at("J10"));

        Battle.Exchange exchange = battle.fire(at("E5"));

        assertThat(exchange.yours().side()).isEqualTo(Side.PLAYER);
        assertThat(exchange.reply()).hasValueSatisfying(shot -> {
            assertThat(shot.side()).isEqualTo(Side.COMPUTER);
            assertThat(shot.cell()).isEqualTo(at("J10"));
            assertThat(shot.outcome()).isEqualTo(new Outcome.Miss());
        });
        assertThat(battle.game().status()).isEqualTo(new Status.Turn(Side.PLAYER));
    }

    @Test
    void sameCellTwiceIsRefused() {
        Battle battle = battle(new RandomTargeting(new Random(2)::nextInt));
        battle.fire(at("E5"));

        assertThat(battle.check(at("E5"))).contains(Battle.FireProblem.ALREADY_FIRED);
        assertThatThrownBy(() -> battle.fire(at("E5"))).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void lastShipEndsTheGameWithoutAReply() {
        Battle battle = battle(new RandomTargeting(new Random(3)::nextInt));
        Battle.Exchange last = null;
        for (Coordinate cell : Coordinate.all()) {
            if (battle.game().isOver()) {
                break;
            }
            last = battle.fire(cell);
        }

        assertThat(battle.game().isOver()).isTrue();
        assertThat(battle.check(at("J10"))).contains(Battle.FireProblem.GAME_OVER);
        if (battle.game().status() instanceof Status.Over(Side winner) && winner == Side.PLAYER) {
            assertThat(last).isNotNull();
            assertThat(last.reply()).isEmpty();
            assertThat(last.yours().outcome()).isInstanceOf(Outcome.Sunk.class);
        }
    }

    @Test
    void randomTargetingNeverRepeatsACell() {
        Battle battle = battle(new RandomTargeting(new Random(4)::nextInt));
        Set<Coordinate> computerShots = new HashSet<>();
        for (Coordinate cell : Coordinate.all()) {
            if (battle.game().isOver()) {
                break;
            }
            battle.fire(cell)
                    .reply()
                    .ifPresent(
                            shot -> assertThat(computerShots.add(shot.cell())).isTrue());
        }
        assertThat(computerShots).hasSameSizeAs(battle.game().home().shots());
    }
}
