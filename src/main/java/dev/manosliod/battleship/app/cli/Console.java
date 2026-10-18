package dev.manosliod.battleship.app.cli;

import java.util.Optional;

public interface Console {

    Optional<String> readLine();

    void println(String text);

    void print(String text);
}
