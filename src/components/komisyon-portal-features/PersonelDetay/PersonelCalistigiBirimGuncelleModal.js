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
import alertify from "alertifyjs";

export default function PersonelCalistigiBirimGuncelleModal({
  modal,
  toggle,
  personel,
  token,
  selectedKurum,
  refreshPersonel,
}) {
  const [birimSira, setBirimSira] = useState("birinciBirim");
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [newCalistigiBirim, setNewCalistigiBirim] = useState(null);

  const [showKurumDisiBirim, setShowKurumDisiBirim] = useState(false);
  const [kurumDisiBirimID, setKurumDisiBirimID] = useState(null);

  const [selectValue, setSelectValue] = useState(""); // <select>  tip için state

  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [detail, setDetail] = useState(null);

  const [birimler, setBirimler] = useState([]);
  const [tumBirimler, setTumBirimler] = useState([]);

  const handleCancel = () => {
    setBirimler([]);
    setTumBirimler([]);
    setNewCalistigiBirim(null);
    setUpdateButtonDisabled(true);
    setBirimSira("birinciBirim");
    setSelectValue("");
    setShowKurumDisiBirim(false);
    setKurumDisiBirimID(null);
    toggle();
  };

  const handleClosed = () => {
    setBirimler([]);
    setTumBirimler([]);
    setNewCalistigiBirim(null);
    setUpdateButtonDisabled(true);
    setBirimSira("birinciBirim");
    setShowKurumDisiBirim(false);
    setKurumDisiBirimID(null);
    setSelectValue("");
  };

  useEffect(() => {
    if (selectedKurum) {
      if (tumBirimler.length === 0) {
        getBirimler(selectedKurum.id);
      }
    }
  });

  function handleTypeChange(event) {
    setSelectValue(event.target.value);
    if (event.target.value === "Seçiniz") {
      return;
    }
    if (event.target.value === "Kurum Dışı") {
      setBirimler([{ _id: "kurumdisi", name: "Kurum Dışı" }]);
      return;
    }

    let typeId = selectedKurum.types.find(
      (type) => type.name === event.target.value
    ).id;
    setBirimler(
      tumBirimler.filter((birim) => birim.unitType.institutionTypeId === typeId)
    );
  }

  function getBirimler(typeID) {
    const configuration = {
      method: "GET",
      url: "api/units/institution/" + typeID,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((result) => {
        result.data.unitList.sort((a, b) => {
          if (a.unitType.oncelikSirasi !== b.unitType.oncelikSirasi) {
            return a.unitType.oncelikSirasi - b.unitType.oncelikSirasi;
          }
          return a.series - b.series;
        });
        setTumBirimler(result.data.unitList);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleBirimChange(event) {
    if (event.target.value === "Seçiniz") {
      return;
    }
    if (event.target.value === "Kurum Dışı") {
      setShowKurumDisiBirim(true);
      setUpdateButtonDisabled(false);
      return;
    }
    setShowKurumDisiBirim(false);
    let selectedBirim = birimler.find(
      (birim) => birim.name === event.target.value
    );
    setNewCalistigiBirim(selectedBirim);
    setUpdateButtonDisabled(false);
  }

  const handleUpdate = () => {
    if (!newCalistigiBirim && !showKurumDisiBirim) {
      alertify.error("Yeni çalışacağı birim seçiniz.");
      return;
    }

    if (!showKurumDisiBirim && newCalistigiBirim._id === personel.birimID._id) {
      alertify.error("Çalıştığı birim aynı olduğu için güncelleme yapılamaz.");
      return;
    }

    if (
      birimSira === "ikinciBirim" &&
      personel.ikinciBirimID &&
      newCalistigiBirim._id === personel.ikinciBirimID._id
    ) {
      alertify.error("Çalıştığı birim aynı olduğu için güncelleme yapılamaz.");
      return;
    }

    if (
      birimSira === "geciciBirim" &&
      showKurumDisiBirim &&
      (kurumDisiBirimID === null || kurumDisiBirimID === "")
    ) {
      alertify.error("Kurum dışı birim id giriniz.");
      return;
    }

    if (birimSira === "birinciBirim") {
      const configuration = {
        method: "POST",
        url: "api/personunits/changeUnit",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          personID: personel._id,
          unitID: personel.birimID._id,
          endDate: endDate,
          detail: detail,
          newUnitID: "",
        },
      };

      if (kurumDisiBirimID) {
        configuration.data.newUnitID = kurumDisiBirimID;
      } else {
        configuration.data.newUnitID = newCalistigiBirim._id;
      }

      axios(configuration)
        .then((result) => {
          alertify.success("Çalıştığı birim bilgisi güncellendi.");
          refreshPersonel();
          toggle();
        })
        .catch((error) => {
          console.log(error);
          alertify.error("Çalıştığı birim bilgisi güncellenemedi.");
        });
    } else {
      const configuration = {
        method: "PUT",
        url: "api/persons/" + personel._id,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (birimSira === "ikinciBirim") {
        configuration.data = {
          ikinciBirimID: newCalistigiBirim._id,
        };
      } else {
        if (kurumDisiBirimID) {
          configuration.data = {
            temporaryBirimID: kurumDisiBirimID,
          };
        } else {
          configuration.data = {
            temporaryBirimID: newCalistigiBirim._id,
          };
        }
      }

      axios(configuration)
        .then((response) => {
          refreshPersonel();
          alertify.success("Çalıştığı birim bilgisi güncellendi.");
          toggle();
        })
        .catch((error) => {
          
          alertify.error("Çalıştığı birim bilgisi güncellenemedi.");
        });
    }
  };

  const handleClearSecondUnit = () => {
    const configuration = {
      method: "PUT",
      url: "api/persons/" + personel._id,
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
        alertify.success("İkinci birim bilgisi silindi.");
        toggle();
      })
      .catch((error) => {
        alertify.error("İkinci birim bilgisi silinemedi.");
      });
  };

  const handleClearTemporaryUnit = () => {
    const configuration = {
      method: "PUT",
      url: "api/persons/" + personel._id,
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
        alertify.success("Geçici birim bilgisi silindi.");
        toggle();
      })
      .catch((error) => {
        alertify.error("Geçici birim bilgisi silinemedi.");
      });
  };

  const handleRadioChange = (e) => {
    setBirimler([]);
    setTumBirimler([]);
    setNewCalistigiBirim(null);
    setUpdateButtonDisabled(true);
    setShowKurumDisiBirim(false);
    setKurumDisiBirimID(null);
    setSelectValue(""); // <select> değerini sıfırla
    setBirimSira(e.target.value);
  };

  return (
    <Modal isOpen={modal} toggle={toggle} onClosed={handleClosed}>
      <ModalHeader toggle={toggle}>Çalıştığı Birimi Güncelle</ModalHeader>
      <ModalBody>
        <Form>
          {/*  eğer personel yazıişleri müdürü ise 2 tane birimi olabiliyor,  */}
          {personel &&
            (personel.kind === "yaziislerimudürü" ||
              personel.kind === "mubasir" ||
              personel.isTemporary) && (
              <FormGroup>
                <Label for="birimSira">
                  Hangi Birimi Güncellemek İstiyorsunuz{" "}
                </Label>
                <br />
                {/* radiobutton birinci birim ve ikinci birim diye seçilecek  */}
                <Input
                  className="mr-2"
                  type="radio"
                  name="birimSira"
                  value="birinciBirim"
                  id="birinciBirim"
                  checked={birimSira === "birinciBirim"}
                  onChange={(e) => handleRadioChange(e)}
                />
                <Label for="birinciBirim">Birinci Birim</Label>
                <Input
                  className="mr-2"
                  type="radio"
                  name="birimSira"
                  value="ikinciBirim"
                  id="ikinciBirim"
                  checked={birimSira === "ikinciBirim"}
                  onChange={(e) => handleRadioChange(e)}
                  hidden={
                    personel.kind === "yaziislerimudürü" ||
                    personel.kind === "mubasir"
                      ? false
                      : true
                  }
                />
                <Label
                  for="ikinciBirim"
                  hidden={
                    personel.kind === "yaziislerimudürü" ||
                    personel.kind === "mubasir"
                      ? false
                      : true
                  }
                >
                  İkinci Birim
                </Label>

                <Input
                  className="mr-2"
                  type="radio"
                  name="birimSira"
                  value="geciciBirim"
                  id="geciciBirim"
                  checked={birimSira === "geciciBirim"}
                  onChange={(e) => handleRadioChange(e)}
                  hidden={personel.isTemporary ? false : true}
                />
                <Label
                  for="geciciBirim"
                  hidden={personel.isTemporary ? false : true}
                >
                  Geçici Birim
                </Label>
              </FormGroup>
            )}

          {personel && (
            <div>
              <FormGroup>
                {/* BİRİNCİ BİRİM */}
                <Label
                  for="calistigiBirim"
                  hidden={birimSira !== "birinciBirim"}
                >
                  Birinci Birim
                </Label>
                <Input
                  id="calistigiBirim"
                  type="text"
                  hidden={birimSira !== "birinciBirim"}
                  value={personel.birimID.name}
                  disabled
                />

                <Label for="digerBirim" hidden={birimSira === "birinciBirim"}>
                  {birimSira === "ikinciBirim"
                    ? "İkinci Birim"
                    : "Geçici Birim"}
                </Label>
                <Input
                  id="digerBirim"
                  type="text"
                  hidden={birimSira === "birinciBirim"}
                  value={
                    birimSira === "ikinciBirim"
                      ? personel.ikinciBirimID
                        ? personel.ikinciBirimID.name
                        : "BELİRTİLMEMİŞ"
                      : (personel.temporaryBirimID &&
                          personel.temporaryBirimID.name) ||
                        "BELİRTİLMEMİŞ"
                  }
                  disabled
                />
              </FormGroup>
              <FormGroup
                hidden={
                  birimSira === "ikinciBirim" || birimSira === "geciciBirim"
                }
              >
                <Label for="calistigiBirimBaslangicTarihi">
                  Birim Başlangıç Tarihi
                </Label>
                <Input
                  id="calistigiBirimBaslangicTarihi"
                  type="text"
                  value={new Date(
                    personel.birimeBaslamaTarihi
                  ).toLocaleDateString()}
                  disabled
                />
              </FormGroup>
            </div>
          )}

          <FormGroup>
            <Label for="selectType">Tip</Label>
            <Input
              id="selectType"
              onChange={handleTypeChange}
              name="select"
              value={selectValue} // value'yu state'e bağla
              type="select"
            >
              <option key={-1}>Seçiniz</option>
              {selectedKurum &&
                selectedKurum.types.map((type) => (
                  <option key={type.id}>{type.name}</option>
                ))}
              {/*  eğer geciciBirim seçili ise kurumdışı seceneği ekle*/}
              <option
                key={"optionBirimDisi"}
                // hidden={birimSira !== "geciciBirim"}
              >
                Kurum Dışı
              </option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="selectBirim">Birim</Label>
            <Input
              id="selectBirim"
              onChange={(e) => handleBirimChange(e)}
              name="select"
              type="select"
              multiple
            >
              {birimler.map((birim) => (
                <option key={birim._id} value={birim.name}>
                  {birim.name}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup hidden={showKurumDisiBirim}>
            <Label for="selectedBirim">Yeni Çalışacağı Birim*</Label>
            <Input
              id="selectedBirim"
              type="text"
              value={newCalistigiBirim ? newCalistigiBirim.name : ""}
              disabled
            />
          </FormGroup>

          <FormGroup hidden={!showKurumDisiBirim}>
            <Label for="temporaryBirimID">Kurum Dışı Birim id</Label>
            <Input
              id="temporaryBirimID"
              type="text"
              value={kurumDisiBirimID}
              onChange={(e) => setKurumDisiBirimID(e.target.value)}
            />
          </FormGroup>

          <FormGroup hidden={birimSira !== "birinciBirim"}>
            <Label for="endDate">Değişiklik Tarihi*</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormGroup>

          <FormGroup hidden={birimSira !== "birinciBirim"}>
            <Label for="detail">Gerekçe</Label>
            <Input
              id="detail"
              type="text"
              onChange={(e) => setDetail(e.target.value)}
            />
          </FormGroup>

          <p>* Zorunlu alanlar</p>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleUpdate}
          disabled={updateButtonDisabled}
        >
          Güncelle
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel}>
          İptal
        </Button>
        <Button
          color="danger"
          hidden={birimSira !== "ikinciBirim"}
          onClick={handleClearSecondUnit}
        >
          İkinci Birim Sil
        </Button>
        <Button
          color="danger"
          hidden={birimSira !== "geciciBirim"}
          onClick={handleClearTemporaryUnit}
        >
          Geçici Birim Sil
        </Button>
      </ModalFooter>
    </Modal>
  );
}
