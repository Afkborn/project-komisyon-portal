import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

import App from "./components/root/App";
import "../src/styles/index.css";

import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "alertifyjs/build/css/alertify.css";
import "alertifyjs/build/css/themes/default.css";
import { setupAxiosInterceptors } from "./components/utils/AuthCheck";
import { getBackendBaseUrl } from "./utils/backendUrl";

// Production build'de CRA proxy çalışmaz; API istekleri için backend baseURL'i ayarla.
axios.defaults.baseURL = getBackendBaseUrl();

// API isteklerindeki token geçerlilik kontrollerini kurulumu
setupAxiosInterceptors();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
