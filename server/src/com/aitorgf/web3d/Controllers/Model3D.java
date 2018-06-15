package controllers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import models.Model3DBean;
import models.Model3DListBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;
import spark.Response;
import spark.Service;
import spark.Spark;

import java.io.*;
import java.nio.file.Paths;
import java.sql.SQLException;
import java.util.Base64;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * REST API for handle models
 */
public class Model3D {
    private static final String BASE64_PREFIX_PATTERN = "^data:.*;base64,(.+)$";
    public static final String UPLOAD_DIR_NAME = "models";

    public static File UPLOAD_DIR = new File(UPLOAD_DIR_NAME);
    private static final Logger LOG = LoggerFactory.getLogger(Model3D.class);

    public static void init(Service service) {
        UPLOAD_DIR.mkdir(); // create the upload directory if it doesn't exist

        service.path("/model", () -> {
            service.post("", "application/json", controllers.Model3D::postOne, new JsonTransformer());
            service.get("/:id", "application/json", controllers.Model3D::getOne, new JsonTransformer());
            service.get("", "application/json", controllers.Model3D::getAll, new JsonTransformer());
            service.delete("/:id", "application/json", controllers.Model3D::deleteOne);
        });
    }

    /**
     * [GET] /model
     * @param req
     * @param res
     * @return
     */
    private static Object getAll(Request req, Response res) {
        LOG.debug("Request Model3D:getAll");

        try {
            models.Model3D model = new models.Model3D();
            return new Model3DListBean(model.getAll());
        }
        catch(SQLException e) {
            LOG.warn(e.getMessage(), e);
            Spark.halt(500, e.toString());
            return null;
        }
    }

    /**
     * [GET] /model/:id
     * @param req
     * @param res
     * @return
     */
    private static Object getOne(Request req, Response res) {
        LOG.debug("Request Model3D:getOne");
        String modelId = req.params(":id");

        try {
            models.Model3D model = new models.Model3D();
            Model3DBean mod = model.getOne(Long.parseLong(modelId));

            if (mod != null) {
                return mod;
            }
            else {
                Spark.halt(404, "Model with id " + modelId + " not in database");
            }
        }
        catch(SQLException e) {
            LOG.warn(e.getMessage(), e);
            Spark.halt(500, e.toString());
        }

        return null;
    }

    /**
     * [DELETE] /model/:id
     * @param req
     * @param res
     * @return
     */
    private static Object deleteOne(Request req, Response res) {
        LOG.debug("Request Model3D:deleteOne");
        String modelId = req.params(":id");

        try {
            models.Model3D model = new models.Model3D();
            Model3DBean modelInstance = model.getOne(Long.parseLong(modelId));

            if (modelInstance == null) {
                Spark.halt(404, "Model not found"); return null;
            }

            File objFile = new File(modelInstance.Obj);
            if (objFile.exists()) objFile.delete();

            if (modelInstance.Mtl != null) {
                File mtlFile = new File(modelInstance.Mtl);
                if (mtlFile.exists()) mtlFile.delete();
            }

            model.deleteOne(modelInstance.Id);
            return modelInstance.Id;
        }
        catch(SQLException e) {
            LOG.warn(e.getMessage(), e);
            Spark.halt(500, e.toString());
        }

        return null;
    }

    /**
     * [POST] /model
     * @param req
     * @param res
     * @return
     */
    private static Object postOne(Request req, Response res) {
        LOG.debug("Request Model3D:postOne");

        try {
            // Get JSON data
            Gson gson = new GsonBuilder().create();
            Model3DBean modelInstance = gson.fromJson(req.body(), Model3DBean.class);

            // Make base64 string matcher
            Pattern base64pattern = Pattern.compile(BASE64_PREFIX_PATTERN);

            // Syntax and data check
            if (modelInstance.Name.length() < 1) {
                Spark.halt(400, "Name is required"); return null;
            }
            if (modelInstance.Obj == null || Objects.equals(modelInstance.Obj, "") || ! base64pattern.matcher(modelInstance.Obj).matches()) {
                Spark.halt(400, "Obj is required and may be a Base64 string"); return null;
            }
            if (modelInstance.Mtl == null || Objects.equals(modelInstance.Mtl, "")) {
                modelInstance.Mtl = null;
            }
            else if (!base64pattern.matcher(modelInstance.Mtl).matches()) {
                Spark.halt(400, "Mtl may be a Base64 string"); return null;
            }

            models.Model3D db = new models.Model3D();

            // Convert base64 data to binary and save temporary in memory
            byte[] objContent = null;
            Matcher objMatcher = base64pattern.matcher(modelInstance.Obj);
            if (objMatcher.find()) {
                objContent = Base64.getDecoder().decode(objMatcher.group(1));
                modelInstance.Obj = null;
            } else {
                LOG.warn("If OBJ match, must be found");
            }
            byte[] mtlContent = null;
            if (modelInstance.Mtl != null) {
                Matcher mtlMatcher = base64pattern.matcher(modelInstance.Mtl);
                if (mtlMatcher.find()) {
                    mtlContent = modelInstance.Mtl == null ? null : Base64.getDecoder().decode(mtlMatcher.group(1));
                    modelInstance.Mtl = null;
                } else {
                    LOG.warn("If MTL match, must be found");
                }
            }

            // Insert model in DB to generate id
            modelInstance = db.addOne(modelInstance);

            // Save model and material files with id as name
            saveFile(modelInstance.Id + ".obj", objContent);
            modelInstance.Obj = UPLOAD_DIR_NAME + "/" + modelInstance.Id + ".obj";
            modelInstance.ObjSize = objContent.length;

            if (mtlContent != null) {
                saveFile(modelInstance.Id + ".mtl", mtlContent);
                modelInstance.Mtl = UPLOAD_DIR_NAME + "/" + modelInstance.Id + ".mtl";
                modelInstance.MtlSize = mtlContent.length;
            }

            // Update the DB with the file names
            modelInstance = db.updateOne(modelInstance);
            return modelInstance;
        }
        catch (IOException e) {
            LOG.warn(e.getMessage(), e);
            Spark.halt(500, e.toString());
        }
        catch (SQLException e) {
            LOG.warn(e.getMessage(), e);
            Spark.halt(500, e.toString());
        }

        return null;
    }

    /**
     * Helper to save model files
     * @param name Filename
     * @param data Content
     * @throws IOException
     */
    private static void saveFile(String name, byte[] data) throws IOException {
        File fo = Paths.get(UPLOAD_DIR.getAbsolutePath(), name).toFile();
        FileOutputStream fos = new FileOutputStream(fo);
        fos.write(data, 0, data.length);
        fos.flush();
        fos.close();
    }
}
