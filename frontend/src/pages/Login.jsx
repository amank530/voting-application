import React, { useState } from "react";
import API from "../services/api";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);

  const [form, setForm] = useState({
    name: "",
    aadhaar: "",
    dob: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Aadhaar validation
    if (!/^\d{12}$/.test(form.aadhaar)) {
      alert("Aadhaar must be 12 digits");
      return;
    }

    // Age validation (only for signup)
    if (isSignup) {
      const age = calculateAge(form.dob);
      if (age < 18) {
        alert("You must be at least 18 years old to register");
        return;
      }
    }

    try {
      if (isSignup) {
        await API.post("/signup", form);
        alert("Signup successful! Please login.");
        setIsSignup(false);
      } else {
        const res = await API.post("/login", {
          aadhaar: form.aadhaar,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
        window.location.href = "/";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{isSignup ? "Signup" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />

              <input
                style={styles.input}
                type="date"
                name="dob"
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            style={styles.input}
            type="text"
            name="aadhaar"
            placeholder="Aadhaar Number"
            maxLength="12"
            onChange={handleChange}
            required
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button style={styles.button} type="submit">
            {isSignup ? "Signup" : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "10px" }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <span
            style={styles.toggle}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? " Login" : " Signup"}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #4facfe, #00f2fe)",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  toggle: {
    color: "blue",
    cursor: "pointer",
    marginLeft: "5px",
    fontWeight: "bold",
  },
};

export default AuthPage;