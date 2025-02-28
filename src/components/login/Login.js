import React, { useState, useEffect } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBCheckbox,
  MDBCard,
  MDBCardBody,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo300.png";
import "../../styles/Login.css";
import axios from "axios";
import Cookies from "universal-cookie";
const cookies = new Cookies();

function Login() {
  const [sicilNo, setSicilNo] = useState("");
  const [sifre, setSifre] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = cookies.get("TOKEN");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const configuration = {
    method: "POST",
    url: "/api/users/login",
    data: {
      username: sicilNo,
      password: sifre,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const validateForm = () => {
    if (sicilNo === "" || sifre === "") {
      setError(true);
      setErrorMessage("Lütfen tüm alanları doldurunuz");
      return false;
    }
    return true;
  };

  const login = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // username and password trim
    configuration.data.username = sicilNo.trim();
    configuration.data.password = sifre.trim();

    axios(configuration)
      .then((result) => {
        // status code 200 ise başarılı giriş
        if (result.status !== 200) {
          setError(true);
          setErrorMessage("Hata! Daha sonra tekrar deneyiniz");
          setLoading(false);
          return;
        }
        if (rememberMe) {
          // Beni hatırla seçiliyse token 7 gün
          const expDate = new Date(Date.now() + 604800000);
          cookies.set("TOKEN", result.data.token, {
            path: "/",
            expires: expDate,
          });
        } else {
          // Beni hatırla seçili değilse, token oturum süresince geçerli olacak
          cookies.set("TOKEN", result.data.token, {
            path: "/",
          });
        }
        // Başarılı giriş sonrası yönlendirme
        window.location.href = "/";
      })
      .catch((error) => {
        const message =
          error.response?.data?.message || "Hata! Daha sonra tekrar deneyiniz";
        setError(true);
        setErrorMessage(message);
        setSifre(""); // Şifreyi temizle
        setLoading(false);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login();
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <MDBContainer className="my-5">
      <MDBCard className="login-card">
        <MDBRow className="g-0">
          <MDBCol md="6" className="d-flex align-items-center">
            <MDBCardBody className="p-4 p-lg-5">
              <div className="text-center mb-4">
                <div
                  onClick={() => navigate("/")}
                  style={{ cursor: "pointer" }}
                  className="mb-4"
                >
                  <img
                    src={logo}
                    alt="logo"
                    className="img-fluid logo-animation"
                    style={{ maxWidth: "200px" }}
                  />
                </div>
                <h3 className="fw-bold mb-4" style={{ color: "#d32f2f" }}>
                  Giriş Yap
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-outline mb-4">
                  <MDBInput
                    wrapperClass="mb-4 position-relative"
                    label="Sicil Numarası (abXXXXXX)"
                    id="sicilNo"
                    onChange={(e) => {
                      setSicilNo(e.target.value);
                      setError(false);
                      setErrorMessage("");
                    }}
                    value={sicilNo}
                    type="text"
                    autoComplete="username"
                    icon={<MDBIcon fas icon="user" />}
                  />

                  <div className="password-input position-relative">
                    <MDBInput
                      wrapperClass="mb-4"
                      label="Şifre"
                      id="sifre"
                      onChange={(e) => {
                        setSifre(e.target.value);
                        setError(false);
                        setErrorMessage("");
                      }}
                      value={sifre}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      icon={<MDBIcon fas icon="lock" />}
                    />
                    <span
                      className="password-toggle"
                      onClick={toggleShowPassword}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        zIndex: 2,
                      }}
                    >
                      <MDBIcon fas icon={showPassword ? "eye-slash" : "eye"} />
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-4">
                    <MDBCheckbox
                      id="rememberMe"
                      label="Beni Hatırla"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                  </div>

                  {error && (
                    <div
                      className="alert alert-danger mb-4 text-center fade-in"
                      role="alert"
                    >
                      <MDBIcon
                        fas
                        icon="exclamation-triangle"
                        className="me-2"
                      />
                      {errorMessage}
                    </div>
                  )}

                  <MDBBtn
                    type="submit"
                    onClick={login}
                    className="mb-4 w-100 btn-login"
                    color="danger"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Giriş Yapılıyor...
                      </>
                    ) : (
                      <>
                        <MDBIcon fas icon="sign-in-alt" className="me-2" />
                        Giriş Yap
                      </>
                    )}
                  </MDBBtn>
                </div>
              </form>
            </MDBCardBody>
          </MDBCol>

          <MDBCol
            md="6"
            className="system-info text-white d-flex align-items-center"
          >
            <div className="px-4 py-5 p-md-5">
              <h3 className="fw-bold mb-4">
                Eskişehir Adliyesi Yönetim Sistemi
              </h3>
              <p className="mb-4">
                Eskişehir Adliyesi Yönetim Sistemi, adliye personelinin
                işlemlerini kolaylaştırmak ve hızlandırmak amacıyla
                geliştirilmiştir.
              </p>
              <div className="d-flex align-items-center mb-4">
                <div className="feature-icon me-3">
                  <MDBIcon fas icon="chart-line" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Verimli Çalışma</h6>
                  <p className="small mb-0">İş süreçlerinizi optimize edin</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-4">
                <div className="feature-icon me-3">
                  <MDBIcon fas icon="shield-alt" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Güvenli Erişim</h6>
                  <p className="small mb-0">Verileriniz güvende</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="feature-icon me-3">
                  <MDBIcon fas icon="sync" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Güncel Bilgiler</h6>
                  <p className="small mb-0">Her zaman güncel verilere erişin</p>
                </div>
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBCard>
      <p className="text-center text-muted mt-4">Developed by Bilgehan Kalay</p>
    </MDBContainer>
  );
}

export default Login;
