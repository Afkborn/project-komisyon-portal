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
    toggle();
  };

  useEffect(() => {
    if (selectedKurum) {
      if (tumBirimler.length === 0) {
        getBirimler(selectedKurum.id);
      }
    }
  });

  function handleTypeChange(event) {
    if (event.target.value === "Seçiniz") {
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
    let selectedBirim = birimler.find(
      (birim) => birim.name === event.target.value
    );
    setNewCalistigiBirim(selectedBirim);
    setUpdateButtonDisabled(false);
  }

  const handleUpdate = () => {
    if (!newCalistigiBirim) {
      alertify.error("Yeni çalışacağı birim seçiniz.");
      return;
    }

    if (newCalistigiBirim._id === personel.birimID._id) {
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
          newUnitID: newCalistigiBirim._id,
        },
      };

      axios(configuration)
        .then((result) => {
          alertify.success("Çalıştığı birim bilgisi güncellendi.");
          refreshPersonel();
          toggle();
        })
        .catch((error) => {
          alertify.error("Çalıştığı birim bilgisi güncellenemedi.");
        });
    } else {
      const configuration = {
        method: "PUT",
        url: "api/persons/" + personel._id,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          ikinciBirimID: newCalistigiBirim._id,
        },
      };

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

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Çalıştığı Birimi Güncelle</ModalHeader>
      <ModalBody>
        <Form>
          {/*  eğer personel yazıişleri müdürü ise 2 tane birimi olabiliyor,  */}
          {personel && personel.kind === "yaziislerimudürü" && (
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
                onChange={() => setBirimSira("birinciBirim")}
              />
              <Label for="birinciBirim">Birinci Birim</Label>
              <Input
                className="mr-2"
                type="radio"
                name="birimSira"
                value="ikinciBirim"
                id="ikinciBirim"
                checked={birimSira === "ikinciBirim"}
                onChange={() => setBirimSira("ikinciBirim")}
              />
              <Label for="ikinciBirim">İkinci Birim</Label>
            </FormGroup>
          )}

          {personel && (
            <div>
              <FormGroup>
                <Label for="calistigiBirim">
                  {birimSira === "birinicBirim"
                    ? "Birinci Çalıştığı Birim"
                    : "İkinci Çalıştığı Birim"}
                </Label>
                <Input
                  id="calistigiBirim"
                  type="text"
                  value={
                    birimSira === "birinciBirim"
                      ? personel.birimID.name
                      : personel.ikinciBirimID && personel.ikinciBirimID.name
                  }
                  disabled
                />
              </FormGroup>
              <FormGroup hidden={birimSira === "ikinciBirim"}>
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
              onChange={(e) => handleTypeChange(e)}
              name="select"
              type="select"
            >
              <option key={-1}>Seçiniz</option>
              {selectedKurum &&
                selectedKurum.types.map((type) => (
                  <option key={type.id}>{type.name}</option>
                ))}
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
          <FormGroup>
            <Label for="selectedBirim">Yeni Çalışacağı Birim*</Label>
            <Input
              id="selectedBirim"
              type="text"
              value={newCalistigiBirim ? newCalistigiBirim.name : ""}
              disabled
            />
          </FormGroup>

          <FormGroup hidden={birimSira === "ikinciBirim"}>
            <Label for="endDate">Değişiklik Tarihi*</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormGroup>

          <FormGroup hidden={birimSira === "ikinciBirim"}>
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
          hidden={birimSira === "birinciBirim"}
          onClick={handleClearSecondUnit}
        >
          İkinci Birim Sil
        </Button>
      </ModalFooter>
    </Modal>
  );
}
