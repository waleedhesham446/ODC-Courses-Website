const mariadb = require('mariadb');
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // connectionLimit: 5
};

const db = mariadb.createConnection(dbConfig);

module.exports = db;