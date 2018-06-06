package models;

import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * SQLite database connector
 */
public class Connector {
    private static final String DB_FILE_NAME = "web_3d_viewer.db";
    public static String DB_FILE_PATH = "./";

    private static Connector INSTANCE = null;
    private Connection connection;

    private Connector() throws SQLException {
        String url = "jdbc:sqlite:" + Paths.get(DB_FILE_PATH, DB_FILE_NAME).toFile().getAbsolutePath();

        this.connection = DriverManager.getConnection(url);
    }

    Connection getConnection() {
        return this.connection;
    }

    static Connector getInstance() throws SQLException {
        if (INSTANCE == null) INSTANCE = new Connector();
        return INSTANCE;
    }
}
