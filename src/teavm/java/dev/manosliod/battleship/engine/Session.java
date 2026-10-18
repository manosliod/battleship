package dev.manosliod.battleship.engine;

import dev.manosliod.battleship.game.application.Battle;
import dev.manosliod.battleship.game.application.HuntTargetTargeting;
import dev.manosliod.battleship.game.domain.Coordinate;
import dev.manosliod.battleship.game.domain.Dice;
import dev.manosliod.battleship.game.domain.Fleet;
import dev.manosliod.battleship.game.domain.FleetPlacer;
import dev.manosliod.battleship.game.domain.Orientation;
import dev.manosliod.battleship.game.domain.Outcome;
import dev.manosliod.battleship.game.domain.Placement;
import dev.manosliod.battleship.game.domain.ShipType;
import dev.manosliod.battleship.game.domain.Shot;
import dev.manosliod.battleship.game.domain.Side;
import dev.manosliod.battleship.game.domain.Sightings;
import dev.manosliod.battleship.game.domain.Status;
import dev.manosliod.battleship.player.domain.PlayerName;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

final class Session {

    static final String OK = "";

    private final Dice dice;
    private final FleetPlacer placer;
    private Fleet fleet = Fleet.empty();
    private Optional<PlayerName> player = Optional.empty();
    private Optional<Battle> battle = Optional.empty();
    private Optional<Battle.Exchange> last = Optional.empty();

    Session(Dice dice) {
        this.dice = dice;
        this.placer = new FleetPlacer(dice);
    }

    String place(String ship, int row, int column, boolean across) {
        if (battle.isPresent()) {
            return "BATTLE_STARTED";
        }
        Optional<ShipType> type = shipType(ship);
        Optional<Coordinate> start = Coordinate.of(row, column);
        if (type.isEmpty()) {
            return "UNKNOWN_SHIP";
        }
        if (start.isEmpty()) {
            return "OFF_BOARD";
        }
        Orientation orientation = across ? Orientation.HORIZONTAL : Orientation.VERTICAL;
        Fleet others = fleet.without(type.get());
        return others.check(type.get(), start.get(), orientation)
                .map(Enum::name)
                .orElseGet(() -> {
                    fleet = others.with(new Placement(type.get(), start.get(), orientation));
                    return OK;
                });
    }

    void remove(String ship) {
        if (battle.isEmpty()) {
            shipType(ship).ifPresent(type -> fleet = fleet.without(type));
        }
    }

    void placeRest() {
        if (battle.isEmpty()) {
            fleet = placer.complete(fleet);
        }
    }

    void clear() {
        if (battle.isEmpty()) {
            fleet = Fleet.empty();
        }
    }

    String start(String name) {
        if (battle.isPresent()) {
            return "BATTLE_STARTED";
        }
        Optional<PlayerName> parsed = PlayerName.parse(name);
        if (parsed.isEmpty()) {
            return "BLANK_NAME";
        }
        if (!fleet.complete()) {
            return "FLEET_INCOMPLETE";
        }
        player = parsed;
        battle = Optional.of(Battle.start(parsed.get(), fleet, placer, new HuntTargetTargeting(dice)));
        last = Optional.empty();
        return OK;
    }

    String fire(int row, int column) {
        if (battle.isEmpty()) {
            return "NOT_STARTED";
        }
        Optional<Coordinate> cell = Coordinate.of(row, column);
        if (cell.isEmpty()) {
            return "OFF_BOARD";
        }
        Optional<Battle.FireProblem> problem = battle.get().check(cell.get());
        if (problem.isPresent()) {
            return problem.get().name();
        }
        last = Optional.of(battle.get().fire(cell.get()));
        return OK;
    }

    void rematch() {
        battle = Optional.empty();
        last = Optional.empty();
        fleet = Fleet.empty();
    }

    String snapshot() {
        Json json = new Json().begin();
        json.field("phase", phase());
        json.field("player", player.map(PlayerName::value));
        json.key("fleet").array(fleet.placements(), Session::placement);
        json.key("missing").array(fleet.missing(), (j, type) -> j.value(type.name()));
        battle.map(Battle::game)
                .ifPresentOrElse(
                        game -> {
                            Sightings home = game.home().sightings();
                            Sightings enemy = game.enemy().sightings();
                            json.key("home").array(game.home().shots(), (j, cell) -> shot(j, cell, home));
                            json.key("enemy").array(game.enemy().shots(), (j, cell) -> shot(j, cell, enemy));
                            json.key("enemySunk").array(enemy.sunk(), Session::placement);
                            json.key("revealed")
                                    .array(
                                            game.isOver()
                                                    ? game.enemy().fleet().placements().stream()
                                                            .filter(p -> !game.enemy()
                                                                    .isSunk(p.type()))
                                                            .toList()
                                                    : List.of(),
                                            Session::placement);
                            json.key("afloat").begin();
                            json.key("player").array(game.home().afloat(), (j, type) -> j.value(type.name()));
                            json.key("computer").array(game.enemy().afloat(), (j, type) -> j.value(type.name()));
                            json.end();
                            json.field(
                                    "winner",
                                    game.status() instanceof Status.Over(Side winner)
                                            ? Optional.of(winner.name().toLowerCase(Locale.ROOT))
                                            : Optional.empty());
                        },
                        () -> {
                            json.key("home").array(List.of(), (j, cell) -> {});
                            json.key("enemy").array(List.of(), (j, cell) -> {});
                            json.key("enemySunk").array(List.of(), (j, cell) -> {});
                            json.key("revealed").array(List.of(), (j, cell) -> {});
                            json.key("afloat").begin();
                            json.key("player").array(List.of(), (j, type) -> {});
                            json.key("computer").array(List.of(), (j, type) -> {});
                            json.end();
                            json.field("winner", Optional.empty());
                        });
        json.key("last");
        last.ifPresentOrElse(
                exchange -> {
                    json.begin();
                    json.key("yours");
                    exchangeShot(json, exchange.yours());
                    json.key("reply");
                    exchange.reply().ifPresentOrElse(reply -> exchangeShot(json, reply), json::nothing);
                    json.end();
                },
                json::nothing);
        return json.end().toString();
    }

    private String phase() {
        return battle.map(b -> b.game().isOver() ? "over" : "battle").orElse("placing");
    }

    private static void placement(Json json, Placement placement) {
        json.begin()
                .field("ship", placement.type().name())
                .field("row", placement.start().row())
                .field("column", placement.start().column())
                .field("across", placement.orientation() == Orientation.HORIZONTAL)
                .end();
    }

    private static void shot(Json json, Coordinate cell, Sightings sightings) {
        json.begin()
                .field("row", cell.row())
                .field("column", cell.column())
                .field(
                        "result",
                        sightings.partOfSunkShip(cell)
                                ? "sunk"
                                : result(sightings.outcomeAt(cell).orElseThrow()))
                .end();
    }

    private static void exchangeShot(Json json, Shot shot) {
        json.begin()
                .field("row", shot.cell().row())
                .field("column", shot.cell().column())
                .field("result", result(shot.outcome()))
                .field(
                        "ship",
                        shot.outcome() instanceof Outcome.Sunk(ShipType type)
                                ? Optional.of(type.name())
                                : Optional.empty())
                .end();
    }

    private static String result(Outcome outcome) {
        return switch (outcome) {
            case Outcome.Miss miss -> "miss";
            case Outcome.Hit hit -> "hit";
            case Outcome.Sunk sunk -> "sunk";
        };
    }

    private static Optional<ShipType> shipType(String name) {
        return Arrays.stream(ShipType.values())
                .filter(type -> type.name().equals(name))
                .findFirst();
    }
}
