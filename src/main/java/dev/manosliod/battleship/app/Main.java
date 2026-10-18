package dev.manosliod.battleship.app;

import dev.manosliod.battleship.app.cli.ConsoleGame;
import dev.manosliod.battleship.app.cli.StreamConsole;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Random;

public final class Main {

    private Main() {}

    public static void main(String[] args) {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        new ConsoleGame(new StreamConsole(in, System.out), new Random()::nextInt).run();
    }
}
