import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from "axios";
import { DELETE_UNIT } from "../../constants/AxiosConfiguration";
import alertify from "alertifyjs";
function BirimSilModal({ modal, toggle, birim, token, getBirimler }) {
  const handleDelete = () => {
    axios(DELETE_UNIT(birim._id, token))
      .then(() => {
        alertify.success("Birim başarıyla silindi.");
        toggle();
        getBirimler();
      })
      .catch((error) => {
        console.error(error);
        alertify.error("Birim silinirken bir hata oluştu.");
      });
  };

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Birim Sil</ModalHeader>
        <ModalBody>
          <p>
            Birimi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            <br />
          </p>
          <p>Birim Adı: {birim && birim.name}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            Sil
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default BirimSilModal;
