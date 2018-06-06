package models;

import com.google.gson.annotations.SerializedName;

/**
 * 3D model information
 */
public class Model3DBean {
    @SerializedName("id")
    public long Id;

    @SerializedName("name")
    public String Name;

    @SerializedName("obj")
    public String Obj = null;

    @SerializedName("obj_size")
    public long ObjSize = 0;

    @SerializedName("mtl")
    public String Mtl = null;

    @SerializedName("mtl_size")
    public long MtlSize = 0;
}
