package Models;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class Model3DQuery extends Model {
    public Model3DQuery() {
        super("model3d");
    }

    @Override
    protected void createTable() {
        // SQL statement for creating a new table
        String sql = "CREATE TABLE IF NOT EXISTS " + this.Name + " (\n\tid integer PRIMARY KEY,\n\tname text NOT NULL\n);";

        try {
            Statement stmt = this.connection.createStatement();
            // create a new table
            stmt.execute(sql);
        }
        catch (Exception e) {
            System.err.println("No se ha podido crear la tabla " + this.Name);
        }
    }

    public List<Model3DBeam> getAll() throws SQLException {
        String sql = "SELECT * FROM " + this.Name;

        Statement stmt  = this.connection.createStatement();
        ResultSet rs    = stmt.executeQuery(sql);

        List<Model3DBeam> rows = new ArrayList<>();

        // loop through the result set
        while (rs.next()) {
            Model3DBeam row = new Model3DBeam();

            row.Id = rs.getInt("id");

            rows.add(row);
        }

        return rows;
    }

    public Model3DBeam getOne(int id) throws SQLException {
        String sql = "SELECT * FROM " + this.Name + " WHERE id = " + id;

        Statement stmt  = this.connection.createStatement();
        ResultSet rs    = stmt.executeQuery(sql);

        // loop through the result set
        while (rs.next()) {
            Model3DBeam row = new Model3DBeam();

            row.Id = rs.getInt("id");

            return row;
        }

        return null;
    }
}
