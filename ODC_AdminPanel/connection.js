const mariadb = require('mariadb');
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // connectionLimit: 5
};
// const pool = mariadb.createPool(dbConfig);

// async function connectionFunction() {
//     let conn;
//     try {
//     	conn = await pool.getConnection();
//         // const rows2 = await conn.query("USE ODC;");
//     	// const [ rows ] = await conn.query("SELECT * FROM STUDENT;");
//         console.log(`Admin Panel Server Connected to Database Successfully...`);

//         return conn;
//     } catch(error){
//         console.log(error);
//     } finally {
//         if (conn) conn.release(); //release to pool
//     }
// }

const db = mariadb.createConnection(dbConfig);

module.exports = db;