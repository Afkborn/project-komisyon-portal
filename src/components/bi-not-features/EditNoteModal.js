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
      });
    }
  }, [isOpen, note]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      title: form.title,
      content: form.content,
      fileNumber: form.fileNumber,
      priority: form.priority,
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
