import React, { useState, useEffect } from "react";
import axios from "axios";

const Allocate = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [newClassroom, setNewClassroom] = useState({
    classroom_name: "",
    no_of_benches: "",
  });
  const [deleteClassroomName, setDeleteClassroomName] = useState("");
  const [updateData, setUpdateData] = useState({
    classroom_name: "",
    new_no_of_benches: "",
  });

  // Fetch classroom list
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/classroom-list");
      setClassrooms(response.data);
    } catch (error) {
      console.error("Error fetching classroom list:", error);
    }
  };

  const handleAddClassroom = async () => {
    if (!newClassroom.classroom_name || !newClassroom.no_of_benches) {
      alert("Please provide both classroom name and number of benches.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/add-classroom", newClassroom);
      alert("Classroom added successfully!");
      fetchClassrooms();
      setNewClassroom({ classroom_name: "", no_of_benches: "" });
    } catch (error) {
      console.error("Error adding classroom:", error);
      alert("Failed to add classroom.");
    }
  };

  const handleDeleteClassroom = async () => {
    if (!deleteClassroomName) {
      alert("Please provide a classroom name to delete.");
      return;
    }

    try {
      console.log("Attempting to delete classroom:", deleteClassroomName); // Debug log
      await axios.post("http://localhost:5000/delete-classroom", {
        classroom_name: deleteClassroomName,
      });
      alert("Classroom deleted successfully!");
      fetchClassrooms(); // Re-fetch the classroom list to update the view
      setDeleteClassroomName(""); // Clear input field after successful delete
    } catch (error) {
      console.error("Error deleting classroom:", error);
      alert("Failed to delete classroom.");
    }
  };

  const handleUpdateBenches = async () => {
    if (!updateData.classroom_name || !updateData.new_no_of_benches) {
      alert("Please provide both classroom name and new number of benches.");
      return;
    }

    try {
      // Sending PUT request instead of POST
      await axios.put("http://localhost:5000/update-benches", updateData);
      alert("Number of benches updated successfully!");
      fetchClassrooms(); // Re-fetch the classroom list to update the view
      setUpdateData({ classroom_name: "", new_no_of_benches: "" }); // Reset form
    } catch (error) {
      console.error("Error updating benches:", error);
      alert("Failed to update benches.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Allocate Page</h2>
      <h3>Classroom List</h3>
      <table
        border="1"
        cellPadding="10"
        cellSpacing="0"
        style={{ width: "100%", textAlign: "center" }}
      >
        <thead>
          <tr>
            <th>Sequence Number</th>
            <th>Classroom Name</th>
            <th>Number of Benches</th>
          </tr>
        </thead>
        <tbody>
          {classrooms.map((classroom) => (
            <tr key={classroom.sequence_number}>
              <td>{classroom.sequence_number}</td>
              <td>{classroom.classroom_name}</td>
              <td>{classroom.no_of_benches}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Add Classroom</h3>
      <input
        type="text"
        placeholder="Classroom Name"
        value={newClassroom.classroom_name}
        onChange={(e) =>
          setNewClassroom({ ...newClassroom, classroom_name: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Number of Benches"
        value={newClassroom.no_of_benches}
        onChange={(e) =>
          setNewClassroom({ ...newClassroom, no_of_benches: e.target.value })
        }
      />
      <button onClick={handleAddClassroom}>Add Classroom</button>

      <h3>Delete Classroom</h3>
      <input
        type="text"
        placeholder="Classroom Name"
        value={deleteClassroomName}
        onChange={(e) => setDeleteClassroomName(e.target.value)}
      />
      <button onClick={handleDeleteClassroom}>Delete Classroom</button>

      <h3>Update Number of Benches</h3>
      <input
        type="text"
        placeholder="Classroom Name"
        value={updateData.classroom_name}
        onChange={(e) =>
          setUpdateData({ ...updateData, classroom_name: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="New Number of Benches"
        value={updateData.new_no_of_benches}
        onChange={(e) =>
          setUpdateData({ ...updateData, new_no_of_benches: e.target.value })
        }
      />
      <button onClick={handleUpdateBenches}>Update Benches</button>
    </div>
  );
};

export default Allocate;
