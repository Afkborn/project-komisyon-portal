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
  FormFeedback,
  Row,
  Col,
  Spinner,
  Card,
  Badge,
  Alert,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

function PersonelEkleModal({
  modal,
  toggle,
  unvanlar,
  birim,
  token,
  handleBirimChange,
  personel,
}) {
  const [selectedUnvan, setSelectedUnvan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    birimID: "",
    titleID: "",
    sicil: "",
    ad: "",
    soyad: "",
    goreveBaslamaTarihi: "",
    durusmaKatibiMi: false,
    birimeBaslamaTarihi: new Date().toISOString().substr(0, 10),
    isTemporary: false,
    isTemporaryReason: "",
    isTemporaryEndDate: "",
    isDisabled: false,
    isMartyrRelative: false,
    email: "",
    phone: "",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Checkbox elements için değeri checked olarak al, diğer input tipleri için value
    const inputValue = type === "checkbox" ? checked : value;

    if (name === "titleID" && value) {
      const unvan = unvanlar.find((unvan) => unvan._id === value);
      setSelectedUnvan(unvan);

      // Zabıt katibi değilse, durusmaKatibiMi değerini false yap
      if (unvan && unvan.kind !== "zabitkatibi") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          durusmaKatibiMi: false,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    // Hata mesajını temizle
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const resetForm = () => {
    setFormData({
      birimID: birim?._id || "",
      titleID: "",
      sicil: "",
      ad: "",
      soyad: "",
      goreveBaslamaTarihi: "",
      durusmaKatibiMi: false,
      birimeBaslamaTarihi: new Date().toISOString().substr(0, 10),
      isTemporary: false,
      isTemporaryReason: "",
      isTemporaryEndDate: "",
      isDisabled: false,
      isMartyrRelative: false,
      email: "",
      phone: "",
      description: "",
    });
    setSelectedUnvan(null);
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    toggle();
  };

  const validateForm = () => {
    const newErrors = {};

    // Zorunlu alanlar
    if (!formData.titleID) newErrors.titleID = "Ünvan seçimi zorunludur";
    if (!formData.sicil) newErrors.sicil = "Sicil numarası zorunludur";
    if (!formData.ad) newErrors.ad = "Ad alanı zorunludur";
    if (!formData.soyad) newErrors.soyad = "Soyad alanı zorunludur";
    if (!formData.goreveBaslamaTarihi)
      newErrors.goreveBaslamaTarihi = "Göreve başlama tarihi zorunludur";

    // Geçici personel ile ilgili doğrulamalar
    if (formData.isTemporary) {
      if (!formData.isTemporaryReason)
        newErrors.isTemporaryReason = "Geçici personel nedeni belirtilmelidir";
      if (!formData.isTemporaryEndDate)
        newErrors.isTemporaryEndDate = "Bitiş tarihi belirtilmelidir";
    }

    // Email formatı doğrulama (opsiyonel alan)
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir email adresi giriniz";
    }

    // Telefon formatı doğrulama (opsiyonel alan)
    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Geçerli bir telefon numarası giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    // Birim ID'sini formData'ya ekle
    const submitData = {
      ...formData,
      birimID: birim._id,
    };

    if (!validateForm()) {
      alertify.error("Lütfen form alanlarını kontrol ediniz.");
      return;
    }

    setLoading(true);

    const configuration = {
      method: "POST",
      url: "/api/persons",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: submitData,
    };

    axios(configuration)
      .then(() => {
        alertify.success("Personel başarıyla eklendi.");
        resetForm();
        toggle();
        handleBirimChange({ target: { value: birim.name } });
      })
      .catch((error) => {
        console.log(error);
        if (error.response?.data?.code === 11000) {
          alertify.error("Bu sicil numarası zaten kullanılmakta.");
          setErrors((prev) => ({
            ...prev,
            sicil: "Bu sicil numarası zaten kullanılmakta",
          }));
        } else {
          let errorMessage =
            error.response?.data?.message || "Bir hata oluştu!";
          alertify.error(errorMessage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (birim?._id) {
      setFormData((prev) => ({
        ...prev,
        birimID: birim._id,
      }));
    }
    // eslint-disable-next-line
  }, [birim]);

  return (
    <Modal isOpen={modal} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle} className="bg-primary text-white">
        <i className="fas fa-user-plus me-2"></i>
        Personel Ekle - {birim?.name}
      </ModalHeader>

      <ModalBody className="bg-light">
        {birim ? (
          <Form>
            <Card className="shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-id-card me-2 text-primary"></i>
                  Temel Bilgiler
                </h5>
              </div>
              <div className="card-body">
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="titleID" className="fw-bold">
                        <i className="fas fa-user-tag me-1 text-primary"></i>{" "}
                        Ünvan*
                      </Label>
                      <Input
                        type="select"
                        name="titleID"
                        id="titleID"
                        value={formData.titleID}
                        onChange={handleInputChange}
                        invalid={!!errors.titleID}
                        className={formData.titleID ? "border-primary" : ""}
                      >
                        <option value="">Ünvan Seçiniz</option>
                        {unvanlar.map((unvan) => (
                          <option key={unvan._id} value={unvan._id}>
                            {unvan.name}
                          </option>
                        ))}
                      </Input>
                      <FormFeedback>{errors.titleID}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="sicil" className="fw-bold">
                        <i className="fas fa-hashtag me-1 text-primary"></i>{" "}
                        Sicil Numarası*
                      </Label>
                      <Input
                        type="number"
                        name="sicil"
                        id="sicil"
                        placeholder="Sicil numarası giriniz"
                        value={formData.sicil}
                        onChange={handleInputChange}
                        invalid={!!errors.sicil}
                        className={formData.sicil ? "border-primary" : ""}
                      />
                      <FormFeedback>{errors.sicil}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="ad" className="fw-bold">
                        <i className="fas fa-user me-1 text-primary"></i> Ad*
                      </Label>
                      <Input
                        type="text"
                        name="ad"
                        id="ad"
                        placeholder="Ad giriniz"
                        value={formData.ad}
                        onChange={handleInputChange}
                        invalid={!!errors.ad}
                        className={formData.ad ? "border-primary" : ""}
                      />
                      <FormFeedback>{errors.ad}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="soyad" className="fw-bold">
                        <i className="fas fa-user me-1 text-primary"></i> Soyad*
                      </Label>
                      <Input
                        type="text"
                        name="soyad"
                        id="soyad"
                        placeholder="Soyad giriniz"
                        value={formData.soyad}
                        onChange={handleInputChange}
                        invalid={!!errors.soyad}
                        className={formData.soyad ? "border-primary" : ""}
                      />
                      <FormFeedback>{errors.soyad}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="goreveBaslamaTarihi" className="fw-bold">
                        <i className="fas fa-calendar-check me-1 text-primary"></i>{" "}
                        Göreve Başlama Tarihi*
                      </Label>
                      <Input
                        type="date"
                        name="goreveBaslamaTarihi"
                        id="goreveBaslamaTarihi"
                        value={formData.goreveBaslamaTarihi}
                        onChange={handleInputChange}
                        invalid={!!errors.goreveBaslamaTarihi}
                        className={
                          formData.goreveBaslamaTarihi ? "border-primary" : ""
                        }
                      />
                      <FormFeedback>{errors.goreveBaslamaTarihi}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="birimeBaslamaTarihi" className="fw-bold">
                        <i className="fas fa-calendar-alt me-1 text-primary"></i>{" "}
                        Birime Başlama Tarihi
                      </Label>
                      <Input
                        type="date"
                        name="birimeBaslamaTarihi"
                        id="birimeBaslamaTarihi"
                        value={formData.birimeBaslamaTarihi}
                        onChange={handleInputChange}
                        className={
                          formData.birimeBaslamaTarihi ? "border-primary" : ""
                        }
                      />
                      <small className="text-muted">
                        Varsayılan olarak bugün seçilmiştir
                      </small>
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            </Card>

            {selectedUnvan && (
              <Card className="shadow-sm mb-4">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="fas fa-briefcase me-2 text-primary"></i>
                      Ünvan Özel Bilgileri
                    </h5>
                    <Badge color="info" pill className="px-3">
                      {selectedUnvan.name}
                    </Badge>
                  </div>
                </div>
                <div className="card-body">
                  {selectedUnvan.kind === "zabitkatibi" && (
                    <>
                      <FormGroup check className="mb-3">
                        <Label check>
                          <Input
                            type="checkbox"
                            name="durusmaKatibiMi"
                            id="durusmaKatibiMi"
                            checked={formData.durusmaKatibiMi}
                            onChange={handleInputChange}
                          />{" "}
                          <span className="fw-bold">Duruşma Katibi Mi?</span>
                        </Label>
                        <small className="d-block text-muted mt-1">
                          Eğer personel duruşma katibi olarak görev yapıyorsa
                          işaretleyiniz
                        </small>
                      </FormGroup>

                      <FormGroup>
                        <Label for="calistigiKisi" className="fw-bold">
                          <i className="fas fa-user-tie me-1 text-primary"></i>{" "}
                          Çalıştığı Kişi (Opsiyonel)
                        </Label>
                        <Input
                          type="select"
                          name="calistigiKisi"
                          id="calistigiKisi"
                          value={formData.calistigiKisi || ""}
                          onChange={handleInputChange}
                        >
                          <option value="">Seçiniz (Opsiyonel)</option>
                          {personel
                            .filter(
                              (p) =>
                                p.title &&
                                (p.title.kind === "hakim" ||
                                  p.title.kind === "baskan" ||
                                  p.title.kind === "uyehakim" ||
                                  p.title.kind === "savci")
                            )
                            .map((person) => (
                              <option key={person._id} value={person._id}>
                                {person.title?.name || "Belirtilmemiş"} |{" "}
                                {person.ad} {person.soyad} - {person.sicil}
                              </option>
                            ))}
                        </Input>
                        <small className="text-muted">
                          Katibin hangi hakim/savcı ile çalıştığını
                          seçebilirsiniz
                        </small>
                      </FormGroup>
                    </>
                  )}

                  {selectedUnvan.description && (
                    <Alert color="info" className="mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Ünvan Bilgisi:</strong>{" "}
                      {selectedUnvan.description}
                    </Alert>
                  )}

                  {selectedUnvan.kind !== "zabitkatibi" && (
                    <Alert color="warning" className="mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Bu ünvan için özel bir ayar bulunmamaktadır.
                    </Alert>
                  )}
                </div>
              </Card>
            )}

            <Card className="shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-cog me-2 text-primary"></i>
                  Ek Özellikler ve Durumlar
                </h5>
              </div>
              <div className="card-body">
                <Row>
                  <Col md={6}>
                    <FormGroup check className="mb-3">
                      <Label check>
                        <Input
                          type="checkbox"
                          name="isTemporary"
                          id="isTemporary"
                          checked={formData.isTemporary}
                          onChange={handleInputChange}
                        />{" "}
                        <span className="fw-bold">Geçici Personel</span>
                      </Label>
                      <small className="d-block text-muted mt-1">
                        Personel geçici olarak görevlendirildiyse işaretleyiniz
                      </small>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Col md={6}>
                        <FormGroup check className="mb-3">
                          <Label check>
                            <Input
                              type="checkbox"
                              name="isDisabled"
                              id="isDisabled"
                              checked={formData.isDisabled}
                              onChange={handleInputChange}
                            />{" "}
                            <span className="fw-bold">Engelli</span>
                          </Label>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup check className="mb-3">
                          <Label check>
                            <Input
                              type="checkbox"
                              name="isMartyrRelative"
                              id="isMartyrRelative"
                              checked={formData.isMartyrRelative}
                              onChange={handleInputChange}
                            />{" "}
                            <span className="fw-bold">Şehit Yakını</span>
                          </Label>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {formData.isTemporary && (
                  <Row className="mt-2 border-top pt-3">
                    <Col md={6}>
                      <FormGroup>
                        <Label for="isTemporaryReason" className="fw-bold">
                          <i className="fas fa-clipboard me-1 text-primary"></i>{" "}
                          Geçici Personel Nedeni*
                        </Label>
                        <Input
                          type="text"
                          name="isTemporaryReason"
                          id="isTemporaryReason"
                          placeholder="Geçici görevlendirme nedenini giriniz"
                          value={formData.isTemporaryReason}
                          onChange={handleInputChange}
                          invalid={!!errors.isTemporaryReason}
                        />
                        <FormFeedback>{errors.isTemporaryReason}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="isTemporaryEndDate" className="fw-bold">
                          <i className="fas fa-calendar-times me-1 text-primary"></i>{" "}
                          Bitiş Tarihi*
                        </Label>
                        <Input
                          type="date"
                          name="isTemporaryEndDate"
                          id="isTemporaryEndDate"
                          value={formData.isTemporaryEndDate}
                          onChange={handleInputChange}
                          invalid={!!errors.isTemporaryEndDate}
                        />
                        <FormFeedback>{errors.isTemporaryEndDate}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                )}
              </div>
            </Card>

            <Card className="shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-address-card me-2 text-primary"></i>
                  İletişim ve Diğer Bilgiler (Opsiyonel)
                </h5>
              </div>
              <div className="card-body">
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="email" className="fw-bold">
                        <i className="fas fa-envelope me-1 text-primary"></i>{" "}
                        Email Adresi
                      </Label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email adresi giriniz (opsiyonel)"
                        value={formData.email}
                        onChange={handleInputChange}
                        invalid={!!errors.email}
                      />
                      <FormFeedback>{errors.email}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="phone" className="fw-bold">
                        <i className="fas fa-phone me-1 text-primary"></i>{" "}
                        Telefon
                      </Label>
                      <Input
                        type="tel"
                        name="phone"
                        id="phone"
                        placeholder="Telefon numarası giriniz (opsiyonel)"
                        value={formData.phone}
                        onChange={handleInputChange}
                        invalid={!!errors.phone}
                      />
                      <FormFeedback>{errors.phone}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="description" className="fw-bold">
                    <i className="fas fa-sticky-note me-1 text-primary"></i>{" "}
                    Açıklama/Not
                  </Label>
                  <Input
                    type="textarea"
                    name="description"
                    id="description"
                    placeholder="Personel hakkında ek bilgiler girebilirsiniz (opsiyonel)"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </div>
            </Card>
          </Form>
        ) : (
          <Alert color="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Birim bilgisi bulunamadı. Lütfen önce bir birim seçiniz.
          </Alert>
        )}
      </ModalBody>

      <ModalFooter className="bg-light">
        <small className="text-muted me-auto">
          * ile işaretli alanlar zorunludur
        </small>
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          <i className="fas fa-times me-1"></i> İptal
        </Button>{" "}
        <Button color="primary" onClick={handleAdd} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-1" /> Kaydediliyor...
            </>
          ) : (
            <>
              <i className="fas fa-save me-1"></i> Kaydet
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default PersonelEkleModal;
