package dev.manosliod.battleship.app.cli;

import dev.manosliod.battleship.game.application.Battle;
import dev.manosliod.battleship.game.application.HuntTargetTargeting;
import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Dice;
import dev.manosliod.battleship.game.domain.Fleet;
import dev.manosliod.battleship.game.domain.FleetPlacer;
import dev.manosliod.battleship.game.domain.Game;
import dev.manosliod.battleship.game.domain.Orientation;
import dev.manosliod.battleship.game.domain.Outcome;
import dev.manosliod.battleship.game.domain.Placement;
import dev.manosliod.battleship.game.domain.PlacementProblem;
import dev.manosliod.battleship.game.domain.ShipType;
import dev.manosliod.battleship.game.domain.Shot;
import dev.manosliod.battleship.game.domain.Side;
import dev.manosliod.battleship.game.domain.Status;
import dev.manosliod.battleship.player.application.PlayerNameCollector;
import dev.manosliod.battleship.player.domain.PlayerName;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public final class ConsoleGame {

    static final String LEGEND = "S ship   X hit   o miss   # sunk   . not fired at";

    private final Console console;
    private final Dice dice;
    private final FleetPlacer placer;

    public ConsoleGame(Console console, Dice dice) {
        this.console = console;
        this.dice = dice;
        this.placer = new FleetPlacer(dice);
    }

    public void run() {
        Optional<PlayerName> name = new PlayerNameCollector(new ConsoleNameInput(console)).collect();
        if (name.isEmpty()) {
            return;
        }
        console.println("Welcome aboard, " + name.get().value() + ".");
        boolean again = true;
        while (again) {
            Optional<Game> finished = placeFleet().flatMap(fleet -> play(name.get(), fleet));
            if (finished.isEmpty()) {
                return;
            }
            announce(finished.get());
            Optional<Boolean> answer = askYesNo("Play again? (yes/no): ");
            if (answer.isEmpty()) {
                return;
            }
            again = answer.get();
        }
        console.println("Thanks for playing, " + name.get().value() + ".");
    }

    private Optional<Fleet> placeFleet() {
        console.println("");
        console.println("Place your fleet. Type a start cell and a direction, for example A1 across or B2 down.");
        console.println("Type 'random' to place the rest at random, or 'reset' to start over.");
        Fleet fleet = Fleet.empty();
        while (true) {
            while (!fleet.complete()) {
                printLines(BoardView.fleet(fleet));
                ShipType type = fleet.missing().getFirst();
                console.print(type.displayName() + " (" + type.length() + " cells): ");
                Optional<String> line = console.readLine();
                if (line.isEmpty()) {
                    return Optional.empty();
                }
                fleet = placeOne(fleet, type, line.get());
            }
            printLines(BoardView.fleet(fleet));
            Optional<String> ready = ask("Type 'start' to begin the battle, or 'reset' to place your ships again: ");
            if (ready.isEmpty()) {
                return Optional.empty();
            }
            switch (ready.get()) {
                case "start", "s" -> {
                    return Optional.of(fleet);
                }
                case "reset", "r" -> fleet = Fleet.empty();
                default -> console.println("Type 'start' or 'reset'.");
            }
        }
    }

    private Fleet placeOne(Fleet fleet, ShipType type, String line) {
        String input = line.strip().toLowerCase(Locale.ROOT);
        if (input.equals("random")) {
            return placer.complete(fleet);
        }
        if (input.equals("reset")) {
            return Fleet.empty();
        }
        String[] parts = input.split("\\s+");
        Optional<Coordinate> start = parts.length == 2 ? Coordinate.parse(parts[0]) : Optional.empty();
        Optional<Orientation> orientation = parts.length == 2 ? orientation(parts[1]) : Optional.empty();
        if (start.isEmpty() || orientation.isEmpty()) {
            console.println("Type a cell and a direction, for example A1 across or B2 down.");
            return fleet;
        }
        Optional<PlacementProblem> problem = fleet.check(type, start.get(), orientation.get());
        if (problem.isPresent()) {
            console.println(
                    switch (problem.get()) {
                        case OFF_BOARD ->
                            "The " + type.displayName() + " does not fit there: it would leave the board.";
                        case OVERLAP -> "The " + type.displayName() + " would overlap another ship.";
                        case ALREADY_PLACED -> "The " + type.displayName() + " is already placed.";
                    });
            return fleet;
        }
        return fleet.with(new Placement(type, start.get(), orientation.get()));
    }

    private static Optional<Orientation> orientation(String word) {
        return switch (word) {
            case "across", "a", "h", "horizontal" -> Optional.of(Orientation.HORIZONTAL);
            case "down", "d", "v", "vertical" -> Optional.of(Orientation.VERTICAL);
            default -> Optional.empty();
        };
    }

    private Optional<Game> play(PlayerName name, Fleet fleet) {
        Battle battle = Battle.start(name, fleet, placer, new HuntTargetTargeting(dice));
        console.println("");
        console.println("The enemy fleet is hidden in its waters. You fire first.");
        while (!battle.game().isOver()) {
            printBoards(battle.game());
            Optional<String> line = ask("Fire at: ");
            if (line.isEmpty()) {
                return Optional.empty();
            }
            Optional<Coordinate> cell = Coordinate.parse(line.get());
            if (cell.isEmpty()) {
                console.println(
                        "That is not a cell. Use a letter from A to J and a number from 1 to 10, for example B7.");
                continue;
            }
            Optional<Battle.FireProblem> problem = battle.check(cell.get());
            if (problem.isPresent()) {
                console.println("You already fired at " + cell.get().label() + ". Pick another cell.");
                continue;
            }
            Battle.Exchange exchange = battle.fire(cell.get());
            console.println(describe(exchange.yours()));
            exchange.reply().ifPresent(reply -> console.println(describe(reply)));
        }
        printBoards(battle.game());
        return Optional.of(battle.game());
    }

    private void announce(Game game) {
        String name = game.player().value();
        if (game.status() instanceof Status.Over(Side winner) && winner == Side.PLAYER) {
            console.println("You win, " + name + "! You sank the whole enemy fleet in "
                    + game.enemy().shots().size() + " shots.");
        } else {
            console.println("The computer wins: it sank your whole fleet in "
                    + game.home().shots().size() + " shots. Better luck next time, " + name + ".");
        }
    }

    private static String describe(Shot shot) {
        String who = shot.side() == Side.PLAYER ? "You fire" : "The computer fires";
        String result = switch (shot.outcome()) {
            case Outcome.Miss miss -> "miss.";
            case Outcome.Hit hit -> "hit!";
            case Outcome.Sunk sunk ->
                shot.side() == Side.PLAYER
                        ? "hit, and you sank the enemy " + sunk.type().displayName() + "!"
                        : "hit, and it sank your " + sunk.type().displayName() + "!";
        };
        return who + " at " + shot.cell().label() + ": " + result;
    }

    private void printBoards(Game game) {
        console.println("");
        printLines(BoardView.sideBySide(
                "Your fleet", BoardView.home(game.home()), "Enemy waters", BoardView.target(game.enemy())));
        console.println(LEGEND);
    }

    private void printLines(List<String> lines) {
        lines.forEach(console::println);
    }

    private Optional<String> ask(String question) {
        console.print(question);
        return console.readLine().map(answer -> answer.strip().toLowerCase(Locale.ROOT));
    }

    private Optional<Boolean> askYesNo(String question) {
        while (true) {
            Optional<String> answer = ask(question);
            if (answer.isEmpty()) {
                return Optional.empty();
            }
            switch (answer.get()) {
                case "yes", "y" -> {
                    return Optional.of(true);
                }
                case "no", "n" -> {
                    return Optional.of(false);
                }
                default -> console.println("Type yes or no.");
            }
        }
    }
}
