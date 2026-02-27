import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Container,
  Row,
  Spinner,
} from "reactstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import alertify from "alertifyjs";
import { io } from "socket.io-client";

import AYSNavbar from "../root/AYSNavbar";
import { GET_USER_DETAILS } from "../constants/AxiosConfiguration";
import { getBackendBaseUrl } from "../../utils/backendUrl";
import ChatList from "../bi-chat-features/ChatList";
import ChatWindow from "../bi-chat-features/ChatWindow";
import CreateGroupModal from "../bi-chat-features/CreateGroupModal";
import CreateDirectMessageModal from "../bi-chat-features/CreateDirectMessageModal";

const SOCKET_URL =
  process.env.REACT_APP_CHAT_SOCKET_URL ||
  getBackendBaseUrl() ||
  "http://localhost:3434";

const getRoomId = (room) =>
  room?._id || room?.id || room?.roomID || room?.roomId || room?.room;

const getMessageRoomId = (message) =>
  message?.roomId || message?.roomID || message?.room || message?.chatRoomId;

const getDisplayNameFromRoom = (room, currentUserId) => {
  const participants = Array.isArray(room?.participants) ? room.participants : [];
  const roomType = (room?.type || "").toUpperCase();

  if (roomType === "GROUP") {
    return room?.name || "Grup Sohbeti";
  }

  const otherUser = participants.find(
    (participant) => String(participant?._id || participant?.id) !== String(currentUserId)
  );

  if (!otherUser) {
    return room?.name || "Direkt Sohbet";
  }

  const fullName = `${otherUser?.name || ""} ${otherUser?.surname || ""}`.trim();
  return fullName || otherUser?.username || "Direkt Sohbet";
};

export default function BiChatDashboard() {
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [users, setUsers] = useState([]);
  const [creatingDirect, setCreatingDirect] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const socketRef = useRef(null);

  const activeRoom = useMemo(
    () => rooms.find((room) => getRoomId(room) === activeRoomId) || null,
    [rooms, activeRoomId]
  );

  const typingText = "";

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "/api/users",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch {
      setUsers([]);
    }
  }, [token]);

  const fetchRooms = useCallback(async () => {
    const res = await axios({
      method: "GET",
      url: "/api/chat/my-rooms",
      headers: { Authorization: `Bearer ${token}` },
    });

    const roomList = Array.isArray(res.data?.rooms) ? res.data.rooms : [];
    const mappedRooms = roomList.map((room) => ({
      ...room,
      displayName: getDisplayNameFromRoom(room, currentUser?._id),
      lastMessage: room?.lastMessage || room?.lastMessageText || "Henüz mesaj yok",
      unreadCount: Number(room?.unreadCount || 0),
    }));

    setRooms(mappedRooms);

    if (!activeRoomId && mappedRooms.length > 0) {
      setActiveRoomId(getRoomId(mappedRooms[0]));
      return;
    }

    const stillExists = mappedRooms.some((room) => getRoomId(room) === activeRoomId);
    if (!stillExists) {
      setActiveRoomId(mappedRooms.length > 0 ? getRoomId(mappedRooms[0]) : null);
    }
  }, [token, activeRoomId, currentUser?._id]);

  const fetchMessages = useCallback(
    async (roomId) => {
      if (!roomId) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      try {
        const res = await axios({
          method: "GET",
          url: `/api/chat/messages/${roomId}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = Array.isArray(res.data?.messages) ? res.data.messages : [];
        setMessages(list);
      } catch (error) {
        console.error(error);
        alertify.error("Mesaj geçmişi getirilemedi");
      } finally {
        setLoadingMessages(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) {
      alertify.error("Oturum bulunamadı!");
      window.location.href = "/login";
      return;
    }

    const initialize = async () => {
      setLoading(true);
      try {
        const [userRes] = await Promise.all([
          axios(GET_USER_DETAILS(token)),
          fetchRooms(),
          fetchUsers(),
        ]);

        setCurrentUser(userRes.data?.user || null);
      } catch (error) {
        console.error(error);
        alertify.error("BiChat verileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token, fetchRooms, fetchUsers]);

  useEffect(() => {
    fetchMessages(activeRoomId);

    if (activeRoomId) {
      setRooms((prev) =>
        prev.map((room) =>
          getRoomId(room) === activeRoomId
            ? { ...room, unreadCount: 0 }
            : room
        )
      );
    }
  }, [activeRoomId, fetchMessages]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect_error", () => {
      alertify.warning("Socket bağlantısı kurulamadı");
    });

    socket.on("receive_message", (incomingMessage) => {
      const message = incomingMessage?.message || incomingMessage;
      const incomingRoomId = getMessageRoomId(message);

      if (incomingRoomId && incomingRoomId === activeRoomId) {
        setMessages((prev) => [...prev, message]);
        return;
      }

      setRooms((prev) =>
        prev.map((room) => {
          const roomId = getRoomId(room);
          if (roomId !== incomingRoomId) return room;

          const unread = Number(room.unreadCount || 0) + 1;
          return {
            ...room,
            unreadCount: unread,
            lastMessage:
              message?.content ||
              message?.text ||
              room.lastMessage,
          };
        })
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, activeRoomId]);

  const handleSendMessage = async ({ content, file }) => {
    if (!socketRef.current || !activeRoomId) return;

    const normalizedContent =
      (content || "").trim() || (file ? `[Ek Dosya] ${file.name}` : "");

    if (!normalizedContent) {
      return;
    }

    const payload = {
      roomID: activeRoomId,
      content: normalizedContent,
    };

    socketRef.current.emit("send_message", payload);

    setRooms((prev) =>
      prev.map((room) =>
        getRoomId(room) === activeRoomId
          ? {
              ...room,
              lastMessage: normalizedContent,
            }
          : room
      )
    );
  };

  const handleTyping = () => {};

  const handleCreateDirectRoom = async (userID) => {
    if (!userID) {
      alertify.warning("Lütfen bir kullanıcı seçiniz");
      return;
    }

    setCreatingDirect(true);
    try {
      const res = await axios({
        method: "POST",
        url: "/api/chat/direct-room",
        headers: { Authorization: `Bearer ${token}` },
        data: { userID },
      });

      const createdRoom = res.data?.room || null;
      await fetchRooms();

      if (createdRoom) {
        setActiveRoomId(getRoomId(createdRoom));
      }

      setIsDirectModalOpen(false);
      alertify.success("Sohbet odası açıldı");
    } catch (error) {
      console.error(error);
      alertify.error(error.response?.data?.message || "Direkt sohbet açılamadı");
    } finally {
      setCreatingDirect(false);
    }
  };

  const handleCreateGroup = async ({ groupName, userIds }) => {
    if (!groupName || userIds.length === 0) {
      alertify.warning("Grup adı ve en az bir kullanıcı seçiniz");
      return;
    }

    setCreatingGroup(true);
    try {
      await axios({
        method: "POST",
        url: "/api/chat/group-room",
        headers: { Authorization: `Bearer ${token}` },
        data: {
          name: groupName,
          participantIDs: userIds,
        },
      });

      setIsGroupModalOpen(false);
      alertify.success("Grup oluşturuldu");
      await fetchRooms();
    } catch (error) {
      console.error(error);
      alertify.error(error.response?.data?.message || "Grup oluşturulamadı");
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="bichat-dashboard bg-light min-vh-100">
      <AYSNavbar />

      <Container fluid className="p-4">
        <Row className="mb-3 align-items-center">
          <Col md={8}>
            <h3 className="fw-bold mb-1 text-primary">
              <i className="fas fa-comments me-2"></i>
              BiChat
            </h3>
            <p className="text-muted mb-0">
              Direkt ve grup sohbetlerinizi gerçek zamanlı yönetin.
            </p>
          </Col>
          <Col md={4} className="d-flex justify-content-md-end mt-3 mt-md-0">
            <Button color="secondary" outline onClick={fetchRooms}>
              <i className="fas fa-sync-alt me-2"></i>
              Oda Listesini Yenile
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center p-5">
            <Spinner color="primary" />
            <p className="text-muted mt-3">BiChat yükleniyor...</p>
          </div>
        ) : (
          <Row className="g-3">
            <Col md={4}>
              <ChatList
                rooms={rooms}
                activeRoomId={activeRoomId}
                onSelectRoom={setActiveRoomId}
                onOpenGroupModal={() => setIsGroupModalOpen(true)}
                onNewMessage={() => setIsDirectModalOpen(true)}
              />
            </Col>

            <Col md={8}>
              {!activeRoom ? (
                <Alert color="info" className="shadow-sm border-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Lütfen soldan bir sohbet odası seçin.
                </Alert>
              ) : (
                <>
                  <ChatWindow
                    room={activeRoom}
                    messages={messages}
                    loading={loadingMessages}
                    currentUser={currentUser}
                    typingText={typingText}
                    onTyping={handleTyping}
                    onSend={handleSendMessage}
                  />
                  {typingText && (
                    <div className="mt-2 text-muted small">
                      <Badge color="light" className="border text-secondary">
                        {typingText}
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </Col>
          </Row>
        )}
      </Container>

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        toggle={() => setIsGroupModalOpen((prev) => !prev)}
        users={users}
        creating={creatingGroup}
        onCreate={handleCreateGroup}
      />

      <CreateDirectMessageModal
        isOpen={isDirectModalOpen}
        toggle={() => setIsDirectModalOpen((prev) => !prev)}
        users={users.filter((user) => String(user?._id) !== String(currentUser?._id))}
        creating={creatingDirect}
        onCreate={handleCreateDirectRoom}
      />
    </div>
  );
}
