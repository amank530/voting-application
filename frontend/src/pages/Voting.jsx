import React, { useState } from "react";

const Voting = () => {
  const [voted, setVoted] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      party: "Party A",
      symbol: "https://via.placeholder.com/80",
      votes: 0,
    },
    {
      id: 2,
      name: "Priya Verma",
      party: "Party B",
      symbol: "https://via.placeholder.com/80",
      votes: 0,
    },
    {
      id: 3,
      name: "Amit Singh",
      party: "Party C",
      symbol: "https://via.placeholder.com/80",
      votes: 0,
    },
  ]);

  const handleVote = (id) => {
    if (voted) return;

    const updated = candidates.map((c) =>
      c.id === id ? { ...c, votes: c.votes + 1 } : c
    );

    setCandidates(updated);
    setVoted(true);
    setSelectedId(id);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h1 style={{ color: "#1a237e", margin: 0 }}>
          National Voting Portal
        </h1>
        <p style={{ color: "#555" }}>
          Cast your vote (Only once)
        </p>
      </div>

      {/* Voting Panel */}
      <div
        style={{
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
        }}
      >
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #ddd",
              padding: "15px 10px",
              backgroundColor:
                selectedId === candidate.id
                  ? "#e8f5e9"
                  : "transparent",
            }}
          >
            {/* Left: Symbol */}
            <img
              src={candidate.picture}
              alt="picture"
              style={{
                width: "60px",
                height: "60px",
              }}
            />

            {/* Middle: Details */}
            <div style={{ flex: 1, marginLeft: "15px" }}>
              <h3 style={{ margin: "0", color: "#222" }}>
                {candidate.name}
              </h3>
            </div>
            
            <div>
              <img src="" alt=""  style={{
                padding: "2px",
                margin: "10px",
                width: "35px",
                height: "50pxpx",
                borderRadius: "40%",
                border: "1px solid black",               
              }} />
            </div>
            

            {/* Right: Button */}
            <button
              onClick={() => handleVote(candidate.id)}
              disabled={voted}
              style={{
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: "none",
                cursor: voted ? "not-allowed" : "pointer",
                backgroundColor:
                  selectedId === candidate.id
                    ? "green"
                    : "#d32f2f",
                color: "#fff",
                minWidth: "90px",
              }}
            >
              {selectedId === candidate.id ? "Voted ✓" : "Vote"}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      {voted && (
        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            color: "green",
            fontWeight: "bold",
          }}
        >
          ✅ Your vote has been recorded successfully
        </div>
      )}
    </div>
  );
};

export default Voting;