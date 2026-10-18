package dev.manosliod.battleship.game.domain;

import dev.manosliod.battleship.player.domain.PlayerName;

public record Game(PlayerName player, Ocean home, Ocean enemy, Status status) {

    public static Game start(PlayerName player, Fleet playerFleet, Fleet computerFleet) {
        return new Game(player, Ocean.of(playerFleet), Ocean.of(computerFleet), new Status.Turn(Side.PLAYER));
    }

    public boolean isOver() {
        return status instanceof Status.Over;
    }

    public Ocean targetOf(Side side) {
        return side == Side.PLAYER ? enemy : home;
    }

    public Move fire(Side side, Coordinate cell) {
        if (!(status instanceof Status.Turn(Side toMove)) || toMove != side) {
            throw new IllegalStateException("It is not " + side + "'s turn: " + status);
        }
        Ocean.Volley volley = targetOf(side).fire(cell);
        Side other = side == Side.PLAYER ? Side.COMPUTER : Side.PLAYER;
        Status next = volley.ocean().allSunk() ? new Status.Over(side) : new Status.Turn(other);
        Game game = side == Side.PLAYER
                ? new Game(player, home, volley.ocean(), next)
                : new Game(player, volley.ocean(), enemy, next);
        return new Move(game, new Shot(side, cell, volley.outcome()));
    }

    public record Move(Game game, Shot shot) {}
}
