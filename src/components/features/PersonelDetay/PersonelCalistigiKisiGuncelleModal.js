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

export default function PersonelCalistigiKisiGuncelleModal({
  modal,
  toggle,
  personel,
  token,
}) {
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
  const [newCalistigiKisiSicil, setNewCalistigiKisiSicil] = useState(null);
  const [newCalistigiKisi, setNewCalistigiKisi] = useState(null);

  const handleUpdate = () => {
    const configuration = {
      method: "PUT",
      url: "api/persons/" + personel._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (newCalistigiKisiSicil === "0") {
      configuration.data = {
        calistigiKisi: null,
      };
    } else {
      configuration.data = {
        calistigiKisi: newCalistigiKisi._id,
      };
    }

    axios(configuration)
      .then((response) => {
        alertify.success("Çalıştığı kişi bilgisi güncellendi.");
        toggle();
      })
      .catch((error) => {
        alertify.error("Çalıştığı kişi bilgisi güncellenemedi.");
      });
  };

  const handleCancel = () => {
    setNewCalistigiKisiSicil(null);
    setUpdateButtonDisabled(true);
    setNewCalistigiKisi(null);
    toggle();
  };

  const handleGetCalistigiKisi = () => {
    if (newCalistigiKisiSicil === "0") {
      setNewCalistigiKisi(null);
      setUpdateButtonDisabled(false);
      return;
    }
    const configuration = {
      method: "GET",
      url: "api/persons/bySicil/" + newCalistigiKisiSicil,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        setNewCalistigiKisi(response.data.person);
        setUpdateButtonDisabled(false);
      })
      .catch((error) => {
        alertify.error("Kişi bulunamadı.");
        setNewCalistigiKisi(null);
        setUpdateButtonDisabled(true);
      });
  };

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        Çalıştığı Kişi Bilgilerini Güncelle
      </ModalHeader>
      <ModalBody>
        <Form>
          {personel && (
            <div>
              <FormGroup>
                <Label for="calistigiKisi">Çalıştığı Kişi</Label>
                <Input
                  type="text"
                  name="calistigiKisi"
                  id="calistigiKisi"
                  value={
                    personel.calistigiKisi
                      ? personel.calistigiKisi.title.name +
                        " | " +
                        personel.calistigiKisi.ad +
                        " " +
                        personel.calistigiKisi.soyad +
                        " - " +
                        personel.calistigiKisi.sicil
                      : "BELİRTİLMEMİŞ"
                  }
                  disabled
                  // onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="newCalistigiKisiSicil">
                  Yeni Çalıştığı Kişi Sicil
                  <br />
                  <small>
                    Çalıştığı kişiyi silmek istiyorsanız 0 yazıp aratın.
                  </small>
                </Label>
                <Input
                  type="text"
                  name="newCalistigiKisiSicil"
                  id="newCalistigiKisiSicil"
                  value={newCalistigiKisiSicil}
                  onChange={(e) => setNewCalistigiKisiSicil(e.target.value)}
                />
                <Button
                  onClick={(e) => {
                    handleGetCalistigiKisi(e);
                  }}
                  className="mt-1"
                  color="info"
                >
                  Çalıştığı Kişi Bul
                </Button>
              </FormGroup>
              <FormGroup>
                <Label for="newCalistigiKisi">
                  Yeni Çalıştığı Kişi Bilgileri
                </Label>
                <Input
                  type="text"
                  name="newCalistigiKisi"
                  id="newCalistigiKisi"
                  value={
                    newCalistigiKisi
                      ? newCalistigiKisi.title.name +
                        " | " +
                        newCalistigiKisi.ad +
                        " " +
                        newCalistigiKisi.soyad +
                        " - " +
                        newCalistigiKisi.sicil +
                        " | " +
                        newCalistigiKisi.birimID.name
                      : "BELİRTİLMEMİŞ"
                  }
                  disabled
                />
              </FormGroup>
            </div>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={updateButtonDisabled}
          color="primary"
          onClick={handleUpdate}
        >
          Güncelle
        </Button>{" "}
        <Button onClick={handleCancel} color="secondary">
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
