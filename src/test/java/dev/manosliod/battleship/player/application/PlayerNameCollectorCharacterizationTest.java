package dev.manosliod.battleship.player.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PlayerNameCollectorCharacterizationTest {

    private static final Path BEFORE = Path.of("docs", "portfolio", "before");
    private static final String CANCEL = "CANCEL";
    private static final String DIALOG_BUTTON_HINT = " and press 'OK'";

    private static final class ScriptedPrompt implements NameInput {
        private final List<String> steps;
        final List<String> messages = new ArrayList<>();
        final List<Thread> threads = new ArrayList<>();

        ScriptedPrompt(List<String> steps) {
            this.steps = steps;
        }

        @Override
        public Optional<String> read(String message) {
            if (messages.size() >= steps.size()) {
                throw new AssertionError("prompted again after the last scripted step");
            }
            String step = steps.get(messages.size());
            messages.add(message);
            threads.add(Thread.currentThread());
            return CANCEL.equals(step) ? Optional.empty() : Optional.of(step);
        }
    }

    private static List<String> steps(String flow) throws IOException {
        String line = Files.readString(BEFORE.resolve(flow + ".in"), StandardCharsets.UTF_8)
                .replace("\n", "");
        return Arrays.asList(line.split("\\|", -1));
    }

    private static List<String> expectedPromptLines(String flow) throws IOException {
        return Files.readAllLines(BEFORE.resolve(flow + ".txt")).stream()
                .filter(l -> l.startsWith("prompt "))
                .toList();
    }

    private static String recordedLabel(String flow) throws IOException {
        String prefix = "JLabel '";
        return Files.readAllLines(BEFORE.resolve(flow + ".txt")).stream()
                .map(String::strip)
                .filter(l -> l.startsWith(prefix) && !l.equals("JLabel 'null'"))
                .map(l -> l.substring(prefix.length(), l.length() - 1))
                .findFirst()
                .orElseThrow();
    }

    private static ScriptedPrompt run(String flow) throws IOException {
        ScriptedPrompt prompt = new ScriptedPrompt(steps(flow));
        new PlayerNameCollector(prompt).collect();
        return prompt;
    }

    @ParameterizedTest
    @ValueSource(strings = {"name-ok"})
    void promptsExactlyAsOftenAsTheRecordedFlow(String flow) throws IOException {
        ScriptedPrompt prompt = run(flow);

        assertThat(prompt.messages).hasSameSizeAs(expectedPromptLines(flow));
        assertThat(prompt.messages).hasSameSizeAs(steps(flow));
    }

    @ParameterizedTest
    @ValueSource(
            strings = {
                "name-ok",
                "name-empty",
                "name-whitespace",
                "name-cancel-then-ok",
                "name-cancel-x3-then-ok",
            })
    void firstPromptIsTheRecordedDialogTextWithoutItsButtonHint(String flow) throws IOException {
        ScriptedPrompt prompt = new ScriptedPrompt(List.of("Ada"));
        new PlayerNameCollector(prompt).collect();

        assertThat(prompt.messages).containsExactly(PlayerNameCollector.MESSAGE);
        assertThat(recordedLabel(flow)).isEqualTo(PlayerNameCollector.MESSAGE + DIALOG_BUTTON_HINT);
    }

    @Test
    void textIsAcceptedOnTheFirstPrompt() throws IOException {
        assertThat(run("name-ok").messages).hasSize(1);
    }

    @Test
    void collectBlocksTheCallingThread() throws IOException {
        ScriptedPrompt prompt = new ScriptedPrompt(List.of("", "Ada"));
        new PlayerNameCollector(prompt).collect();

        assertThat(prompt.threads).hasSize(2).containsOnly(Thread.currentThread());
    }

    @Test
    void producesNoConsoleOutput() throws IOException {
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        System.setOut(new PrintStream(out, true, StandardCharsets.UTF_8));
        System.setErr(new PrintStream(err, true, StandardCharsets.UTF_8));
        try {
            run("name-ok");
        } finally {
            System.setOut(originalOut);
            System.setErr(originalErr);
        }

        assertThat(out.size()).isZero();
        assertThat(err.size()).isZero();
    }
}
