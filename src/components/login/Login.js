import React from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
} from "mdb-react-ui-kit";

import logo from "../../assets/logo300.png";
import "../../styles/Login.css";

import axios from "axios";
import Cookies from "universal-cookie";
const cookies = new Cookies();

function App() {
  const [sicilNo, setSicilNo] = React.useState("");
  const [sifre, setSifre] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

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

  const login = () => {
    console.log(configuration);
    axios(configuration)
      .then((result) => {
        const expDate = new Date(Date.now() + 604800000);
        console.log(expDate);
        cookies.set("TOKEN", result.data.token, {
          path: "/",
          expires: expDate,
        });
        window.location.href = "/";
      })
      .catch((error) => {
        console.log(error);
        const message =
          error.response.data.message || "Hata! Daha sonra tekrar deneyiniz";
        setError(true);
        setErrorMessage(message);
      });
  };

  return (
    <MDBContainer className="my-5 gradient-form">
      <MDBRow>
        <MDBCol col="6" className="mb-5">
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
              onChange={(e) => setSicilNo(e.target.value)}
              value={sicilNo}
              type="text"
            />
            <MDBInput
              wrapperClass="mb-4"
              label="Şifre"
              id="sifre"
              onChange={(e) => setSifre(e.target.value)}
              value={sifre}
              type="password"
            />

            <div className="text-center pt-1 mb-5 pb-1">
              <MDBBtn
                onClick={() => {
                  login();
                }}
                className="mb-4 w-100 gradient-custom-2"
              >
                Giriş Yap
              </MDBBtn>
              {/* <a className="text-muted" href="#!">
                Forgot password?
              </a> */}
            </div>

            {/* <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
              <p className="mb-0">Don't have an account?</p>
              <MDBBtn outline className="mx-2" color="danger">
                Danger
              </MDBBtn>
            </div> */}
          </div>
        </MDBCol>

        <MDBCol col="6" className="mb-5">
          <div className="d-flex flex-column  justify-content-center gradient-custom-2 h-100 mb-4">
            <div className="text-white px-3 py-4 p-md-5 mx-md-4">
              <h4 class="mb-4"> Geliştirici Notu :) </h4>
              <p class="small mb-0">
                Eskişehir Adliyesi Komisyon Kalemi için geliştirilmiş bir
                uygulamadır. Uygulamayı geliştirmekteki temel amaç komisyon
                kaleminin işlerini daha hızlı ve kolay bir şekilde yapmalarını
                sağlamaktır.
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default App;
