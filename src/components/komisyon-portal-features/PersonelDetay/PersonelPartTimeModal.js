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
  Row,
  Col,
  Badge,
  InputGroup,
  InputGroupText,
  Card,
  CardBody,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import { renderDate_GGAAYYYY } from "../../actions/TimeActions";

export default function PersonelPartTimeModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
}) {
  const [partTimeStart, setPartTimeStart] = useState("");
  const [partTimeEnd, setPartTimeEnd] = useState("");
  const [partTimeReason, setPartTimeReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Modal açıldığında mevcut değerleri yükle
  useEffect(() => {
    if (modal && personel) {
      if (personel.isPartTime) {
        setPartTimeStart(
          personel.partTimeStartDate
            ? personel.partTimeStartDate.split("T")[0]
            : "",
        );
        setPartTimeEnd(
          personel.partTimeEndDate
            ? personel.partTimeEndDate.split("T")[0]
            : "",
        );
        setPartTimeReason(personel.partTimeReason || "");
      } else {
        setPartTimeStart(new Date().toISOString().split("T")[0]);
        setPartTimeEnd("");
        setPartTimeReason("");
      }
      setErrors({});
    }
  }, [modal, personel]);

  const validateForm = () => {
    const newErrors = {};

    if (!personel.isPartTime) {
      // Yarı zamanlı yapmak yalanacaksa tarih zorunlu
      if (!partTimeStart) {
        newErrors.partTimeStart = "Başlangıç tarihi gereklidir";
      }
      if (!partTimeEnd) {
        newErrors.partTimeEnd = "Bitiş tarihi gereklidir";
      }
      if (!partTimeReason) {
        newErrors.partTimeReason = "Gerekçe gereklidir";
      }
      if (partTimeStart && partTimeEnd && partTimeStart > partTimeEnd) {
        newErrors.partTimeEnd =
          "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePartTime = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      //   const url = `${process.env.REACT_APP_BACKEND_URL}/api/personel/${personel._id}`;

      const payload = {
        isPartTime: !personel.isPartTime, // Toggle
      };

      if (!personel.isPartTime) {
        // Yarı zamanlı yapılıyorsa
        payload.partTimeStartDate = partTimeStart;
        payload.partTimeEndDate = partTimeEnd;
        payload.partTimeReason = partTimeReason;
      }

      const configuration = {
        method: "PUT",
        url: `/api/persons/${personel._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: payload,
      };

      const response = await axios(configuration);

      if (response.data.success) {
        alertify.success(
          personel.isPartTime
            ? "Yarı zamanlı çalışma durumu kaldırıldı"
            : "Yarı zamanlı çalışma durumu eklendi",
        );
        toggle();
        refreshPersonel();
      } else {
        alertify.error(response.data.message || "Güncelleme başarısız");
      }
    } catch (error) {
      console.error("Yarı zamanlı güncelleme hatası:", error);
      alertify.error(
        error.response?.data?.message || "Güncelleme sırasında hata oluştu",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={modal} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-info text-white">
        <i className="fas fa-clock me-2"></i>
        Yarı Zamanlı Çalışma Yönetimi
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="info" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3">İşlem yapılıyor, lütfen bekleyin...</p>
          </div>
        ) : (
          personel && (
            <Form>
              {personel?.isPartTime && (
                <Alert color="info" className="mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <span>
                    Personel şu anda yarı zamanlı çalışma durumundadır. Durumu
                    kaldırmak için aşağıdaki bilgileri inceleyiniz.
                  </span>
                </Alert>
              )}

              {!personel?.isPartTime && (
                <Alert color="info" className="mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <span>
                    Personeli yarı zamanlı çalışan olarak kaydetmek için
                    başlangıç tarihi, bitiş tarihi ve gerekçe bilgilerini
                    belirtiniz.
                  </span>
                </Alert>
              )}

              <Card className="mb-4">
                <CardBody className="bg-light">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <h5 className="mb-1">
                        {personel.ad} {personel.soyad}
                      </h5>
                      <p className="mb-0 text-muted">Sicil: {personel.sicil}</p>
                    </Col>
                    <Col md={6} className="text-end">
                      <h6 className="mb-1">Yarı Zamanlı Durum:</h6>
                      <Badge
                        color={personel?.isPartTime ? "warning" : "secondary"}
                        pill
                        className="px-3 py-2"
                      >
                        {personel?.isPartTime ? "Aktif" : "Pasif"}
                      </Badge>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {personel?.isPartTime ? (
                <div className="border rounded p-3 bg-light mb-4">
                  <h5 className="mb-3">
                    <i className="fas fa-eye me-2"></i>
                    Mevcut Bilgiler
                  </h5>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label className="fw-bold text-muted small text-uppercase">
                          Başlangıç Tarihi
                        </Label>
                        <Input
                          type="text"
                          value={renderDate_GGAAYYYY(
                            personel.partTimeStartDate,
                          )}
                          disabled
                          className="bg-white"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label className="fw-bold text-muted small text-uppercase">
                          Bitiş Tarihi
                        </Label>
                        <Input
                          type="text"
                          value={renderDate_GGAAYYYY(personel.partTimeEndDate)}
                          disabled
                          className="bg-white"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <FormGroup>
                        <Label className="fw-bold text-muted small text-uppercase">
                          Gerekçe
                        </Label>
                        <Input
                          type="textarea"
                          value={personel.partTimeReason || ""}
                          disabled
                          className="bg-white"
                          rows="3"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Alert color="warning" className="mt-3 mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Yarı zamanlı çalışma durumunu kaldırmak üzeresiniz.
                  </Alert>
                </div>
              ) : (
                <div className="border rounded p-3 bg-light mb-4">
                  <h5 className="mb-3">
                    <i className="fas fa-edit me-2"></i>
                    Yarı Zamanlı Çalışma Bilgileri
                  </h5>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label
                          for="partTimeStart"
                          className="fw-bold text-muted small text-uppercase"
                        >
                          Başlangıç Tarihi{" "}
                          <span className="text-danger">*</span>
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-calendar-alt"></i>
                          </InputGroupText>
                          <Input
                            type="date"
                            id="partTimeStart"
                            value={partTimeStart}
                            onChange={(e) => setPartTimeStart(e.target.value)}
                            invalid={!!errors.partTimeStart}
                          />
                        </InputGroup>
                        {errors.partTimeStart && (
                          <Alert color="danger" className="mt-2 py-1 mb-0">
                            {errors.partTimeStart}
                          </Alert>
                        )}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label
                          for="partTimeEnd"
                          className="fw-bold text-muted small text-uppercase"
                        >
                          Bitiş Tarihi <span className="text-danger">*</span>
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-calendar-check"></i>
                          </InputGroupText>
                          <Input
                            type="date"
                            id="partTimeEnd"
                            value={partTimeEnd}
                            onChange={(e) => setPartTimeEnd(e.target.value)}
                            invalid={!!errors.partTimeEnd}
                          />
                        </InputGroup>
                        {errors.partTimeEnd && (
                          <Alert color="danger" className="mt-2 py-1 mb-0">
                            {errors.partTimeEnd}
                          </Alert>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <FormGroup>
                        <Label
                          for="partTimeReason"
                          className="fw-bold text-muted small text-uppercase"
                        >
                          Gerekçe <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="textarea"
                          id="partTimeReason"
                          placeholder="Yarı zamanlı çalışmanın gerekçesini girin"
                          value={partTimeReason}
                          onChange={(e) => setPartTimeReason(e.target.value)}
                          invalid={!!errors.partTimeReason}
                          rows="3"
                        />
                        {errors.partTimeReason && (
                          <Alert color="danger" className="mt-2 py-1 mb-0">
                            {errors.partTimeReason}
                          </Alert>
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              )}
            </Form>
          )
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          color={personel?.isPartTime ? "warning" : "info"}
          onClick={handleUpdatePartTime}
          disabled={loading}
        >
          <i
            className={`fas ${
              personel?.isPartTime ? "fa-trash-alt" : "fa-save"
            } me-1`}
          ></i>
          {loading
            ? "İşlem yapılıyor..."
            : personel?.isPartTime
              ? "Kaldır"
              : "Kaydet"}
        </Button>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          <i className="fas fa-times me-1"></i> İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
