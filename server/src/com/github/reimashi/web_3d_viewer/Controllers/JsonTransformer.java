package controllers;

import com.google.gson.Gson;
import spark.ResponseTransformer;

/**
 * Transform the controller responses in JSON objects
 */
public class JsonTransformer implements ResponseTransformer {

    private Gson gson = new Gson();

    @Override
    public String render(Object model) {
        return gson.toJson(model);
    }
}