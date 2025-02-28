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
  Card,
  CardBody,
  InputGroup,
  InputGroupText,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

export default function PersonelCalistigiBirimGuncelleModal({
  modal,
  toggle,
  personel,
  token,
  selectedKurum,
  refreshPersonel,
}) {
  // Modal için state'ler
  const [birimSira, setBirimSira] = useState("birinciBirim");
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newCalistigiBirim, setNewCalistigiBirim] = useState(null);
  const [showKurumDisiBirim, setShowKurumDisiBirim] = useState(false);
  const [kurumDisiBirimID, setKurumDisiBirimID] = useState(null);
  const [selectValue, setSelectValue] = useState("");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [detail, setDetail] = useState("");
  const [birimler, setBirimler] = useState([]);
  const [tumBirimler, setTumBirimler] = useState([]);
  const [errors, setErrors] = useState({});

  // Modal açıldığında form durumunu ayarla
  useEffect(() => {
    if (modal && selectedKurum) {
      if (tumBirimler.length === 0) {
        getBirimler(selectedKurum.id);
      }

      // Personelin özelliğine bağlı olarak varsayılan birimSira'yı ayarla
      if (personel.isTemporary) {
        setBirimSira("geciciBirim");
      } else if (
        personel.kind === "yaziislerimudürü" ||
        personel.kind === "mubasir"
      ) {
        setBirimSira("birinciBirim");
      }
    }
     // eslint-disable-next-line 
  }, [modal, selectedKurum]);

  // Form sıfırlama fonksiyonu
  const resetForm = () => {
    setBirimler([]);
    setTumBirimler([]);
    setNewCalistigiBirim(null);
    setUpdateButtonDisabled(true);
    setBirimSira("birinciBirim");
    setSelectValue("");
    setShowKurumDisiBirim(false);
    setKurumDisiBirimID(null);
    setDetail("");
    setEndDate(new Date().toISOString().split("T")[0]);
    setErrors({});
    setLoading(false);
  };

  // İptal ve kapatma işlemleri
  const handleCancel = () => {
    resetForm();
    toggle();
  };

  const handleClosed = () => {
    resetForm();
  };

  // Form validasyonu
  const validateForm = () => {
    const newErrors = {};

    if (birimSira === "birinciBirim") {
      if (!endDate) {
        newErrors.endDate = "Değişiklik tarihi gereklidir";
      }

      if (!newCalistigiBirim && !showKurumDisiBirim) {
        newErrors.birim = "Yeni çalışacağı birim seçilmelidir";
      }

      if (showKurumDisiBirim && !kurumDisiBirimID) {
        newErrors.kurumDisiBirimID = "Kurum dışı birim ID gereklidir";
      }

      // Aynı birime güncelleme kontrolü
      if (
        newCalistigiBirim &&
        personel.birimID &&
        newCalistigiBirim._id === personel.birimID._id
      ) {
        newErrors.birim = "Personel zaten bu birimde çalışıyor";
      }
    } else if (birimSira === "ikinciBirim") {
      if (!newCalistigiBirim && !showKurumDisiBirim) {
        newErrors.birim = "İkinci birim seçilmelidir";
      }

      if (
        newCalistigiBirim &&
        personel.ikinciBirimID &&
        newCalistigiBirim._id === personel.ikinciBirimID._id
      ) {
        newErrors.birim = "Personel zaten bu ikinci birimde çalışıyor";
      }
    } else if (birimSira === "geciciBirim") {
      if (!newCalistigiBirim && !kurumDisiBirimID) {
        newErrors.birim = "Geçici birim seçilmelidir";
      }

      if (showKurumDisiBirim && !kurumDisiBirimID) {
        newErrors.kurumDisiBirimID = "Kurum dışı birim ID gereklidir";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Birim türü değişince yapılacak işlemler
  function handleTypeChange(event) {
    setSelectValue(event.target.value);
    setNewCalistigiBirim(null);

    if (event.target.value === "Seçiniz") {
      setBirimler([]);
      setUpdateButtonDisabled(true);
      return;
    }

    if (event.target.value === "Kurum Dışı") {
      setBirimler([{ _id: "kurumdisi", name: "Kurum Dışı" }]);
      setShowKurumDisiBirim(true);
      return;
    }

    setShowKurumDisiBirim(false);

    // Seçilen tipe göre birimleri filtrele
    let typeId = selectedKurum.types.find(
      (type) => type.name === event.target.value
    ).id;

    const filteredBirimler = tumBirimler.filter(
      (birim) => birim.unitType.institutionTypeId === typeId
    );

    setBirimler(filteredBirimler);
  }

  // Birimleri getir
  function getBirimler(institutionID) {
    setLoading(true);

    const configuration = {
      method: "GET",
      url: `/api/units/institution/${institutionID}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        // Birimleri öncelik ve seri numarasına göre sırala
        const sortedBirimler = result.data.unitList.sort((a, b) => {
          if (a.unitType.oncelikSirasi !== b.unitType.oncelikSirasi) {
            return a.unitType.oncelikSirasi - b.unitType.oncelikSirasi;
          }
          return a.series - b.series;
        });

        setTumBirimler(sortedBirimler);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        alertify.error("Birimler yüklenirken bir hata oluştu");
      });
  }

  // Birim değiştiğinde yapılacaklar
  function handleBirimChange(event) {
    if (event.target.value === "Seçiniz") {
      setNewCalistigiBirim(null);
      setUpdateButtonDisabled(true);
      return;
    }

    if (event.target.value === "Kurum Dışı") {
      setShowKurumDisiBirim(true);
      setNewCalistigiBirim(null);
      setUpdateButtonDisabled(false);
      return;
    }

    setShowKurumDisiBirim(false);

    // Seçilen birimi bul
    const selectedBirim = birimler.find(
      (birim) => birim.name === event.target.value
    );

    setNewCalistigiBirim(selectedBirim);
    setUpdateButtonDisabled(false);

    // Validasyon sonucuna göre buton aktifliğini ayarla
    setTimeout(() => {
      validateForm();
    }, 100);
  }

  // Güncelleme işlemi
  const handleUpdate = () => {
    // Form validasyonu
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    if (birimSira === "birinciBirim") {
      // Birinci birim güncelleme - PersonUnit kaydı oluşturur
      const configuration = {
        method: "POST",
        url: "/api/personunits/changeUnit",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          personID: personel._id,
          unitID: personel.birimID._id,
          endDate: endDate,
          detail: detail,
          newUnitID: showKurumDisiBirim
            ? kurumDisiBirimID
            : newCalistigiBirim._id,
        },
      };

      axios(configuration)
        .then((result) => {
          alertify.success("Çalıştığı birim başarıyla güncellendi");
          refreshPersonel();
          setLoading(false);
          toggle();
        })
        .catch((error) => {
          console.log(error);
          alertify.error("Çalıştığı birim güncellenirken bir hata oluştu");
          setLoading(false);
        });
    } else {
      // İkinci veya geçici birim güncelleme - Person kaydında ilgili alanı günceller
      const configuration = {
        method: "PUT",
        url: `/api/persons/${personel._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data:
          birimSira === "ikinciBirim"
            ? {
                ikinciBirimID: showKurumDisiBirim
                  ? kurumDisiBirimID
                  : newCalistigiBirim._id,
              }
            : {
                temporaryBirimID: showKurumDisiBirim
                  ? kurumDisiBirimID
                  : newCalistigiBirim._id,
              },
      };

      axios(configuration)
        .then((response) => {
          refreshPersonel();
          alertify.success(
            `${
              birimSira === "ikinciBirim" ? "İkinci" : "Geçici"
            } birim başarıyla güncellendi`
          );
          setLoading(false);
          toggle();
        })
        .catch((error) => {
          const errorMsg =
            error.response?.data?.message ||
            `${
              birimSira === "ikinciBirim" ? "İkinci" : "Geçici"
            } birim güncellenirken bir hata oluştu`;
          alertify.error(errorMsg);
          setLoading(false);
        });
    }
  };

  // İkinci veya geçici birimi silme işlemleri
  const handleClearSecondUnit = () => {
    setLoading(true);

    const configuration = {
      method: "PUT",
      url: `/api/persons/${personel._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        ikinciBirimID: null,
      },
    };

    axios(configuration)
      .then((response) => {
        refreshPersonel();
        alertify.success("İkinci birim başarıyla silindi");
        setLoading(false);
        toggle();
      })
      .catch((error) => {
        alertify.error("İkinci birim silinirken bir hata oluştu");
        setLoading(false);
      });
  };

  const handleClearTemporaryUnit = () => {
    setLoading(true);

    const configuration = {
      method: "PUT",
      url: `/api/persons/${personel._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        temporaryBirimID: null,
      },
    };

    axios(configuration)
      .then((response) => {
        refreshPersonel();
        alertify.success("Geçici birim başarıyla silindi");
        setLoading(false);
        toggle();
      })
      .catch((error) => {
        alertify.error("Geçici birim silinirken bir hata oluştu");
        setLoading(false);
      });
  };



  // Personelin belirli bir birim tipine sahip olup olmadığını kontrol et
  const hasPersonelBirimType = (type) => {
    if (!personel) return false;

    if (type === "ikinciBirim") {
      return (
        personel.kind === "yaziislerimudürü" || personel.kind === "mubasir"
      );
    } else if (type === "geciciBirim") {
      return personel.isTemporary;
    }

    return true;
  };

  // Tab etiketi oluştur
  const birimTabLabel = (key, icon, text, badgeColor, badgeCond, badgeText) => {
    return (
      <div className="d-flex align-items-center">
        <i className={`fas fa-${icon} me-2`}></i> {text}
        {badgeCond && (
          <Badge color={badgeColor} pill className="ms-2" size="sm">
            {badgeText}
          </Badge>
        )}
      </div>
    );
  };

  // Personel birim adını formatla
  const formatBirimName = (birim) => {
    if (!birim) return "BELİRTİLMEMİŞ";

    // Eğer birim adında kurum adı yoksa (aynı kurumun farklı birimleri için)
    if (birim.institutionID?.name === selectedKurum?.name) {
      return birim.name;
    }

    // Farklı kurumların birimleri için kurum adını da göster
    return `${birim.name} (${birim.institutionID?.name || "Bilinmeyen Kurum"})`;
  };

  return (
    <Modal
      isOpen={modal}
      toggle={loading ? null : toggle}
      onClosed={handleClosed}
      size="lg"
    >
      <ModalHeader
        toggle={loading ? null : toggle}
        className="bg-primary text-white"
      >
        <i className="fas fa-building me-2"></i>
        Çalıştığı Birimi Güncelle
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="text-center my-5">
            <Spinner
              color="primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted">
              İşlem yapılıyor, lütfen bekleyin...
            </p>
          </div>
        ) : personel ? (
          <Form>
            <Alert color="info" className="mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <strong>
                {personel.ad} {personel.soyad}
              </strong>{" "}
              adlı personelin birim bilgilerini güncelleyebilirsiniz.
              {personel.isTemporary && (
                <div className="mt-2">
                  <Badge color="warning" pill className="me-2">
                    Geçici Personel
                  </Badge>
                  Bu personel geçici olarak görevlendirilmiş.
                </div>
              )}
            </Alert>

            {/* Personel birden fazla birim tipine sahipse seçim yapmak için tablar */}
            <Nav tabs className="mb-4">
              <NavItem>
                <NavLink
                  className={birimSira === "birinciBirim" ? "active" : ""}
                  onClick={() => setBirimSira("birinciBirim")}
                  style={{ cursor: "pointer" }}
                >
                  {birimTabLabel(
                    "birinciBirim",
                    "home",
                    "Ana Birim",
                    "primary",
                    true,
                    "Mevcut"
                  )}
                </NavLink>
              </NavItem>

              {hasPersonelBirimType("ikinciBirim") && (
                <NavItem>
                  <NavLink
                    className={birimSira === "ikinciBirim" ? "active" : ""}
                    onClick={() => setBirimSira("ikinciBirim")}
                    style={{ cursor: "pointer" }}
                  >
                    {birimTabLabel(
                      "ikinciBirim",
                      "exchange-alt",
                      "İkinci Birim",
                      "info",
                      personel.ikinciBirimID,
                      "Mevcut"
                    )}
                  </NavLink>
                </NavItem>
              )}

              {hasPersonelBirimType("geciciBirim") && (
                <NavItem>
                  <NavLink
                    className={birimSira === "geciciBirim" ? "active" : ""}
                    onClick={() => setBirimSira("geciciBirim")}
                    style={{ cursor: "pointer" }}
                  >
                    {birimTabLabel(
                      "geciciBirim",
                      "clock",
                      "Geçici Birim",
                      "warning",
                      personel.temporaryBirimID,
                      "Mevcut"
                    )}
                  </NavLink>
                </NavItem>
              )}
            </Nav>

            {/* Seçilen tab için içerik */}
            <TabContent activeTab={birimSira}>
              <TabPane tabId="birinciBirim">
                {/* Ana Birim Tab İçeriği */}
                <Row className="mb-4">
                  <Col md={12}>
                    <Card className="border-0 mb-3">
                      <CardBody className="bg-light">
                        <h5 className="mb-3">Mevcut Ana Birim Bilgileri</h5>
                        <Row className="mb-0">
                          <Col md={8}>
                            <FormGroup>
                              <Label className="text-muted small text-uppercase">
                                Ana Birim
                              </Label>
                              <p className="form-control-plaintext fw-bold">
                                {formatBirimName(personel.birimID)}
                              </p>
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label className="text-muted small text-uppercase">
                                Başlangıç Tarihi
                              </Label>
                              <p className="form-control-plaintext fw-bold">
                                {new Date(
                                  personel.birimeBaslamaTarihi
                                ).toLocaleDateString()}
                              </p>
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>

                    <h5 className="mb-3 text-primary">Yeni Ana Birim Seçimi</h5>
                    <Row className="mb-3">
                      <Col md={6}>
                        <FormGroup>
                          <Label for="selectType" className="fw-bold">
                            Birim Tipi
                          </Label>
                          <Input
                            id="selectType"
                            name="select"
                            type="select"
                            className={`form-select ${
                              errors.birim ? "is-invalid" : ""
                            }`}
                            value={selectValue}
                            onChange={handleTypeChange}
                          >
                            <option key={-1}>Seçiniz</option>
                            {selectedKurum &&
                              selectedKurum.types.map((type) => (
                                <option key={type.id}>{type.name}</option>
                              ))}
                            <option key="optionBirimDisi">Kurum Dışı</option>
                          </Input>
                          {errors.birim && (
                            <div className="invalid-feedback">
                              {errors.birim}
                            </div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="selectBirim" className="fw-bold">
                            Birim
                          </Label>
                          <Input
                            id="selectBirim"
                            name="selectBirim"
                            type="select"
                            className="form-select"
                            onChange={handleBirimChange}
                            disabled={birimler.length === 0}
                          >
                            <option key="secim">Seçiniz</option>
                            {birimler.map((birim) => (
                              <option key={birim._id} value={birim.name}>
                                {birim.name}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* Kurum dışı birim ID alanı */}
                    {showKurumDisiBirim && (
                      <FormGroup className="mb-3">
                        <Label for="kurumDisiBirimID" className="fw-bold">
                          Kurum Dışı Birim ID
                          <Badge color="danger" pill className="ms-2">
                            Zorunlu
                          </Badge>
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-fingerprint"></i>
                          </InputGroupText>
                          <Input
                            id="kurumDisiBirimID"
                            name="kurumDisiBirimID"
                            placeholder="Birim ID değerini girin"
                            value={kurumDisiBirimID || ""}
                            onChange={(e) =>
                              setKurumDisiBirimID(e.target.value)
                            }
                            className={
                              errors.kurumDisiBirimID ? "is-invalid" : ""
                            }
                          />
                        </InputGroup>
                        {errors.kurumDisiBirimID && (
                          <div className="invalid-feedback d-block">
                            {errors.kurumDisiBirimID}
                          </div>
                        )}
                      </FormGroup>
                    )}

                    {/* Seçili birim bilgisi */}
                    {!showKurumDisiBirim && newCalistigiBirim && (
                      <Alert color="success" className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="alert-heading mb-1">
                              Seçilen Birim
                            </h6>
                            <p className="mb-0">
                              {newCalistigiBirim.name}
                              {newCalistigiBirim.series && (
                                <Badge color="primary" pill className="ms-2">
                                  Seri No: {newCalistigiBirim.series}
                                </Badge>
                              )}
                            </p>
                          </div>
                          <Badge color="success" pill>
                            SEÇİLDİ
                          </Badge>
                        </div>
                      </Alert>
                    )}

                    <Row className="mb-3">
                      <Col md={6}>
                        <FormGroup>
                          <Label for="endDate" className="fw-bold">
                            Değişiklik Tarihi
                            <Badge color="danger" pill className="ms-2">
                              Zorunlu
                            </Badge>
                          </Label>
                          <InputGroup>
                            <InputGroupText>
                              <i className="fas fa-calendar-alt"></i>
                            </InputGroupText>
                            <Input
                              id="endDate"
                              name="endDate"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
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
                      <Col md={6}>
                        <FormGroup>
                          <Label for="detail" className="fw-bold">
                            Gerekçe
                          </Label>
                          <Input
                            id="detail"
                            name="detail"
                            type="text"
                            placeholder="Birim değişikliği gerekçesi (isteğe bağlı)"
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tabId="ikinciBirim">
                {/* İkinci Birim Tab İçeriği */}
                <Row className="mb-4">
                  <Col md={12}>
                    <Card className="border-0 mb-3">
                      <CardBody className="bg-light">
                        <h5 className="mb-3">Mevcut İkinci Birim Bilgileri</h5>
                        <FormGroup className="mb-0">
                          <Label className="text-muted small text-uppercase">
                            İkinci Birim
                          </Label>
                          <div className="d-flex align-items-center">
                            <p className="form-control-plaintext fw-bold mb-0">
                              {personel.ikinciBirimID ? (
                                formatBirimName(personel.ikinciBirimID)
                              ) : (
                                <Badge color="secondary">Belirtilmemiş</Badge>
                              )}
                            </p>
                            {personel.ikinciBirimID && (
                              <Button
                                color="danger"
                                size="sm"
                                className="ms-auto"
                                onClick={handleClearSecondUnit}
                              >
                                <i className="fas fa-trash-alt me-1"></i> İkinci
                                Birimi Sil
                              </Button>
                            )}
                          </div>
                        </FormGroup>
                      </CardBody>
                    </Card>

                    {!personel.ikinciBirimID && (
                      <>
                        <h5 className="mb-3 text-primary">
                          Yeni İkinci Birim Seçimi
                        </h5>

                        <Row className="mb-3">
                          <Col md={6}>
                            <FormGroup>
                              <Label for="selectType2" className="fw-bold">
                                Birim Tipi
                              </Label>
                              <Input
                                id="selectType2"
                                name="select"
                                type="select"
                                className={`form-select ${
                                  errors.birim ? "is-invalid" : ""
                                }`}
                                value={selectValue}
                                onChange={handleTypeChange}
                              >
                                <option key={-1}>Seçiniz</option>
                                {selectedKurum &&
                                  selectedKurum.types.map((type) => (
                                    <option key={type.id}>{type.name}</option>
                                  ))}
                                <option key="optionBirimDisi">
                                  Kurum Dışı
                                </option>
                              </Input>
                              {errors.birim && (
                                <div className="invalid-feedback">
                                  {errors.birim}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="selectBirim2" className="fw-bold">
                                Birim
                              </Label>
                              <Input
                                id="selectBirim2"
                                name="selectBirim"
                                type="select"
                                className="form-select"
                                onChange={handleBirimChange}
                                disabled={birimler.length === 0}
                              >
                                <option key="secim">Seçiniz</option>
                                {birimler.map((birim) => (
                                  <option key={birim._id} value={birim.name}>
                                    {birim.name}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>

                        {/* Kurum dışı birim ID alanı */}
                        {showKurumDisiBirim && (
                          <FormGroup className="mb-3">
                            <Label for="kurumDisiBirimID2" className="fw-bold">
                              Kurum Dışı Birim ID
                              <Badge color="danger" pill className="ms-2">
                                Zorunlu
                              </Badge>
                            </Label>
                            <InputGroup>
                              <InputGroupText>
                                <i className="fas fa-fingerprint"></i>
                              </InputGroupText>
                              <Input
                                id="kurumDisiBirimID2"
                                name="kurumDisiBirimID"
                                placeholder="Birim ID değerini girin"
                                value={kurumDisiBirimID || ""}
                                onChange={(e) =>
                                  setKurumDisiBirimID(e.target.value)
                                }
                                className={
                                  errors.kurumDisiBirimID ? "is-invalid" : ""
                                }
                              />
                            </InputGroup>
                            {errors.kurumDisiBirimID && (
                              <div className="invalid-feedback d-block">
                                {errors.kurumDisiBirimID}
                              </div>
                            )}
                          </FormGroup>
                        )}

                        {/* Seçili ikinci birim bilgisi */}
                        {!showKurumDisiBirim && newCalistigiBirim && (
                          <Alert color="success" className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="alert-heading mb-1">
                                  Seçilen Birim
                                </h6>
                                <p className="mb-0">
                                  {newCalistigiBirim.name}
                                  {newCalistigiBirim.series && (
                                    <Badge
                                      color="primary"
                                      pill
                                      className="ms-2"
                                    >
                                      Seri No: {newCalistigiBirim.series}
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              <Badge color="success" pill>
                                SEÇİLDİ
                              </Badge>
                            </div>
                          </Alert>
                        )}
                      </>
                    )}
                  </Col>
                </Row>
              </TabPane>

              <TabPane tabId="geciciBirim">
                {/* Geçici Birim Tab İçeriği */}
                <Row className="mb-4">
                  <Col md={12}>
                    <Card className="border-0 mb-3">
                      <CardBody className="bg-light">
                        <h5 className="mb-3">Mevcut Geçici Birim Bilgileri</h5>
                        <FormGroup className="mb-0">
                          <Label className="text-muted small text-uppercase">
                            Geçici Birim
                          </Label>
                          <div className="d-flex align-items-center">
                            <p className="form-control-plaintext fw-bold mb-0">
                              {personel.temporaryBirimID ? (
                                formatBirimName(personel.temporaryBirimID)
                              ) : (
                                <Badge color="secondary">Belirtilmemiş</Badge>
                              )}
                            </p>
                            {personel.temporaryBirimID && (
                              <Button
                                color="danger"
                                size="sm"
                                className="ms-auto"
                                onClick={handleClearTemporaryUnit}
                              >
                                <i className="fas fa-trash-alt me-1"></i> Geçici
                                Birimi Sil
                              </Button>
                            )}
                          </div>
                        </FormGroup>
                      </CardBody>
                    </Card>

                    {!personel.temporaryBirimID && (
                      <>
                        <h5 className="mb-3 text-primary">
                          Yeni Geçici Birim Seçimi
                        </h5>

                        <Row className="mb-3">
                          <Col md={6}>
                            <FormGroup>
                              <Label for="selectType3" className="fw-bold">
                                Birim Tipi
                              </Label>
                              <Input
                                id="selectType3"
                                name="select"
                                type="select"
                                className={`form-select ${
                                  errors.birim ? "is-invalid" : ""
                                }`}
                                value={selectValue}
                                onChange={handleTypeChange}
                              >
                                <option key={-1}>Seçiniz</option>
                                {selectedKurum &&
                                  selectedKurum.types.map((type) => (
                                    <option key={type.id}>{type.name}</option>
                                  ))}
                                <option key="optionBirimDisi">
                                  Kurum Dışı
                                </option>
                              </Input>
                              {errors.birim && (
                                <div className="invalid-feedback">
                                  {errors.birim}
                                </div>
                              )}
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
                              <Label for="selectBirim3" className="fw-bold">
                                Birim
                              </Label>
                              <Input
                                id="selectBirim3"
                                name="selectBirim"
                                type="select"
                                className="form-select"
                                onChange={handleBirimChange}
                                disabled={birimler.length === 0}
                              >
                                <option key="secim">Seçiniz</option>
                                {birimler.map((birim) => (
                                  <option key={birim._id} value={birim.name}>
                                    {birim.name}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>

                        {/* Kurum dışı birim ID alanı */}
                        {showKurumDisiBirim && (
                          <FormGroup className="mb-3">
                            <Label for="kurumDisiBirimID3" className="fw-bold">
                              Kurum Dışı Birim ID
                              <Badge color="danger" pill className="ms-2">
                                Zorunlu
                              </Badge>
                            </Label>
                            <InputGroup>
                              <InputGroupText>
                                <i className="fas fa-fingerprint"></i>
                              </InputGroupText>
                              <Input
                                id="kurumDisiBirimID3"
                                name="kurumDisiBirimID"
                                placeholder="Birim ID değerini girin"
                                value={kurumDisiBirimID || ""}
                                onChange={(e) =>
                                  setKurumDisiBirimID(e.target.value)
                                }
                                className={
                                  errors.kurumDisiBirimID ? "is-invalid" : ""
                                }
                              />
                            </InputGroup>
                            {errors.kurumDisiBirimID && (
                              <div className="invalid-feedback d-block">
                                {errors.kurumDisiBirimID}
                              </div>
                            )}
                          </FormGroup>
                        )}

                        {/* Seçili geçici birim bilgisi */}
                        {!showKurumDisiBirim && newCalistigiBirim && (
                          <Alert color="success" className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="alert-heading mb-1">
                                  Seçilen Birim
                                </h6>
                                <p className="mb-0">
                                  {newCalistigiBirim.name}
                                  {newCalistigiBirim.series && (
                                    <Badge
                                      color="primary"
                                      pill
                                      className="ms-2"
                                    >
                                      Seri No: {newCalistigiBirim.series}
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              <Badge color="success" pill>
                                SEÇİLDİ
                              </Badge>
                            </div>
                          </Alert>
                        )}
                      </>
                    )}
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </Form>
        ) : (
          <Alert color="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Personel bilgileri yüklenemedi.
          </Alert>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color="primary"
          onClick={handleUpdate}
          disabled={updateButtonDisabled || loading}
        >
          {loading ? <Spinner size="sm" /> : "Güncelle"}
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
