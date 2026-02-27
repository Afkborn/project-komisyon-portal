import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NotFound from "../common/NotFound";
import Unauthorized from "../common/Unauthorized";

import Home from "./Home";
import Login from "../login/Login";

import KomisyonRoutes from "../Routes/KomisyonRoutes";
import KomisyonPortalDashboard from "../dashboards/KomisyonPortalDashboard";
import SantralRoutes from "../Routes/SantralRoutes";
import SantralPortalDashboard from "../dashboards/SantralPortalDashboard";
import KullaniciYonetimSistemRoutes from "../Routes/KullaniciYonetimSistemRoutes";
import KullaniciYonetimSistemDashboard from "../dashboards/KullaniciYonetimSistemDashboard";
import HesapAyarlari from "../dashboards/HesapAyarlari";
import SegbisRoutes from "../Routes/SegbisRoutes";
import BiNotRoutes from "../Routes/BiNotRoutes";
import BiChatRoutes from "../Routes/BiChatRoutes";
import BiChatDashboard from "../dashboards/BiChatDashboard";
import ProtectedRoutes from "../Routes/ProtectedRoutes";
import SegbisRehberDashboard from "../dashboards/SegbisRehberDashboard";
import BiNotDashboard from "../dashboards/BiNotDashboard";
import KullaniciAktiviteleri from "../dashboards/KullaniciAktiviteleri";
import BultenDashboard from "../dashboards/BultenDashboard";
import EskBaroLevhaDashboard from "../dashboards/EskBaroLevhaDashboard";
import "../../styles/App.css";

function getPageTitle(pathname) {
  const path = (pathname || "").toLowerCase();

  if (path.startsWith("/binot")) return "AYS - BiNot";
  if (path.startsWith("/ays-kys/aktiviteler"))
    return "AYS - Kullanıcı Aktiviteleri";
  if (path.startsWith("/ays-kys")) return "AYS - Kullanıcı Yönetim Sistemi";
  if (path.startsWith("/segbis-rehber")) return "AYS - SEGBİS Rehber";
  if (path.startsWith("/komisyon-portal")) return "EPSİS";
  if (path.startsWith("/santral-portal")) return "AYS - Santral Portal";
  if (path.startsWith("/bulten")) return "AYS - Bülten";
  if (path.startsWith("/eskisehir-baro-levha"))
    return "AYS - Eskişehir Baro Levha";
  if (path.startsWith("/login")) return "AYS - Giriş";
  if (path.startsWith("/unauthorized")) return "AYS - Yetkisiz Erişim";
  if (path === "/") return "Adliye Yönetim Sistemi";

  return "AYS";
}

function App() {
  const location = useLocation();

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bulten" element={<BultenDashboard />} />

        {/* Protected Routes */}
        <Route element={<KomisyonRoutes />}>
          <Route
            path="/komisyon-portal/*"
            element={<KomisyonPortalDashboard />}
          />
        </Route>

        <Route element={<SantralRoutes />}>
          <Route
            path="/santral-portal/*"
            element={<SantralPortalDashboard />}
          />
        </Route>

        <Route element={<KullaniciYonetimSistemRoutes />}>
          <Route
            path="/ays-kys/*"
            element={<KullaniciYonetimSistemDashboard />}
          />
          <Route
            path="/ays-kys/aktiviteler/:userId"
            element={<KullaniciAktiviteleri />}
          />
        </Route>

        <Route element={<SegbisRoutes />}>
          <Route path="/segbis-rehber/*" element={<SegbisRehberDashboard />} />
        </Route>

        <Route element={<BiNotRoutes />}>
          <Route path="/binot/*" element={<BiNotDashboard />} />
        </Route>

        <Route element={<BiChatRoutes />}>
          <Route path="/bichat/*" element={<BiChatDashboard />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/hesap-ayarları" element={<HesapAyarlari />} />
        </Route>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/eskisehir-baro-levha"
          element={<EskBaroLevhaDashboard />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global styles for app wrapper */}
      <style jsx="true">{`
        .app-wrapper {
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
          padding: 0;
          margin: 0;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;
