package dev.manosliod.battleship.engine;

import java.util.List;
import java.util.Optional;
import java.util.function.BiConsumer;

final class Json {

    private static final String HEX = "0123456789abcdef";

    private final StringBuilder out = new StringBuilder();
    private boolean first = true;

    Json begin() {
        separate();
        out.append('{');
        first = true;
        return this;
    }

    Json end() {
        out.append('}');
        first = false;
        return this;
    }

    Json key(String name) {
        separate();
        string(name);
        out.append(':');
        first = true;
        return this;
    }

    Json field(String name, String value) {
        return key(name).value(value);
    }

    Json field(String name, int value) {
        key(name);
        separate();
        out.append(value);
        return this;
    }

    Json field(String name, boolean value) {
        key(name);
        separate();
        out.append(value);
        return this;
    }

    Json field(String name, Optional<String> value) {
        key(name);
        value.ifPresentOrElse(this::value, this::nothing);
        return this;
    }

    Json value(String value) {
        separate();
        string(value);
        return this;
    }

    void nothing() {
        separate();
        out.append("null");
    }

    <T> Json array(List<T> items, BiConsumer<Json, T> write) {
        separate();
        out.append('[');
        first = true;
        for (T item : items) {
            write.accept(this, item);
        }
        out.append(']');
        first = false;
        return this;
    }

    @Override
    public String toString() {
        return out.toString();
    }

    private void separate() {
        if (!first) {
            out.append(',');
        }
        first = false;
    }

    private void string(String value) {
        out.append('"');
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (c < 0x20) {
                        out.append("\\u00").append(HEX.charAt(c >> 4)).append(HEX.charAt(c & 0xF));
                    } else {
                        out.append(c);
                    }
                }
            }
        }
        out.append('"');
    }
}
