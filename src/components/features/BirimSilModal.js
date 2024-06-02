import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axios from "axios";

function BirimSilModal({ modal, toggle, birim, token }) {
  const handleDelete = () => {
    const configuration = {
      method: "DELETE",
      url: "api/units/" + birim._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then(() => {
        alert(`Birim ${birim.name} başarıyla silindi.`);
        toggle();
      })
      .catch((error) => {
        console.error(error);
        alert("Birim silinirken bir hata oluştu.");
      });
  };

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Birim Sil</ModalHeader>
        <ModalBody>
          <p>
            Birimi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
