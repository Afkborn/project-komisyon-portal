import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col,
  Badge,
  Popover,
  PopoverHeader,
  PopoverBody,
  Card,
  CardHeader,
  CardBody,
  Alert,
} from "reactstrap";
import { renderDate_GGAA } from "../../actions/TimeActions";
import alertify from "alertifyjs";
import { generatePdf } from "../../actions/PdfActions";

import "../../../styles/TumPersonelTablo.css";

export default function TumPersonelTablo({
  selectedKurum,
  token,
  showPersonelDetay,
  tableResults,
  tableType,
}) {
  const [kontrolEdilecekBirimTipi, setKontrolEdilecekBirimTipi] = useState([]);
  const [kontrolEdilecekBirimler, setKontrolEdilecekBirimler] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);
  const [selectedUnitType, setSelectedUnitType] = useState("Ceza");
  const [mahkemeTablo, setMahkemeTablo] = useState([]);
  const [hoveredPersonelId, setHoveredPersonelId] = useState(null);
  const [hoveredDescriptionId, setHoveredDescriptionId] = useState(null);

  useEffect(() => {
    if (selectedKurum) {
      getKontrolEdilecekBirimler(selectedUnitType);
    }
    // eslint-disable-next-line
  }, [selectedKurum]);

  // tableResults değiştiğinde mahkemeTablo'yu güncelle
  useEffect(() => {
    if (tableResults && tableResults.length !== 0) {
      setSelectedUnitType(tableType);
      getKontrolEdilecekBirimler(tableType);
      setMahkemeTablo(tableResults);
    }
    // eslint-disable-next-line
  }, [tableResults, tableType]);

  const handleRadioFilterChange = (e) => {
    const newFilterOption = e.target.value;
    setSelectedUnitType(newFilterOption);

    getKontrolEdilecekBirimler(newFilterOption);
  };

  const getKontrolEdilecekBirimler = async (queryUnitType) => {
    setKontrolEdilecekBirimTipi([]);
    setKontrolEdilecekBirimler([]);
    setMahkemeTablo([]);

    const configuration = {
      method: "GET",
      url:
        "/api/reports/personelTabloKontrolEdilecekBirimler?institutionId=" +
        selectedKurum.id +
        "&queryUnitType=" +
        queryUnitType,

      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setKontrolEdilecekBirimTipi(response.data.unitTypeList);
        setKontrolEdilecekBirimler(response.data.unitList);
      })
      .catch((error) => {
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        console.log(error);
      });
  };

  const getPersonelTablo = async () => {
    setRaporGetiriliyorMu(true);
    const configuration = {
      method: "GET",
      url:
        "/api/reports/personelTablo?institutionId=" +
        selectedKurum.id +
        "&queryUnitType=" +
        selectedUnitType,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setRaporGetiriliyorMu(false);
        setMahkemeTablo(response.data.personelTablo);
      })
      .catch((error) => {
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        console.log(error);
      });
  };

  const handleExportPdf = () => {
    if (raporGetiriliyorMu) return;
    if (!mahkemeTablo || mahkemeTablo.length === 0) {
      alertify.error("Önce raporu getiriniz.");
      return;
    }

    const kurumAdi = selectedKurum?.name ? ` - ${selectedKurum.name}` : "";
    const fileName = `Personel Tablosu${kurumAdi} - ${selectedUnitType}`;

    generatePdf(document, "tumPersonelTabloPdf", fileName, null, true);
  };

  // Renk paletini tanımlayalım - modern bir görünüm için
  const colors = {
    primary: "#0d6efd",
    secondary: "#6c757d",
    success: "#198754",
    info: "#0dcaf0",
    warning: "#ffc107",
    danger: "#dc3545",
    light: "#f8f9fa",
    dark: "#212529",
    lightGray: "#f5f5f5",
    borderGray: "#dee2e6",
  };

  // Stiller için yeni tanımlamalar
  const birimTipStyle = {
    fontWeight: "bold",
    color: colors.danger,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",
    margin: "15px 0",
    borderBottom: `2px solid ${colors.danger}`,
    backgroundColor: colors.lightGray,
    borderRadius: "5px",
  };

  const cardStyle = {
    height: "100%",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  };

  const sectionTitleStyle = {
    fontSize: "16px",
    fontWeight: "bold",
    color: colors.dark,
    padding: "5px",
    margin: "10px 0 5px 0",
    borderBottom: `1px dashed ${colors.borderGray}`,
    textTransform: "uppercase",
  };

  // Açıklama metnini kısaltmak için yardımcı fonksiyon
  const truncateText = (text, maxLength = 15) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  function renderPersonelWithKind(personelTablo, kind) {
    let filteredPersonel = personelTablo.filter(
      (personel) => personel.title && personel.title.kind === kind
    );
    if (kind === "other") {
      // başkan,uyehakim,hakim,yaziislerimudürü,mubasir,zabitkatibi dışındakileri yazdır
      filteredPersonel = personelTablo.filter(
        (personel) =>
          personel.title &&
          ![
            "baskan",
            "uyehakim",
            "hakim",
            "yaziislerimudürü",
            "mubasir",
            "zabitkatibi",
          ].includes(personel.title.kind)
      );
    }

    if (filteredPersonel.length === 0) {
      return <p>Tanımlı kişi bulunamadı</p>;
    }

    return filteredPersonel.map((personel) => {
      const isHovered = hoveredPersonelId === (personel._id || personel.id);
      let badges = [];

      if (kind === "other") {
        badges.push(
          <Badge
            color="secondary"
            className="ms-2 rounded-pill"
            key="unvan"
            style={{ fontSize: "0.75rem", padding: "0.35em 0.65em" }}
          >
            {personel.title.name}
          </Badge>
        );
      }

      if (personel.durusmaKatibiMi) {
        badges.push(
          <Badge
            color="warning"
            className="ms-2 rounded-pill"
            key="durusma"
            style={{ fontSize: "0.75rem", padding: "0.35em 0.65em" }}
          >
            Duruşma
          </Badge>
        );
      }

      if (personel.isTemporary) {
        badges.push(
          <Badge
            color="danger"
            className="ms-2 rounded-pill"
            key="gecici"
            style={{ fontSize: "0.75rem", padding: "0.35em 0.65em" }}
          >
            Geçici
          </Badge>
        );
      }

      if (personel.level) {
        badges.push(
          <Badge
            color="secondary"
            className="ms-2 rounded-pill"
            key="seviye"
            style={{ fontSize: "0.75rem", padding: "0.35em 0.65em" }}
          >
            Svy. {personel.level}
          </Badge>
        );
      }

      if (personel.description) {
        const descriptionPopoverId = `descriptionPopover-${
          personel._id || personel.id
        }`;
        const isDescriptionHovered =
          hoveredDescriptionId === descriptionPopoverId;

        badges.push(
          <>
            <Badge
              id={descriptionPopoverId}
              color="info"
              className="ms-2 rounded-pill"
              key="aciklama"
              onMouseEnter={() => setHoveredDescriptionId(descriptionPopoverId)}
              onMouseLeave={() => setHoveredDescriptionId(null)}
              style={{
                cursor: "pointer",
                fontSize: "0.75rem",
                padding: "0.35em 0.65em",
              }}
            >
              {truncateText(personel.description)}
            </Badge>
            <Popover
              placement="right"
              isOpen={isDescriptionHovered}
              target={descriptionPopoverId}
            >
              <PopoverHeader>Açıklama</PopoverHeader>
              <PopoverBody>{personel.description}</PopoverBody>
            </Popover>
          </>
        );
      }

      if (personel.izindeMi) {
        let lastPersonelIzin = personel.izinler.sort((a, b) => {
          return new Date(b.endDate) - new Date(a.endDate);
        })[0];

        badges.push(
          <Badge
            color="danger"
            className="ms-2 rounded-pill"
            key="izin"
            style={{ fontSize: "0.75rem", padding: "0.35em 0.65em" }}
          >
            İzinde {renderDate_GGAA(lastPersonelIzin.startDate)} -{" "}
            {renderDate_GGAA(lastPersonelIzin.endDate)}
          </Badge>
        );
      }

      const personelStyle = {
        fontWeight: "normal",
        cursor: "pointer",
        textDecoration: isHovered ? "underline" : "none",
        padding: "5px 0",
        margin: "0",
        borderBottom: `1px dotted ${colors.borderGray}`,
      };

      return (
        <h6
          style={personelStyle}
          key={personel._id || personel.id}
          onClick={() =>
            showPersonelDetay(personel, mahkemeTablo, selectedUnitType)
          }
          onMouseEnter={() => setHoveredPersonelId(personel._id || personel.id)}
          onMouseLeave={() => setHoveredPersonelId(null)}
          className="personel-item"
        >
          {personel.ad} {personel.soyad}{" "}
          {badges.length < 3 ? (
            // 2 veya daha az rozet varsa yan yana göster
            badges
          ) : (
            // 3 veya daha fazla rozet varsa popover içine yerleştir
            <>
              <Badge
                id={`badgePopover-${personel._id || personel.id}`}
                color="primary"
                className="ms-2 rounded-pill"
                style={{ fontSize: "0.75rem", padding: "0.35em 0.65em" }}
              >
                {badges.length} Rozet
              </Badge>
              {/* Badge yüklendikten sonra popoveru aç */}
              {isHovered && (
                <Popover
                  placement="right"
                  isOpen={isHovered} // Benzersiz hover kontrolü
                  target={`badgePopover-${personel._id || personel.id}`} // Benzersiz ID
                >
                  <PopoverHeader> {personel.ad} rozetleri.</PopoverHeader>
                  <PopoverBody>{badges}</PopoverBody>
                </Popover>
              )}
            </>
          )}
        </h6>
      );
    });
  }

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">Personel Tablosu</h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            Bu rapor ile birlikte seçilen kurumun tüm personelleri tablo halinde
            listelenmektedir.
            <br /> Yüklenecek veri miktarına göre işlem{" "}
            <strong>biraz zaman alabilir.</strong>
          </Alert>

          <Card className="mb-4 border-light">
            <CardBody>
              <FormGroup tag="fieldset" className="mb-3">
                <legend className="col-form-label mb-2">Birim Alan:</legend>
                <div className="d-flex">
                  <div className="me-3">
                    <Input
                      className="me-1"
                      type="radio"
                      name="radio"
                      id="radioCeza"
                      value="Ceza"
                      checked={selectedUnitType === "Ceza"}
                      onChange={handleRadioFilterChange}
                    />
                    <Label for="radioCeza">Ceza</Label>
                  </div>
                  <div className="me-3">
                    <Input
                      className="me-1"
                      type="radio"
                      name="radio"
                      id="radioHukuk"
                      value="Hukuk"
                      checked={selectedUnitType === "Hukuk"}
                      onChange={handleRadioFilterChange}
                    />
                    <Label for="radioHukuk">Hukuk</Label>
                  </div>
                  <div>
                    <Input
                      className="me-1"
                      type="radio"
                      name="radio"
                      id="radioDiger"
                      value="Diger"
                      checked={selectedUnitType === "Diger"}
                      onChange={handleRadioFilterChange}
                    />
                    <Label for="radioDiger">Diğer</Label>
                  </div>
                </div>
              </FormGroup>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="kontrolEdilecekBirimTip">
                      Kontrol Edilecek Birim Tipleri
                    </Label>
                    <Input
                      id="kontrolEdilecekBirimTip"
                      multiple
                      name="selectMulti"
                      type="select"
                      disabled
                      className="form-control-sm"
                    >
                      {kontrolEdilecekBirimTipi.map((birimTip) => (
                        <option key={birimTip.id} value={birimTip.id}>
                          {birimTip.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label for="kontrolEdilecekBirimListesi">
                      Kontrol Edilecek Birim Listesi
                    </Label>
                    <Input
                      id="kontrolEdilecekBirimListesi"
                      multiple
                      name="selectMulti"
                      type="select"
                      disabled
                      className="form-control-sm"
                    >
                      {kontrolEdilecekBirimler.map((birim) => (
                        <option key={birim.id} value={birim.id}>
                          {birim.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Button
                color="danger"
                disabled={kontrolEdilecekBirimler.length === 0}
                className="mt-3"
                size="lg"
                id="getPersonelTablo"
                onClick={(e) => getPersonelTablo(e)}
                style={{ width: "100%" }}
              >
                <i className="fas fa-file-alt me-2"></i> Rapor Getir
              </Button>

              <Button
                color="success"
                className="mt-2"
                size="lg"
                style={{ width: "100%" }}
                disabled={raporGetiriliyorMu || mahkemeTablo.length === 0}
                onClick={handleExportPdf}
              >
                <i className="fas fa-file-pdf me-2"></i> PDF Oluştur
              </Button>
            </CardBody>
          </Card>

          {raporGetiriliyorMu && (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Rapor yükleniyor, bu işlem biraz zaman alabilir...
              </p>
            </div>
          )}

          <div id="tumPersonelTabloPdf" hidden={raporGetiriliyorMu || mahkemeTablo.length === 0}>
            {kontrolEdilecekBirimTipi.length > 0 &&
              kontrolEdilecekBirimTipi.map((birimTip) => (
                <div key={birimTip.unitTypeID} className="mt-5">
                  <h2 style={birimTipStyle}>
                    <i className="fas fa-building me-2"></i>
                    {birimTip.tabloHeaderName}
                  </h2>
                  <Row xs={1} md={2} lg={3} xl={4} className="g-3 equal-height">
                    {mahkemeTablo.length > 0 &&
                      mahkemeTablo
                        .filter((birim) => birim.unitTypeID === birimTip.id)
                        .map((birim) => (
                          <Col key={birim.unitID}>
                            <Card style={cardStyle} className="h-100">
                              <CardHeader className="text-center bg-light">
                                <h4 className="mb-0 birim-title">
                                  {birim.name}
                                </h4>
                              </CardHeader>
                              <CardBody>
                                <div
                                  className="text-center"
                                  id="baskan"
                                  hidden={!birimTip.baskanGerekliMi}
                                >
                                  <h5 style={sectionTitleStyle}>
                                    <i className="fas fa-gavel me-1"></i>{" "}
                                    Mahkeme Başkanı
                                  </h5>
                                  {birim.persons &&
                                    renderPersonelWithKind(
                                      birim.persons,
                                      "baskan"
                                    )}
                                </div>

                                <div
                                  className="text-center"
                                  id="uyehakim"
                                  hidden={!birimTip.uyeHakimGerekliMi}
                                >
                                  <h5 style={sectionTitleStyle}>
                                    <i className="fas fa-balance-scale me-1"></i>{" "}
                                    Üye Hakimler
                                  </h5>
                                  {birim.persons &&
                                    renderPersonelWithKind(
                                      birim.persons,
                                      "uyehakim"
                                    )}
                                </div>

                                <div
                                  className="text-center"
                                  id="hakim"
                                  hidden={!birimTip.hakimGerekliMi}
                                >
                                  <h5 style={sectionTitleStyle}>
                                    <i className="fas fa-balance-scale me-1"></i>{" "}
                                    Hakim
                                  </h5>
                                  {birim.persons &&
                                    renderPersonelWithKind(
                                      birim.persons,
                                      "hakim"
                                    )}
                                </div>

                                <div
                                  className="text-center"
                                  id="yaziislerimudürü"
                                >
                                  <h5 style={sectionTitleStyle}>
                                    <i className="fas fa-user-tie me-1"></i>{" "}
                                    Yazı İşleri Müdürü
                                  </h5>
                                  {birim.persons &&
                                    renderPersonelWithKind(
                                      birim.persons,
                                      "yaziislerimudürü"
                                    )}
                                </div>

                                <div className="text-center" id="mubasir">
                                  <h5 style={sectionTitleStyle}>
                                    <i className="fas fa-bullhorn me-1"></i>{" "}
                                    Mübaşir
                                  </h5>
                                  {birim.persons &&
                                    renderPersonelWithKind(
                                      birim.persons,
                                      "mubasir"
                                    )}
                                </div>

                                <div className="text-center" id="zabitkatibi">
                                  <h5 style={sectionTitleStyle}>
                                    <i className="fas fa-pen me-1"></i> Zabıt
                                    Katipleri
                                  </h5>
                                  {birim.persons &&
                                    renderPersonelWithKind(
                                      birim.persons,
                                      "zabitkatibi"
                                    )}
                                </div>

                                <div className="text-center" id="diger">
                                  <h5 style={sectionTitleStyle}>
                                    <i className="fas fa-users me-1"></i> Diğer
                                    Personel
                                  </h5>
                                  {birim.persons &&
                                    renderPersonelWithKind(
                                      birim.persons,
                                      "other"
                                    )}
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                  </Row>
                </div>
              ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
