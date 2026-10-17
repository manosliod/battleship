package dev.manosliod.battleship.app;

import dev.manosliod.battleship.player.application.NameInput;
import java.util.Optional;
import javax.swing.JOptionPane;

final class SwingNameInput implements NameInput {

    @Override
    public Optional<String> read(String message) {
        return Optional.ofNullable(JOptionPane.showInputDialog(null, message));
    }
}
