import React from "react";
import logo from "../../assets/logo300.png";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <img src={logo} alt="Logo" style={styles.logo} />
      <h1 style={styles.message}>
        Böyle bir URL yok gibi gözüküyor <br /> <br /> Güvenli bir yere gitmek
        istersen
        <a href="/"> buraya tıkla</a>
      </h1>
    </div>
  );
}

// Inline styles for centering and layout
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", // Full viewport height
    textAlign: "center",
    backgroundColor: "#f8f9fa", // Optional background color
  },
  logo: {
    width: "150px", // Adjust size of the logo
    marginBottom: "20px", // Space between logo and message
  },
  message: {
    fontSize: "24px", // Adjust font size
    color: "#333", // Text color
  },
};
