import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Home.css"; 


const Home = () => {
  const [candidates, setCandidates] = useState([]);
  const [isGreen, setIsGreen] = useState(true);

  // Toggle live indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGreen((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Fetch candidates
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await API.get("/candidates");
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const vote = async (id) => {
    try {
      await API.post(`/vote/${id}`);
      alert("Vote cast successfully!");
      fetchCandidates();
    } catch (err) {
      alert("Error voting");
    }
  };

  const navigate = useNavigate();  
 

    return (

    <div className="home-page">
       
      {/* Hero Section */}
      <section className="hero-section">
        <h2>State Council Election 2026</h2>
        <p>Vote securely, transparently, and instantly.</p>

        <div className="cta-buttons">
          <button onClick={() => navigate("/login")} className="vote-btn">Vote Now</button>
          <button onClick={() => navigate("/status")} className="learn-btn">wining candidate</button>
        </div>

        {/* Live Voting Indicator */}
        <div className="live-status">
          <p>
            Voting is LIVE
            <span className={`status-dot ${isGreen ? "green" : "red"}`}></span>
          </p>
          <p className="end-time">Ends on 15 Feb 2026, 6:00 PM</p>
        </div>
      </section>

      {/* Candidates Section */}
      <section className="candidates-section">
        <h3>Cast Your Vote</h3>

        {candidates.length === 0 ? (
          <p className="no-candidates">No candidates available</p>
        ) : (
          <div className="candidates-grid">
            {candidates.map((c) => (
              <div key={c.id} className="candidate-card">
                <h4>{c.name}</h4>
                {c.votes !== undefined && <p>Votes: {c.votes}</p>}
                <button onClick={() => vote(c.id)} className="vote-btn-card">
                  Vote
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        © 2026 SecureVote | All rights reserved
      </footer>
    </div>
  );
};

export default Home;