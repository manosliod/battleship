package dev.manosliod.battleship.app.cli;

import static org.assertj.core.api.Assertions.assertThat;

import dev.manosliod.battleship.game.domain.Coordinate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.junit.jupiter.api.Test;

class ConsoleGameTest {

    private static final List<String> ROWS = List.of("A1 across", "A3 across", "A5 across", "A7 across", "A9 across");

    private static ScriptedConsole run(List<String> input) {
        ScriptedConsole console = new ScriptedConsole(input);
        new ConsoleGame(console, new Random(42)::nextInt).run();
        return console;
    }

    private static List<String> script(List<String> head, List<String> tail) {
        List<String> all = new ArrayList<>(head);
        all.addAll(tail);
        return all;
    }

    private static List<String> everyCell() {
        return Coordinate.all().stream().map(Coordinate::label).toList();
    }

    @Test
    void cancelAtTheNamePromptEndsQuietly() {
        ScriptedConsole console = run(List.of());

        assertThat(console.output()).isEqualTo("Please insert your name: ");
    }

    @Test
    void blankNameIsAskedAgain() {
        ScriptedConsole console = run(List.of("  ", "Ada"));

        assertThat(console.output())
                .contains("Your name can't be blank. Please insert your name: ")
                .contains("Welcome aboard, Ada.");
    }

    @Test
    void placementExplainsEveryMistake() {
        ScriptedConsole console = run(List.of("Ada", "G1 across", "A1 sideways", "Z9 down", "A1 across", "C1 down"));

        assertThat(console.output())
                .contains("The Carrier does not fit there: it would leave the board.")
                .contains("Type a cell and a direction, for example A1 across or B2 down.")
                .contains("The Battleship would overlap another ship.")
                .contains("Battleship (4 cells): ");
    }

    @Test
    void manualPlacementShowsTheFleet() {
        ScriptedConsole console = run(script(List.of("Ada"), ROWS));

        assertThat(console.output())
                .contains("    A  B  C  D  E  F  G  H  I  J")
                .contains(" 1  S  S  S  S  S  .  .  .  .  .")
                .contains(" 9  S  S  .  .  .  .  .  .  .  .")
                .endsWith("Type 'start' to begin the battle, or 'reset' to place your ships again: ");
    }

    @Test
    void randomPlacesTheRest() {
        ScriptedConsole console = run(List.of("Ada", "A1 across", "random", "start"));

        assertThat(console.output()).contains("The enemy fleet is hidden in its waters. You fire first.");
        assertThat(console.output()).doesNotContain("Cruiser (3 cells)");
    }

    @Test
    void resetStartsThePlacementAgain() {
        ScriptedConsole console = run(List.of("Ada", "A1 across", "reset", "A2 down"));

        assertThat(console.output().split("Carrier \\(5 cells\\): ", -1)).hasSize(3);
    }

    @Test
    void battleRefusesBadAndRepeatedCells() {
        ScriptedConsole console = run(script(script(List.of("Ada"), ROWS), List.of("start", "K1", "E2", "e2")));

        assertThat(console.output())
                .contains("That is not a cell. Use a letter from A to J and a number from 1 to 10, for example B7.")
                .contains("You fire at E2: ")
                .contains("The computer fires at ")
                .contains("You already fired at E2. Pick another cell.")
                .contains("Your fleet")
                .contains("Enemy waters")
                .contains(ConsoleGame.LEGEND);
    }

    @Test
    void fullGameEndsWithAWinnerAndCanBePlayedAgain() {
        List<String> input = script(script(List.of("Ada"), ROWS), List.of("start"));
        input.addAll(everyCell());
        ScriptedConsole console = new ScriptedConsole(input);
        new ConsoleGame(console, new Random(7)::nextInt).run();
        String output = console.output();

        assertThat(output).containsAnyOf("You win, Ada! You sank the whole enemy fleet in ", "The computer wins: ");
        assertThat(output).contains("Play again? (yes/no): ");
        assertThat(output).containsPattern("you sank the enemy (Carrier|Battleship|Cruiser|Submarine|Destroyer)!");
    }

    @Test
    void answeringNoSaysGoodbye() {
        List<String> input = script(script(List.of("Ada"), ROWS), List.of("start"));
        ScriptedConsole probe = new ScriptedConsole(script(input, everyCell()));
        new ConsoleGame(probe, new Random(7)::nextInt).run();
        int shotsNeeded = probe.output().split("You fire at ", -1).length - 1;
        input.addAll(everyCell().subList(0, shotsNeeded));
        input.addAll(List.of("maybe", "no"));

        ScriptedConsole console = new ScriptedConsole(input);
        new ConsoleGame(console, new Random(7)::nextInt).run();

        assertThat(console.output()).contains("Type yes or no.").endsWith("Thanks for playing, Ada.\n");
        assertThat(console.exhausted()).isTrue();
    }

    @Test
    void answeringYesStartsANewPlacement() {
        List<String> input = script(script(List.of("Ada"), ROWS), List.of("start"));
        ScriptedConsole probe = new ScriptedConsole(script(input, everyCell()));
        new ConsoleGame(probe, new Random(7)::nextInt).run();
        int shotsNeeded = probe.output().split("You fire at ", -1).length - 1;
        input.addAll(everyCell().subList(0, shotsNeeded));
        input.add("yes");

        ScriptedConsole console = new ScriptedConsole(input);
        new ConsoleGame(console, new Random(7)::nextInt).run();

        assertThat(console.output()).endsWith("Carrier (5 cells): ");
    }
}
