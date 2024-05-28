import { MDBContainer } from "mdb-react-ui-kit";
import { Switch, Route, useLocation } from "react-router-dom";
import NotFound from "../common/NotFound";
import Navigation from "../navi/Navigation";
import Footer from "../footer/Footer";
import ProtectedRoutes from "../common/ProtectedRoutes";
import Home from "../home/Home";
import Login from "../login/Login";

function App() {
  const location = useLocation();

  const validPaths = ["/"]; // navigation ve footer olacak  yolları tanımlayalım
  const isPathValid = validPaths.includes(location.pathname);


  return (
    <MDBContainer fluid>
      {isPathValid && <Navigation />}
      <Switch>
        <ProtectedRoutes path="/" exact component={Home} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
      {isPathValid && <Footer />}
    </MDBContainer>
  );
}

export default App;
