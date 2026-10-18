/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package battleship;

import javax.swing.JOptionPane;

/**
 *
 * @author manli
 */
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
