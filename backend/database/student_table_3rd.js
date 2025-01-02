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

// Path to the CSV file
const filePath = path.join(
  "C:",
  "College",
  "web tech project",
  "data",
  "student_list_3rd.csv"
);

// Create the table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS student_list_3rd (
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
  console.log("Table student_list_3rd created.");

  // Clear the table
  const truncateQuery = "TRUNCATE TABLE student_list_3rd";
  connection.query(truncateQuery, (err) => {
    if (err) {
      console.error("Error truncating the table:", err.message);
      connection.end();
      return;
    }
    console.log("Table student_list_3rd emptied.");

    // Read and process the CSV file manually
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the CSV file:", err.message);
        connection.end();
        return;
      }

      const rows = data.split("\n"); // Split rows including the header
      const studentData = rows
        .map((row) => {
          const columns = row.trim().split(","); // Split by commas
          if (columns.length === 3) {
            const rno = parseInt(columns[0], 10); // Column A: rno
            const usn = columns[1]; // Column B: usn
            const name = columns[2]; // Column C: name
            return [rno, usn, name];
          }
          return null; // Ignore invalid rows
        })
        .filter((row) => row !== null); // Remove null entries

      if (studentData.length === 0) {
        console.log("No valid data to insert.");
        connection.end();
        return;
      }

      // Insert data into the table
      const insertQuery =
        "INSERT INTO student_list_3rd (rno, usn, name) VALUES ?";
      connection.query(insertQuery, [studentData], (err) => {
        if (err) {
          console.error("Error inserting data:", err.message);
        } else {
          console.log("Data inserted successfully.");
        }

        // Close the connection
        connection.end((err) => {
          if (err) {
            console.error("Error closing the connection:", err.message);
          } else {
            console.log("Connection closed.");
          }
        });
      });
    });
  });
});
