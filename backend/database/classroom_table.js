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
  "classroom_list.csv"
);
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the CSV file:", err.message);
    return;
  }

  // Split the file content into rows and process each row
  const rows = data.split("\n");
  const classroomData = rows.map((row, index) => {
    const [classroom_name, no_of_benches, capacity] = row.trim().split(" ");
    return {
      sequence_number: index + 1, // Assign a sequence number based on CSV order
      classroom_name,
      no_of_benches: parseInt(no_of_benches, 10),
      capacity: parseInt(capacity, 10),
    };
  });

  // Create the table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS classroom_list (
      sequence_number INT PRIMARY KEY,
      classroom_name VARCHAR(50) NOT NULL,
      no_of_benches INT NOT NULL,
      capacity INT NOT NULL
    );
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating the table:", err.message);
      connection.end();
      return;
    }
    console.log("Table classroom_list created or already exists.");

    // Truncate the table to remove existing data
    const truncateQuery = "TRUNCATE TABLE classroom_list";
    connection.query(truncateQuery, (err) => {
      if (err) {
        console.error("Error truncating the table:", err.message);
        connection.end();
        return;
      }
      console.log("Table classroom_list emptied.");

      // Insert data into the table
      const insertQuery = `
        INSERT INTO classroom_list (sequence_number, classroom_name, no_of_benches, capacity)
        VALUES (?, ?, ?, ?)
      `;
      classroomData.forEach(
        ({ sequence_number, classroom_name, no_of_benches, capacity }) => {
          connection.query(
            insertQuery,
            [sequence_number, classroom_name, no_of_benches, capacity],
            (err) => {
              if (err) {
                console.error(
                  `Error inserting row for classroom ${classroom_name}:`,
                  err.message
                );
              }
            }
          );
        }
      );

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
});
