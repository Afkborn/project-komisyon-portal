import axios from "axios";
import { getBackendBaseUrl } from "./backendUrl";

const axiosInstance = axios.create({
  baseURL: getBackendBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export const configureAxios = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export default axiosInstance;
