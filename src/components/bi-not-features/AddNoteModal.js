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

export default function AddNoteModal({
  isOpen,
  toggle,
  selectedUnit,
  defaultBirimId,
  onSave,
  saving,
}) {
  const initialState = useMemo(
    () => ({
      title: "",
      content: "",
      fileNumber: "",
      priority: "Normal",
      reminderEnabled: false,
      reminderDate: "",
      alertTarget: "ben",
    }),
    [],
  );

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      setForm(initialState);
    }
  }, [isOpen, initialState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isPersonal = selectedUnit?.key === "personal";
    const birimID = isPersonal ? defaultBirimId : selectedUnit?.id;

    onSave({
      title: form.title,
      content: form.content,
      fileNumber: form.fileNumber,
      priority: form.priority,
      isPrivate: isPersonal,
      birimID,
      hasReminder: form.reminderEnabled,
      reminderDate: form.reminderEnabled ? form.reminderDate : null,
      reminderTarget: form.reminderEnabled
        ? form.alertTarget === "birim"
          ? "UNIT"
          : "SELF"
        : null,
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={!saving && toggle} centered size="lg">
      <ModalHeader
        toggle={!saving && toggle}
        className="bg-light"
      >
        <i className="fas fa-sticky-note me-2"></i>
        Yeni Not Ekle
      </ModalHeader>
      <ModalBody>
        <Alert color="info" className="mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <span>
            Not eklenecek alan: <strong>{selectedUnit?.label || "-"}</strong>
          </span>
        </Alert>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={12}>
              <FormGroup>
                <Label className="fw-bold" for="title">
                  Başlık*
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Kısa başlık"
                />
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label className="fw-bold" for="content">
                  Not İçeriği*
                </Label>
                <Input
                  id="content"
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
                <Label className="fw-bold" for="fileNumber">
                  Dosya No
                </Label>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <i className="fas fa-folder-open"></i>
                  </InputGroupText>
                  <Input
                    id="fileNumber"
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
                <Label className="fw-bold" for="priority">
                  Öncelik
                </Label>
                <Input
                  id="priority"
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
                  id="reminderEnabled"
                  name="reminderEnabled"
                  checked={form.reminderEnabled}
                  onChange={handleChange}
                />
                <Label check for="reminderEnabled" className="fw-bold">
                  Anımsatıcı Kur
                </Label>
              </FormGroup>
            </Col>

            {form.reminderEnabled && (
              <>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold" for="reminderDate">
                      Anımsatıcı Tarihi*
                    </Label>
                    <Input
                      id="reminderDate"
                      name="reminderDate"
                      type="date"
                      value={form.reminderDate}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold" for="alertTarget">
                      Kime Uyarı Gitsin*
                    </Label>
                    <Input
                      id="alertTarget"
                      name="alertTarget"
                      type="select"
                      value={form.alertTarget}
                      onChange={handleChange}
                      required
                    >
                      <option value="ben">Ben</option>
                      <option value="birim">Birim</option>
                    </Input>
                  </FormGroup>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" /> Kaydediliyor...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i> Kaydet
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
