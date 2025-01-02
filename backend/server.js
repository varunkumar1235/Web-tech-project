const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Add this to handle JSON request bodies

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Empty password
  database: "wt_cp",
};

// Seating arrangement endpoint
app.get("/seating-arrangement", async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Fetch classroom and student data
    const [classrooms] = await connection.query(
      "SELECT * FROM classroom_list ORDER BY sequence_number"
    );
    const [thirdSemStudents] = await connection.query(
      "SELECT * FROM student_list_3rd ORDER BY rno"
    );
    const [fifthSemStudents] = await connection.query(
      "SELECT * FROM student_list ORDER BY rno"
    );

    // Group students by division (e.g., 100-series, 200-series)
    const groupByDivision = (students) => {
      const divisions = {};
      students.forEach((student) => {
        const division = Math.floor(student.rno / 100); // Identify division by roll number
        if (!divisions[division]) divisions[division] = [];
        divisions[division].push(student.rno); // Collect roll numbers
      });
      return divisions;
    };

    const thirdSemDivisions = groupByDivision(thirdSemStudents);
    const fifthSemDivisions = groupByDivision(fifthSemStudents);

    // Allocate classrooms
    const allocation = [];
    classrooms.forEach((classroom) => {
      const benches = classroom.no_of_benches; // Total benches in the classroom

      let thirdSemRollNumbers = [];
      let fifthSemRollNumbers = [];
      let thirdSemPaperCount = 0;
      let fifthSemPaperCount = 0;

      // Allocate students for 3rd sem
      const thirdDivisionKeys = Object.keys(thirdSemDivisions);
      if (thirdDivisionKeys.length > 0) {
        const currentThirdDivision = thirdDivisionKeys[0]; // Get the first division
        const students = thirdSemDivisions[currentThirdDivision].splice(
          0,
          benches
        ); // Take up to 'benches' students
        thirdSemRollNumbers = students;
        thirdSemPaperCount = students.length + 2;

        // Remove division if all students are allocated
        if (thirdSemDivisions[currentThirdDivision].length === 0) {
          delete thirdSemDivisions[currentThirdDivision];
        }
      }

      // Allocate students for 5th sem
      const fifthDivisionKeys = Object.keys(fifthSemDivisions);
      if (fifthDivisionKeys.length > 0) {
        const currentFifthDivision = fifthDivisionKeys[0]; // Get the first division
        const students = fifthSemDivisions[currentFifthDivision].splice(
          0,
          benches
        ); // Take up to 'benches' students
        fifthSemRollNumbers = students;
        fifthSemPaperCount = students.length + 2;

        // Remove division if all students are allocated
        if (fifthSemDivisions[currentFifthDivision].length === 0) {
          delete fifthSemDivisions[currentFifthDivision];
        }
      }

      // Determine roll number ranges
      const getRollNumberRange = (rollNumbers) => {
        const filteredNumbers = rollNumbers.filter((num) => num !== "EMPTY");
        if (filteredNumbers.length === 0) return "EMPTY"; // No students allocated
        return `${filteredNumbers[0]}-${
          filteredNumbers[filteredNumbers.length - 1]
        }`;
      };

      const thirdSemRollNumberRange = getRollNumberRange(thirdSemRollNumbers);
      const fifthSemRollNumberRange = getRollNumberRange(fifthSemRollNumbers);

      allocation.push({
        classroom_name: classroom.classroom_name,
        third_sem_roll_numbers: thirdSemRollNumberRange,
        fifth_sem_roll_numbers: fifthSemRollNumberRange,
        third_sem_paper_count: thirdSemPaperCount,
        fifth_sem_paper_count: fifthSemPaperCount,
      });
    });

    // Create a new table for seating allocations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seat_arrangement (
        classroom_name VARCHAR(50),
        third_sem_roll_numbers VARCHAR(50),
        fifth_sem_roll_numbers VARCHAR(50),
        third_sem_paper_count INT,
        fifth_sem_paper_count INT
      )
    `);

    // Clear old data
    await connection.query("TRUNCATE TABLE seat_arrangement");

    // Insert allocation data into the database
    for (const entry of allocation) {
      await connection.query("INSERT INTO seat_arrangement SET ?", entry);
    }

    // Send the allocation as a response
    res.json(allocation);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    connection.end();
  }
});

// Classroom management endpoints (Add, Delete, Update)
app.get("/classroom-list", async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [classrooms] = await connection.query(
      "SELECT * FROM classroom_list ORDER BY sequence_number"
    );
    res.json(classrooms);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    connection.end();
  }
});

// Add a classroom with duplicate name check
app.post("/add-classroom", async (req, res) => {
  const { classroom_name, no_of_benches } = req.body;
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check if the classroom name already exists
    const [existingClassroom] = await connection.query(
      "SELECT * FROM classroom_list WHERE classroom_name = ?",
      [classroom_name]
    );

    if (existingClassroom.length > 0) {
      return res.status(400).send("Classroom with this name already exists.");
    }

    // Get the last sequence_number to increment
    const [lastClassroom] = await connection.query(
      "SELECT * FROM classroom_list ORDER BY sequence_number DESC LIMIT 1"
    );
    const sequence_number = lastClassroom.length
      ? lastClassroom[0].sequence_number + 1
      : 1;

    // Insert the new classroom into the database
    await connection.query(
      "INSERT INTO classroom_list (sequence_number, classroom_name, no_of_benches) VALUES (?, ?, ?)",
      [sequence_number, classroom_name, no_of_benches]
    );

    res.status(200).send("Classroom added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    connection.end();
  }
});

// Delete a classroom
app.post("/delete-classroom", async (req, res) => {
  const { classroom_name } = req.body;
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Ensure that classroom_name is provided
    if (!classroom_name) {
      return res.status(400).send("Classroom name is required.");
    }

    // Check if the classroom exists
    const [classroom] = await connection.query(
      "SELECT * FROM classroom_list WHERE classroom_name = ?",
      [classroom_name]
    );

    if (classroom.length === 0) {
      return res.status(404).send("Classroom not found.");
    }

    // Delete the classroom
    const [deleteResult] = await connection.query(
      "DELETE FROM classroom_list WHERE classroom_name = ?",
      [classroom_name]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(500).send("Failed to delete the classroom.");
    }

    res.status(200).send("Classroom deleted successfully!");
  } catch (error) {
    console.error("Error during delete:", error);
    res.status(500).send("Server Error");
  } finally {
    connection.end();
  }
});

// Update the number of benches for a classroom
app.put("/update-benches", async (req, res) => {
  const { classroom_name, new_no_of_benches } = req.body;
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Ensure that classroom_name and no_of_benches are provided
    if (!classroom_name || !new_no_of_benches) {
      return res
        .status(400)
        .send("Classroom name and new number of benches are required.");
    }

    // Check if the classroom exists
    const [classroom] = await connection.query(
      "SELECT * FROM classroom_list WHERE classroom_name = ?",
      [classroom_name]
    );

    if (classroom.length === 0) {
      return res.status(404).send("Classroom not found.");
    }

    // Update the number of benches
    const [updateResult] = await connection.query(
      "UPDATE classroom_list SET no_of_benches = ? WHERE classroom_name = ?",
      [new_no_of_benches, classroom_name]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).send("Failed to update the number of benches.");
    }

    res.status(200).send("Number of benches updated successfully!");
  } catch (error) {
    console.error("Error during update:", error);
    res.status(500).send("Server Error");
  } finally {
    connection.end();
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
