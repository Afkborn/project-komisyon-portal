import React from "react";
import { Route, Redirect } from "react-router-dom";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

function KomisyonRoutes({ component: Component, ...rest }) {
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  let decodedToken;
  if (token) {
    try {
      decodedToken = jwtDecode(token); // Decode the token
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (token && decodedToken) {
          // Check if the role is "komisyonkatibi"
          if (
            decodedToken.role === "komisyonkatibi" ||
            decodedToken.role === "admin"
          ) {
            return <Component {...props} />;
          } else {
            // eğer rol komisyonkatibi veya admin değilse
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

export default KomisyonRoutes;
