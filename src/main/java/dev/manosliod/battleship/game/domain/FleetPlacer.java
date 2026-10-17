package dev.manosliod.battleship.game.domain;

import java.util.ArrayList;
import java.util.List;

public final class FleetPlacer {

    private final Dice dice;

    public FleetPlacer(Dice dice) {
        this.dice = dice;
    }

    public Fleet randomFleet() {
        return complete(Fleet.empty());
    }

    public Fleet complete(Fleet fleet) {
        Fleet result = fleet;
        for (ShipType type : fleet.missing()) {
            List<Placement> options = options(result, type);
            result = result.with(options.get(dice.roll(options.size())));
        }
        return result;
    }

    public static List<Placement> options(Fleet fleet, ShipType type) {
        List<Placement> options = new ArrayList<>();
        for (Coordinate start : Coordinate.all()) {
            for (Orientation orientation : Orientation.values()) {
                if (fleet.check(type, start, orientation).isEmpty()) {
                    options.add(new Placement(type, start, orientation));
                }
            }
        }
        return options;
    }
}
