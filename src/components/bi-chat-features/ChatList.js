import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

const roomId = (room) =>
  room?._id || room?.id || room?.roomID || room?.roomId || room?.room;

const roomType = (room) => {
  const type = (room?.type || room?.roomType || "DIRECT").toString().toUpperCase();
  return type === "GROUP" ? "GROUP" : "DIRECT";
};

const roomName = (room) =>
  room?.name || room?.displayName || room?.title || "İsimsiz Sohbet";

const roomLastMessage = (room) =>
  room?.lastMessage || room?.lastMessageText || room?.latestMessage?.content || "Henüz mesaj yok";

export default function ChatList({
  rooms,
  activeRoomId,
  onSelectRoom,
  onOpenGroupModal,
  onNewMessage,
}) {
  const [search, setSearch] = useState("");

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rooms;

    return rooms.filter((room) => {
      const name = roomName(room).toLowerCase();
      const lastMsg = roomLastMessage(room).toLowerCase();
      return name.includes(keyword) || lastMsg.includes(keyword);
    });
  }, [rooms, search]);

  return (
    <Card className="shadow-sm border-0 h-100">
      <CardHeader className="bg-white border-0">
        <div className="d-flex gap-2 mb-3">
          <Button color="primary" size="sm" className="flex-fill" onClick={onNewMessage}>
            <i className="fas fa-pen me-2"></i>
            Yeni Mesaj
          </Button>
          <Button color="secondary" size="sm" className="flex-fill" onClick={onOpenGroupModal}>
            <i className="fas fa-users me-2"></i>
            Grup Oluştur
          </Button>
        </div>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sohbet ara..."
        />
      </CardHeader>

      <CardBody className="pt-0">
        {filteredRooms.length === 0 ? (
          <div className="text-muted text-center py-4">Sohbet bulunamadı</div>
        ) : (
          <ListGroup flush>
            {filteredRooms.map((room) => {
              const id = roomId(room);
              const isActive = id === activeRoomId;
              const unreadCount = Number(room?.unreadCount || 0);

              return (
                <ListGroupItem
                  key={id}
                  action
                  active={isActive}
                  onClick={() => onSelectRoom(id)}
                  className={`mb-2 border rounded-3 ${isActive ? "bg-primary text-white" : "bg-white text-dark"}`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold text-truncate d-flex align-items-center gap-2">
                        <span className="text-truncate">{roomName(room)}</span>
                        <Badge color={roomType(room) === "GROUP" ? "secondary" : "light"}>
                          {roomType(room)}
                        </Badge>
                      </div>
                      <small
                        className="d-block text-truncate"
                        style={{ opacity: isActive ? 0.85 : 0.7 }}
                      >
                        {roomLastMessage(room)}
                      </small>
                    </div>

                    {unreadCount > 0 && (
                      <Badge pill color="danger">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        )}
      </CardBody>
    </Card>
  );
}
