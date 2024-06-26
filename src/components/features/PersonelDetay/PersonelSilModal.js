import React from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
} from "reactstrap";
import alertify from "alertifyjs";
import axios from "axios";

export default function PersonelSilModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
}) {
  const handleDelete = () => {
    const configuration = {
      method: "DELETE",
      url: `api/persons/${personel.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        alertify.success("Personel başarıyla silindi.");
        refreshPersonel(true);
        toggle();
      })
      .catch((error) => {
        alertify.error("Personel silinirken bir hata oluştu.");
        console.log(error);
        toggle();
      });
  };

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Personel Sil</ModalHeader>
      {personel && (
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="personelAdi">
                {personel.ad} {personel.soyad} adlı personeli silmek
                istediğinize emin misiniz?
              </Label>
            </FormGroup>
          </Form>
        </ModalBody>
      )}

      <ModalFooter>
        <Button color="danger" onClick={handleDelete}>
          Sil
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
