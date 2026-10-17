package dev.manosliod.battleship.app;

import dev.manosliod.battleship.player.application.PlayerNameCollector;

public final class Main {

    private Main() {}

    public static void main(String[] args) {
        new PlayerNameCollector(new SwingNameInput()).collect();
    }
}
