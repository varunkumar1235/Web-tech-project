// Import the mysql2 module
const mysql = require("mysql2");

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: "localhost", // Replace with your MySQL server host
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "wt_cp", // The database you want to connect to
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the wt_cp database.");
});

module.exports = connection;
