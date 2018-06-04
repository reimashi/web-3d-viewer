import controllers.Model3D;
import spark.Spark;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Paths;

public class Main {
    final static int PORT = 4080;

    public static void main(String[] args) {
        // Set http listen port
        Spark.port(PORT);

        // Serve client files
        try {
            File staticDir = new File("../client/dist");
            Spark.staticFiles.externalLocation(staticDir.getCanonicalPath());
            System.out.println("Serving static files from " + staticDir.getCanonicalPath() + "");

            File uploadDir = Paths.get(staticDir.getCanonicalPath(), Model3D.UPLOAD_DIR_NAME).toFile();
            Model3D.UPLOAD_DIR = uploadDir;
            System.out.println("The upload files will be stored in " + uploadDir.getCanonicalPath() + "");
        }
        catch (IOException e) {
            System.err.println("Server can't locate the static files directory");
        }

        // Initialize controllers
        Model3D.init();

        System.out.println("Listening on http://127.0.0.1:" + PORT + "...");
        System.out.println("Press [Enter] to stop");

        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
            br.readLine();
            Spark.stop();
        }
        catch(Exception e) {
            System.err.println("Server can't be stopped by console");
        }
    }
}