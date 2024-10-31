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
  refreshPersonel,
}) {
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [newDeactivationReason, setNewDeactivationReason] = useState("");
  const [newDeactivationDate, setNewDeactivationDate] = useState(new Date());

  const [suspensionEndDate, setSuspensionEndDate] = useState();
  const [suspensionReason, setSuspensionReason] = useState("");

  useEffect(() => {
    if (personel && !personel.status) {
      setUpdateButtonDisabled(false);
    }
    if (personel && personel.isSuspended === true) {
      setUpdateButtonDisabled(false);
    }
  }, [personel, newDeactivationReason]);

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
        deactivationDate: newDeactivationDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (personel.isSuspended) {
      configuration.data.status = true;
      configuration.data.isSuspended = false;
      configuration.data.suspensionEndDate = null;
      configuration.data.suspensionReason = null;
    }

    if (newDeactivationReason === "Uzaklastirma") {
      if (!suspensionEndDate) {
        alertify.error("Uzaklaştırma bitiş tarihi boş bırakılamaz");
        return;
      }
      if (new Date(suspensionEndDate) < new Date()) {
        alertify.error("Uzaklaştırma bitiş tarihi bugünden önce olamaz");
        return;
      }
      configuration.data.status = true;
      configuration.data.isSuspended = true;
      configuration.data.suspensionEndDate = suspensionEndDate;
      configuration.data.suspensionReason = suspensionReason;
    }

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

  function handleDateChange(event) {
    setNewDeactivationDate(event.target.value);
  }

  function handleSuspensionEndDateChange(event) {
    setSuspensionEndDate(event.target.value);
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
                  value={
                    personel.status
                      ? personel.isSuspended
                        ? "Aktif (Uzaklaştırma)"
                        : "Aktif"
                      : "Pasif"
                  }
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

              <FormGroup
                hidden={
                  !personel.status ||
                  (personel.status === true && personel.isSuspended === true)
                }
              >
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
                  <option key={4} value={"Ölüm"}>
                    Ölüm
                  </option>
                  <option key={3} value={"Diğer"}>
                    Diğer
                  </option>

                  <option key={5} value={"Uzaklastirma"}>
                    Uzaklaştırma
                  </option>
                </Input>
              </FormGroup>

              <FormGroup
                hidden={
                  personel.status === false ||
                  (personel.status === true &&
                    newDeactivationReason === "Uzaklastirma") ||
                  (personel.status === true && personel.isSuspended === true)
                }
              >
                <Label for="personelNewDeactivationDate">Ayrılış Tarihi</Label>
                <Input
                  id="personelNewDeactivationDate"
                  type="date"
                  value={newDeactivationDate}
                  onChange={(e) => handleDateChange(e)}
                />
              </FormGroup>

              <FormGroup
                hidden={
                  personel.status === false ||
                  (personel.status === true &&
                    newDeactivationReason !== "Uzaklastirma")
                }
              >
                <Label for="suspensionEndDate">
                  Uzaklaştırma Bitiş Tarihi *{" "}
                </Label>
                <Input
                  id="suspensionEndDate"
                  type="date"
                  value={suspensionEndDate}
                  onChange={(e) => handleSuspensionEndDateChange(e)}
                />
              </FormGroup>
              <FormGroup
                hidden={
                  personel.status === false ||
                  (personel.status === true &&
                    newDeactivationReason !== "Uzaklastirma")
                }
              >
                <Label for="suspensionEndDate">Uzaklaştırma Gerekçe </Label>
                <Input
                  id="suspensionEndDate"
                  type="text"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                />
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
          {personel && personel.status ? personel.isSuspended ? "UZAKLAŞTIRMA KALDIR" : "Pasif Yap" : "Aktif Yap"}
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
