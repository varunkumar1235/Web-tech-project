const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

// Database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Empty password
  database: "wt_cp",
});

// Read the CSV file
const filePath = path.join(
  "C:",
  "College",
  "web tech project",
  "data",
  "student_list.csv"
);
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the CSV file:", err.message);
    return;
  }

  // Split the file content into rows and process each row
  const rows = data.split("\n");
  const studentData = rows.map((row) => {
    const [rno, usn, ...nameParts] = row.trim().split(" ");
    const name = nameParts.join(" ");
    return { rno: parseInt(rno, 10), usn, name };
  });

  // Create the table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS student_list (
      rno INT PRIMARY KEY,
      usn VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL
    );
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating the table:", err.message);
      connection.end();
      return;
    }
    console.log("Table student_list created.");

    // Insert data into the table
    const insertQuery =
      "INSERT INTO student_list (rno, usn, name) VALUES (?, ?, ?)";
    studentData.forEach(({ rno, usn, name }) => {
      connection.query(insertQuery, [rno, usn, name], (err) => {
        if (err) {
          console.error(`Error inserting row with rno ${rno}:`, err.message);
        }
      });
    });

    console.log("Data inserted successfully.");

    // Close the connection
    connection.end((err) => {
      if (err) {
        console.error("Error closing the connection:", err.message);
        return;
      }
      console.log("Connection closed.");
    });
  });
});
