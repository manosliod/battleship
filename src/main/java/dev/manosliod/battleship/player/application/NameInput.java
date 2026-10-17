package dev.manosliod.battleship.player.application;

import java.util.Optional;

public interface NameInput {

    Optional<String> read(String message);
}
