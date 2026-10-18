package battleship;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.UnaryOperator;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class DisplayCharacterizationTest {

    private static final Path BEFORE = Path.of("docs", "portfolio", "before");
    private static final String CANCEL = "CANCEL";
    private static final String DIALOG_MESSAGE = "Please insert your name and press 'OK'";

    private static final class ScriptedPrompt implements UnaryOperator<String> {
        private final List<String> steps;
        final List<String> messages = new ArrayList<>();
        final List<Thread> threads = new ArrayList<>();

        ScriptedPrompt(List<String> steps) {
            this.steps = steps;
        }

        @Override
        public String apply(String message) {
            if (messages.size() >= steps.size()) {
                throw new AssertionError("prompted again after the last scripted step");
            }
            String step = steps.get(messages.size());
            messages.add(message);
            threads.add(Thread.currentThread());
            return CANCEL.equals(step) ? null : new String(step);
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
        new Display(prompt);
        return prompt;
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
    void promptMessageMatchesTheRecordedDialog(String flow) throws IOException {
        ScriptedPrompt prompt = run(flow);

        assertThat(prompt.messages)
                .isNotEmpty()
                .allSatisfy(m -> assertThat(m).isEqualTo(DIALOG_MESSAGE).isEqualTo(recordedLabel(flow)));
    }

    @Test
    void textIsAcceptedOnTheFirstPrompt() throws IOException {
        assertThat(run("name-ok").messages).hasSize(1);
    }

    @Test
    void whitespaceOnlyTextIsAcceptedOnTheFirstPrompt() throws IOException {
        assertThat(run("name-whitespace").messages).hasSize(1);
    }

    @Test
    void constructorBlocksTheCallingThread() throws IOException {
        ScriptedPrompt prompt = run("name-cancel-then-ok");

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

    @Test
    @Tag("legacy")
    void legacyEmptyNameIsAccepted() throws IOException {
        assertThat(run("name-empty").messages).hasSize(1);
    }

    @Test
    @Tag("legacy")
    void legacyCancelPromptsAgain() throws IOException {
        assertThat(run("name-cancel-then-ok").messages).hasSize(2);
        assertThat(run("name-cancel-x3-then-ok").messages).hasSize(4);
    }

    @Test
    @Tag("legacy")
    void legacyCancelNeverEndsOnItsOwn() {
        ScriptedPrompt prompt = new ScriptedPrompt(List.of(CANCEL, CANCEL));

        assertThatThrownBy(() -> new Display(prompt)).isInstanceOf(AssertionError.class);
        assertThat(prompt.messages).hasSize(2);
    }
}
