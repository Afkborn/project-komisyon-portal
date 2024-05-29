import React from "react";
import { MDBFooter } from "mdb-react-ui-kit";
import "../../styles/App.css";

export default function Footer() {
  return (
    <MDBFooter className="text-center text-lg-left ">
      <div className="text-center text-light p-3 gradient-custom-2">
        &copy; {new Date().getFullYear()} Copyright{" "}
        <a className="text-light" href="https://github.com/Afkborn/">
          Afkborn
        </a>
      </div>
    </MDBFooter>
  );
}
