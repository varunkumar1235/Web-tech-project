const mysql = require("mysql2");
const fs = require("fs");

// MySQL connection configuration
const connection = mysql.createConnection({
  host: "localhost", // Change if necessary
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password (empty string based on your setup)
  database: "wt_cp", // Replace with your database name
});

// CSV file path
const csvFilePath = "C:\\College\\web tech project\\data\\CS.csv";

// Step 1: Create the `cs` table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS cs (
    usn VARCHAR(20) NOT NULL,
    division VARCHAR(10) NOT NULL,
    rno INT NOT NULL
  );
`;

connection.query(createTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
    connection.end();
    return;
  }
  console.log("Table `cs` created or already exists.");

  // Step 2: Read the CSV file and process its content
  fs.readFile(csvFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading CSV file:", err);
      connection.end();
      return;
    }

    // Split CSV content into lines
    const lines = data.split("\n");

    // Process each line (skip the header)
    const insertValues = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [usn, division, rno] = line.split(",");
        if (usn && division && rno) {
          insertValues.push([usn, division, parseInt(rno, 10)]);
        }
      }
    }

    // Step 3: Insert data into the `cs` table
    if (insertValues.length > 0) {
      const insertQuery = `INSERT INTO cs (usn, division, rno) VALUES ?`;
      connection.query(insertQuery, [insertValues], (err, results) => {
        if (err) {
          console.error("Error inserting data:", err);
        } else {
          console.log(
            `Inserted ${results.affectedRows} rows into the \`cs\` table.`
          );
        }
        connection.end();
      });
    } else {
      console.log("No valid data found in the CSV file.");
      connection.end();
    }
  });
});
