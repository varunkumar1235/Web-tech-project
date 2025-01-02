const mysql = require("mysql2/promise");

(async () => {
  // Database connection
  const connection = await mysql.createConnection({
    host: "localhost", // Replace with your host
    user: "root", // Replace with your username
    password: "", // Replace with your password
    database: "wt_cp", // Replace with your database name
  });

  try {
    // Fetch the roll numbers from the `student_list` table
    const [students] = await connection.execute(`SELECT rno FROM student_list`);
    const studentList = students.map((student) => student.rno); // Extract the roll numbers

    // Create the `elective` table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS elective (
        rno INT PRIMARY KEY,
        elective VARCHAR(10)
      )
    `);

    // Function to check if roll number exists in a table
    const checkTable = async (tableName, rno) => {
      const [rows] = await connection.execute(
        `SELECT rno FROM ${tableName} WHERE rno = ?`,
        [rno]
      );
      return rows.length > 0;
    };

    // Process each roll number
    for (const rno of studentList) {
      let elective = null;

      // Check if rno exists in `cs` table
      if (await checkTable("cs", rno)) {
        elective = "cs";
      }
      // Check if rno exists in `cv` table
      else if (await checkTable("cv", rno)) {
        elective = "cv";
      }
      // Check if rno exists in `cm` table
      else if (await checkTable("cm", rno)) {
        elective = "cm";
      }

      // If an elective is found, insert into the `elective` table
      if (elective) {
        await connection.execute(
          `INSERT INTO elective (rno, elective) VALUES (?, ?) ON DUPLICATE KEY UPDATE elective = VALUES(elective)`,
          [rno, elective]
        );
      }
    }

    console.log("Elective table populated successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    await connection.end();
  }
})();
