// src/db/setup-database.ts
import { createConnection, Connection } from 'mysql2/promise';
import { rootConfig } from '../config/database.root.config';
import databaseConfig from '../config/database.app.config';

async function createDatabase(
    connection: Connection,
    dbName: string,
): Promise<void> {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" created successfully.`);
}

async function createUser(
    connection: Connection,
    username: string,
    password: string,
): Promise<void> {
    await connection.query(
        `CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}'`,
    );
    console.log(`User "${username}" created successfully.`);
}

async function grantPrivileges(
    connection: Connection,
    dbName: string,
    username: string,
): Promise<void> {
    await connection.query(
        `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${username}'@'%'`,
    );
    console.log(
        `Privileges granted to user "${username}" for database "${dbName}"`,
    );
}

async function configureMainDatabase(connection: Connection): Promise<string> {
    const config = databaseConfig();
    const shadowDbName = `${config.database.name}_shadow`;

    console.log('Setting up main databases...');
    await createDatabase(connection, config.database.name);
    await createDatabase(connection, shadowDbName);

    await createUser(
        connection,
        config.database.username,
        config.database.password,
    );

    await grantPrivileges(
        connection,
        config.database.name,
        config.database.username,
    );
    await grantPrivileges(connection, shadowDbName, config.database.username);

    console.log('Main databases setup completed successfully.');
    return config.database.username;
}

async function setupDatabase(): Promise<void> {
    let connection: Connection | null = null;

    try {
        connection = await createConnection({
            host: rootConfig.host,
            port: rootConfig.port,
            user: rootConfig.user,
            password: rootConfig.password,
        });

        await configureMainDatabase(connection);

        await connection.query(`FLUSH PRIVILEGES`);
        console.log('All privileges have been flushed successfully.');
    } catch (error) {
        console.error('Database setup error:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase().catch((error) => {
    console.error('Failed to setup database:', error);
    process.exit(1);
});
