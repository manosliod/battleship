package dev.manosliod.battleship.player.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PlayerNameTest {

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "   ", "\t", "\n \t"})
    void blankTextIsNotAName(String raw) {
        assertThat(PlayerName.parse(raw)).isEmpty();
    }

    @Test
    void surroundingWhitespaceIsStripped() {
        assertThat(PlayerName.parse("  Ada Lovelace \t")).contains(new PlayerName("Ada Lovelace"));
    }

    @Test
    void constructorRefusesUnstrippedOrBlankValues() {
        assertThatThrownBy(() -> new PlayerName(" Ada")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new PlayerName(" ")).isInstanceOf(IllegalArgumentException.class);
    }
}
