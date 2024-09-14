import React, { useState, useEffect } from "react";
import axios from "axios";
import { FormGroup, Label, Input, Button, Spinner, Row, Col } from "reactstrap";
import alertify from "alertifyjs";

export default function TumPersonelTablo({ selectedKurum, token }) {
  const [kontrolEdilecekBirimTipi, setKontrolEdilecekBirimTipi] = useState([]);
  const [kontrolEdilecekBirimler, setKontrolEdilecekBirimler] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

  const [mahkemeTablo, setMahkemeTablo] = useState([]);

  const getKontrolEdilecekBirimler = async () => {
    const configuration = {
      method: "GET",
      url:
        "/api/reports/personelTabloKontrolEdilecekBirimler?institutionId=" +
        selectedKurum.id,
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
      url: "/api/reports/personelTablo?institutionId=" + selectedKurum.id,
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

  useEffect(() => {
    if (selectedKurum) {
      getKontrolEdilecekBirimler();
    }
  }, [selectedKurum]);

  const birimTipStyle = {
    fontWeight: "bold",

    //color: "red",
    //backgroundColor: "lightgray",

    // centering the text
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  function renderPersonelWithKind(personelTablo, kind) {
    const filteredPersonel = personelTablo.filter(
      (personel) => personel.title && personel.title.kind === kind
    );

    if (filteredPersonel.length === 0) {
      return <p>Tanımlı kişi bulunamadı</p>;
    }

    return filteredPersonel.map((personel) => (
      <h6 key={personel._id || personel.id}>
        {personel.ad} {personel.soyad}
      </h6>
    ));
  }

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
          disabled={kontrolEdilecekBirimler.length === 0}
          className="m-3"
          size="lg"
          id="getPersonelTablo"
          onClick={(e) => getPersonelTablo(e)}
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

        <div hidden={raporGetiriliyorMu || mahkemeTablo.length==0}>
          {kontrolEdilecekBirimTipi.length > 0 &&
            kontrolEdilecekBirimTipi.map((birimTip) => (
              <div key={birimTip.unitTypeID} className="mt-5 border ">
                <h2 style={birimTipStyle}>{birimTip.tabloHeaderName}</h2>
                <Row xs="4" className="">
                  {mahkemeTablo.length > 0 &&
                    mahkemeTablo
                      .filter((birim) => birim.unitTypeID === birimTip.id)
                      .map((birim) => (
                        <Col key={birim.unitID} className="mt-2">
                          <div className="bg-light border">
                            <div id="birimName">
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
