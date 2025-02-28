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

export default function PersonelDurumGuncelleModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
}) {
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [newDeactivationReason, setNewDeactivationReason] = useState("");
  const [newDeactivationDate, setNewDeactivationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [suspensionEndDate, setSuspensionEndDate] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Modal açıldığında form durumunu ayarla
  useEffect(() => {
    if (modal && personel) {
      // Personel pasifse veya uzaklaştırma durumundaysa güncelleme butonunu etkinleştir
      if (!personel.status || personel.isSuspended) {
        setUpdateButtonDisabled(false);
      } else {
        setUpdateButtonDisabled(true);
      }

      // Form alanlarını sıfırla
      setNewDeactivationReason("");
      setSuspensionEndDate("");
      setSuspensionReason("");
      setNewDeactivationDate(new Date().toISOString().split("T")[0]);
      setErrors({});
    }
  }, [modal, personel]);

  // Form değişikliklerinde validasyon kontrolü yap
  const validateForm = () => {
    const newErrors = {};

    // Uzaklaştırma seçilmişse bitiş tarihi ve gerekçe zorunlu olmalı
    if (newDeactivationReason === "Uzaklastirma") {
      if (!suspensionEndDate) {
        newErrors.suspensionEndDate = "Uzaklaştırma bitiş tarihi gereklidir";
      } else if (new Date(suspensionEndDate) <= new Date()) {
        newErrors.suspensionEndDate =
          "Uzaklaştırma bitiş tarihi bugünden sonra olmalıdır";
      }

      if (!suspensionReason || suspensionReason.trim() === "") {
        newErrors.suspensionReason = "Uzaklaştırma gerekçesi gereklidir";
      }
    }

    // Aktif personel için durum değişimi yapılacaksa ayrılış nedeni seçilmiş olmalı
    if (personel?.status && !personel?.isSuspended && !newDeactivationReason) {
      newErrors.deactivationReason = "Ayrılış gerekçesi seçilmelidir";
    }

    setErrors(newErrors);

    // Personel aktifse ve yeni bir durum seçilmişse veya
    // Personel pasifse ya da uzaklaştırma durumundaysa ve hatalar yoksa butonu aktif et
    if (
      (personel?.status &&
        newDeactivationReason &&
        Object.keys(newErrors).length === 0) ||
      ((!personel?.status || personel?.isSuspended) &&
        Object.keys(newErrors).length === 0)
    ) {
      setUpdateButtonDisabled(false);
    } else if (
      personel?.status &&
      !personel?.isSuspended &&
      !newDeactivationReason
    ) {
      setUpdateButtonDisabled(true);
    }
  };

  // Form alanları değişince validasyon yap
  useEffect(() => {
    if (personel) validateForm();
  }, [newDeactivationReason, suspensionEndDate, suspensionReason]);

  const handleCancel = () => {
    toggle();
  };

  const handleUpdate = () => {
    // Son kontroller
    if (personel.status && newDeactivationReason === "Uzaklastirma") {
      if (!suspensionEndDate) {
        alertify.error("Uzaklaştırma bitiş tarihi boş bırakılamaz");
        return;
      }
      if (new Date(suspensionEndDate) < new Date()) {
        alertify.error("Uzaklaştırma bitiş tarihi bugünden önce olamaz");
        return;
      }
      if (!suspensionReason || suspensionReason.trim() === "") {
        alertify.error("Uzaklaştırma gerekçesi boş bırakılamaz");
        return;
      }
    }

    if (personel.status && !personel.isSuspended && !newDeactivationReason) {
      alertify.error("Ayrılış gerekçesi seçmelisiniz");
      return;
    }

    setLoading(true);

    const configuration = {
      method: "PUT",
      url: `/api/persons/${personel._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        status: !personel.status,
        deactivationReason: newDeactivationReason,
        deactivationDate: newDeactivationDate,
      },
    };

    // Personel şu an uzaklaştırma durumunda ise, uzaklaştırmayı kaldır
    if (personel.isSuspended) {
      configuration.data = {
        status: true,
        isSuspended: false,
        suspensionEndDate: null,
        suspensionReason: null,
      };
    }

    // Yeni durum uzaklaştırma ise, gerekli alanları ekle
    if (newDeactivationReason === "Uzaklastirma") {
      configuration.data = {
        status: true,
        isSuspended: true,
        suspensionEndDate: suspensionEndDate,
        suspensionReason: suspensionReason,
      };
    }

    axios(configuration)
      .then((response) => {
        let successMessage = "";

        if (personel.isSuspended) {
          successMessage = "Personelin uzaklaştırma durumu kaldırıldı";
        } else if (newDeactivationReason === "Uzaklastirma") {
          successMessage = "Personel uzaklaştırma durumuna alındı";
        } else if (!personel.status) {
          successMessage = "Personel aktif duruma getirildi";
        } else {
          successMessage = "Personel pasif duruma getirildi";
        }

        alertify.success(successMessage);
        setLoading(false);
        refreshPersonel();
        toggle();
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          "Personel durumu güncellenirken bir hata oluştu";
        alertify.error(errorMessage);
        setLoading(false);
      });
  };

  // Ayrılış gerekçesi değişince state'i güncelle
  const handleTypeChange = (event) => {
    setNewDeactivationReason(
      event.target.value === "Seçiniz" ? "" : event.target.value
    );
  };

  // Tarih değişince state'i güncelle
  const handleDateChange = (event) => {
    setNewDeactivationDate(event.target.value);
  };

  // Uzaklaştırma bitiş tarihi değişince state'i güncelle
  const handleSuspensionEndDateChange = (event) => {
    setSuspensionEndDate(event.target.value);
  };

  // Personel durumuna göre işlem butonunun metni
  const getButtonText = () => {
    if (!personel) return "Güncelle";
    if (personel.status) {
      if (personel.isSuspended) return "UZAKLAŞTIRMA KALDIR";
      if (newDeactivationReason === "Uzaklastirma") return "UZAKLAŞTIR";
      return "PASİF YAP";
    }
    return "AKTİF YAP";
  };

  // Personel durumuna göre yazı ve badge rengi
  const getStatusInfo = () => {
    if (!personel) return { text: "", color: "secondary" };

    if (personel.status) {
      if (personel.isSuspended)
        return { text: "Aktif (Uzaklaştırılmış)", color: "warning" };
      return { text: "Aktif", color: "success" };
    }
    return { text: "Pasif", color: "danger" };
  };

  const statusInfo = getStatusInfo();

  return (
    <Modal isOpen={modal} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle} className="bg-warning text-white">
        <i className="fas fa-user-edit me-2"></i>
        Personel Durum Güncelleme
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center py-5">
            <Spinner
              color="warning"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3">Durum güncelleniyor, lütfen bekleyin...</p>
          </div>
        ) : (
          personel && (
            <Form>
              <Alert color="info" className="mb-4">
                <i className="fas fa-info-circle me-2"></i>
                <span>
                  Personel durumu <strong>Pasif</strong> yapıldığında listelerde
                  gözükmez. Pasif personeli, sicil numarasını kullanarak tekrar
                  aktif yapabilirsiniz.
                </span>
              </Alert>

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
                      <h6 className="mb-1">Mevcut Durum:</h6>
                      <Badge
                        color={statusInfo.color}
                        pill
                        className="px-3 py-2"
                      >
                        {statusInfo.text}
                      </Badge>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {/* Pasif personel bilgisi */}
              {personel.status === false && (
                <FormGroup className="mb-4">
                  <Label className="form-label fw-bold">
                    Ayrılış Gerekçesi
                  </Label>
                  <Input
                    id="personelDeactivationReason"
                    type="text"
                    value={personel.deactivationReason || "Belirtilmemiş"}
                    disabled
                    className="bg-light"
                  />
                </FormGroup>
              )}

              {/* Uzaklaştırma durumu bilgisi */}
              {personel.isSuspended && (
                <Row className="mb-4">
                  <Col md={6}>
                    <FormGroup>
                      <Label className="form-label fw-bold">
                        Uzaklaştırma Gerekçesi
                      </Label>
                      <Input
                        type="text"
                        value={personel.suspensionReason || "Belirtilmemiş"}
                        disabled
                        className="bg-light"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label className="form-label fw-bold">
                        Uzaklaştırma Bitiş Tarihi
                      </Label>
                      <Input
                        type="text"
                        value={
                          personel.suspensionEndDate
                            ? new Date(
                                personel.suspensionEndDate
                              ).toLocaleDateString()
                            : "Belirtilmemiş"
                        }
                        disabled
                        className="bg-light"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )}

              {/* Aktif personel için ayrılış gerekçesi seçimi */}
              {personel.status === true && personel.isSuspended === false && (
                <FormGroup className="mb-4">
                  <Label
                    for="personelNewDeactivationReason"
                    className="form-label fw-bold"
                  >
                    Ayrılış/Durum Değişikliği Nedeni
                  </Label>
                  <Input
                    id="personelNewDeactivationReason"
                    name="select"
                    type="select"
                    onChange={(e) => handleTypeChange(e)}
                    className={`form-select ${
                      errors.deactivationReason ? "is-invalid" : ""
                    }`}
                  >
                    <option key={-1}>Seçiniz</option>
                    <option key={0} value="Emekli">
                      Emekli
                    </option>
                    <option key={1} value="İstifa">
                      İstifa
                    </option>
                    <option key={2} value="Naklen Atama">
                      Naklen Atama
                    </option>
                    <option key={4} value="Ölüm">
                      Ölüm
                    </option>
                    <option key={3} value="Diğer">
                      Diğer
                    </option>
                    <option key={5} value="Uzaklastirma">
                      Uzaklaştırma
                    </option>
                  </Input>
                  {errors.deactivationReason && (
                    <div className="invalid-feedback">
                      {errors.deactivationReason}
                    </div>
                  )}
                </FormGroup>
              )}

              {/* Ayrılış tarihi seçimi - uzaklaştırma hariç diğer seçenekler için */}
              {personel.status === true &&
                personel.isSuspended === false &&
                newDeactivationReason &&
                newDeactivationReason !== "Uzaklastirma" && (
                  <FormGroup className="mb-4">
                    <Label
                      for="personelNewDeactivationDate"
                      className="form-label fw-bold"
                    >
                      Ayrılış Tarihi
                    </Label>
                    <InputGroup>
                      <InputGroupText>
                        <i className="fas fa-calendar-alt"></i>
                      </InputGroupText>
                      <Input
                        id="personelNewDeactivationDate"
                        type="date"
                        value={newDeactivationDate}
                        onChange={(e) => handleDateChange(e)}
                      />
                    </InputGroup>
                  </FormGroup>
                )}

              {/* Uzaklaştırma seçildiğinde gösterilen alanlar */}
              {personel.status === true &&
                personel.isSuspended === false &&
                newDeactivationReason === "Uzaklastirma" && (
                  <div className="border rounded p-3 bg-light mb-4">
                    <h5 className="mb-3">Uzaklaştırma Bilgileri</h5>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label
                            for="suspensionEndDate"
                            className="form-label fw-bold"
                          >
                            Uzaklaştırma Bitiş Tarihi*
                          </Label>
                          <InputGroup>
                            <InputGroupText>
                              <i className="fas fa-calendar-check"></i>
                            </InputGroupText>
                            <Input
                              id="suspensionEndDate"
                              type="date"
                              value={suspensionEndDate}
                              onChange={(e) => handleSuspensionEndDateChange(e)}
                              className={
                                errors.suspensionEndDate ? "is-invalid" : ""
                              }
                            />
                          </InputGroup>
                          {errors.suspensionEndDate && (
                            <div className="text-danger small mt-1">
                              {errors.suspensionEndDate}
                            </div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label
                            for="suspensionReason"
                            className="form-label fw-bold"
                          >
                            Uzaklaştırma Gerekçesi*
                          </Label>
                          <Input
                            id="suspensionReason"
                            type="text"
                            value={suspensionReason}
                            onChange={(e) =>
                              setSuspensionReason(e.target.value)
                            }
                            placeholder="Uzaklaştırma gerekçesini belirtin"
                            className={
                              errors.suspensionReason ? "is-invalid" : ""
                            }
                          />
                          {errors.suspensionReason && (
                            <div className="invalid-feedback">
                              {errors.suspensionReason}
                            </div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Alert color="warning" className="mt-2 mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Uzaklaştırma durumunda personel pasife alınmaz, ancak
                      belirtilen tarihe kadar uzaklaştırma durumunda olur.
                    </Alert>
                  </div>
                )}
            </Form>
          )
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color={
            personel?.isSuspended
              ? "success"
              : newDeactivationReason === "Uzaklastirma"
              ? "warning"
              : personel?.status
              ? "danger"
              : "success"
          }
          onClick={handleUpdate}
          disabled={updateButtonDisabled || loading}
        >
          <i
            className={`fas ${
              personel?.status
                ? personel?.isSuspended
                  ? "fa-user-check"
                  : "fa-user-slash"
                : "fa-user-check"
            } me-1`}
          ></i>
          {getButtonText()}
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          <i className="fas fa-times me-1"></i> İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
