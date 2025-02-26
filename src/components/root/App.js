import { MDBContainer } from "mdb-react-ui-kit";
import { Routes, Route } from "react-router-dom"; // Switch yerine Routes
import NotFound from "../common/NotFound";
import Unauthorized from "../common/Unauthorized";
import KomisyonRoutes from "../common/KomisyonRoutes";
import SantralRoutes from "../common/SantralRoutes";
import KullaniciYonetimSistemRoutes from "../common/KullaniciYonetimSistemRoutes";
import Home from "./Home";
import Login from "../login/Login";
import KomisyonPortalDashboard from "../dashboards/KomisyonPortalDashboard";
import SantralPortalDashboard from "../dashboards/SantralPortalDashboard";
import KullaniciYonetimSistemDashboard from "../dashboards/KullaniciYonetimSistemDashboard";
import "../../styles/App.css";

function App() {
  return (
    <MDBContainer fluid className="p-0 m-0">
      <MDBContainer fluid>
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
