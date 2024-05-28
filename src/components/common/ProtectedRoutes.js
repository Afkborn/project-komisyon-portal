import React from "react";
import { Route, Redirect } from "react-router-dom";

import Cookies from "universal-cookie";

function ProtectedRoutes({ component: Component, ...rest }) {
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");
  return (
    <Route
      {...rest}
      render={(props) => {
        if (token) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
      }}
    />
  );
}

export default ProtectedRoutes;
