package models;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Base class for database models
 */
public abstract class Model {
    public final String Name;
    protected Connection connection;
    protected static boolean initialice = false;

    public Model(String name) throws SQLException {
        this.Name = name;
        this.connection = Connector.getInstance().getConnection();
        if (!initialice) {
            this.createTable();
            initialice = true;
        }
    }

    /**
     * Create the table structure if doesn't exists
     * @throws SQLException
     */
    protected abstract void createTable() throws SQLException;
}
