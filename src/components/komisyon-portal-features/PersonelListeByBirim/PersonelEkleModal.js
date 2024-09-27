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
function PersonelEkleModal({
  modal,
  toggle,
  unvanlar,
  birim,
  token,
  handleBirimChange,
  personel,
}) {
  let [selectedUnvan, setSelectedUnvan] = useState("");

  const [formData, setFormData] = useState({
    birimID: "",
    titleID: "",
    sicil: "",
    ad: "",
    soyad: "",
    goreveBaslamaTarihi: "",
    durusmaKatibiMi: "",
    birimeBaslamaTarihi: new Date().toISOString().substr(0, 10),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "isTemporary") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
      return;
    }

    if (name === "titleID") {
      const selectedUnvan = unvanlar.find((unvan) => unvan._id === value);
      setSelectedUnvan(selectedUnvan);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCancel = () => {
    setFormData({
      birimID: "",
      titleID: "",
      sicil: "",
      ad: "",
      soyad: "",
      goreveBaslamaTarihi: "",
      durusmaKatibiMi: "",
    });
    toggle();
  };

  const checkFormDatas = () => {
    if (
      formData.kind === "" ||
      formData.sicil === "" ||
      formData.ad === "" ||
      formData.soyad === "" ||
      formData.goreveBaslamaTarihi === ""
    ) {
      alertify.error("Lütfen tüm alanları doldurunuz.");
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    setFormData({
      ...formData,
      birimID: birim._id,
    });

    if (!checkFormDatas()) {
      return;
    }

    const configuration = {
      method: "POST",
      url: "api/persons",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: formData,
    };

    console.log(formData);

    axios(configuration)
      .then(() => {
        alertify.success("Personel başarıyla eklendi.");
        toggle();
        handleBirimChange({ target: { value: birim.name } });
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data.code === 11000) {
          alertify.error("Bu sicil numarası zaten kullanılmakta.");
        } else {
          let errorMessage = error.response.data.message || "Hata!";
          alertify.error(errorMessage);
        }
      });
  };

  useEffect(() => {
    setFormData({
      ...formData,
      birimID: birim._id,
    });
    // eslint-disable-next-line
  }, [birim]);

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Personel Ekle</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup hidden>
              <Label for="name">BirimID</Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={birim._id}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label for="unvan">Ünvan</Label>
              <Input
                type="select"
                name="titleID"
                id="titleID"
                onChange={handleInputChange}
              >
                <option value="">Seçiniz</option>
                {unvanlar.map((unvan) => (
                  <option key={unvan._id} value={unvan._id}>
                    {unvan.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
            {selectedUnvan.kind === "zabitkatibi" && (
              <FormGroup>
                <Label for="durusmaKatibiMi">Duruşma Katibi Mi?</Label>
                <Input
                  type="select"
                  name="durusmaKatibiMi"
                  id="durusmaKatibiMi"
                  value={formData.durusmaKatibiMi}
                  onChange={handleInputChange}
                >
                  <option value="true">Evet</option>
                  <option value="false">Hayır</option>
                </Input>
              </FormGroup>
            )}

            {selectedUnvan.kind === "zabitkatibi" && (
              <FormGroup>
                <Label for="calistigiKisi">Çalıştığı Kişi (Opsiyonel)</Label>
                <Input
                  type="select"
                  name="calistigiKisi"
                  id="calistigiKisi"
                  value={formData.calistigiKisi}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz</option>
                  {personel.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.title.name} | {person.ad} {person.soyad} -{" "}
                      {person.sicil}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            )}
            <FormGroup>
              <Label for="sicil">Sicil</Label>
              <Input
                type="number"
                name="sicil"
                id="sicil"
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="ad">Ad</Label>
              <Input
                type="text"
                name="ad"
                id="ad"
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="soyad">Soyad</Label>
              <Input
                type="text"
                name="soyad"
                id="soyad"
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label check>
                <Input
                  type="checkbox"
                  name="isTemporary"
                  id="isTemporary"
                  onChange={handleInputChange}
                />
                Geçici Personel
              </Label>
            </FormGroup>

            <FormGroup>
              <Label for="goreveBaslamaTarihi">Göreve Başlama Tarihi</Label>
              <Input
                type="date"
                name="goreveBaslamaTarihi"
                id="goreveBaslamaTarihi"
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label for="birimeBaslamaTarihi">Birime Başlama Tarihi</Label>
              <Input
                type="date"
                name="birimeBaslamaTarihi"
                id="birimeBaslamaTarihi"
                onChange={handleInputChange}
                defaultValue={new Date().toISOString().substr(0, 10)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAdd}>
            Kaydet
          </Button>
          <Button color="secondary" onClick={handleCancel}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default PersonelEkleModal;
