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
import alertify from "alertifyjs";

export default function PersonelUnvanGuncelleModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
  unvanlar,
}) {
  function handleTypeChange(event) {
    if (event.target.value === "Seçiniz") {
      return;
    }
    setNewTitle(event.target.value);
    setUpdateButtonDisabled(false);
  }

  const [newTitle, setNewTitle] = useState("");

  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);

  const handleCancel = () => {
    setNewTitle("");
    toggle();
  };

  const handleUpdate = () => {
    const configuration = {
      method: "PUT",
      url: "api/persons/" + personel._id,
      data: {
        title: newTitle,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        alertify.success("Personel unvanı başarıyla güncellendi");
        setNewTitle("");
        refreshPersonel();
        toggle();
      })
      .catch((error) => {
        console.log(error);
        let errorMessage =
          error.response.data.message ||
          "Personel unvanı güncellenirken bir hata oluştu";
        alertify.error(errorMessage);
      });
  };

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Ünvan Güncelle</ModalHeader>

      <ModalBody>
        <Form>
          {personel && (
            <div>
              <FormGroup>
                <Label for="personelStatus">Şuanki Ünvan</Label>
                <Input
                  id="personelStatus"
                  type="text"
                  value={personel.title.name}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label for="unvanlar">Ünvanlar</Label>
                <Input
                  id="unvanlar"
                  onChange={(e) => handleTypeChange(e)}
                  name="select"
                  type="select"
                >
                  <option key={-1}>Seçiniz</option>
                  {unvanlar.map((unvan) => (
                    <option key={unvan._id} value={unvan._id} >{unvan.name}</option>
                  ))}
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
          Güncelle
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
