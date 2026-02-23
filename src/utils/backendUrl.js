export const getBackendBaseUrl = () => {
  const raw =
    process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE_URL;

  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/+$/, "");
  }

  // Boş string => relative URL (aynı origin) kullanılır.
  return "";
};
