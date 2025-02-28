import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Alert,
  Spinner,
  Card,
  CardBody,
  Badge,
  Input,
  Row,
  Col,
} from "reactstrap";
import alertify from "alertifyjs";
import axios from "axios";

export default function PersonelSilModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
}) {
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  // Silme işlemini onaylamak için yazılması gereken metin
  const confirmationRequired = "SIL";
  const isConfirmed = confirmationText === confirmationRequired;

  const handleDelete = () => {
    // Onay metni kontrolü
    if (!isConfirmed) {
      alertify.error(
        `Silme işlemini onaylamak için "${confirmationRequired}" yazmalısınız.`
      );
      return;
    }

    setLoading(true);

    const configuration = {
      method: "DELETE",
      url: `/api/persons/${personel.id || personel._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        alertify.success("Personel başarıyla silindi.");
        setConfirmationText("");
        refreshPersonel(true);
        setLoading(false);
        toggle();
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message ||
          "Personel silinirken bir hata oluştu.";
        alertify.error(errorMsg);
        console.log(error);
        setLoading(false);
      });
  };

  const handleCancel = () => {
    setConfirmationText("");
    toggle();
  };

  // Modal kapandığında state'i sıfırla
  const resetState = () => {
    setConfirmationText("");
    setLoading(false);
  };

  return (
    <Modal
      isOpen={modal}
      toggle={loading ? undefined : toggle}
      centered
      onClosed={resetState}
    >
      <ModalHeader
        toggle={loading ? undefined : toggle}
        className="bg-danger text-white"
      >
        <i className="fas fa-trash-alt me-2"></i>
        Personel Silme İşlemi
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center my-4 py-4">
            <Spinner color="danger" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted">
              Personel siliniyor, lütfen bekleyin...
            </p>
          </div>
        ) : (
          <Form>
            {personel && (
              <>
                <Alert color="danger" className="mb-4">
                  <h5 className="alert-heading d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-2 fs-4"></i>
                    <strong>DİKKAT: Bu işlem geri alınamaz!</strong>
                  </h5>
                  <p className="mb-0">
                    <strong>
                      {personel.ad} {personel.soyad}
                    </strong>{" "}
                    adlı personeli sistemden tamamen silmek üzeresiniz. Silinen
                    personel bilgileri <u>kurtarılamaz</u>.
                  </p>
                </Alert>

                <Card className="mb-4 border">
                  <CardBody className="bg-light">
                    <h5 className="card-title mb-3">
                      Silinecek Personel Bilgileri
                    </h5>

                    <Row className="mb-3">
                      <Col md={6}>
                        <FormGroup>
                          <Label className="text-muted small text-uppercase">
                            Sicil Numarası
                          </Label>
                          <p className="form-control-plaintext fw-bold">
                            {personel.sicil}
                          </p>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label className="text-muted small text-uppercase">
                            Durum
                          </Label>
                          <div>
                            <Badge
                              color={personel.status ? "success" : "danger"}
                              pill
                              className="px-3 py-2"
                            >
                              {personel.status ? "Aktif" : "Pasif"}
                            </Badge>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={6}>
                        <FormGroup>
                          <Label className="text-muted small text-uppercase">
                            Ad Soyad
                          </Label>
                          <p className="form-control-plaintext fw-bold">
                            {personel.ad} {personel.soyad}
                          </p>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label className="text-muted small text-uppercase">
                            Ünvan
                          </Label>
                          <p className="form-control-plaintext fw-bold">
                            {personel.title
                              ? personel.title.name
                              : "Belirtilmemiş"}
                          </p>
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label className="text-muted small text-uppercase">
                        Çalıştığı Birim
                      </Label>
                      <p className="form-control-plaintext fw-bold">
                        {personel.birimID
                          ? personel.birimID.name
                          : "Belirtilmemiş"}
                      </p>
                    </FormGroup>
                  </CardBody>
                </Card>

                <Alert color="warning">
                  <div className="mb-3">
                    <strong>
                      <i className="fas fa-keyboard me-2"></i>
                      Silme işlemini onaylamak için aşağıdaki alana "
                      {confirmationRequired}" yazın:
                    </strong>
                  </div>
                  <Input
                    type="text"
                    className="form-control"
                    placeholder={`"${confirmationRequired}" yazınız`}
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="small mt-2 text-muted">
                    Not: Silme işlemi, sistemden personel kaydını kalıcı olarak
                    kaldırır.
                  </div>
                </Alert>
              </>
            )}
          </Form>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color="danger"
          onClick={handleDelete}
          disabled={!isConfirmed || loading}
          className="px-4"
        >
          <i className="fas fa-trash me-2"></i>
          {loading ? "Siliniyor..." : "Personeli Sil"}
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          <i className="fas fa-times me-1"></i> İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
