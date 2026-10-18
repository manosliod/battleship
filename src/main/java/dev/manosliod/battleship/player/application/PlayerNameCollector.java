package dev.manosliod.battleship.player.application;

import dev.manosliod.battleship.player.domain.PlayerName;
import java.util.Optional;

public final class PlayerNameCollector {

    static final String MESSAGE = "Please insert your name and press 'OK'";
    static final String BLANK_MESSAGE = "Your name can't be blank. Please insert your name and press 'OK'";

    private final NameInput input;

    public PlayerNameCollector(NameInput input) {
        this.input = input;
    }

    public Optional<PlayerName> collect() {
        String message = MESSAGE;
        while (true) {
            Optional<String> answer = input.read(message);
            if (answer.isEmpty()) {
                return Optional.empty();
            }
            Optional<PlayerName> name = PlayerName.parse(answer.get());
            if (name.isPresent()) {
                return name;
            }
            message = BLANK_MESSAGE;
        }
    }
}
