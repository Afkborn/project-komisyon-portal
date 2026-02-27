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

export default function CreateGroupModal({ isOpen, toggle, users, onCreate, creating }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
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

  const handleToggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClose = () => {
    setGroupName("");
    setSelectedUserIds([]);
    setSearch("");
    toggle();
  };

  const handleCreate = () => {
    onCreate({
      groupName: groupName.trim(),
      userIds: selectedUserIds,
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>Yeni Grup Oluştur</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>Grup Adı</Label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Örn: Nöbet Ekibi"
          />
        </FormGroup>

        <FormGroup>
          <Label>Kullanıcı Ara</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim veya kullanıcı adı"
          />
        </FormGroup>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Birden fazla kişi seçebilirsiniz.</small>
          <Badge color="secondary">Seçili: {selectedUserIds.length}</Badge>
        </div>

        <ListGroup style={{ maxHeight: "320px", overflowY: "auto" }}>
          {filteredUsers.map((user) => {
            const id = userId(user);
            const selected = selectedUserIds.includes(id);

            return (
              <ListGroupItem
                key={id}
                action
                onClick={() => handleToggleUser(id)}
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
                <Input type="checkbox" checked={selected} readOnly />
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={handleClose} disabled={creating}>
          Vazgeç
        </Button>
        <Button color="primary" onClick={handleCreate} disabled={creating}>
          {creating ? "Oluşturuluyor..." : "Grup Oluştur"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
