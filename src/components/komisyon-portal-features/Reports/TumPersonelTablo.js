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
} from "reactstrap";
import { renderDate_GGAA } from "../../actions/TimeActions";
import alertify from "alertifyjs";

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

  useEffect(() => {
    if (selectedKurum) {
      getKontrolEdilecekBirimler(selectedUnitType);
    }
    if (tableResults.length !== 0) {
      setSelectedUnitType(tableType);
      getKontrolEdilecekBirimler(tableType);
      setMahkemeTablo(tableResults);
    }
    // eslint-disable-next-line
  }, [selectedKurum]);

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

  const birimTipStyle = {
    fontWeight: "bold",

    color: "red",
    //backgroundColor: "lightgray",

    // centering the text
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const divBirimNameStyle = {
    fontWeight: "bold",
    color: "black",
    //backgroundColor: "lightgray",
    // centering the text
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const [hoveredPersonelId, setHoveredPersonelId] = useState(null);

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
          <Badge color="secondary" className="ms-2" key="unvan">
            {personel.title.name}
          </Badge>
        );
      }

      if (personel.durusmaKatibiMi) {
        badges.push(
          <Badge color="warning" className="ms-2" key="durusma">
            Duruşma
          </Badge>
        );
      }
      if (personel.isTemporary) {
        badges.push(
          <Badge color="danger" className="ms-2" key="gecici">
            Geçici
          </Badge>
        );
      }
      if (personel.level) {
        badges.push(
          <Badge color="secondary" className="ms-2" key="seviye">
            Svy. {personel.level}
          </Badge>
        );
      }
      if (personel.description) {
        badges.push(
          <>
            <Badge
              id={`descriptionPopover-${personel._id || personel.id}`}
              color="info"
              className="ms-2"
              key="aciklama"
            >
              {personel.description}
            </Badge>
          </>
        );
      }

      if (personel.izindeMi) {
        // personel.izinleri endDate'e göre sırala en sonuncusunu al

        let lastPersonelIzin = personel.izinler.sort((a, b) => {
          return new Date(b.endDate) - new Date(a.endDate);
        })[0];

        badges.push(
          <Badge color="danger" className="ms-2" key="izin">
            İzinde {renderDate_GGAA(lastPersonelIzin.startDate)} -{" "}
            {renderDate_GGAA(lastPersonelIzin.endDate)}
          </Badge>
        );
      }

      const personelStyle = {
        fontWeight: "normal",
        cursor: "pointer",
        textDecoration: isHovered ? "underline" : "none",
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
                className="ms-2"
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

  const borderDivStyle = {
    border: "1px solid black",
    padding: "5px",
  };

  return (
    <div>
      <h3>Personel Tablosu</h3>
      <span>
        Bu rapor ile birlikte seçilen kurumun tüm personelleri tablo halinde
        listelenmektedir.
        <br /> Yüklenecek veri miktarına göre işlem{" "}
        <b> biraz zaman alabilir.</b>
      </span>
      <div>
        <FormGroup>
          <Label for="radioCeza">Birim Alan: </Label>{" "}
          <Input
            className="ms-2"
            type="radio"
            name="radio"
            id="radioCeza"
            value="Ceza"
            checked={selectedUnitType === "Ceza"}
            onChange={handleRadioFilterChange}
          />
          <Label for="radioCeza">Ceza</Label>{" "}
          <Input
            className="ms-2"
            type="radio"
            name="radio"
            id="radioHukuk"
            value="Hukuk"
            checked={selectedUnitType === "Hukuk"}
            onChange={handleRadioFilterChange}
          />
          <Label for="radioHukuk">Hukuk</Label>
          <Input
            className="ms-2"
            type="radio"
            name="radio"
            id="radioDiger"
            value="Diger"
            checked={selectedUnitType === "Diger"}
            onChange={handleRadioFilterChange}
          />
          <Label for="radioDiger">Diğer</Label>
        </FormGroup>
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
          >
            {kontrolEdilecekBirimTipi.map((birimTip) => (
              <option key={birimTip.id} value={birimTip.id}>
                {birimTip.name}
              </option>
            ))}
          </Input>
        </FormGroup>

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
          >
            {kontrolEdilecekBirimler.map((birim) => (
              <option key={birim.id} value={birim.id}>
                {birim.name}
              </option>
            ))}
          </Input>
        </FormGroup>

        <Button
          color="danger"
          disabled={kontrolEdilecekBirimler.length === 0}
          className="m-3"
          size="lg"
          id="getPersonelTablo"
          onClick={(e) => getPersonelTablo(e)}
          style={{ width: "100%" }}
        >
          Rapor Getir
        </Button>

        <div>
          {raporGetiriliyorMu && (
            <div className="m-5">
              <Spinner color="danger" />
              <span className="m-2">
                Rapor yükleniyor, bu işlem biraz zaman alabilir.
              </span>
            </div>
          )}
        </div>

        <div hidden={raporGetiriliyorMu || mahkemeTablo.length === 0}>
          {kontrolEdilecekBirimTipi.length > 0 &&
            kontrolEdilecekBirimTipi.map((birimTip) => (
              <div key={birimTip.unitTypeID} className="mt-5  ">
                <h2 style={birimTipStyle}>{birimTip.tabloHeaderName}</h2>
                <Row xs="4" className="equal-height">
                  {mahkemeTablo.length > 0 &&
                    mahkemeTablo
                      .filter((birim) => birim.unitTypeID === birimTip.id)
                      .map((birim) => (
                        <Col key={birim.unitID} className="mt-2 col ">
                          <div style={borderDivStyle} className="bg-light">
                            <div style={divBirimNameStyle} id="birimName">
                              <h4 className="text-center">{birim.name}</h4>
                            </div>

                            <div
                              className="text-center"
                              id="baskan"
                              hidden={!birimTip.baskanGerekliMi}
                            >
                              <h5>Mahkeme Başkanı</h5>
                              {birim.persons &&
                                renderPersonelWithKind(birim.persons, "baskan")}
                            </div>

                            <div
                              className="text-center"
                              id="uyehakim"
                              hidden={!birimTip.uyeHakimGerekliMi}
                            >
                              <h5>Üye Hakimler </h5>
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
                              <h5>Hakim </h5>
                              {birim.persons &&
                                renderPersonelWithKind(birim.persons, "hakim")}
                            </div>

                            <div className="text-center" id="yaziislerimudürü">
                              <h5>Yazı İşleri Müdürü</h5>
                              {birim.persons &&
                                renderPersonelWithKind(
                                  birim.persons,
                                  "yaziislerimudürü"
                                )}
                            </div>

                            <div className="text-center" id="mubasir">
                              <h5>Mübaşir</h5>
                              {birim.persons &&
                                renderPersonelWithKind(
                                  birim.persons,
                                  "mubasir"
                                )}
                            </div>

                            <div className="text-center" id="zabitkatibi">
                              <h5>Zabıt Katipleri</h5>
                              {birim.persons &&
                                renderPersonelWithKind(
                                  birim.persons,
                                  "zabitkatibi"
                                )}
                            </div>

                            <div className="text-center" id="diger">
                              <h5>Diğer Personel</h5>
                              {birim.persons &&
                                renderPersonelWithKind(birim.persons, "other")}
                            </div>
                          </div>
                        </Col>
                      ))}
                </Row>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
