package battleship;

import javax.swing.JOptionPane;

public final class Display {
    private String playerName = null;

    public Display() {
        while (playerName == null || playerName == "") {
            getUsername();
        }
    }

    public void getUsername() {
        playerName = JOptionPane.showInputDialog(null, "Please insert your name and press 'OK'");
    }
}
