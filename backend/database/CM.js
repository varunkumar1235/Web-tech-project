const mysql = require("mysql2");
const fs = require("fs");

// MySQL connection configuration
const connection = mysql.createConnection({
  host: "localhost", // Replace if necessary
  user: "root", // Replace with your MySQL username
  password: "", // Your MySQL password (empty string in your case)
  database: "wt_cp", // Database name
});

// CSV file path for `CM.csv`
const csvFilePath = "C:\\College\\web tech project\\data\\CM.csv";

// Step 1: Create the `cm` table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS cm (
    usn VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
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
  console.log("Table `cm` created or already exists.");

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
        const [usn, name, division, rno] = line.split(",");
        if (usn && name && division && rno) {
          insertValues.push([usn, name, division, parseInt(rno, 10)]);
        }
      }
    }

    // Step 3: Insert data into the `cm` table
    if (insertValues.length > 0) {
      const insertQuery = `INSERT INTO cm (usn, name, division, rno) VALUES ?`;
      connection.query(insertQuery, [insertValues], (err, results) => {
        if (err) {
          console.error("Error inserting data:", err);
        } else {
          console.log(
            `Inserted ${results.affectedRows} rows into the \`cm\` table.`
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