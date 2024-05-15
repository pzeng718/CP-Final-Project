const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'cppart2db.mysql.database.azure.com',
    user: 'pz640',
    port: 3306,
    password: 'Password123!',
    database: 'todo',
    ssl:{
        ca: fs.readFileSync(path.join(__dirname, './DigiCertGlobalRootCA.crt')),
        rejectUnauthorized: false
    },
    connectTimeout: 30000
});

const executeQuery = (query, callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool: ' + err.stack);
            return callback(err);
        }
        console.log('Connected to database as ID ' + connection.threadId);

        connection.query(query, (err, results, fields) => {
            connection.release();

            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    });
};

module.exports = { executeQuery };
