import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  FormGroup,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

const userId = (user) => user?._id || user?.id || user?.userId;

const userName = (user) => {
  if (user?.name || user?.surname) {
    return `${user.name || ""} ${user.surname || ""}`.trim();
  }

  return user?.username || "İsimsiz Kullanıcı";
};

export default function CreateDirectMessageModal({
  isOpen,
  toggle,
  users,
  creating,
  onCreate,
}) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) => {
      const fullName = userName(user).toLowerCase();
      const username = (user?.username || "").toLowerCase();
      return fullName.includes(keyword) || username.includes(keyword);
    });
  }, [users, search]);

  const handleClose = () => {
    setSelectedUserId(null);
    setSearch("");
    toggle();
  };

  const handleCreate = () => {
    if (!selectedUserId) return;
    onCreate(selectedUserId);
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>Yeni Mesaj</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>Kullanıcı Ara</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim veya kullanıcı adı"
          />
        </FormGroup>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Mesaj göndermek istediğiniz kişiyi seçin.</small>
          <Badge color="secondary">Kayıt: {filteredUsers.length}</Badge>
        </div>

        <ListGroup style={{ maxHeight: "320px", overflowY: "auto" }}>
          {filteredUsers.map((user) => {
            const id = userId(user);
            const selected = selectedUserId === id;

            return (
              <ListGroupItem
                key={id}
                action
                onClick={() => setSelectedUserId(id)}
                className="d-flex justify-content-between align-items-center"
                active={selected}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div className="fw-semibold">{userName(user)}</div>
                  <small className={selected ? "text-light" : "text-muted"}>
                    {user?.username || "-"}
                  </small>
                </div>
                <Input type="radio" checked={selected} readOnly />
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={handleClose} disabled={creating}>
          Vazgeç
        </Button>
        <Button color="primary" onClick={handleCreate} disabled={!selectedUserId || creating}>
          {creating ? "Açılıyor..." : "Sohbeti Aç"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
