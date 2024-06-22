import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import {
  DELETE_titles,
  POST_titles,
  PUT_titles,
} from "../constants/AxiosConfiguration";
import alertify from "alertifyjs";
export default function Unvanlar({ unvanlar, token, updateUnvanlar }) {
  const [newUnvanName, setNewUnvanName] = useState("");
  const [newUnvanOncelikSira, setNewUnvanOncelikSira] = useState("");
  const [showUnvanEkleModal, setShowUnvanEkleModal] = useState(false);
  const [showUnvanSilModal, setShowUnvanSilModal] = useState(false);
  const [showUnvanGuncelleModal, setShowUnvanGuncelleModal] = useState(false);
  const unvanEkleToggle = () => setShowUnvanEkleModal(!showUnvanEkleModal);
  const unvanSilToggle = () => setShowUnvanSilModal(!showUnvanSilModal);
  const unvanGuncelleToggle = () =>
    setShowUnvanGuncelleModal(!showUnvanGuncelleModal);
  const [deleteSelectedUnvan, setDeleteSelectedUnvan] = useState(null);
  const [updateSelectedUnvan, setUpdateSelectedUnvan] = useState(null);

  function strToEng(str) {
    return str
      .replace("İ", "I")
      .replace("ı", "i")
      .replace("Ğ", "G")
      .replace("ğ", "g")
      .replace("Ü", "U")
      .replace("ü", "u")
      .replace("Ş", "S")
      .replace("ş", "s")
      .replace("Ö", "O")
      .replace("ö", "o")
      .replace("Ç", "C")
      .replace("ç", "c")
      .replace(/\s/g, "")
      .toLowerCase();
  }

  function handleButtonEditUnvan(unvan) {
    // Ünvan düzenleme işlemi için modal açılacak
    setUpdateSelectedUnvan(unvan);
    unvanGuncelleToggle();
  }

  function handleButtonDeleteUnvan(unvan) {
    setDeleteSelectedUnvan(unvan);
    unvanSilToggle();
  }

  function handleDelete() {
    axios(DELETE_titles(deleteSelectedUnvan._id, token))
      .then(() => {
        alertify.success("Ünvan başarıyla silindi.");
        unvanSilToggle();
        updateUnvanlar();
      })
      .catch((error) => {
        console.error(error);
        alertify.error("Ünvan silinirken bir hata oluştu.");
      });
  }

  function handleAdd() {
    if (newUnvanName === "") {
      alert("Ünvan adı boş olamaz.");
      return;
    }
    axios(POST_titles(newUnvanName, strToEng(newUnvanName), token , newUnvanOncelikSira))
      .then(() => {
        alertify.success(`Ünvan ${newUnvanName} başarıyla eklendi.`);
        unvanEkleToggle();
        updateUnvanlar();
      })
      .catch((error) => {
        console.error(error);
        alertify.error("Ünvan eklenerken bir hata oluştu.");
      });
  }

  function handleUpdate() {
    if (updateSelectedUnvan.name === "") {
      alert("Ünvan adı boş olamaz.");
      return;
    }
    let kind = "";
    if (updateSelectedUnvan.deletable === false) {
      kind = updateSelectedUnvan.kind;
    } else {
      kind = strToEng(updateSelectedUnvan.name);
    }
    axios(
      PUT_titles(updateSelectedUnvan._id, updateSelectedUnvan.name, kind, token)
    )
      .then(() => {
        alertify.success(
          `Ünvan ${updateSelectedUnvan.name} başarıyla güncellendi.`
        );
        unvanGuncelleToggle();
        updateUnvanlar();
      })
      .catch((error) => {
        console.error(error);
        alertify.error("Ünvan güncellenirken bir hata oluştu.");
      });
  }

  return (
    <div>
      <h3>Ünvanlar</h3>
      <span>
        Sistemde kayıtlı olan ünvanlar listelenmektedir.
        <br />
        Bu ekranda yeni ünvan ekleyebilir, olanları güncelleyebilir veya
        silebilirsiniz. Sabit ünvanlar için <b>silme işlemi yapamazsınız.</b>
        <br />
        Ünvanlar tüm kurumlar için geçerli olup, kurum bazında ünvan tanımlaması
        yapılamaz.
      </span>

      <hr />

      <div>
        <div>
          <Button
            className="float-end"
            onClick={(e) => {
              unvanEkleToggle(e);
            }}
            color="success"
          >
            Ünvan Ekle{" "}
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>Ünvan Adı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {unvanlar.map((unvan) => {
              return (
                <tr key={unvan._id}>
                  <td>{unvan.name}</td>
                  <td>
                    <Button
                      onClick={() => handleButtonEditUnvan(unvan)}
                      color="warning"
                    >
                      Düzenle
                    </Button>{" "}
                    <Button
                      disabled={!unvan.deletable}
                      onClick={() => handleButtonDeleteUnvan(unvan)}
                      color="danger"
                    >
                      Sil
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <Modal isOpen={showUnvanSilModal} toggle={unvanSilToggle}>
        <ModalHeader toggle={unvanSilToggle}>Ünvan Sil</ModalHeader>
        <ModalBody>
          <p>
            Ünvanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          <p>Ünvan Adı: {deleteSelectedUnvan && deleteSelectedUnvan.name}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            Sil
          </Button>{" "}
          <Button color="secondary" onClick={unvanSilToggle}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showUnvanEkleModal} toggle={unvanEkleToggle}>
        <ModalHeader toggle={unvanEkleToggle}>Ünvan Ekle</ModalHeader>
        <ModalBody>
          <p>Ünvan adı: </p>
          <Input
            type="text"
            onChange={(e) => {
              setNewUnvanName(e.target.value);
            }}
          />

          <p className="mt-1">Ünvan Öncelik Sırası: </p>
          <Input
            type="text"
            onChange={(e) => {
              setNewUnvanOncelikSira(e.target.value);
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={(e) => {
              handleAdd(e);
            }}
          >
            Ekle
          </Button>{" "}
          <Button color="secondary" onClick={unvanEkleToggle}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showUnvanGuncelleModal} toggle={unvanGuncelleToggle}>
        <ModalHeader toggle={unvanGuncelleToggle}>Ünvan Güncelle</ModalHeader>
        <ModalBody>
          <p>Ünvan adı: </p>
          <Input
            type="text"
            defaultValue={updateSelectedUnvan && updateSelectedUnvan.name}
            onChange={(e) => {
              setUpdateSelectedUnvan({
                ...updateSelectedUnvan,
                name: e.target.value,
              });
            }}
          />

          <p className="mt-1">Ünvan Öncelik Sırası: </p>
          <Input
            type="text"
            defaultValue={
              updateSelectedUnvan && updateSelectedUnvan.oncelikSirasi
            }
            onChange={(e) => {
              setUpdateSelectedUnvan({
                ...updateSelectedUnvan,
                oncelikSirasi: e.target.value,
              });
            }}
          />
          <small>
            Personel Listesi ekranında sıralama yaparken ünvanın öncelik
            sıralamasındaki değere göre sıralama yapar.
          </small>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={(e) => {
              handleUpdate(e);
            }}
          >
            Güncelle
          </Button>{" "}
          <Button color="secondary" onClick={unvanGuncelleToggle}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
