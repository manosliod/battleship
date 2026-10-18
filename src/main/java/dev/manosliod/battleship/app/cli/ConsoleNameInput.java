package dev.manosliod.battleship.app.cli;

import dev.manosliod.battleship.player.application.NameInput;
import java.util.Optional;

final class ConsoleNameInput implements NameInput {

    private final Console console;

    ConsoleNameInput(Console console) {
        this.console = console;
    }

    @Override
    public Optional<String> read(String message) {
        console.print(message + ": ");
        return console.readLine();
    }
}
