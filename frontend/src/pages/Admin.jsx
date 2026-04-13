import React, { useState } from "react";
import API from "../services/api";

const Admin = () => {
  const [form, setForm] = useState({
    name: "",
    position: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addCandidate = async () => {
    if (!form.name.trim() || !form.position) {
      setMessage("⚠️ Name and position are required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();
      data.append("name", form.name);
      data.append("position", form.position);
      data.append("description", form.description);
      if (form.image) {
        data.append("image", form.image);
      }

      await API.post("/add-candidate", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✅ Candidate added successfully!");
      setForm({
        name: "",
        position: "",
        description: "",
        image: null,
      });
    } catch (err) {
      setMessage("❌ Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Panel</h2>

        <input
          style={styles.input}
          name="name"
          placeholder="Candidate Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          name="name"
          placeholder="Area Name"
          value={form.name}
          onChange={handleChange}
        />

        <select
          style={styles.input}
          name="position"
          value={form.position}
          onChange={handleChange}
        >
          <option value="">Select Position</option>
          <option value="President">President</option>
          <option value="Vice President">Vice President</option>
          <option value="Secretary">Secretary</option>
        </select>

        {/* <textarea
          style={styles.textarea}
          name="description"
          placeholder="Candidate Description (optional)"
          value={form.description}
          onChange={handleChange}
        /> */}

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          style={styles.file}
        />

        <button
          style={{
            ...styles.button,
            backgroundColor:
              form.name && form.position ? "#4CAF50" : "#aaa",
          }}
          onClick={addCandidate}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Candidate"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
    container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f7fa",
  },
    card: {
    padding: "25px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "320px",
  },
    title: {
    textAlign: "center",
    marginBottom: "15px",
  },
    input: {
    width: "80%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
    textarea: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    minHeight: "70px",
  },
    file: {
    marginBottom: "12px",
  },
    button: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
  },
    message: {
    marginTop: "10px",
    textAlign: "center",
  },
};

export default Admin;