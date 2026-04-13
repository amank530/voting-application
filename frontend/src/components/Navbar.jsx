import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#00df9a" : "#fff",
    margin: "0 15px",
    textDecoration: "none",
    fontWeight: "500",
    transition: "0.3s",
  });

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>SecureVote</h2>

      {/* Hamburger Menu */}
      <div style={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* Links */}
      <div style={{
        ...styles.links,
        ...(menuOpen ? styles.mobileMenuOpen : {})
      }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/login" style={linkStyle("/login")}>Login</Link>
        <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111",
    padding: "10px 20px",
    color: "#fff",
    position: "relative",
  },
  logo: {
    margin: 0,
    color: "#00df9a",
  },
  links: {
    display: "flex",
    alignItems: "center",
  },
  menuIcon: {
    display: "none",
    fontSize: "24px",
    cursor: "pointer",
  },

  /* Mobile styles */
  mobileMenuOpen: {
    position: "absolute",
    top: "60px",
    right: 0,
    background: "#222",
    flexDirection: "column",
    width: "200px",
    padding: "10px",
  },
};

/* Add this CSS in your global CSS file */
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@media (max-width: 768px) {
  nav div[style*="display: flex"] {
    display: none !important;
  }

  nav div[style*="font-size: 24px"] {
    display: block !important;
  }

  nav div[style*="position: absolute"] {
    display: flex !important;
  }
}
`;
document.head.appendChild(styleSheet);

export default Navbar;