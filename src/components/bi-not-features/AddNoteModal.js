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
import alertify from "alertifyjs";

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
      const newForm = { ...initialState };
      // Şahsi not ise alertTarget'ı "ben" yap
      if (selectedUnit?.key === "personal") {
        newForm.alertTarget = "ben";
      } else {
        // Birim notu ise alertTarget'ı "birim" yap
        newForm.alertTarget = "birim";
      }
      setForm(newForm);
    }
  }, [isOpen, initialState, selectedUnit?.key]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Anımsatıcı tarih için minimum tarih-saati hesapla (şu an + 1 dakika)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  // Şahsi not mu kontrol et
  const isPersonalNote = selectedUnit?.key === "personal";

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
                      Anımsatıcı Tarihi ve Saati*
                    </Label>
                    <InputGroup>
                      <InputGroupText className="bg-light">
                        <i className="fas fa-clock"></i>
                      </InputGroupText>
                      <Input
                        id="reminderDate"
                        name="reminderDate"
                        type="datetime-local"
                        value={form.reminderDate}
                        onChange={handleChange}
                        min={getMinDateTime()}
                        required
                      />
                    </InputGroup>
                    <small className="text-muted mt-1 d-block">
                      Gelecek bir tarih ve saat seçin
                    </small>
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
