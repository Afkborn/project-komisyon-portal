import React from "react";
import { getUserInitials, getUserProfilePictureUrl } from "./userAvatarUtils";

export default function UserAvatar({
  user,
  size = 36,
  className = "",
  style = {},
  alt = "Profil",
}) {
  const profilePictureUrl = getUserProfilePictureUrl(user);
  const initials = getUserInitials(user);

  return (
    <div
      className={`bg-danger text-white rounded-circle d-flex justify-content-center align-items-center overflow-hidden ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(Math.floor(size * 0.35), 12)}px`,
        fontWeight: "bold",
        ...style,
      }}
    >
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : initials ? (
        initials
      ) : (
        <i className="fas fa-user"></i>
      )}
    </div>
  );
}
