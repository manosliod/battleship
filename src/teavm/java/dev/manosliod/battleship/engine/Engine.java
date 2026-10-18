package dev.manosliod.battleship.engine;

import org.teavm.jso.JSExport;

public final class Engine {

    private static final Sessions SESSIONS = Sessions.random();

    private Engine() {}

    public static void main(String[] args) {}

    @JSExport
    public static int open() {
        return SESSIONS.open();
    }

    @JSExport
    public static void close(int session) {
        SESSIONS.close(session);
    }

    @JSExport
    public static String place(int session, String ship, int row, int column, boolean across) {
        return SESSIONS.get(session).place(ship, row, column, across);
    }

    @JSExport
    public static void remove(int session, String ship) {
        SESSIONS.get(session).remove(ship);
    }

    @JSExport
    public static void placeRest(int session) {
        SESSIONS.get(session).placeRest();
    }

    @JSExport
    public static void clear(int session) {
        SESSIONS.get(session).clear();
    }

    @JSExport
    public static String start(int session, String name) {
        return SESSIONS.get(session).start(name);
    }

    @JSExport
    public static String fire(int session, int row, int column) {
        return SESSIONS.get(session).fire(row, column);
    }

    @JSExport
    public static void rematch(int session) {
        SESSIONS.get(session).rematch();
    }

    @JSExport
    public static String snapshot(int session) {
        return SESSIONS.get(session).snapshot();
    }
}
