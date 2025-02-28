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
  Card,
  CardBody,
  CardHeader,
  FormFeedback,
  Row,
  Col,
  Spinner,
  FormText,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

function BirimEkleModal({ modal, toggle, kurum, token, getBirimler }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Birim bilgileri
  const [birimType, setBirimType] = useState(null);
  const [unitTypes, setUnitTypes] = useState([]);
  const [selectedUnitType, setSelectedUnitType] = useState(null);

  // Mahkeme özellikleri
  const [isSingleCourt, setIsSingleCourt] = useState(false);
  const [courtNumber, setCourtNumber] = useState(1);
  const [delegationType, setDelegationType] = useState("1");
  const [birimName, setBirimName] = useState("");
  const [status, setStatus] = useState(true);
  const [minClerkCount, setMinClerkCount] = useState(1);

  // Birim Adı hesaplama
  const calculateBirimName = () => {
    if (!birimType || !selectedUnitType) return;

    if (birimType.id === 0) {
      // Mahkeme
      let name = "";

      if (!isSingleCourt && courtNumber > 0) {
        name += `${courtNumber}. `;
      }

      if (selectedUnitType) {
        name += `${selectedUnitType.name} `;
      }

      if (delegationType === "1/2" || delegationType === "1/3") {
        name += "(1. Heyet)";
      } else if (name.charAt(name.length - 1) === " ") {
        name = name.slice(0, -1);
      }

      setBirimName(name.trim());
    } else if (birimType.id === 1) {
      // Savcılık
      if (selectedUnitType) {
        setBirimName(selectedUnitType.name);
      }
    }
  };

  // Birim türü değişince alt birim tiplerini yükle
  const handleBirimTypeChange = (e) => {
    const typeName = e.target.value;
    if (typeName === "") {
      setBirimType(null);
      setUnitTypes([]);
      return;
    }

    const selected = kurum.types.find((type) => type.name === typeName);
    setBirimType(selected);

    // Reset form fields
    setSelectedUnitType(null);
    setBirimName("");
    setIsSingleCourt(false);
    setCourtNumber(1);
    setDelegationType("1");
    setStatus(true);

    // Alt birim tiplerini getir
    setLoading(true);
    axios({
      method: "GET",
      url: `/api/unit_types?institutionTypeId=${selected.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        setUnitTypes(result.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        alertify.error("Birim tipleri yüklenirken bir hata oluştu");
        setLoading(false);
      });
  };

  // Alt birim tipi seçildiğinde
  const handleUnitTypeChange = (e) => {
    const typeName = e.target.value;
    if (typeName === "") {
      setSelectedUnitType(null);
      return;
    }

    const selected = unitTypes.find((type) => type.name === typeName);
    setSelectedUnitType(selected);
    setMinClerkCount(selected.gerekenKatipSayisi || 1);
  };

  // Court Type (Tek/Çoklu) değişimini handle et
  const handleCourtTypeChange = (e) => {
    setIsSingleCourt(e.target.value === "single");
    if (e.target.value === "single") {
      setCourtNumber(0);
    } else {
      setCourtNumber(1);
    }
  };

  // Validasyon
  const validateForm = () => {
    const newErrors = {};

    if (!birimType) newErrors.birimType = "Birim türü seçilmelidir";
    if (!selectedUnitType) newErrors.unitType = "Alt birim seçilmelidir";
    if (!birimName) newErrors.birimName = "Birim adı boş olamaz";
    if (minClerkCount < 1) newErrors.minClerkCount = "En az 1 katip gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleAddBirim = () => {
    if (!validateForm()) {
      alertify.error("Lütfen tüm alanları doğru şekilde doldurunuz.");
      return;
    }

    setLoading(true);

    const birimData = {
      unitTypeID: selectedUnitType.id,
      institutionID: kurum.id,
      delegationType: delegationType,
      status: status,
      series: courtNumber,
      minClertCount: minClerkCount,
      name: birimName,
    };

    axios({
      method: "POST",
      url: "/api/units",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: birimData,
    })
      .then(() => {
        alertify.success("Birim başarıyla eklendi");
        toggle();
        getBirimler(kurum);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        alertify.error(
          error.response?.data?.message || "Birim eklenirken bir hata oluştu"
        );
        setLoading(false);
      });
  };

  // Birim adı hesaplama efekti
  useEffect(() => {
    calculateBirimName();
    // eslint-disable-next-line
  }, [birimType, selectedUnitType, isSingleCourt, courtNumber, delegationType]);

  return (
    <Modal isOpen={modal} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle} className="bg-primary text-white">
        <i className="fas fa-plus-circle me-2"></i>
        Yeni Birim Ekle - {kurum?.name}
      </ModalHeader>

      <ModalBody className="bg-light">
        {!kurum ? (
          <Alert color="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Kurum bilgisi bulunamadı. Lütfen önce bir kurum seçiniz.
          </Alert>
        ) : (
          <Form>
            <Card className="shadow-sm mb-4">
              <CardHeader className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-sitemap me-2 text-primary"></i>
                  Temel Birim Bilgileri
                </h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="birimType" className="fw-bold">
                        <i className="fas fa-layer-group me-1 text-primary"></i>
                        Birim Türü*
                      </Label>
                      <Input
                        id="birimType"
                        name="birimType"
                        type="select"
                        onChange={handleBirimTypeChange}
                        invalid={!!errors.birimType}
                        className={birimType ? "border-primary" : ""}
                      >
                        <option value="">Birim Türü Seçiniz</option>
                        {kurum.types.map((type) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </Input>
                      <FormFeedback>{errors.birimType}</FormFeedback>
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    <FormGroup>
                      <Label for="unitType" className="fw-bold">
                        <i className="fas fa-tag me-1 text-primary"></i>
                        Alt Birim Türü*
                      </Label>
                      <Input
                        id="unitType"
                        name="unitType"
                        type="select"
                        onChange={handleUnitTypeChange}
                        disabled={!birimType || loading}
                        invalid={!!errors.unitType}
                        className={selectedUnitType ? "border-primary" : ""}
                      >
                        <option value="">Alt Birim Türü Seçiniz</option>
                        {unitTypes.map((type) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </Input>
                      <FormFeedback>{errors.unitType}</FormFeedback>
                      {loading && !unitTypes.length && (
                        <FormText>
                          <Spinner size="sm" color="primary" className="me-1" />
                          Alt birimler yükleniyor...
                        </FormText>
                      )}
                    </FormGroup>
                  </Col>
                </Row>

                {birimType && selectedUnitType && (
                  <Alert color="info" className="mt-2">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>{selectedUnitType.name}</strong> türünde yeni bir
                    birim oluşturuyorsunuz.
                    {selectedUnitType.description && (
                      <p className="mb-0 mt-1 small">
                        {selectedUnitType.description}
                      </p>
                    )}
                  </Alert>
                )}
              </CardBody>
            </Card>

            {birimType?.id === 0 && (
              <Card className="shadow-sm mb-4">
                <CardHeader className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="fas fa-gavel me-2 text-primary"></i>
                      Mahkeme Özellikleri
                    </h5>
                    <Badge color="danger" pill className="px-3 py-2">
                      Mahkeme
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row className="mb-3">
                    <Col md={6}>
                      <FormGroup>
                        <Label className="fw-bold">Mahkeme Türü</Label>
                        <div>
                          <FormGroup check inline>
                            <Input
                              id="multiCourt"
                              type="radio"
                              name="courtType"
                              value="multi"
                              checked={!isSingleCourt}
                              onChange={handleCourtTypeChange}
                            />
                            <Label check for="multiCourt">
                              <Badge color="info" className="me-1">
                                Çoklu Mahkeme
                              </Badge>
                            </Label>
                          </FormGroup>
                          <FormGroup check inline>
                            <Input
                              id="singleCourt"
                              type="radio"
                              name="courtType"
                              value="single"
                              checked={isSingleCourt}
                              onChange={handleCourtTypeChange}
                            />
                            <Label check for="singleCourt">
                              <Badge color="secondary" className="me-1">
                                Tek Mahkeme
                              </Badge>
                            </Label>
                          </FormGroup>
                        </div>
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="courtNumber" className="fw-bold">
                          <i className="fas fa-sort-numeric-up me-1 text-primary"></i>
                          Mahkeme Sırası
                        </Label>
                        <Input
                          type="number"
                          id="courtNumber"
                          name="courtNumber"
                          placeholder="Mahkeme sıra numarası"
                          value={courtNumber}
                          disabled={isSingleCourt}
                          min={1}
                          onChange={(e) =>
                            setCourtNumber(parseInt(e.target.value, 10) || 0)
                          }
                        />
                        <FormText>
                          {isSingleCourt
                            ? "Tek mahkeme seçildiğinde sıra numarası kullanılmaz"
                            : "Örn: 1. Asliye Ceza, 5. Ağır Ceza gibi"}
                        </FormText>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label className="fw-bold">Heyet Durumu</Label>
                        <div>
                          <FormGroup check className="mb-2">
                            <Input
                              id="delegation1"
                              type="radio"
                              name="delegation"
                              value="1"
                              checked={delegationType === "1"}
                              onChange={(e) =>
                                setDelegationType(e.target.value)
                              }
                            />
                            <Label check for="delegation1">
                              Tekli Mahkeme
                            </Label>
                            <FormText>Tek hakimli mahkemeler için</FormText>
                          </FormGroup>

                          <FormGroup check className="mb-2">
                            <Input
                              id="delegation12"
                              type="radio"
                              name="delegation"
                              value="1/2"
                              checked={delegationType === "1/2"}
                              onChange={(e) =>
                                setDelegationType(e.target.value)
                              }
                            />
                            <Label check for="delegation12">
                              1/2 Heyet
                            </Label>
                            <FormText>
                              İki hakimli heyetli mahkemeler için
                            </FormText>
                          </FormGroup>

                          <FormGroup check>
                            <Input
                              id="delegation13"
                              type="radio"
                              name="delegation"
                              value="1/3"
                              checked={delegationType === "1/3"}
                              onChange={(e) =>
                                setDelegationType(e.target.value)
                              }
                            />
                            <Label check for="delegation13">
                              1/3 Heyet
                            </Label>
                            <FormText>
                              Üç hakimli heyetli mahkemeler için
                            </FormText>
                          </FormGroup>
                        </div>
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label className="fw-bold d-block mb-2">
                          Mahkeme Durumu
                        </Label>
                        <div className="form-check form-switch">
                          <Input
                            type="switch"
                            id="statusSwitch"
                            name="status"
                            checked={status}
                            onChange={() => setStatus(!status)}
                          />
                          <Label
                            for="statusSwitch"
                            className="form-check-label"
                          >
                            {status ? (
                              <Badge color="success">Aktif</Badge>
                            ) : (
                              <Badge color="danger">Pasif</Badge>
                            )}
                          </Label>
                        </div>
                        <FormText>
                          {status
                            ? "Mahkeme aktif durumdadır ve personel ataması yapılabilir"
                            : "Mahkeme pasif durumdadır, işletimde değildir"}
                        </FormText>
                      </FormGroup>

                      <FormGroup>
                        <Label for="clerkCount" className="fw-bold">
                          <i className="fas fa-users me-1 text-primary"></i>
                          Gerekli Katip Sayısı*
                        </Label>
                        <Input
                          type="number"
                          id="clerkCount"
                          name="clerkCount"
                          value={minClerkCount}
                          min={1}
                          invalid={!!errors.minClerkCount}
                          onChange={(e) =>
                            setMinClerkCount(parseInt(e.target.value, 10) || 0)
                          }
                        />
                        <FormFeedback>{errors.minClerkCount}</FormFeedback>
                        <FormText>
                          Bu birim için gerekli minimum zabıt katibi sayısı
                        </FormText>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            )}

            {birimType?.id !== 0 && birimType && (
              <Card className="shadow-sm mb-4">
                <CardHeader className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i
                        className={`fas ${
                          birimType.id === 1
                            ? "fa-balance-scale"
                            : "fa-building"
                        } me-2 text-primary`}
                      ></i>
                      {birimType.name} Özellikleri
                    </h5>
                    <Badge
                      color={birimType.id === 1 ? "warning" : "info"}
                      pill
                      className="px-3 py-2"
                    >
                      {birimType.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label className="fw-bold d-block mb-2">
                          Birim Durumu
                        </Label>
                        <div className="form-check form-switch">
                          <Input
                            type="switch"
                            id="statusSwitch"
                            name="status"
                            checked={status}
                            onChange={() => setStatus(!status)}
                          />
                          <Label
                            for="statusSwitch"
                            className="form-check-label"
                          >
                            {status ? (
                              <Badge color="success">Aktif</Badge>
                            ) : (
                              <Badge color="danger">Pasif</Badge>
                            )}
                          </Label>
                        </div>
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup>
                        <Label for="clerkCount" className="fw-bold">
                          <i className="fas fa-users me-1 text-primary"></i>
                          Gerekli Personel Sayısı*
                        </Label>
                        <Input
                          type="number"
                          id="clerkCount"
                          name="clerkCount"
                          value={minClerkCount}
                          min={1}
                          invalid={!!errors.minClerkCount}
                          onChange={(e) =>
                            setMinClerkCount(parseInt(e.target.value, 10) || 0)
                          }
                        />
                        <FormFeedback>{errors.minClerkCount}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            )}

            <Card className="shadow-sm">
              <CardHeader className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-file-signature me-2 text-primary"></i>
                  Birim Adı
                </h5>
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <Label for="birimName" className="fw-bold">
                    <i className="fas fa-tag me-1 text-primary"></i>
                    Birim Adı*
                  </Label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="birimName"
                      name="birimName"
                      placeholder="Birim adını giriniz"
                      value={birimName}
                      onChange={(e) => setBirimName(e.target.value)}
                      invalid={!!errors.birimName}
                    />
                    {birimType && (
                      <InputGroupText>
                        <Badge
                          color={
                            birimType.id === 0
                              ? "danger"
                              : birimType.id === 1
                              ? "warning"
                              : "info"
                          }
                        >
                          {birimType.name}
                        </Badge>
                      </InputGroupText>
                    )}
                  </InputGroup>
                  <FormFeedback>{errors.birimName}</FormFeedback>
                  <FormText>
                    Birim adı yukarıdaki seçimlerinize göre otomatik
                    oluşturulur, ancak düzenleyebilirsiniz
                  </FormText>
                </FormGroup>

                {selectedUnitType && (
                  <div className="mt-3 text-center">
                    <h6>Önizleme</h6>
                    <div className="p-3 border rounded bg-white text-center">
                      <Badge
                        color={
                          birimType?.id === 0
                            ? "danger"
                            : birimType?.id === 1
                            ? "warning"
                            : "info"
                        }
                        pill
                        className="mb-2"
                      >
                        {selectedUnitType.name}
                      </Badge>
                      <h5 className="mb-0 fw-bold">
                        {birimName || "Birim adı girilmedi"}
                      </h5>
                      <div className="small text-muted mt-1">
                        {status ? "Aktif Birim" : "Pasif Birim"} •
                        {birimType?.id === 0
                          ? ` ${
                              delegationType === "1" ? "Tekli" : "Heyetli"
                            } Mahkeme • ${minClerkCount} Katip`
                          : ` ${minClerkCount} Personel`}
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Form>
        )}
      </ModalBody>

      <ModalFooter className="bg-light">
        <small className="text-muted me-auto">
          * ile işaretli alanlar zorunludur
        </small>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          <i className="fas fa-times me-1"></i> Vazgeç
        </Button>{" "}
        <Button
          color="primary"
          onClick={handleAddBirim}
          disabled={loading || !kurum}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-1" /> Kaydediliyor...
            </>
          ) : (
            <>
              <i className="fas fa-save me-1"></i> Birimi Ekle
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default BirimEkleModal;
