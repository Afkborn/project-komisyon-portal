import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { renderDate_GGAAYYYY } from "../actions/TimeActions";

const getPriorityBadge = (priority) => {
  if (priority === "Acil") return { color: "danger", label: "Acil" };
  if (priority === "Düşük") return { color: "info", label: "Düşük" };
  if (priority === "Yüksek") return { color: "secondary", label: "Yüksek" };
  return { color: "secondary", label: priority || "Normal" };
};

const formatReminderDateWithDayTime = (reminderDate) => {
  if (!reminderDate) return "";

  const dateValue = new Date(reminderDate);
  const dayName = dateValue.toLocaleDateString("tr-TR", {
    weekday: "long",
  });
  const timeValue = dateValue.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${renderDate_GGAAYYYY(dateValue)} ${dayName} ${timeValue}`;
};

export default function NoteCard({ note, onComplete, onDelete, onEdit }) {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const priority = getPriorityBadge(note.priority);
  const isCompleted = Boolean(note.completed || note.isCompleted || note.done);
  const noteNotifications = useMemo(
    () => (Array.isArray(note.notifications) ? note.notifications : []),
    [note.notifications],
  );

  const recipients = useMemo(
    () =>
      noteNotifications
        .flatMap((notification) => notification.recipients || [])
        .filter((recipient) => recipient?.user),
    [noteNotifications],
  );

  const readCount = recipients.filter((recipient) => recipient.isRead).length;

  const handleCompleteClick = () => {
    if (!window.confirm("Bu notu tamamlandı olarak işaretlemek istiyor musunuz?")) {
      return;
    }

    onComplete(note);
  };

  return (
    <Card
      className={`shadow-sm border-0 mb-3 ${isCompleted ? "opacity-75" : ""}`}
    >
      <CardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center flex-wrap gap-2">
              <Badge color={priority.color} pill>
                {priority.label}
              </Badge>

              {note.fileNumber && (
                <Badge color="light" className="border text-dark" pill>
                  <i className="fas fa-folder-open me-1"></i>
                  {note.fileNumber}
                </Badge>
              )}

              {note.reminderDate && (
                <Badge color="warning" pill>
                  <i className="fas fa-bell me-1"></i>
                  {formatReminderDateWithDayTime(note.reminderDate)}
                </Badge>
              )}

              {noteNotifications.length > 0 && (
                <Badge color="primary" pill>
                  <i className="fas fa-bell me-1"></i>
                  Anımsatıcı Bildirimi
                </Badge>
              )}
            </div>
          </div>

          <div className="d-flex gap-2">
            {noteNotifications.length > 0 && (
              <Button
                color="primary"
                size="sm"
                outline
                onClick={() => setIsNotificationModalOpen(true)}
              >
                <i className="fas fa-eye me-1"></i>
                Bildirim Durumu
              </Button>
            )}
            {!isCompleted && (
              <Button
                color="info"
                size="sm"
                outline
                onClick={() => onEdit(note)}
              >
                <i className="fas fa-edit me-1"></i>
                Düzenle
              </Button>
            )}
            <Button
              color={isCompleted ? "secondary" : "success"}
              size="sm"
              onClick={handleCompleteClick}
            >
              <i className="fas fa-check me-1"></i>
              {isCompleted ? "Tamamlandı" : "Tamamla"}
            </Button>
            <Button
              color="danger"
              size="sm"
              outline
              onClick={() => onDelete(note)}
            >
              <i className="fas fa-trash me-1"></i>
              Sil
            </Button>
          </div>
        </div>

        <div className="mt-3">
          {note.creator && (
            <div className="text-muted small mb-2">
              <i className="fas fa-user me-1"></i>
              {note.creator.name} {note.creator.surname} - {note.creator.person?.sicil}
            </div>
          )}
          {note.title && (
            <div className={`fw-bold ${isCompleted ? "text-decoration-line-through" : ""}`}>
              {note.title}
            </div>
          )}
          <div className={isCompleted ? "text-decoration-line-through" : ""}>
            {note.content || "-"}
          </div>
        </div>
      </CardBody>

      <Modal
        isOpen={isNotificationModalOpen}
        toggle={() => setIsNotificationModalOpen(false)}
      >
        <ModalHeader toggle={() => setIsNotificationModalOpen(false)}>
          Bildirim Durumu
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Badge color="secondary" className="me-2">
              Toplam: {recipients.length}
            </Badge>
            <Badge color="success" className="me-2">
              Okundu: {readCount}
            </Badge>
            <Badge color="warning">Okunmadı: {recipients.length - readCount}</Badge>
          </div>

          {recipients.length === 0 ? (
            <div className="text-muted">Bu not için bildirim alıcısı bulunamadı.</div>
          ) : (
            recipients.map((recipient) => {
              const user = recipient.user;

              return (
                <div
                  key={recipient._id || user._id}
                  className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                >
                  <div>
                    <div className="fw-bold">
                      {user.name} {user.surname} ({user.username})
                    </div>
                    {recipient.isRead && recipient.readAt && (
                      <div className="small text-muted">
                        Okunma Zamanı: {new Date(recipient.readAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>
                  <Badge color={recipient.isRead ? "success" : "warning"}>
                    {recipient.isRead ? "Okundu" : "Okunmadı"}
                  </Badge>
                </div>
              );
            })
          )}
        </ModalBody>
      </Modal>
    </Card>
  );
}
