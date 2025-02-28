import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
  Alert,
  Spinner,
  Badge,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

export default function PersonelUnvanGuncelleModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
  unvanlar,
}) {
  const [newTitle, setNewTitle] = useState("");
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedUnvan, setSelectedUnvan] = useState(null);

  useEffect(() => {
    if (modal && personel) {
      setUpdateButtonDisabled(true);
      setNewTitle("");
      setSelectedUnvan(null);
    }
  }, [modal, personel]);

  function handleTypeChange(event) {
    if (event.target.value === "Seçiniz") {
      setUpdateButtonDisabled(true);
      setSelectedUnvan(null);
      return;
    }

    const unvanId = event.target.value;
    setNewTitle(unvanId);
    setUpdateButtonDisabled(false);

    // Seçilen ünvanı bul
    const selected = unvanlar.find((unvan) => unvan._id === unvanId);
    setSelectedUnvan(selected);
  }

  const handleCancel = () => {
    setNewTitle("");
    setSelectedUnvan(null);
    toggle();
  };

  const handleUpdate = () => {
    setLoading(true);

    const configuration = {
      method: "PUT",
      url: `/api/persons/${personel._id}`,
      data: {
        title: newTitle,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        alertify.success("Personel ünvanı başarıyla güncellendi");
        setNewTitle("");
        setSelectedUnvan(null);
        refreshPersonel();
        setLoading(false);
        toggle();
      })
      .catch((error) => {
        console.log(error);
        let errorMessage =
          error.response?.data?.message ||
          "Personel ünvanı güncellenirken bir hata oluştu";
        alertify.error(errorMessage);
        setLoading(false);
      });
  };

  return (
    <Modal isOpen={modal} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="bg-warning text-white">
        <i className="fas fa-user-tag me-2"></i>
        Ünvan Güncelle
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center my-4">
            <Spinner color="warning" />
            <p className="mt-2">İşlem yapılıyor...</p>
          </div>
        ) : (
          <Form>
            {personel && (
              <>
                <Alert color="info" className="d-flex align-items-center">
                  <i className="fas fa-info-circle me-2 fs-5"></i>
                  <div>
                    <strong>
                      {personel.ad} {personel.soyad}
                    </strong>{" "}
                    adlı personelin ünvanını değiştirmek üzeresiniz.
                  </div>
                </Alert>

                <FormGroup className="mb-4">
                  <Label className="form-label fw-bold text-muted small text-uppercase">
                    Mevcut Ünvan
                  </Label>
                  <div className="p-2 border rounded bg-light d-flex align-items-center">
                    <Badge
                      color="primary"
                      pill
                      className="me-2 py-2 px-3"
                      style={{ fontSize: "0.9em" }}
                    >
                      {personel.title?.name || "Belirtilmemiş"}
                    </Badge>
                    <span className="text-muted small">
                      ({personel.title?.kind || "tanımsız"})
                    </span>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label for="unvanlar" className="form-label fw-bold">
                    Yeni Ünvan Seçin
                  </Label>
                  <Input
                    id="unvanlar"
                    onChange={handleTypeChange}
                    name="select"
                    type="select"
                    className="form-select"
                  >
                    <option key="-1">Seçiniz</option>
                    {unvanlar.map((unvan) => (
                      <option key={unvan._id} value={unvan._id}>
                        {unvan.name}{" "}
                        {unvan.oncelikSirasi &&
                          `(Öncelik: ${unvan.oncelikSirasi})`}
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                {selectedUnvan && (
                  <Alert color="light" className="border mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-1">
                          Seçilen Ünvan Detayları
                        </h6>
                        <p className="mb-0">
                          <strong>Ünvan:</strong> {selectedUnvan.name}
                        </p>
                        <p className="mb-0">
                          <strong>Tür:</strong>{" "}
                          {selectedUnvan.kind || "Belirtilmemiş"}
                        </p>
                        <p className="mb-0">
                          <strong>Öncelik:</strong>{" "}
                          {selectedUnvan.oncelikSirasi || "Belirtilmemiş"}
                        </p>
                      </div>
                      <Badge color="success" pill className="px-3 py-2">
                        Seçildi
                      </Badge>
                    </div>
                  </Alert>
                )}
              </>
            )}
          </Form>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color="warning"
          onClick={handleUpdate}
          disabled={updateButtonDisabled || loading}
        >
          <i className="fas fa-save me-1"></i> Güncelle
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          <i className="fas fa-times me-1"></i> İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
