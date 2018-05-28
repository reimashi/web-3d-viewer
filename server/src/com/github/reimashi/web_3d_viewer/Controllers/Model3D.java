package Controllers;

import Models.Model3DBeam;
import Models.Model3DQuery;
import spark.Request;
import spark.Response;
import spark.Spark;

import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletException;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.SQLException;

public class Model3D {
    private static File uploadDir = new File("upload");

    public static void init() {
        uploadDir.mkdir(); // create the upload directory if it doesn't exist

        Spark.post("/model", "application/json", Model3D::postOne, new JsonTransformer());
        Spark.get("/model/:id", "application/json", Model3D::getOne, new JsonTransformer());
        Spark.get("/model", "application/json", Model3D::getAll, new JsonTransformer());
    }

    private static Object getAll(Request req, Response res) {
        System.out.println("getAll");
        Model3DQuery model = new Model3DQuery();

        try {
            return model.getAll();
        }
        catch(SQLException e) {
            Spark.halt(500, e.toString());
            return null;
        }
    }

    private static Object getOne(Request req, Response res) {
        Model3DQuery model = new Model3DQuery();
        String modelId = req.params(":id");

        try {
            Model3DBeam mod = model.getOne(Integer.parseInt(modelId));

            if (mod != null) {
                return mod;
            }
            else {
                Spark.halt(404, "Model with id " + modelId + " not in database");
            }
        }
        catch(SQLException e) {
            Spark.halt(500, e.toString());
        }

        return null;
    }

    private static Object postOne(Request req, Response res) {
        try (InputStream input = req.raw().getPart("uploaded_file").getInputStream()) {
            Path tempFile = Files.createTempFile(uploadDir.toPath(), "", "");

            req.attribute("org.eclipse.jetty.multipartConfig", new MultipartConfigElement("/temp"));

            Files.copy(input, tempFile, StandardCopyOption.REPLACE_EXISTING);
            return "<h1>You uploaded this image:<h1><img src='" + tempFile.getFileName() + "'>";
        }
        catch (ServletException | IOException e) {
            Spark.halt(500, e.toString());
        }

        return null;
    }
}
