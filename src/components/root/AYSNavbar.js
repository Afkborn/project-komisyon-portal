import React, { useState, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
} from "reactstrap";

import { GET_USER_DETAILS } from "../constants/AxiosConfiguration";
import Cookies from "universal-cookie";
import axios from "axios";
import logo from "../../assets/logo300.png";
import "./AYSNavbar.css"; // Yeni CSS dosyası için import eklendi

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

  // useState yerine useEffect kullanarak düzeltildi
  useEffect(() => {
    if (user === null) {
      getUser();
    }
    // eslint-disable-next-line
  }, [user]);

  function logout() {
    // Backend'e logout isteği gönder
    axios({
      method: 'POST',
      url: '/api/users/logout',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(() => {
      console.log("Başarıyla çıkış yapıldı");
    })
    .catch(error => {
      console.error("Çıkış yaparken bir hata oluştu:", error);
    })
    .finally(() => {
      // İşlem başarılı olsa da olmasa da kullanıcı bilgisini temizle ve çıkış işlemini tamamla
      setUser(null);
      
      // Cookie'yi doğru şekilde temizle (path ve domain parametreleriyle)
      cookies.remove("TOKEN", { path: "/" });

      // Tarayıcı önbelleğini temizle ve session'ı sonlandır
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }

      // Sayfayı tamamen yeniden yükle ve ana sayfaya yönlendir
      window.location.href = "/";

      // Alternatif olarak daha güçlü bir çözüm
      setTimeout(() => {
        if (cookies.get("TOKEN")) {
          // Eğer token hala duruyorsa, sayfayı tamamen yenile
          window.location.reload(true);
        }
      }, 100);
    });
  }

  function handleLogin() {
    window.location.href = "/login";
  }

  function renderDropdown() {
    if (user) {
      return (
        <UncontrolledDropdown>
          <DropdownToggle className="user-dropdown" color="light">
            <i className="fas fa-user-circle mr-2"></i>
            {user.name} {user.surname}
          </DropdownToggle>
          <DropdownMenu right className="dropdown-menu-custom">
            <DropdownItem onClick={(e) => logout()}>
              <i className="fas fa-sign-out-alt mr-2"></i>Çıkış Yap
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      );
    } else {
      return (
        <UncontrolledDropdown>
          <DropdownToggle
            onClick={(e) => handleLogin()}
            className="login-btn"
            color="light"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>Giriş Yap
          </DropdownToggle>
        </UncontrolledDropdown>
      );
    }
  }

  return (
    <Navbar className="ays-navbar" expand="md" dark color="dark">
      <Container className="d-flex justify-content-between align-items-center">
        <NavbarBrand href="/" className="d-flex align-items-center">
          <img alt="logo" src={logo} className="navbar-logo mr-3" />
          <span className="navbar-title">Adliye Yönetim Sistemi</span>
        </NavbarBrand>
        <div className="navbar-dropdown-container">{renderDropdown()}</div>
      </Container>
    </Navbar>
  );
}
