package dev.manosliod.battleship.player.application;

import static org.assertj.core.api.Assertions.assertThat;

import dev.manosliod.battleship.player.domain.PlayerName;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class PlayerNameCollectorTest {

    private static final class Answers implements NameInput {
        private final Deque<Optional<String>> answers;
        final List<String> messages = new ArrayList<>();

        Answers(List<Optional<String>> answers) {
            this.answers = new ArrayDeque<>(answers);
        }

        @Override
        public Optional<String> read(String message) {
            messages.add(message);
            return answers.removeFirst();
        }
    }

    @Test
    void acceptsANameOnTheFirstPrompt() {
        Answers answers = new Answers(List.of(Optional.of("Ada")));

        assertThat(new PlayerNameCollector(answers).collect()).contains(new PlayerName("Ada"));
        assertThat(answers.messages).containsExactly(PlayerNameCollector.MESSAGE);
    }

    @Test
    void emptyAnswerAsksAgainWithTheBlankMessage() {
        Answers answers = new Answers(List.of(Optional.of(""), Optional.of("Ada")));

        assertThat(new PlayerNameCollector(answers).collect()).contains(new PlayerName("Ada"));
        assertThat(answers.messages).containsExactly(PlayerNameCollector.MESSAGE, PlayerNameCollector.BLANK_MESSAGE);
    }

    @Test
    void whitespaceOnlyAnswerAsksAgain() {
        Answers answers = new Answers(List.of(Optional.of("   "), Optional.of("\t"), Optional.of(" Ada ")));

        assertThat(new PlayerNameCollector(answers).collect()).contains(new PlayerName("Ada"));
        assertThat(answers.messages)
                .containsExactly(
                        PlayerNameCollector.MESSAGE,
                        PlayerNameCollector.BLANK_MESSAGE,
                        PlayerNameCollector.BLANK_MESSAGE);
    }

    @Test
    void cancelEndsWithoutAName() {
        Answers answers = new Answers(List.of(Optional.empty()));

        assertThat(new PlayerNameCollector(answers).collect()).isEmpty();
        assertThat(answers.messages).hasSize(1);
    }

    @Test
    void cancelAfterABlankAnswerEndsWithoutAName() {
        Answers answers = new Answers(List.of(Optional.of(" "), Optional.empty()));

        assertThat(new PlayerNameCollector(answers).collect()).isEmpty();
        assertThat(answers.messages).hasSize(2);
    }
}
