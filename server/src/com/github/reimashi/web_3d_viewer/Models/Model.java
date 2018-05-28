package Models;

import java.sql.Connection;

public abstract class Model {
    public final String Name;
    protected Connection connection;

    public Model(String name) {
        this.Name = name;
        this.connection = Connector.getInstance().getConnection();
        this.createTable();
    }

    protected abstract void createTable();
}
