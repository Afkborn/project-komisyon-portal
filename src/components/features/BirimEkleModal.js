import React, { useState } from "react";
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

function BirimEkleModal({ modal, toggle, handleAddBirim, kurum, setBirim }) {
  const [altKurum, setAltKurum] = useState(null);
  const [birimler, setBirimler] = useState([]);
  const [seciliBirim, setSeciliBirim] = useState(null);

  function handleKurumTypeSelectInputChange(e) {
    if (e.target.value === "Alt Kurum Seçiniz") {
      setAltKurum(null);
      return;
    }
    let seciliKurum = kurum.types.find((type) => type.name === e.target.value);
    setAltKurum(seciliKurum);
    const configuration = {
      method: "GET",
      url: "api/unit_types",
      params: {
        type: seciliKurum.id,
      },
    };
    axios(configuration)
      .then((result) => {
        setBirimler(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleBirimSelectInputChange(e) {
    if (e.target.value === "Birim Seçiniz") {
      setSeciliBirim(null);
      return;
    }
    let seciliBirim = birimler.find((birim) => birim.name === e.target.value);
    setSeciliBirim(seciliBirim);
  }

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle} fullscreen>
        {kurum && (
          <ModalHeader toggle={toggle}>{kurum.name} - Birim Ekleme</ModalHeader>
        )}
        <ModalBody>
          {kurum && (
            <Form>
              <div>
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
              </div>

              <hr />

              <FormGroup>
                <Label for="kurumTypeSelect">Birim Türü </Label>
                <Input
                  onChange={(e) => handleKurumTypeSelectInputChange(e)}
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

              <FormGroup>
                <Label for="birimSelect">Birim </Label>
                <Input
                  onChange={(e) => handleBirimSelectInputChange(e)}
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

              <FormGroup check>
                <Input name="radio2" type="radio" />{" "}
                <Label check>Tek mahkeme</Label>
              </FormGroup>
              <FormGroup check>
                <Input name="radio2" type="radio" />{" "}
                <Label check>Çoklu mahkeme</Label>
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
