import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { GET_USER_DETAILS } from "../constants/AxiosConfiguration";
import Cookies from "universal-cookie";
import axios from "axios";
import logo from "../../assets/logo300.png";

export default function AYSNavbar() {
  const [user, setUser] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  function getUser() {
    axios(GET_USER_DETAILS(token))
      .then((result) => {
        setUser(result.data.user);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  useState(() => {
    if (user === null) {
      getUser();
    }
  }, []);

  function logout() {
    cookies.remove("TOKEN");
    setUser(null);
    window.location.href = "/";
  }

  function handleLogin() {
    window.location.href = "/login";
  }

  function renderDropdown() {
    if (user) {
      return (
        <UncontrolledDropdown>
          <DropdownToggle color="danger">
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
          <DropdownToggle onClick={(e) => handleLogin()} color="danger">
            Giriş Yap
          </DropdownToggle>
        </UncontrolledDropdown>
      );
    }
  }

  return (
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
  );
}
