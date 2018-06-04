package models;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class Model3D extends Model {
    public Model3D() throws SQLException {
        super("model3d");
    }

    @Override
    protected void createTable() throws SQLException {
        // SQL statement for creating a new table
        String sql = String.format("CREATE TABLE IF NOT EXISTS %s (" +
                    "id integer PRIMARY KEY AUTOINCREMENT," +
                    "name text NOT NULL," +
                    "obj text," +
                    "objSize integer NOT NULL DEFAULT 0," +
                    "mtl text," +
                    "mtlSize integer NOT NULL DEFAULT 0" +
                ");", this.Name);

        Statement stmt = this.connection.createStatement();
        // create a new table
        stmt.execute(sql);
    }

    /**
     * Get all the models on the database
     * @return List of all the models on the database
     * @throws SQLException
     */
    public List<Model3DBean> getAll() throws SQLException {
        String sql = String.format("SELECT * FROM %s", this.Name);

        Statement stmt = this.connection.createStatement();
        ResultSet rs = stmt.executeQuery(sql);

        List<Model3DBean> rows = new ArrayList<>();

        // loop through the result set
        while (rs.next()) {
            Model3DBean row = new Model3DBean();

            row.Id = rs.getLong("id");
            row.Name = rs.getString("name");
            row.Obj = rs.getString("obj");
            row.Mtl = rs.getString("mtl");
            row.ObjSize = rs.getLong("objSize");
            row.MtlSize = rs.getLong("mtlSize");

            rows.add(row);
        }

        return rows;
    }

    /**
     * Get one model from the database
     * @param id Model id
     * @return Model information
     * @throws SQLException
     */
    public Model3DBean getOne(long id) throws SQLException {
        String sql = String.format("SELECT * FROM %s WHERE id = ?", this.Name);

        PreparedStatement stmt  = this.connection.prepareStatement(sql);
        stmt.setLong(1, id);

        ResultSet rs = stmt.executeQuery();

        // loop through the result set
        while (rs.next()) {
            Model3DBean row = new Model3DBean();

            row.Id = rs.getLong("id");
            row.Name = rs.getString("name");
            row.Obj = rs.getString("obj");
            row.Mtl = rs.getString("mtl");
            row.ObjSize = rs.getLong("objSize");
            row.MtlSize = rs.getLong("mtlSize");

            return row;
        }

        return null;
    }

    /**
     * Add one model to the database
     * @param toAdd Model information
     * @return Updated model information
     * @throws SQLException
     */
    public Model3DBean addOne(Model3DBean toAdd) throws SQLException {
        String sql = String.format("INSERT INTO %s (name, obj, mtl, objSize, mtlSize) VALUES (?, ?, ?, ?, ?)", this.Name);

        PreparedStatement st = this.connection.prepareStatement(sql);
        st.setString(1, toAdd.Name);
        st.setString(2, toAdd.Obj);
        st.setString(3, toAdd.Mtl);
        st.setLong(4, toAdd.ObjSize);
        st.setLong(5, toAdd.MtlSize);

        st.executeUpdate();

        ResultSet generatedKeys = st.getGeneratedKeys();
        if (generatedKeys.next()) {
            toAdd.Id = generatedKeys.getLong(1);
        }

        return toAdd;
    }

    /**
     * Update a model in the database
     * @param toUpdate The model information to be updated
     * @return Updated model information
     * @throws SQLException
     */
    public Model3DBean updateOne(Model3DBean toUpdate) throws SQLException {
        String sql = String.format("UPDATE %s SET name = ?, obj = ?, mtl = ?, objSize = ?, mtlSize = ? WHERE id = ?", this.Name);

        PreparedStatement st = this.connection.prepareStatement(sql);
        st.setString(1, toUpdate.Name);
        st.setString(2, toUpdate.Obj);
        st.setString(3, toUpdate.Mtl);
        st.setLong(4, toUpdate.ObjSize);
        st.setLong(5, toUpdate.MtlSize);
        st.setLong(6, toUpdate.Id);

        st.executeUpdate();

        return toUpdate;
    }

    /**
     * Delete a model in the database
     * @param id Model id
     * @throws SQLException
     */
    public void deleteOne(long id) throws SQLException {
        String sql = String.format("DELETE FROM %s WHERE id = ?", this.Name);
        PreparedStatement st = this.connection.prepareStatement(sql);
        st.setLong(1, id);
        st.executeUpdate();
    }
}
