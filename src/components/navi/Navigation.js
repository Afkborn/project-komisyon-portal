import React from "react";
import { MDBContainer, MDBNavbar, MDBNavbarBrand } from "mdb-react-ui-kit";
import "../../styles/App.css";


export default function Navigation() {
  return (
    <MDBNavbar className="mdb-container gradient-custom-2">
      <MDBContainer>
        <MDBNavbarBrand href="#">
          <img
            src="https://mdbootstrap.com/img/logo/mdb-transaprent-noshadows.webp"
            height="30"
            alt=""
            loading="lazy"
          />
        </MDBNavbarBrand>
      </MDBContainer>
    </MDBNavbar>
  );
}
