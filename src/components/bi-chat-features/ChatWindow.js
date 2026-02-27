import React, { useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  InputGroupText,
  Spinner,
} from "reactstrap";
import MessageItem from "./MessageItem";

const roomId = (room) => room?._id || room?.id || room?.roomID || room?.roomId;

const roomName = (room) => room?.name || room?.displayName || room?.title || "Sohbet";

const roomStatus = (room) => room?.status || room?.presence || "Aktif";

export default function ChatWindow({
  room,
  messages,
  loading,
  currentUser,
  typingText,
  onTyping,
  onSend,
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0)
    );
  }, [messages]);

  const clearInput = () => {
    setText("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;

    await onSend({
      roomId: roomId(room),
      content: text.trim(),
      file,
    });

    clearInput();
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-white border-0 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 text-primary">
            {roomName(room)}
          </h5>
          <small className="text-muted">{roomStatus(room)}</small>
        </div>

        {typingText && (
          <Badge color="light" className="text-secondary border">
            {typingText}
          </Badge>
        )}
      </CardHeader>

      <CardBody className="d-flex flex-column" style={{ minHeight: "68vh" }}>
        <div className="flex-grow-1 mb-3 p-2 bg-light" style={{ overflowY: "auto" }}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="text-center text-muted py-5">Henüz mesaj yok.</div>
          ) : (
            sortedMessages.map((message, index) => (
              <MessageItem key={message._id || message.id || index} message={message} currentUser={currentUser} />
            ))
          )}
        </div>

        <div className="border rounded-3 p-2 bg-white">
          {file && (
            <div className="small text-muted mb-2 d-flex justify-content-between align-items-center">
              <span>
                <i className="fas fa-paperclip me-1"></i>
                {file.name}
              </span>
              <Button
                size="sm"
                color="link"
                className="text-danger p-0"
                onClick={() => setFile(null)}
              >
                Kaldır
              </Button>
            </div>
          )}

          <InputGroup>
            <Input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onTyping(Boolean(e.target.value.trim()));
              }}
              placeholder="Mesajınızı yazın..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* <Input
              type="file"
              innerRef={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            /> */}

            <InputGroupText className="p-0 border-0 bg-transparent">
              <Button color="primary" onClick={handleSend}>
                <i className="fas fa-paper-plane me-1"></i>
                Gönder
              </Button>
            </InputGroupText>
          </InputGroup>
        </div>
      </CardBody>
    </Card>
  );
}
