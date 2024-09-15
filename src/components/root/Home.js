import React, { useState } from "react";
import {
  Container,
  Navbar,
  NavbarBrand,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Card,
  CardGroup,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
} from "reactstrap";
import { GET_USER_DETAILS } from "../constants/AxiosConfiguration";
import Cookies from "universal-cookie";
import axios from "axios";
import logo from "../../assets/logo300.png";

export default function Home() {
  const [user, setUser] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  function getUser() {
    axios(GET_USER_DETAILS(token))
      .then((result) => {
        setUser(result.data.user);
      })
      .catch((error) => {});
  }

  useState(() => {
    if (user === null) {
      getUser();
    }
  }, []);

  function logout() {
    cookies.remove("TOKEN");
    setUser(null);
  }

  function handleLogin() {
    window.location.href = "/login";
  }

  function renderDropdown() {
    if (user) {
      return (
        <UncontrolledDropdown>
          <DropdownToggle>
            {user.name} {user.surname}{" "}
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={(e) => logout()}>Çıkış Yap</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      );
    } else {
      return (
        <UncontrolledDropdown>
          <DropdownToggle onClick={(e) => handleLogin()}>
            Giriş Yap
          </DropdownToggle>
        </UncontrolledDropdown>
      );
    }
  }

  function handleKomisyonPortal() {
    window.location.href = "/komisyon-portal";
  }

  function handleSantralPortal() {
    window.location.href = "/santral-portal";
  }

  const cardImgStyle = {
    width: 300,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: "50%",
  };

  const cardStyle = {
    // mouse pointer
    cursor: "pointer",
  };

  return (
    <div>
      <>
        <Navbar className="my-2">
          <NavbarBrand href="/">
            <img
              alt="logo"
              src={logo}
              style={{
                height: 80,
                width: 80,
              }}
            />
            <span>Adliye Yönetim Sistemi</span>
          </NavbarBrand>
          {renderDropdown()}
        </Navbar>
      </>
      <Container>
        <div className="mt-5">
          <CardGroup>
            <Card
              className="m-5"
              style={cardStyle}
              onClick={(e) => handleKomisyonPortal()}
            >
              <CardImg
                alt="Komisyon Portal Logo"
                src={logo}
                top
                width="100%"
                style={cardImgStyle}
              />
              <CardBody>
                <CardTitle tag="h5">Komisyon Portal</CardTitle>
                <CardText>
                  Komisyon kalemi için geliştirilen portalda Adliye Personel
                  İşlemleri için özel raporlar ve işlemler bulunmaktadır.
                </CardText>
              </CardBody>
            </Card>
            <Card
              className="m-5"
              style={cardStyle}
              onClick={(e) => handleSantralPortal()}
            >
              <CardImg
                alt="Santral Portal Logo"
                src={logo}
                top
                width="100%"
                style={cardImgStyle}
              />
              <CardBody>
                <CardTitle tag="h5">Santral Portal</CardTitle>
                <CardText>
                  Santral portalı ile adliyede çalışan personellerin dahili
                  numaralarını ve bilgilerini görüntüleyebilirsiniz.
                </CardText>
              </CardBody>
            </Card>
          </CardGroup>
        </div>
      </Container>
    </div>
  );
}
