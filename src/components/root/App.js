import { MDBContainer } from "mdb-react-ui-kit";
import { Switch, Route } from "react-router-dom"; // useLocation
import NotFound from "../common/NotFound";
import Unauthorized from "../common/Unauthorized";

import KomisyonRoutes from "../common/KomisyonRoutes";
import SantralRoutes from "../common/SantralRoutes";

import Home from "./Home";
import Login from "../login/Login";

import KomisyonPortalDashboard from "../dashboards/KomisyonPortalDashboard";
import SantralPortalDashboard from "../dashboards/SantralPortalDashboard";

function App() {
  // const location = useLocation();
  // const validPaths = ["/"]; // navigation ve footer olacak  yolları tanımlayalım
  // const isPathValid = validPaths.includes(location.pathname);

  return (
    <MDBContainer fluid className="p-0 m-0">
      {/* {isPathValid && <Navigation />} */}
      <MDBContainer fluid>
        <Switch>
          <Route path="/" exact component={Home} />
          <KomisyonRoutes
            path="/komisyon-portal"
            exact
            component={KomisyonPortalDashboard}
          />
          <SantralRoutes
            path="/santral-portal"
            exact
            component={SantralPortalDashboard}
          />
          <Route path="/login" component={Login} />
          <Route path="/unauthorized" component={Unauthorized} />
          <Route component={NotFound} />
        </Switch>
      </MDBContainer>
      {/* {isPathValid && <Footer />} */}
    </MDBContainer>
  );
}

export default App;
