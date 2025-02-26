import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBCheckbox,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom"; // useHistory yerine useNavigate
import { useEffect } from "react";
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

  const navigate = useNavigate(); // useHistory yerine useNavigate

  useEffect(() => {
    const token = cookies.get("TOKEN");
    if (token) {
      navigate("/"); // history.push yerine navigate
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

    // username and password ttrim
    configuration.data.username = sicilNo.trim();
    configuration.data.password = sifre.trim();

    axios(configuration)
      .then((result) => {
        // status code 200 ise başarılı giriş
        if (result.status !== 200) {
          setError(true);
          setErrorMessage("Hata! Daha sonra tekrar deneyiniz");
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
          error.response.data.message || "Hata! Daha sonra tekrar deneyiniz";
        setError(true);
        setErrorMessage(message);
        setSifre(""); // Şifreyi temizle
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login();
  };

  return (
    <MDBContainer className="my-5 gradient-form">
      <MDBRow>
        <MDBCol col="6" className="mb-5">
          <form onSubmit={handleSubmit}>
            <div className="d-flex flex-column ms-5">
              <div
                onClick={() => navigate("/")} // history.push yerine navigate
                className="text-center mt-5"
                style={{
                  cursor: "pointer",
                }}
              >
                <img src={logo} style={{ width: "185px" }} alt="logo" />
                <h4 hidden className="mt-1 mb-5 pb-1">
                  Eskişehir Adliyesi{" "}
                </h4>
              </div>

              <p className="mt-5">Devam edebilmek için lütfen giriş yapın</p>

              <MDBInput
                wrapperClass="mb-4"
                label="Sicil Numarası (abXXXXXX)"
                id="sicilNo"
                onChange={(e) => {
                  setSicilNo(e.target.value);
                  setError(false);
                  setErrorMessage("");
                }}
                value={sicilNo}
                type="text"
              />
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
                type="password"
              />

              {/* oturum açık kalsın mı  */}
              <MDBCheckbox
                id="rememberMe"
                label="Beni Hatırla"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn
                  onClick={() => {
                    login();
                  }}
                  className="mb-4 w-100 "
                  color="danger"
                >
                  Giriş Yap
                </MDBBtn>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}{" "}
              </div>
            </div>
          </form>
        </MDBCol>

        <MDBCol col="6" className="mb-5">
          <div className="d-flex flex-column justify-content-center gradient-custom-2 h-100 mb-4">
            <div className="text-white px-3 py-4 p-md-5 mx-md-4">
              <h4 className="mb-4">Eskişehir Adliyesi Yönetim Sistemi</h4>
              <p className="small mb-0">
                Eskişehir Adliyesi Yönetim Sistemi, Eskişehir Adliyesi
                personelinin işlemlerini kolaylaştırmak ve hızlandırmak amacıyla
                geliştirilmiştir.
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
      <p>Developed by Bilgehan Kalay</p>
    </MDBContainer>
  );
}

export default Login;
