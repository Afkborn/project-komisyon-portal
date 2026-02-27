import React from "react";
import { Badge } from "reactstrap";

const currentUserId = (currentUser) =>
  currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.person?._id;

const senderId = (message) =>
  message?.sender?._id ||
  message?.sender?.id ||
  message?.senderId ||
  message?.userId ||
  message?.sender;

const senderName = (message) => {
  if (message?.sender?.name || message?.sender?.surname) {
    return `${message.sender.name || ""} ${message.sender.surname || ""}`.trim();
  }

  if (message?.senderName) return message.senderName;
  if (message?.username) return message.username;

  return "Kullanıcı";
};

const senderTitle = (message) =>
  message?.sender?.title?.name ||
  message?.sender?.title ||
  message?.senderTitle ||
  message?.title ||
  "";

const messageText = (message) => message?.content || message?.text || "";

export default function MessageItem({ message, currentUser }) {
  const isMine = String(senderId(message)) === String(currentUserId(currentUser));
  const createdAt = message?.createdAt || message?.date || new Date().toISOString();
  const attachment = message?.attachment || null;
  const bubbleClass = isMine ? "bg-primary text-white" : "bg-white text-dark border";
  const attachmentClass = isMine ? "text-light" : "text-primary";

  return (
    <div className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}>
      <div
        className={`shadow-sm px-3 py-2 ${bubbleClass}`}
        style={{
          maxWidth: "75%",
          borderRadius: "14px",
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="fw-semibold small">{senderName(message)}</span>
          {senderTitle(message) && (
            <Badge color="light" className="text-secondary border">
              {senderTitle(message)}
            </Badge>
          )}
        </div>

        {messageText(message) && <div style={{ whiteSpace: "pre-wrap" }}>{messageText(message)}</div>}

        {attachment && (
          <div className="mt-2 small">
            <a
              href={attachment?.url || attachment?.data}
              target="_blank"
              rel="noreferrer"
              className={attachmentClass}
            >
              <i className="fas fa-paperclip me-1"></i>
              {attachment?.name || "Ekli dosya"}
            </a>
          </div>
        )}

        <div
          className="text-end mt-1"
          style={{
            fontSize: "0.72rem",
            opacity: 0.75,
          }}
        >
          {new Date(createdAt).toLocaleString("tr-TR")}
        </div>
      </div>
    </div>
  );
}
