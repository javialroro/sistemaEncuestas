const { Client } = require('pg');

class Database {
    constructor(database, user, password, host, port) {
        this.database = database;
        this.user = user;
        this.password = password;
        this.host = host;
        this.port = port;
        this.client = new Client({
            user: this.user,
            host: this.host,
            database: this.database,
            password: this.password,
            port: this.port,
        });
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
        } catch (e) {
            console.error(`Failed to connect ${e}`);
        }
    }

    async disconnect() {
        try {
            await this.client.end();
            console.log('Disconnected from the database');
        } catch (e) {
            console.error(`Failed to disconnect ${e}`);
        }
    }

// Autenticacion y Autorizacion
    async createUser(username, password) {
        try {
            await this.client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        } catch (e) {
            console.error(`Failed to create user ${e}`);
        }
    }

    async getUserByUsername(username) {
        try {
            const result = await this.client.query('SELECT * FROM users WHERE username = $1', [username]);
            return result.rows[0];
        } catch (e) {
            console.error(`Failed to get user by username ${e}`);
        }
    }
// Usuarios

    async getUsers() {
        try {
            const result = await this.client.query('SELECT * FROM users');
            return result.rows;
        } catch (e) {
            console.error(`Failed to get users ${e}`);
        }
    }

    async getUserById(id) {
        try {
            const result = await this.client.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0];
        } catch (e) {
            console.error(`Failed to get user by id ${e}`);
        }
    }

    async updateUser(request_json, id) {
        try {
            await this.client.query('UPDATE users SET username = $1, password = $2 WHERE id = $3', [request_json.username, request_json.password, id]);
        } catch (e) {
            console.error(`Failed to update user ${e}`);
        }
    }

    async deleteUser(id) {
        try {
            await this.client.query('DELETE FROM users WHERE id = $1', [id]);
        } catch (e) {
            console.error(`Failed to delete user ${e}`);
        }
    }
 
}

module.exports.Database = Database;
