package dev.manosliod.battleship.engine;

import dev.manosliod.battleship.game.domain.Dice;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

final class Sessions {

    private final Dice dice;
    private final Map<Integer, Session> open = new HashMap<>();
    private int next = 1;

    Sessions(Dice dice) {
        this.dice = dice;
    }

    static Sessions random() {
        return new Sessions(new Random()::nextInt);
    }

    int open() {
        int id = next++;
        open.put(id, new Session(dice));
        return id;
    }

    Session get(int id) {
        Session session = open.get(id);
        if (session == null) {
            throw new IllegalArgumentException("No open session " + id);
        }
        return session;
    }

    void close(int id) {
        open.remove(id);
    }

    int size() {
        return open.size();
    }
}
