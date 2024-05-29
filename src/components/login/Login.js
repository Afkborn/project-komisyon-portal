import React, { useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
} from "mdb-react-ui-kit";
import { useHistory } from "react-router-dom";
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

  const navigate = useHistory();

  useEffect(() => {
    const token = cookies.get("TOKEN");
    if (token) {
      navigate.push("/");
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
    axios(configuration)
      .then((result) => {
        const expDate = new Date(Date.now() + 604800000);
        cookies.set("TOKEN", result.data.token, {
          path: "/",
          expires: expDate,
        });
        window.location.href = "/";
      })
      .catch((error) => {
        console.log("HATA");
        const message =
          error.response.data.message || "Hata! Daha sonra tekrar deneyiniz";
        setError(true);
        setErrorMessage(message);
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
              <div className="text-center">
                <img src={logo} style={{ width: "185px" }} alt="logo" />
                <h4 className="mt-1 mb-5 pb-1">Eskişehir Adliyesi </h4>
              </div>

              <p>Devam edebilmek için lütfen giriş yapın</p>

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

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn
                  onClick={() => {
                    login();
                  }}
                  className="mb-4 w-100 "
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
          <div className="d-flex flex-column  justify-content-center gradient-custom-2 h-100 mb-4">
            <div className="text-white px-3 py-4 p-md-5 mx-md-4">
              <h4 class="mb-4"> Geliştirici Notu :) </h4>
              <p class="small mb-0">
                Eskişehir Adliyesi Komisyon Kalemi için geliştirilmiş bir
                uygulamadır. Uygulamayı geliştirmekteki temel amaç komisyon
                kaleminin işlerini daha hızlı ve kolay bir şekilde yapmalarını
                sağlamaktır - Bilgehan Kalay
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;
