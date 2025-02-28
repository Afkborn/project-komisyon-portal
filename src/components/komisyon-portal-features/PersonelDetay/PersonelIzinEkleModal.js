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
  InputGroup,
  InputGroupText,
  Row,
  Col,
  Badge,
  Card,
  CardBody,
} from "reactstrap";
import alertify from "alertifyjs";
import axios from "axios";

export default function PersonelIzinEkleModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
}) {
  const initialIzinState = {
    reason: "",
    startDate: "",
    endDate: "",
    comment: "",
    dayCount: 0,
  };

  const [izin, setIzin] = useState(initialIzinState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // İzin tipleri için sabit tanımlar
  const izinTipleri = [
    {
      id: "YILLIK_IZIN",
      name: "Yıllık İzin",
      color: "primary",
      icon: "umbrella-beach",
    },
    {
      id: "RAPOR_IZIN",
      name: "Raporlu İzin",
      color: "danger",
      icon: "clinic-medical",
    },
    {
      id: "UCRETSIZ_IZIN",
      name: "Ücretsiz İzin",
      color: "dark",
      icon: "money-bill-wave",
    },
    {
      id: "MAZERET_IZIN",
      name: "Mazeret İzni",
      color: "warning",
      icon: "exclamation-circle",
    },
    { id: "DOGUM_IZIN", name: "Doğum İzni", color: "info", icon: "baby" },
    {
      id: "OLUM_IZIN",
      name: "Ölüm İzni",
      color: "secondary",
      icon: "sad-tear",
    },
    {
      id: "EVLENME_IZIN",
      name: "Evlenme İzni",
      color: "success",
      icon: "ring",
    },
    {
      id: "REFAKAT_IZIN",
      name: "Refakat İzni",
      color: "primary",
      icon: "hand-holding-medical",
    },
    {
      id: "DIGER_IZIN",
      name: "Diğer İzin",
      color: "light",
      icon: "ellipsis-h",
    },
  ];

  // Modal açıldığında form değerlerini sıfırla
  useEffect(() => {
    if (modal) {
      setIzin(initialIzinState);
      setErrors({});
    }
  }, [modal]);

  // İzin süresini hesapla
  useEffect(() => {
    if (izin.startDate && izin.endDate) {
      const startDate = new Date(izin.startDate);
      const endDate = new Date(izin.endDate);

      if (startDate <= endDate) {
        // Başlangıç ve bitiş günleri de dahil (1 gün ekliyoruz)
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        setIzin((prev) => ({ ...prev, dayCount: diffDays }));
      } else if (izin.startDate && izin.endDate) {
        // Başlangıç bitiş tarihinden sonraysa hata ver
        setErrors((prev) => ({
          ...prev,
          endDate: "Bitiş tarihi, başlangıç tarihinden önce olamaz",
        }));
      }
    }
  }, [izin.startDate, izin.endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Hata mesajlarını temizle
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setIzin((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    // İzin tipi kontrolü
    if (!izin.reason) {
      newErrors.reason = "İzin tipi seçmelisiniz";
    }

    // Tarih kontrolü
    if (!izin.startDate) {
      newErrors.startDate = "Başlangıç tarihi seçmelisiniz";
    }

    if (!izin.endDate) {
      newErrors.endDate = "Bitiş tarihi seçmelisiniz";
    } else if (
      izin.startDate &&
      new Date(izin.endDate) < new Date(izin.startDate)
    ) {
      newErrors.endDate = "Bitiş tarihi, başlangıç tarihinden önce olamaz";
    }

    // Açıklama kontrolü
    if (!izin.comment || izin.comment.trim() === "") {
      newErrors.comment = "İzin açıklaması giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    // Form validasyonu
    if (!validateForm()) {
      alertify.error("Lütfen tüm alanları doğru şekilde doldurunuz.");
      return;
    }

    setLoading(true);

    const configuration = {
      method: "POST",
      url: `/api/leaves/${personel._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        startDate: izin.startDate,
        endDate: izin.endDate,
        reason: izin.reason,
        comment: izin.comment,
        dayCount: izin.dayCount,
      },
    };

    axios(configuration)
      .then((result) => {
        alertify.success("İzin başarıyla eklendi");
        refreshPersonel();
        setLoading(false);
        toggle();
      })
      .catch((error) => {
        console.log(error);
        const errorMessage =
          error.response?.data?.message || "İzin eklenirken bir hata oluştu";
        alertify.error(errorMessage);
        setLoading(false);
      });
  };

  const handleCancel = () => {
    setIzin(initialIzinState);
    setErrors({});
    toggle();
  };

  // Seçilen izin tipinin detaylarını getir
  const getSelectedIzinType = () => {
    return izinTipleri.find((tip) => tip.id === izin.reason);
  };

  // Tarih formatını düzelt
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const selectedIzinType = getSelectedIzinType();

  return (
    <Modal isOpen={modal} toggle={!loading && toggle} centered size="lg">
      <ModalHeader
        toggle={!loading && toggle}
        className="bg-success text-white"
      >
        <i className="fas fa-calendar-plus me-2"></i>
        Personel İzin Ekleme
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center my-5 py-5">
            <Spinner
              color="success"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted">
              İzin ekleniyor, lütfen bekleyin...
            </p>
          </div>
        ) : (
          <Form>
            {personel && (
              <>
                <Alert color="info" className="mb-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-info-circle me-3 fs-4"></i>
                    <div>
                      <strong>
                        {personel.ad} {personel.soyad}
                      </strong>{" "}
                      adlı personel için yeni bir izin kaydı ekliyorsunuz.
                      {personel.izindeMi && (
                        <div className="mt-2">
                          <Badge color="danger" pill>
                            UYARI
                          </Badge>{" "}
                          <strong>Bu personel şu an izinde görünüyor.</strong>{" "}
                          Yeni izin eklemek mevcut izin durumunu etkileyebilir.
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>

                <Row className="g-3">
                  {/* İzin Tipi Seçimi */}
                  <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <CardBody>
                        <h5 className="card-title mb-3">
                          <i className="fas fa-list-alt me-2 text-success"></i>
                          İzin Tipi
                        </h5>

                        <FormGroup>
                          <InputGroup>
                            <InputGroupText>
                              <i className="fas fa-tags"></i>
                            </InputGroupText>
                            <Input
                              type="select"
                              name="reason"
                              id="reason"
                              onChange={handleInputChange}
                              value={izin.reason}
                              className={`form-select ${
                                errors.reason ? "is-invalid" : ""
                              }`}
                            >
                              <option value="">İzin Tipini Seçiniz</option>
                              {izinTipleri.map((tip) => (
                                <option key={tip.id} value={tip.id}>
                                  {tip.name}
                                </option>
                              ))}
                            </Input>
                            {errors.reason && (
                              <div className="invalid-feedback">
                                {errors.reason}
                              </div>
                            )}
                          </InputGroup>
                        </FormGroup>

                        {selectedIzinType && (
                          <div className="mt-3 p-3 border rounded bg-light">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <div
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    background: `var(--bs-${selectedIzinType.color})`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color:
                                      selectedIzinType.color === "light"
                                        ? "#000"
                                        : "#fff",
                                  }}
                                >
                                  <i
                                    className={`fas fa-${selectedIzinType.icon} fa-lg`}
                                  ></i>
                                </div>
                              </div>
                              <div>
                                <h5 className="mb-0">
                                  {selectedIzinType.name}
                                </h5>
                                <div className="text-muted">
                                  Seçilen İzin Tipi
                                </div>
                              </div>
                              <Badge
                                color={selectedIzinType.color}
                                pill
                                className="ms-auto px-3 py-2"
                              >
                                SEÇİLDİ
                              </Badge>
                            </div>
                          </div>
                        )}

                        <FormGroup className="mt-3">
                          <Label for="comment" className="fw-bold">
                            İzin Açıklaması{" "}
                            <span className="text-danger">*</span>
                          </Label>
                          <Input
                            type="textarea"
                            name="comment"
                            id="comment"
                            rows="4"
                            placeholder="İzin hakkında açıklama yazınız"
                            value={izin.comment}
                            onChange={handleInputChange}
                            className={errors.comment ? "is-invalid" : ""}
                          />
                          {errors.comment && (
                            <div className="invalid-feedback">
                              {errors.comment}
                            </div>
                          )}
                          <small className="text-muted">
                            İzin hakkında detaylı bilgi giriniz (örn: mazeret
                            sebebi, rapor detayları vb.)
                          </small>
                        </FormGroup>
                      </CardBody>
                    </Card>
                  </Col>

                  {/* İzin Tarihleri */}
                  <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <CardBody>
                        <h5 className="card-title mb-3">
                          <i className="fas fa-calendar-day me-2 text-success"></i>
                          İzin Tarihleri
                        </h5>

                        <Row className="g-3">
                          <Col md={6}>
                            <FormGroup>
                              <Label for="startDate" className="fw-bold">
                                Başlangıç Tarihi{" "}
                                <span className="text-danger">*</span>
                              </Label>
                              <InputGroup>
                                <InputGroupText>
                                  <i className="fas fa-calendar-day"></i>
                                </InputGroupText>
                                <Input
                                  type="date"
                                  name="startDate"
                                  id="startDate"
                                  value={izin.startDate}
                                  onChange={handleInputChange}
                                  className={
                                    errors.startDate ? "is-invalid" : ""
                                  }
                                />
                              </InputGroup>
                              {errors.startDate && (
                                <div className="invalid-feedback d-block">
                                  {errors.startDate}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="endDate" className="fw-bold">
                                Bitiş Tarihi{" "}
                                <span className="text-danger">*</span>
                              </Label>
                              <InputGroup>
                                <InputGroupText>
                                  <i className="fas fa-calendar-check"></i>
                                </InputGroupText>
                                <Input
                                  type="date"
                                  name="endDate"
                                  id="endDate"
                                  value={izin.endDate}
                                  onChange={handleInputChange}
                                  className={errors.endDate ? "is-invalid" : ""}
                                />
                              </InputGroup>
                              {errors.endDate && (
                                <div className="invalid-feedback d-block">
                                  {errors.endDate}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>

                        {/* İzin Süresi Özeti */}
                        {izin.startDate && izin.endDate && !errors.endDate && (
                          <Card className="mt-4 border-0 bg-light">
                            <CardBody>
                              <h6 className="text-success mb-3">
                                İzin Süresi Özeti
                              </h6>
                              <Row>
                                <Col xs={6}>
                                  <div className="text-muted small">
                                    BAŞLANGIÇ TARİHİ
                                  </div>
                                  <div className="fw-bold">
                                    {formatDate(izin.startDate)}
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className="text-muted small">
                                    BİTİŞ TARİHİ
                                  </div>
                                  <div className="fw-bold">
                                    {formatDate(izin.endDate)}
                                  </div>
                                </Col>
                              </Row>
                              <hr />
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="text-muted">
                                  Toplam İzin Süresi:
                                </div>
                                <Badge
                                  color="success"
                                  pill
                                  className="px-3 py-2 fs-6"
                                >
                                  {izin.dayCount} Gün
                                </Badge>
                              </div>
                            </CardBody>
                          </Card>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color="success"
          onClick={handleUpdate}
          disabled={loading}
          className="px-4"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" /> İzin Ekleniyor...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i> İzin Ekle
            </>
          )}
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          <i className="fas fa-times me-1"></i> İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
