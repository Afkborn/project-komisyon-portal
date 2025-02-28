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
  Badge,
  Spinner,
  Card,
  CardBody,
  InputGroup,
  InputGroupText,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

export default function PersonelCalistigiKisiGuncelleModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
}) {
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [newCalistigiKisiSicil, setNewCalistigiKisiSicil] = useState("");
  const [newCalistigiKisi, setNewCalistigiKisi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal açıldığında verileri sıfırla
  useEffect(() => {
    if (modal) {
      setNewCalistigiKisiSicil("");
      setNewCalistigiKisi(null);
      setUpdateButtonDisabled(true);
      setError("");
    }
  }, [modal]);

  const handleUpdate = () => {
    setLoading(true);
    setError("");

    const configuration = {
      method: "PUT",
      url: `/api/persons/${personel._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        calistigiKisi:
          newCalistigiKisiSicil === "0" ? null : newCalistigiKisi?._id,
      },
    };

    axios(configuration)
      .then((response) => {
        refreshPersonel();
        alertify.success("Çalıştığı kişi bilgisi başarıyla güncellendi");
        setLoading(false);
        toggle();
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message ||
          "Çalıştığı kişi bilgisi güncellenemedi";
        alertify.error(errorMsg);
        setLoading(false);
        setError(errorMsg);
      });
  };

  const handleCancel = () => {
    setNewCalistigiKisiSicil("");
    setUpdateButtonDisabled(true);
    setNewCalistigiKisi(null);
    setError("");
    toggle();
  };

  const handleGetCalistigiKisi = () => {
    // Girişi temizle
    setError("");

    // Sicil numarası girişi kontrolü
    if (!newCalistigiKisiSicil || newCalistigiKisiSicil.trim() === "") {
      setError("Sicil numarası boş bırakılamaz");
      return;
    }

    // "0" kişiyi kaldırmak için özel durum
    if (newCalistigiKisiSicil === "0") {
      setNewCalistigiKisi(null);
      setUpdateButtonDisabled(false);
      return;
    }

    setSearchLoading(true);

    const configuration = {
      method: "GET",
      url: `/api/persons/bySicil/${newCalistigiKisiSicil}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        if (!response.data.person) {
          setError("Bu sicil numarasına ait personel bulunamadı");
          setNewCalistigiKisi(null);
          setUpdateButtonDisabled(true);
        } else {
          // Kişinin kendisini seçme kontrolü
          if (response.data.person._id === personel._id) {
            setError("Kişi kendisini çalıştığı kişi olarak seçemez");
            setNewCalistigiKisi(null);
            setUpdateButtonDisabled(true);
          } else {
            setNewCalistigiKisi(response.data.person);
            setUpdateButtonDisabled(false);
            setError("");
          }
        }
        setSearchLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setError("Bu sicil numarasına ait personel bulunamadı");
        setNewCalistigiKisi(null);
        setUpdateButtonDisabled(true);
        setSearchLoading(false);
      });
  };

  // Enter tuşuna basılınca arama işlemini gerçekleştir
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleGetCalistigiKisi();
    }
  };

  return (
    <Modal isOpen={modal} toggle={!loading && toggle} centered>
      <ModalHeader toggle={!loading && toggle} className="bg-info text-white">
        <i className="fas fa-user-friends me-2"></i>
        Çalıştığı Kişi Güncelleme
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center my-4">
            <Spinner color="info" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted">Güncelleniyor, lütfen bekleyin...</p>
          </div>
        ) : personel ? (
          <Form>
            <Alert color="info" className="mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <div>
                <strong>
                  {personel.ad} {personel.soyad}
                </strong>{" "}
                adlı personelin çalıştığı kişiyi güncelleyebilirsiniz. Çalıştığı
                kişi ilişkisini kaldırmak için sicil numarası olarak{" "}
                <strong>0</strong> giriniz.
              </div>
            </Alert>

            {/* Mevcut Çalıştığı Kişi Bilgisi */}
            <Card className="border-0 mb-3">
              <CardBody className="bg-light">
                <h5 className="mb-3">Mevcut Çalıştığı Kişi</h5>
                {personel.calistigiKisi ? (
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#17a2b8",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {personel.calistigiKisi.ad.charAt(0)}
                      {personel.calistigiKisi.soyad.charAt(0)}
                    </div>
                    <div>
                      <h6 className="mb-0">
                        {personel.calistigiKisi.ad}{" "}
                        {personel.calistigiKisi.soyad}
                      </h6>
                      <div className="d-flex align-items-center">
                        <Badge color="primary" pill className="me-2">
                          {personel.calistigiKisi.title.name}
                        </Badge>
                        <small className="text-muted">
                          Sicil: {personel.calistigiKisi.sicil}
                        </small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Badge color="secondary">Çalıştığı kişi belirtilmemiş</Badge>
                )}
              </CardBody>
            </Card>

            {/* Yeni Çalıştığı Kişi Arama */}
            <h5 className="mb-3 text-info">Yeni Çalıştığı Kişi Seçimi</h5>

            <FormGroup className="mb-3">
              <Label for="newCalistigiKisiSicil" className="fw-bold">
                Sicil Numarası ile Ara
              </Label>
              <InputGroup>
                <InputGroupText>
                  <i className="fas fa-id-card"></i>
                </InputGroupText>
                <Input
                  type="text"
                  name="newCalistigiKisiSicil"
                  id="newCalistigiKisiSicil"
                  value={newCalistigiKisiSicil}
                  onChange={(e) => setNewCalistigiKisiSicil(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Sicil numarası girin veya 0 yazarak kaldırın"
                  className={error ? "is-invalid" : ""}
                />
                <Button
                  onClick={handleGetCalistigiKisi}
                  color="info"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <i className="fas fa-search"></i>
                  )}
                </Button>
              </InputGroup>
              {error && <div className="text-danger small mt-1">{error}</div>}
              <small className="text-muted">
                İpucu: Çalıştığı kişi atamasını kaldırmak için "0" yazıp arama
                yapın.
              </small>
            </FormGroup>

            {/* Yeni Seçilen Kişi Bilgileri */}
            {newCalistigiKisiSicil === "0" ? (
              <Alert color="warning" className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Çalıştığı kişi bilgisi kaldırılacak.</strong> Bu
                personel hiçbir kişiye bağlı olmayacak.
              </Alert>
            ) : (
              newCalistigiKisi && (
                <Card className="border border-success mb-0">
                  <CardBody className="bg-light">
                    <Row>
                      <Col xs="auto">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          {newCalistigiKisi.ad.charAt(0)}
                          {newCalistigiKisi.soyad.charAt(0)}
                        </div>
                      </Col>
                      <Col>
                        <h5 className="card-title mb-1">
                          {newCalistigiKisi.ad} {newCalistigiKisi.soyad}
                        </h5>
                        <div className="mb-2">
                          <Badge color="primary" pill className="me-2">
                            {newCalistigiKisi.title.name}
                          </Badge>
                          <span className="text-muted">
                            Sicil: {newCalistigiKisi.sicil}
                          </span>
                        </div>
                        <div>
                          <i className="fas fa-building me-1 text-muted"></i>
                          <span>{newCalistigiKisi.birimID.name}</span>
                        </div>
                      </Col>
                      <Col xs="auto" className="align-self-center">
                        <Badge color="success" pill className="px-3 py-2">
                          SEÇİLDİ
                        </Badge>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              )
            )}
          </Form>
        ) : (
          <Alert color="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Personel bilgisi yüklenemedi.
          </Alert>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color="info"
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
