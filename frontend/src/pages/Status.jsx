import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const candidates = ["candidate-1", "candidate-2", "candidate-3", "candidate-4"];

function Status() {
  const [votes, setVotes] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVotes((prevVotes) =>
        prevVotes.map((v) => v + Math.floor(Math.random() * 10))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: candidates,
    datasets: [
      {
        label: "Votes",
        data: votes,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const winningIndex = votes.indexOf(Math.max(...votes));
  const winner = candidates[winningIndex];

  // Inline CSS
  const containerStyle = {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
    minHeight: "100vh",
    padding: "20px",
  };

  const headerStyle = {
    marginBottom: "30px",
  };

  const titleStyle = {
    fontSize: "3rem",
    color: "#333",
  };

  const winnerStyle = {
    fontSize: "1.5rem",
    color: "#34aadc",
  };

  const chartWrapperStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Live Voting Results</h1>
        <h2 style={winnerStyle}>Current Leader: <span style={{color: 'red'}}>{winner}</span></h2>
      </header>
      <div style={chartWrapperStyle}>
        <Bar data={data} />
      </div>
    </div>
  );
}

export default Status;