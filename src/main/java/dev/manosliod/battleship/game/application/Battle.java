package dev.manosliod.battleship.game.application;

import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Fleet;
import dev.manosliod.battleship.game.domain.FleetPlacer;
import dev.manosliod.battleship.game.domain.Game;
import dev.manosliod.battleship.game.domain.Shot;
import dev.manosliod.battleship.game.domain.Side;
import dev.manosliod.battleship.player.domain.PlayerName;
import java.util.Optional;

public final class Battle {

    private final Targeting targeting;
    private Game game;

    private Battle(Game game, Targeting targeting) {
        this.game = game;
        this.targeting = targeting;
    }

    public static Battle start(PlayerName player, Fleet playerFleet, FleetPlacer placer, Targeting targeting) {
        return new Battle(Game.start(player, playerFleet, placer.randomFleet()), targeting);
    }

    public Game game() {
        return game;
    }

    public Optional<FireProblem> check(Coordinate cell) {
        if (game.isOver()) {
            return Optional.of(FireProblem.GAME_OVER);
        }
        return game.enemy().firedAt(cell) ? Optional.of(FireProblem.ALREADY_FIRED) : Optional.empty();
    }

    public Exchange fire(Coordinate cell) {
        check(cell).ifPresent(problem -> {
            throw new IllegalStateException(cell.label() + ": " + problem);
        });
        Game.Move yours = game.fire(Side.PLAYER, cell);
        game = yours.game();
        if (game.isOver()) {
            return new Exchange(yours.shot(), Optional.empty());
        }
        Game.Move reply = game.fire(Side.COMPUTER, targeting.choose(game.home().sightings()));
        game = reply.game();
        return new Exchange(yours.shot(), Optional.of(reply.shot()));
    }

    public record Exchange(Shot yours, Optional<Shot> reply) {}

    public enum FireProblem {
        ALREADY_FIRED,
        GAME_OVER
    }
}
