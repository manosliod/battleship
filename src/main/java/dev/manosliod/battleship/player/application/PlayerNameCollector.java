package dev.manosliod.battleship.player.application;

import java.util.Optional;

public final class PlayerNameCollector {

    static final String MESSAGE = "Please insert your name and press 'OK'";

    private final NameInput input;

    public PlayerNameCollector(NameInput input) {
        this.input = input;
    }

    public String collect() {
        Optional<String> name = input.read(MESSAGE);
        while (name.isEmpty()) {
            name = input.read(MESSAGE);
        }
        return name.get();
    }
}
