package battleship;

import java.util.function.UnaryOperator;
import javax.swing.JOptionPane;

public final class Display {
    private final UnaryOperator<String> prompt;
    private String playerName = null;

    public Display() {
        this(Display::showDialog);
    }

    Display(UnaryOperator<String> prompt) {
        this.prompt = prompt;
        while (playerName == null || playerName == "") {
            getUsername();
        }
    }

    public void getUsername() {
        playerName = prompt.apply("Please insert your name and press 'OK'");
    }

    private static String showDialog(String message) {
        return JOptionPane.showInputDialog(null, message);
    }
}
