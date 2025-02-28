import { MDBContainer } from "mdb-react-ui-kit";
import { Routes, Route } from "react-router-dom"; // Switch yerine Routes
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
    <MDBContainer fluid className="p-0 m-0">
      <MDBContainer fluid>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<KomisyonRoutes />}>+
          
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
      </MDBContainer>
    </MDBContainer>
  );
}

export default App;
