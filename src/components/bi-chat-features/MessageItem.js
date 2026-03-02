import React, { useState } from "react";
import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

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

const messageId = (message) =>
  message?._id || message?.id || message?.messageId || message?.messageID;

export default function MessageItem({
  message,
  currentUser,
  onDeleteForMe,
  onDeleteForEveryone,
}) {
  const [busyAction, setBusyAction] = useState(null);
  const isMine = String(senderId(message)) === String(currentUserId(currentUser));
  const createdAt = message?.createdAt || message?.date || new Date().toISOString();
  const attachment = message?.attachment || null;
  const deletedForAll = Boolean(message?.isDeletedForAll);
  const currentMessageId = messageId(message);
  const bubbleClass = isMine ? "bg-primary text-white" : "bg-white text-dark border";
  const attachmentClass = isMine ? "text-light" : "text-primary";

  const handleDeleteForMeClick = async () => {
    if (!currentMessageId || !onDeleteForMe || busyAction) return;
    setBusyAction("me");
    try {
      await onDeleteForMe(currentMessageId);
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteForEveryoneClick = async () => {
    if (!currentMessageId || !onDeleteForEveryone || busyAction) return;
    setBusyAction("everyone");
    try {
      await onDeleteForEveryone(currentMessageId);
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}>
      <div className={`d-flex align-items-start gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
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

          {deletedForAll ? (
            <div className="fst-italic text-muted">
              <span className="me-1" role="img" aria-label="silindi">
                🚫
              </span>
              Bu mesaj silindi
            </div>
          ) : (
            <>
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
            </>
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

        <UncontrolledDropdown>
          <DropdownToggle color="link" className="text-muted p-1 shadow-none">
            <i className="fas fa-ellipsis-v"></i>
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem onClick={handleDeleteForMeClick} disabled={Boolean(busyAction)}>
              Benden Sil
            </DropdownItem>
            {isMine && (
              <DropdownItem
                onClick={handleDeleteForEveryoneClick}
                disabled={Boolean(busyAction)}
              >
                Herkesten Sil
              </DropdownItem>
            )}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </div>
  );
}
