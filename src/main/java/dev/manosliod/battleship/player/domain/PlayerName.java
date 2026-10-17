package dev.manosliod.battleship.player.domain;

import java.util.Optional;

public record PlayerName(String value) {

    public PlayerName {
        if (value.isBlank() || !value.equals(value.strip())) {
            throw new IllegalArgumentException("A player name is stripped and not blank");
        }
    }

    public static Optional<PlayerName> parse(String raw) {
        String stripped = raw.strip();
        return stripped.isEmpty() ? Optional.empty() : Optional.of(new PlayerName(stripped));
    }
}
