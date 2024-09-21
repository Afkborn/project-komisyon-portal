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
    if (newCalistigiBirim._id === personel.birimID._id) {
      alertify.error("Çalıştığı birim aynı olduğu için güncelleme yapılamaz.");
      return;
    }

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
  };

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Çalıştığı Birimi Güncelle</ModalHeader>
      <ModalBody>
        <Form>
          {personel && (
            <div>
              <FormGroup>
                <Label for="calistigiBirim">Şuan Çalıştığı Birim</Label>
                <Input
                  id="calistigiBirim"
                  type="text"
                  value={personel.birimID.name}
                  disabled
                />
              </FormGroup>
              <FormGroup>
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

          <FormGroup>
            <Label for="endDate">Değişiklik Tarihi*</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
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
      </ModalFooter>
    </Modal>
  );
}
