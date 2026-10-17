package dev.manosliod.battleship.app.cli;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintStream;
import java.io.UncheckedIOException;
import java.util.Optional;

public final class StreamConsole implements Console {

    private final BufferedReader in;
    private final PrintStream out;

    public StreamConsole(BufferedReader in, PrintStream out) {
        this.in = in;
        this.out = out;
    }

    @Override
    public Optional<String> readLine() {
        try {
            return Optional.ofNullable(in.readLine());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @Override
    public void println(String text) {
        out.println(text);
    }

    @Override
    public void print(String text) {
        out.print(text);
        out.flush();
    }
}
