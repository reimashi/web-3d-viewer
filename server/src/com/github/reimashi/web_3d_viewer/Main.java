import com.qmetric.spark.authentication.*;
import controllers.Model3D;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Service;
import spark.staticfiles.StaticFilesConfiguration;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Paths;

public class Main {
    private static int WEB_PORT = 4080;
    private static String WEB_USER = "admin";
    private static String WEB_PASS = "admin";
    private static String STATIC_PATH = "../client/dist";

    private static final Logger LOG = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        // Load configuration from environment variables, for docker integration
        if (System.getenv().containsKey("WEB_PORT")) {
            WEB_PORT = Integer.parseInt(System.getenv("WEB_PORT"));
        }

        if (System.getenv().containsKey("WEB_USER")) {
            WEB_USER =System.getenv("WEB_USER");
        }

        if (System.getenv().containsKey("WEB_PASS")) {
            WEB_PASS = System.getenv("WEB_PASS");
        }

        if (System.getenv().containsKey("STATIC_PATH")) {
            WEB_PASS = System.getenv("STATIC_PATH");
        }

        // Init web service
        Service service = Service.ignite();

        // Set http listen port
        service.port(WEB_PORT);

        // Basic authentication
        service.before(new BasicAuthenticationFilter(new AuthenticationDetails(WEB_USER, WEB_PASS)));

        // Serve client files
        try {
            File staticDir = new File(STATIC_PATH);

            StaticFilesConfiguration staticHandler = new StaticFilesConfiguration();
            staticHandler.configureExternal(staticDir.getCanonicalPath());
            service.before((request, response) -> staticHandler.consume(request.raw(), response.raw()));

            LOG.info("Serving static files from " + staticDir.getCanonicalPath() + "");

            File uploadDir = Paths.get(staticDir.getCanonicalPath(), Model3D.UPLOAD_DIR_NAME).toFile();
            Model3D.UPLOAD_DIR = uploadDir;
            LOG.info("The upload files will be stored in " + uploadDir.getCanonicalPath() + "");
        }
        catch (IOException e) {
            LOG.warn("Server can't locate the static files directory");
        }

        // Initialize controllers
        Model3D.init(service);

        LOG.info("Listening on http://0.0.0.0:" + WEB_PORT + "...");

        // Wait loop
        try {
            System.out.println("Press [Enter] to stop");
            BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
            br.readLine();
        }
        catch(Exception e) {
            LOG.warn("Server can't be stopped by console");

            try {
                Thread.sleep(Long.MAX_VALUE);
            } catch (InterruptedException e1) {
                LOG.error("Main thread can't wait the end signal", e1);
            }
        }

        service.stop();
    }
}