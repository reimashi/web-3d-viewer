package Models;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class Connector {
    private static final Connector INSTANCE = new Connector();
    private Connection connection;

    private Connector() {
        String url = "jdbc:sqlite:./database.sql";

        try {
            this.connection = DriverManager.getConnection(url);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public Connection getConnection() {
        return this.connection;
    }

    public static Connector getInstance() {
        return INSTANCE;
    }
}
