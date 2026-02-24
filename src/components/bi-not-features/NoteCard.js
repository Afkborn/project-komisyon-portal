import React from "react";
import { Badge, Button, Card, CardBody } from "reactstrap";
import { renderDate_GGAAYYYY } from "../actions/TimeActions";

const getPriorityBadge = (priority) => {
  if (priority === "acil") return { color: "danger", label: "Acil" };
  if (priority === "dusuk") return { color: "info", label: "Düşük" };
  return { color: "secondary", label: "Normal" };
};

export default function NoteCard({ note, onComplete }) {
  const priority = getPriorityBadge(note.priority);
  const isCompleted = Boolean(note.completed || note.isCompleted || note.done);

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

              {note.fileNo && (
                <Badge color="light" className="border text-dark" pill>
                  <i className="fas fa-folder-open me-1"></i>
                  {note.fileNo}
                </Badge>
              )}

              {note.reminderDate && (
                <Badge color="warning" pill>
                  <i className="fas fa-bell me-1"></i>
                  {renderDate_GGAAYYYY(
                    typeof note.reminderDate === "string"
                      ? note.reminderDate.split("T")[0]
                      : note.reminderDate,
                  )}
                </Badge>
              )}
            </div>
          </div>

          <Button
            color={isCompleted ? "secondary" : "success"}
            size="sm"
            onClick={() => onComplete(note)}
          >
            <i className="fas fa-check me-1"></i>
            Tamamlandı
          </Button>
        </div>

        <div className="mt-3">
          <div className={isCompleted ? "text-decoration-line-through" : ""}>
            {note.content || "-"}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
