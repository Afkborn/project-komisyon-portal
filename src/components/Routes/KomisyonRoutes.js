import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { hasRequiredRole } from "../common/authUtils"; // Ortak fonksiyonu içe aktar

function KomisyonRoutes() {
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

  // Token yoksa login sayfasına yönlendir
  if (!token || !decodedToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rol kontrolü
  // komisyonuyesi, komisyonbaskani, admin rolleri için yetkilendirme
  const requiredRoles = [
    "komisyonbaskan",
    "komisyonuye",
    "komisyonkatip",
    "komisyonmudur",
    "admin",
  ];

  if (!hasRequiredRole(decodedToken, requiredRoles)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Yetkili kullanıcı için içeriği göster
  return <Outlet />;
}

export default KomisyonRoutes;
