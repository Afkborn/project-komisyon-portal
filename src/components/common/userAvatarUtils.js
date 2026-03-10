export const getUserProfilePictureUrl = (user) => {
  const dbPath =
    user?.profilePicture ||
    user?.profilePictureUrl ||
    user?.photoUrl ||
    user?.avatarUrl ||
    user?.imageUrl ||
    "";

  if (!dbPath) return "";

  if (
    dbPath.startsWith("http://") ||
    dbPath.startsWith("https://") ||
    dbPath.startsWith("data:") ||
    dbPath.startsWith("blob:")
  ) {
    return dbPath;
  }

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  return `${backendUrl}${dbPath}`;
};

export const getUserInitials = (user) => {
  const firstNameInitial = user?.name?.charAt(0) || user?.ad?.charAt(0) || "";
  const lastNameInitial =
    user?.surname?.charAt(0) || user?.soyad?.charAt(0) || "";

  return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
};
