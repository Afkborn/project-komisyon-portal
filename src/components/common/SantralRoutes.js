import React from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

function SantralRoutes({ component: Component, ...rest }) {
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  let decodedToken;
  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (token && decodedToken) {
          if (
            decodedToken.role === "santralmemuru" ||
            decodedToken.role === "admin"
          ) {
            return <Component {...props} />;
          } else {
            return (
              <Redirect
                to={{
                  pathname: "/unauthorized",
                  state: {
                    from: props.location,
                  },
                }}
              />
            );
          }
        } else {
          // token yoksa
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

export default SantralRoutes;
