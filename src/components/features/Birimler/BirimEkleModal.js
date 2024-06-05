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
} from "reactstrap";
import axios from "axios";
import { GET_UNIT_TYPES } from "../../constants/AxiosConfiguration";
function BirimEkleModal({ modal, toggle, kurum, token, getBirimler }) {
  const [birim, setBirim] = useState({});
  const [seciliAltBirim, setSeciliAltBirim] = useState(null);

  const [altKurum, setAltKurum] = useState(null);
  const [birimler, setBirimler] = useState([]);
  const [tekilMahkeme, setTekilMahkeme] = useState(false);

  const [mahkemeSayi, setMahkemeSayi] = useState(1);
  const [heyetSayi, setHeyetSayi] = useState("1");
  const [birimName, setBirimName] = useState("");
  const [mahkemeDurum, setMahkemeDurum] = useState(true);
  const [minKatipSayisi, setMinKatipSayisi] = useState(1);

  const handleHeyetRadioChange = (event) => {
    setHeyetSayi(event.target.value);
    birimAdiHesapla();
  };

  const handleRadioChange = (e) => {
    if (e.target.value === "Tek mahkeme") {
      setTekilMahkeme(true);
      setMahkemeSayi(0);
    } else {
      setTekilMahkeme(false);
      setMahkemeSayi(1);
    }
  };

  const birimAdiHesapla = () => {
    if (altKurum && altKurum.id === 0) {
      let birimAdi = "";
      if (mahkemeSayi > 0) {
        if (mahkemeSayi > 0) {
          birimAdi += mahkemeSayi + ". ";
          if (seciliAltBirim) {
            birimAdi += seciliAltBirim.name + " ";
          }
        }
      } else {
        if (seciliAltBirim) {
          birimAdi += seciliAltBirim.name + " ";
        }
      }
      if (heyetSayi === "1/2" || heyetSayi === "1/3") {
        birimAdi += "(1. Heyet)";
      } else if (heyetSayi === "1") {
        // delete last char if it is space
        if (birimAdi.charAt(birimAdi.length - 1) === " ") {
          birimAdi = birimAdi.slice(0, -1);
        }
      }

      birimAdi = birimAdi.replace(/\s+/g, " ");
      setBirimName(birimAdi);
    } else if (altKurum && altKurum.id === 1) {
      let birimAdi = "";
      if (seciliAltBirim) {
        birimAdi += seciliAltBirim.name + " ";
      }
      birimAdi = birimAdi.replace(/\s+/g, " ");
      setBirimName(birimAdi);
    } else {
      setBirimName("");
    }
  };

  useEffect(() => {
    birimAdiHesapla();
  }, [mahkemeSayi, seciliAltBirim, heyetSayi, altKurum]);

  function handleKurumTypeSelectInputChange(e) {
    if (e.target.value === "Alt Kurum Seçiniz") {
      setAltKurum(null);
      return;
    }
    let seciliKurum = kurum.types.find((type) => type.name === e.target.value);
    setAltKurum(seciliKurum);
    setBirimName("");
    axios(GET_UNIT_TYPES(seciliKurum.id))
      .then((result) => {
        setBirimler(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleBirimSelectInputChange(e) {
    if (e.target.value === "Birim Seçiniz") {
      setSeciliAltBirim(null);
      return;
    }
    let seciliAltBirim = birimler.find(
      (birim) => birim.name === e.target.value
    );
    setMinKatipSayisi(seciliAltBirim.gerekenKatipSayisi || 1);
    setSeciliAltBirim(seciliAltBirim);
  }

  function handleAddBirim() {
    // burada yazılan kod şuan çok karışık ve anlaşılmaz durumda vakit kısıtlı olduğu için şimdilik ellemiyorum.
    setBirim({
      ...birim,
      kurumID: kurum.id,
      kurumName: kurum.name,
      birimTurID: altKurum ? altKurum.id : null,
      birimTurName: altKurum ? altKurum.name : null,
      altBirimID: seciliAltBirim ? seciliAltBirim.id : null,
      altBirimName: seciliAltBirim ? seciliAltBirim.name : null,
      name: birimName,
      mahkemeDurum: mahkemeDurum,
      heyetDurum: heyetSayi,
      mahkemeSayi: mahkemeSayi,
      minKatipSayisi: minKatipSayisi,
    });
    const configuration = {
      method: "POST",
      url: "api/units",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        unitTypeID: seciliAltBirim ? seciliAltBirim.id : null,
        institutionID: kurum.id,
        delegationType: heyetSayi,
        status: mahkemeDurum,
        series: mahkemeSayi,
        minClertCount: minKatipSayisi,
        name: birimName,
      },
    };
    axios(configuration)
      .then((result) => {
        toggle();
        alert("Birim başarıyla eklendi");
        getBirimler();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        {kurum && (
          <ModalHeader toggle={toggle}>{kurum.name} - Birim Ekleme</ModalHeader>
        )}
        <ModalBody>
          {kurum && (
            <Form>
              {/* <div>
                <Label>
                  Kurum ID: {kurum.id} - Kurum Adı: {kurum.name} <br />
                </Label>
              </div>
              <div>
                {altKurum && (
                  <Label>
                    Alt Kurum ID: {altKurum.id} - Alt Kurum Adı: {altKurum.name}
                  </Label>
                )}
              </div> */}

              {/* <hr /> */}

              <FormGroup>
                <Label for="kurumTypeSelect">Birim Türü </Label>
                <Input
                  onChange={(e) => {
                    handleKurumTypeSelectInputChange(e);
                  }}
                  id="kurumTypeSelect"
                  name="select"
                  type="select"
                >
                  <option>Alt Kurum Seçiniz</option>
                  {kurum.types.map((type) => (
                    <option key={type.id}>{type.name}</option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup
              // hidden={!(altKurum && (altKurum.id === 1 || altKurum.id === 0))}
              >
                <Label for="birimSelect">Alt Birim </Label>
                <Input
                  onChange={(e) => {
                    handleBirimSelectInputChange(e);
                    birimAdiHesapla();
                  }}
                  id="birimSelect"
                  name="select"
                  type="select"
                >
                  <option>Birim Seçiniz</option>
                  {birimler.map((birim) => (
                    <option key={birim.id}>{birim.name}</option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup check hidden={!(altKurum && altKurum.id === 0)}>
                <Input
                  onClick={(e) => {
                    handleRadioChange(e);
                  }}
                  value="Tek mahkeme"
                  name="radio2"
                  type="radio"
                />{" "}
                <Label check>Tek mahkeme</Label>
              </FormGroup>
              <FormGroup check hidden={!(altKurum && altKurum.id === 0)}>
                <Input
                  onClick={(e) => {
                    handleRadioChange(e);
                  }}
                  value="Çoklu mahkeme"
                  name="radio2"
                  type="radio"
                  defaultChecked
                />{" "}
                <Label check>Çoklu mahkeme</Label>
              </FormGroup>

              <FormGroup hidden={!(altKurum && altKurum.id === 0)}>
                <Label for="mahkemeSayi">Mahkeme Sayı</Label>
                <Input
                  type="number"
                  name="mahkemeSayi"
                  id="mahkemeSayi"
                  placeholder="Mahkeme Sayı"
                  disabled={tekilMahkeme}
                  value={mahkemeSayi}
                  min={1}
                  onChange={(e) => {
                    setMahkemeSayi(parseInt(e.target.value, 10));
                    birimAdiHesapla();
                  }}
                />
              </FormGroup>

              <FormGroup hidden={!(altKurum && altKurum.id === 0)}>
                <Label for="mahkemeHeyet">Heyet Sayısı</Label>
                <div>
                  <Input
                    type="radio"
                    value="1"
                    name="heyet"
                    checked={heyetSayi === "1"}
                    onChange={handleHeyetRadioChange}
                  />
                  <Label>1</Label>
                </div>
                <div>
                  <Input
                    type="radio"
                    value="1/2"
                    name="heyet"
                    checked={heyetSayi === "1/2"}
                    onChange={handleHeyetRadioChange}
                  />
                  <Label>1/2</Label>
                </div>
                <div>
                  <Input
                    type="radio"
                    value="1/3"
                    name="heyet"
                    checked={heyetSayi === "1/3"}
                    onChange={handleHeyetRadioChange}
                  />
                  <Label>1/3</Label>
                </div>
              </FormGroup>

              <FormGroup switch hidden={!(altKurum && altKurum.id === 0)}>
                <Input
                  type="switch"
                  checked={mahkemeDurum}
                  onClick={() => {
                    setMahkemeDurum(!mahkemeDurum);
                  }}
                />
                <Label check>
                  {mahkemeDurum ? "Mahkeme İşletimde" : "Mahkeme Kapalı"}
                </Label>
              </FormGroup>

              <FormGroup hidden={!(altKurum && altKurum.id === 0)}>
                <Label for="minKatipSayi">Gerekli Katip Sayısı</Label>
                <Input
                  type="number"
                  name="minKatipSayi"
                  id="minKatipSayi"
                  placeholder="Katip sayısı"
                  value={minKatipSayisi}
                  min={1}
                  onChange={(e) =>
                    setMinKatipSayisi(parseInt(e.target.value, 10))
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label for="birimAdi">Birim Adı</Label>
                <Input
                  type="text"
                  name="birimAdi"
                  id="birimAdi"
                  placeholder="Birim Adı"
                  value={birimName}
                  onChange={(e) => setBirimName(e.target.value)}
                />
              </FormGroup>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddBirim}>
            Kaydet
          </Button>{" "}
          <Button color="danger" onClick={toggle}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default BirimEkleModal;
