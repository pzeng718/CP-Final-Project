const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'password123',
    database: 'todo'
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
