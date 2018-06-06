package models;

import java.util.List;

/**
 * List of 3D models
 */
public class Model3DListBean {
    public List<Model3DBean> models;

    public Model3DListBean(List<Model3DBean> elems) {
        this.models = elems;
    }
}