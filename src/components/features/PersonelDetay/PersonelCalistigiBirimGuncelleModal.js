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
  refreshPersonel
}) {
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [newCalistigiBirim, setNewCalistigiBirim] = useState(null);
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
      method: "PUT",
      url: "api/persons/" + personel._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        birimID: newCalistigiBirim._id,
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
            <FormGroup>
              <Label for="calistigiBirim">Çalıştığı Birim</Label>
              <Input
                id="calistigiBirim"
                type="text"
                value={personel.birimID.name}
                disabled
              />
            </FormGroup>
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
            <Label for="selectedBirim">Seçili Birim</Label>
            <Input
              id="selectedBirim"
              type="text"
              value={newCalistigiBirim ? newCalistigiBirim.name : ""}
              disabled
            />
          </FormGroup>
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
