import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoutes() {
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");
  const location = useLocation();

  let decodedToken;
  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  if (!token || !decodedToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
