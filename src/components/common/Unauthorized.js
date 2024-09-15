import React from "react";
import Cookies from "universal-cookie";
import logo from "../../assets/logo300.png"; 

export default function Unauthorized() {
  const cookies = new Cookies();

  function logout() {
    cookies.remove("TOKEN");
    window.location.href = "/login";
  }

  return (
    <div style={styles.container}>
      <img src={logo} alt="Logo" style={styles.logo} />
      <h1 style={styles.message}>Bu sayfayı görüntülemek için yetkiniz yok!</h1>
      <h6>
        Hesap değiştirmek için{" "}
        <button onClick={logout} style={styles.linkButton}>
          buraya tıklayın
        </button>
      </h6>
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
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
  },
  logo: {
    width: "150px",
    marginBottom: "20px",
  },
  message: {
    fontSize: "24px",
    color: "#333",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "inherit",
  },
};
