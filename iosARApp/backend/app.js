const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "cppart2db.mysql.database.azure.com",
  port: 3306,
  user: "pz640",
  password: "Password123!",
  database: "mysql",
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "./DigiCertGlobalRootCA.crt")),
    rejectUnauthorized: false,
  },
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL server!");
});

app.post("/db", (req, res) => {
  const query = req.body.query;
  console.log(query);
  connection.query(query, (error, results, fields) => {
    if (error) throw error;
    res.json(results);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
