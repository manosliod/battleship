import java.awt.*;import java.awt.image.*;import javax.swing.*;import java.util.*;import java.io.File;import javax.imageio.ImageIO;
public class Harness{
 static JDialog dlg(){for(Window w:Window.getWindows())if(w instanceof JDialog&&w.isVisible())return (JDialog)w;return null;}
 static JDialog await() throws Exception{for(int i=0;i<100;i++){JDialog d=dlg();if(d!=null)return d;Thread.sleep(100);}throw new RuntimeException("no dialog");}
 static void shot(JDialog d,String f)throws Exception{Thread.sleep(300);BufferedImage im=new BufferedImage(d.getWidth(),d.getHeight(),BufferedImage.TYPE_INT_RGB);SwingUtilities.invokeAndWait(()->d.paint(im.getGraphics()));ImageIO.write(im,"png",new File(f));}
 static JTextField tf(Container c){for(Component k:c.getComponents()){if(k instanceof JTextField)return (JTextField)k;if(k instanceof Container){JTextField r=tf((Container)k);if(r!=null)return r;}}return null;}
 static void click(Container c,String t){for(Component k:c.getComponents()){if(k instanceof JButton&&((JButton)k).getText().equals(t))((JButton)k).doClick();else if(k instanceof Container)click((Container)k,t);}}
 static void dump(Container c,int n){for(Component k:c.getComponents()){String x=k.getClass().getSimpleName();if(k instanceof JLabel)x+=" '"+((JLabel)k).getText()+"'";if(k instanceof JButton)x+=" '"+((JButton)k).getText()+"'";System.out.println(" ".repeat(n)+x);if(k instanceof Container)dump((Container)k,n+1);}}
 public static void main(String[] a)throws Exception{
  String out=a[0];String[] steps=a[1].split("\\|",-1);
  Thread t=new Thread(()->{battleship.BattleShip.main(new String[0]);});t.setDaemon(true);t.start();
  int prompts=0;boolean first=true;
  for(String s:steps){JDialog d=await();prompts++;
   if(first){System.out.println("TITLE="+d.getTitle()+" modal="+d.isModal());dump(d,0);}
   String tag=prompts+"";
   if(!s.equals("CANCEL")){final String v=s;SwingUtilities.invokeAndWait(()->tf(d).setText(v));}
   shot(d,out+"-prompt"+tag+".png");first=false;
   System.out.println("prompt "+prompts+" input="+s);
   final String btn=s.equals("CANCEL")?"Cancel":"OK";SwingUtilities.invokeAndWait(()->click(d,btn));Thread.sleep(500);}
  Thread.sleep(800);JDialog d=dlg();System.out.println("after steps: dialog visible="+(d!=null)+" threadAlive="+t.isAlive());System.exit(0);}
}
