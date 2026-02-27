import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from "reactstrap";

const formatDateTimeForInput = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

export default function EditNoteModal({
  isOpen,
  toggle,
  note,
  onSave,
  saving,
}) {
  const initialState = useMemo(
    () => ({
      title: note?.title || "",
      content: note?.content || "",
      fileNumber: note?.fileNumber || "",
      priority: note?.priority || "Normal",
      reminderEnabled: Boolean(note?.hasReminder),
      reminderDate: note?.reminderDate ? formatDateTimeForInput(note.reminderDate) : "",
      alertTarget: note?.reminderTarget === "UNIT" ? "birim" : "ben",
    }),
    [note],
  );

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (isOpen && note) {
      setForm({
        title: note.title || "",
        content: note.content || "",
        fileNumber: note.fileNumber || "",
        priority: note.priority || "Normal",
        reminderEnabled: Boolean(note.hasReminder),
        reminderDate: note.reminderDate ? formatDateTimeForInput(note.reminderDate) : "",
        alertTarget: note.reminderTarget === "UNIT" ? "birim" : "ben",
      });
    }
  }, [isOpen, note]);

  const isPersonalNote = Boolean(note?.isPrivate);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.reminderEnabled && !form.reminderDate) {
      return;
    }

    onSave({
      title: form.title,
      content: form.content,
      fileNumber: form.fileNumber,
      priority: form.priority,
      hasReminder: form.reminderEnabled,
      reminderDate: form.reminderEnabled
        ? new Date(form.reminderDate).toISOString()
        : null,
      reminderTarget: form.reminderEnabled
        ? form.alertTarget === "birim"
          ? "UNIT"
          : "SELF"
        : null,
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={!saving && toggle} centered size="lg">
      <ModalHeader toggle={!saving && toggle} className="bg-info text-white">
        <i className="fas fa-edit me-2"></i>
        Not Güncelle
      </ModalHeader>
      <ModalBody>
        <Alert color="info" className="mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <span>
            Not başlığı, içeriği, dosya numarası ve önceliğini
            güncelleyebilirsiniz.
          </span>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={12}>
              <FormGroup>
                <Label className="fw-bold" for="edit-title">
                  Başlık*
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Başlık"
                />
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label className="fw-bold" for="edit-content">
                  Not İçeriği*
                </Label>
                <Input
                  id="edit-content"
                  name="content"
                  type="textarea"
                  rows={4}
                  value={form.content}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label className="fw-bold" for="edit-fileNumber">
                  Dosya No
                </Label>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <i className="fas fa-folder-open"></i>
                  </InputGroupText>
                  <Input
                    id="edit-fileNumber"
                    name="fileNumber"
                    value={form.fileNumber}
                    onChange={handleChange}
                    placeholder="Örn: 2026/123"
                  />
                </InputGroup>
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label className="fw-bold" for="edit-priority">
                  Öncelik
                </Label>
                <Input
                  id="edit-priority"
                  name="priority"
                  type="select"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="Acil">Acil</option>
                  <option value="Yüksek">Yüksek</option>
                  <option value="Normal">Normal</option>
                  <option value="Düşük">Düşük</option>
                </Input>
                <div className="mt-2">
                  {form.priority === "Acil" && (
                    <Badge color="danger" pill>
                      Acil notlar kırmızı etiketle gösterilir
                    </Badge>
                  )}
                  {form.priority === "Düşük" && (
                    <Badge color="info" pill>
                      Düşük öncelikler mavi etiketle gösterilir
                    </Badge>
                  )}
                </div>
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup check>
                <Input
                  type="checkbox"
                  id="edit-reminderEnabled"
                  name="reminderEnabled"
                  checked={form.reminderEnabled}
                  onChange={handleChange}
                />
                <Label check for="edit-reminderEnabled" className="fw-bold">
                  Anımsatıcı Kur
                </Label>
              </FormGroup>
            </Col>

            {form.reminderEnabled && (
              <>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold" for="edit-reminderDate">
                      Anımsatıcı Tarihi ve Saati*
                    </Label>
                    <InputGroup>
                      <InputGroupText className="bg-light">
                        <i className="fas fa-clock"></i>
                      </InputGroupText>
                      <Input
                        id="edit-reminderDate"
                        name="reminderDate"
                        type="datetime-local"
                        value={form.reminderDate}
                        onChange={handleChange}
                        required
                      />
                    </InputGroup>
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold" for="edit-alertTarget">
                      Kime Uyarı Gitsin*
                    </Label>
                    <Input
                      id="edit-alertTarget"
                      name="alertTarget"
                      type="select"
                      value={form.alertTarget}
                      onChange={handleChange}
                      disabled={isPersonalNote}
                      required
                    >
                      <option value="ben">Ben</option>
                      {!isPersonalNote && (
                        <option value="birim">Birim</option>
                      )}
                    </Input>
                    {isPersonalNote && (
                      <small className="text-muted mt-1 d-block">
                        <i className="fas fa-info-circle me-1"></i>
                        Şahsi notlar için uyarı sadece size gider
                      </small>
                    )}
                  </FormGroup>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="info" onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" /> Güncelleniyor...
            </>
          ) : (
            <>
              <i className="fas fa-check me-2"></i> Güncelle
            </>
          )}
        </Button>
        <Button color="secondary" onClick={toggle} disabled={saving}>
          <i className="fas fa-times me-2"></i> İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
