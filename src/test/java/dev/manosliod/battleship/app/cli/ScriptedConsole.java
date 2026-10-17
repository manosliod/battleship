package dev.manosliod.battleship.app.cli;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Optional;

final class ScriptedConsole implements Console {

    private final Deque<String> lines;
    private final StringBuilder output = new StringBuilder();

    ScriptedConsole(List<String> lines) {
        this.lines = new ArrayDeque<>(lines);
    }

    @Override
    public Optional<String> readLine() {
        String line = lines.pollFirst();
        if (line != null) {
            output.append(line).append('\n');
        }
        return Optional.ofNullable(line);
    }

    @Override
    public void println(String text) {
        output.append(text).append('\n');
    }

    @Override
    public void print(String text) {
        output.append(text);
    }

    String output() {
        return output.toString();
    }

    boolean exhausted() {
        return lines.isEmpty();
    }
}
