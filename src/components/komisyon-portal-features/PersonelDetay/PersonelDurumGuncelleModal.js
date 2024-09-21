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

export default function PersonelDurumGuncelleModal({
  modal,
  toggle,
  personel,
  token,
  selectedKurum,
  refreshPersonel,
}) {
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [newDeactivationReason, setNewDeactivationReason] = useState("");
  useEffect(() => {
    if (personel && !personel.status) {
      setUpdateButtonDisabled(false);
    }
  }, [personel]);

  const handleCancel = () => {
    setNewDeactivationReason("");
    toggle();
  };

  const handleUpdate = () => {
    const configuration = {
      method: "PUT",
      url: "api/persons/" + personel._id,
      data: {
        status: !personel.status,
        deactivationReason: newDeactivationReason,
        deactivationDate: new Date(),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        alertify.success("Personel durumu başarıyla güncellendi");
        setNewDeactivationReason("");
        refreshPersonel();
        toggle();
      })
      .catch((error) => {
        alertify.error("Personel durumu güncellenirken bir hata oluştu");
      });
  };

  function handleTypeChange(event) {
    if (event.target.value === "Seçiniz") {
      return;
    }
    setNewDeactivationReason(event.target.value);
    setUpdateButtonDisabled(false);
  }

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Durum Güncelle</ModalHeader>

      <ModalBody>
        <p>
          {" "}
          Personel durumu Pasif yapıldığı takdirde listelerde gözükmez, sicili
          ile birlikte tekrar güncelleme yapabilirsiniz.
        </p>
        <Form>
          {personel && (
            <div>
              <FormGroup>
                <Label for="personelStatus">Şuanki Durum</Label>
                <Input
                  id="personelStatus"
                  type="text"
                  value={personel.status ? "Aktif" : "Pasif"}
                  disabled
                />
              </FormGroup>

              <FormGroup hidden={personel.status}>
                <Label for="personelDeactivationReason">
                  Ayrılış Gerekçesi
                </Label>
                <Input
                  id="personelDeactivationReason"
                  type="text"
                  value={
                    personel.deactivationReason
                      ? personel.deactivationReason
                      : ""
                  }
                  disabled
                />
              </FormGroup>

              <FormGroup hidden={!personel.status}>
                <Label for="personelNewDeactivationReason">
                  Ayrılış Gerekçesi
                </Label>
                <Input
                  id="personelNewDeactivationReason"
                  onChange={(e) => handleTypeChange(e)}
                  name="select"
                  type="select"
                >
                  <option key={-1}>Seçiniz</option>
                  <option key={0} value={"Emekli"}>
                    Emekli
                  </option>
                  <option key={1} value={"İstifa"}>
                    İstifa
                  </option>
                  <option key={2} value={"Naklen Atama"}>
                    Naklen Atama
                  </option>
                  <option key={3} value={"Diğer"}>
                    Diğer
                  </option>
                </Input>
              </FormGroup>
            </div>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleUpdate}
          disabled={updateButtonDisabled}
        >
          {personel && personel.status ? "Pasif Yap" : "Aktif Yap"}
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
