const mysql = require('mysql2/promise');
const config = require("../config/config.js");

const dbConfig = config.database
const pool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.databaseName,
    waitForConnections: true, //se não tiver conexão livre, aguardar
    connectionLimit: 10, //Máximo de 10 conexões abertas ao mesmo tempo
    queueLimit: 0 //Fila de espera sem limite
})

async function getConnection() {
    return pool.getConnection();
}

module.exports = getConnection;
