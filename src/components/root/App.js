import { Routes, Route } from "react-router-dom";
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
import SegbisRoutes from "../Routes/SegbisRoutes";
import SegbisRehberDashboard from "../dashboards/SegbisRehberDashboard";
import KullaniciAktiviteleri from "../dashboards/KullaniciAktiviteleri";

import "../../styles/App.css";

function App() {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<Home />} />

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
          <Route
            path="/segbis-rehber/*"
            element={<SegbisRehberDashboard />}
          />
        </Route>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
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
