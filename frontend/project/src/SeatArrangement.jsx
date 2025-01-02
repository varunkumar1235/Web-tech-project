import React, { useState, useEffect } from "react";
import axios from "axios";
import "./app.css";

const SeatArrangement = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch seating arrangement data from backend
    axios
      .get("http://localhost:5000/seating-arrangement")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Function to download the data as a CSV file
  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = [
      "Class Room,3rd Sem Roll Numbers,5th Sem Roll Numbers,3rd Sem QP Count,5th Sem QP Count",
    ];

    const rows = data.map((row) =>
      [
        row.classroom_name || "-",
        row.third_sem_roll_numbers === "EMPTY"
          ? "-"
          : row.third_sem_roll_numbers,
        row.fifth_sem_roll_numbers === "EMPTY"
          ? "-"
          : row.fifth_sem_roll_numbers,
        row.third_sem_paper_count === "EMPTY" ? "-" : row.third_sem_paper_count,
        row.fifth_sem_paper_count === "EMPTY" ? "-" : row.fifth_sem_paper_count,
      ].join(",")
    );

    const csvContent = [headers.join("\n"), rows.join("\n")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "seating_arrangement.csv";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Seating Arrangement for both 3rd and 5th Semesters</h2>
      <h3>(All Core Subjects: 3rd and 5th)</h3>

      {data.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <div>
          <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
            style={{ width: "100%", textAlign: "center" }}
          >
            <thead>
              <tr>
                <th rowSpan="2">Class Room</th>
                <th colSpan="2">Roll Numbers</th>
                <th colSpan="2">QP Count</th>
              </tr>
              <tr>
                <th>3rd Sem</th>
                <th>5th Sem</th>
                <th>3rd Sem</th>
                <th>5th Sem</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.classroom_name || "-"}</td>
                  <td>
                    {row.third_sem_roll_numbers === "EMPTY"
                      ? "-"
                      : row.third_sem_roll_numbers}
                  </td>
                  <td>
                    {row.fifth_sem_roll_numbers === "EMPTY"
                      ? "-"
                      : row.fifth_sem_roll_numbers}
                  </td>
                  <td>
                    {row.third_sem_paper_count === "EMPTY"
                      ? "-"
                      : row.third_sem_paper_count}
                  </td>
                  <td>
                    {row.fifth_sem_paper_count === "EMPTY"
                      ? "-"
                      : row.fifth_sem_paper_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={downloadCSV}
            style={{ marginTop: "20px", padding: "10px" }}
          >
            Download as CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default SeatArrangement;
