import { MDBContainer } from "mdb-react-ui-kit";
import { Switch, Route } from "react-router-dom"; // useLocation
import NotFound from "../common/NotFound";
// import Navigation from "../navi/Navigation";
// import Footer from "../footer/Footer";
import ProtectedRoutes from "../common/ProtectedRoutes";
import Dashboard from "../home/Dashboard";
import Login from "../login/Login";

function App() {
  // const location = useLocation();
  // const validPaths = ["/"]; // navigation ve footer olacak  yolları tanımlayalım
  // const isPathValid = validPaths.includes(location.pathname);

  return (
    <MDBContainer fluid className="p-0 m-0">
      {/* {isPathValid && <Navigation />} */}
      <MDBContainer fluid>
        <Switch>
          <ProtectedRoutes path="/" exact component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      </MDBContainer>
      {/* {isPathValid && <Footer />} */}
    </MDBContainer>
  );
}

export default App;
