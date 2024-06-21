import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

function BirimGuncelleModal({ modal, toggle, birim, token, getBirimler }) {
  const [updatedBirim, setUpdatedBirim] = useState({ ...birim });

  const handleCancel = () => {
    setUpdatedBirim({ ...birim });
    toggle();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBirim({
      ...updatedBirim,
      [name]: value,
    });
  };

  useEffect(() => {
    setUpdatedBirim({ ...birim });
  }, [birim]);

  const handleUpdate = () => {
    const configuration = {
      method: "PUT",
      url: "api/units/" + birim._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: updatedBirim,
    };
    axios(configuration)
      .then(() => {
        alertify.success("Birim başarıyla güncellendi.");
        getBirimler();
        toggle();
      })
      .catch((error) => {
        console.error(error);
        alertify.error("Birim güncellenirken bir hata oluştu.");
      });
  };

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Birim Güncelle</ModalHeader>
        <ModalBody>
          {birim && (
            <Form>
              <FormGroup>
                <Label for="unitTypeName">
                  Birim Tipi : {birim.unitType.name}
                </Label>
                <br />
                <Label for="unitTypeType">
                  Birim Tipi : {birim.unitType.unitType}
                </Label>
              </FormGroup>

              {/* sıra */}
              <FormGroup>
                <Label for="sira">Sıra</Label>
                <Input
                  type="number"
                  name="series"
                  id="sira"
                  placeholder="Sıra"
                  value={updatedBirim.series}
                  min={1}
                  onChange={handleInputChange}
                />
              </FormGroup>

              {/* birim adı */}
              <FormGroup>
                <Label for="birimAdi">Birim Adı</Label>
                <Input
                  type="text"
                  name="name"
                  id="birimAdi"
                  placeholder="Birim Adı"
                  value={updatedBirim.name}
                  onChange={handleInputChange}
                />
              </FormGroup>

              {/*  minumum katip sayısı */}
              <FormGroup>
                <Label for="minKatipSayi">Gerekli Minimum Katip Sayısı</Label>
                <Input
                  type="number"
                  name="minClertCount"
                  id="minKatipSayi"
                  placeholder="Gerekli Katip Sayısı"
                  value={updatedBirim.minClertCount}
                  min={1}
                  onChange={handleInputChange}
                />
              </FormGroup>

              {/* status */}
              <FormGroup>
                <Label for="status">Durum</Label>
                <Input
                  type="select"
                  name="status"
                  id="status"
                  value={updatedBirim.status}
                  onChange={handleInputChange}
                >
                  <option value={true}>Mahkeme İşletimde</option>
                  <option value={false}>Mahkeme Kapalı</option>
                </Input>
              </FormGroup>

              {/* heyet sayısı */}
              <FormGroup>
                <Label for="heyetSayi">Heyet Sayısı</Label>
                <Input
                  type="select"
                  name="delegationType"
                  id="heyetSayi"
                  value={updatedBirim.delegationType}
                  onChange={handleInputChange}
                >
                  <option value={"1"}>1</option>
                  <option value={"1/2"}>1/2</option>
                  <option value={"1/3"}>1/3</option>
                </Input>
              </FormGroup>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleUpdate}>
            Güncelle
          </Button>{" "}
          <Button color="secondary" onClick={handleCancel}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default BirimGuncelleModal;
