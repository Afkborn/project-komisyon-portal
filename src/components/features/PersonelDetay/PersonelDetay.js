import React, { useState } from "react";
import {
  Input,
  Label,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Table,
  Badge,
} from "reactstrap";
import axios from "axios";
import {
  //   renderDate_GGAAYYYY,
  calculateGorevSuresi,
} from "../../actions/TimeActions";
import alertify from "alertifyjs";
import PersonelCalistigiKisiGuncelleModal from "./PersonelCalistigiKisiGuncelleModal";
import PersonelCalistigiBirimGuncelleModal from "./PersonelCalistigiBirimGuncelleModal";

export default function PersonelDetay({ selectedKurum, token }) {
  const [personel, setPersonel] = useState(null);
  const [updatedPersonel, setUpdatedPersonel] = useState({ ...personel });
  const [sicil, setSicil] = useState(null);
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showCalistigiKisiGuncelleModal, setShowCalistigiKisiGuncelleModal] =
    useState(false);
  const calistigiKisiGuncelleModalToggle = () => {
    setShowCalistigiKisiGuncelleModal(!showCalistigiKisiGuncelleModal);
  };

  const [showCalistigiBirimGuncelleModal, setShowCalistigiBirimGuncelleModal] =
    useState(false);
  const calistigiBirimGuncelleModalToggle = () => {
    setShowCalistigiBirimGuncelleModal(!showCalistigiBirimGuncelleModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUpdatedPersonel({
      ...updatedPersonel,
      [name]: value,
    });
  };

  const handleUpdate = () => {
    console.log("personel" + personel);
    console.log(updatedPersonel);
    setLoadSpinner(true);
    const configuration = {
      method: "PUT",
      url: "api/persons/" + personel._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: updatedPersonel,
    };
    axios(configuration)
      .then((response) => {
        setLoadSpinner(false);
        alertify.success("Personel bilgisi güncellendi.");
      })
      .catch((error) => {
        setLoadSpinner(false);
        alertify.error("Personel bilgisi güncellenemedi.");
      });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoadSpinner(true);
    const configuration = {
      method: "GET",
      url: "api/persons/bySicil/" + sicil,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        setError(false);
        setErrorMessage("");
        setPersonel(response.data.person);
        setUpdatedPersonel({
          goreveBaslamaTarihi:
            response.data.person.goreveBaslamaTarihi.split("T")[0],
          ad: response.data.person.ad,
          soyad: response.data.person.soyad,
          durusmaKatibiMi: response.data.person.durusmaKatibiMi,
        });
        setLoadSpinner(false);
      })
      .catch((error) => {
        setError(true);
        setErrorMessage(error.response.data.message);
        setLoadSpinner(false);
        setPersonel(null);
      });
  };

  return (
    <div>
      <h3>Personel Detay</h3>
      <span>
        Sicil ile birlikte personel hakkında detaylı bilgi alabilirsiniz.
        <br />
        Personelin birimini değiştirebilir, izin bilgisi ekleyebilir veya
        güncelleyebilirsiniz.
      </span>

      <hr />
      <div>
        <div hidden={!selectedKurum}>
          <Form onSubmit={(e) => handleFormSubmit(e)}>
            <Row className="row-cols-lg-auto g-3 align-items-center">
              <Col>
                <Label className="visually-hidden" for="sicil">
                  Sicil
                </Label>
                <Input
                  id="sicil"
                  name="sicil"
                  placeholder="Sicil (123456)"
                  type="number"
                  value={sicil}
                  onChange={(e) => setSicil(e.target.value)}
                />
              </Col>
              <Col>
                <Button onClick={(e) => handleFormSubmit(e)}>Getir</Button>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="mt-1" hidden={!loadSpinner}>
          <Spinner type="grow" color="danger" />
        </div>
        <div className="mt-1" hidden={!error}>
          <span className="text-danger">{errorMessage}</span>
        </div>

        {personel && (
          <div>
            <hr />
            <h4>Personel Bilgileri</h4>
            <Row className="mt-2">
              <Col>
                <Button
                  className="m-1"
                  onClick={(e) => handleUpdate(e)}
                  color="primary"
                >
                  Güncelle
                </Button>
                <Button  onClick={calistigiBirimGuncelleModalToggle}  className="m-1" color="primary">
                  Birim Değiştir
                </Button>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <Label>Sicil</Label>
                <Input
                  type="text"
                  value={personel.sicil}
                  onChange={handleInputChange}
                  disabled
                />
              </Col>
              <Col>
                <Label>Ad</Label>
                <Input
                  id="ad"
                  name="ad"
                  type="text"
                  value={updatedPersonel.ad}
                  onChange={handleInputChange}
                />
              </Col>
              <Col>
                <Label>Soyad</Label>
                <Input
                  type="text"
                  id="soyad"
                  name="soyad"
                  value={updatedPersonel.soyad}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <Label>Çalıştığı Birim </Label>
                <Input type="text" value={personel.birimID.name} disabled />
              </Col>
              <Col>
                <Label>Ünvan</Label>
                <Input type="text" value={personel.title.name} disabled />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <Label>Göreve Başlama Tarihi</Label>
                <Input
                  type="date"
                  id="goreveBaslamaTarihi"
                  name="goreveBaslamaTarihi"
                  value={updatedPersonel.goreveBaslamaTarihi}
                  onChange={handleInputChange}
                />
              </Col>
              <Col>
                <Label>Görev Süresi</Label>
                <Input
                  type="text"
                  value={calculateGorevSuresi(personel.goreveBaslamaTarihi)}
                  disabled
                />
              </Col>
            </Row>

            {personel.title.kind === "zabitkatibi" && (
              <Row className="mt-2">
                <Col>
                  <Label>Duruşma Katibi</Label>
                  <Input
                    type="select"
                    name="durusmaKatibiMi"
                    id="durusmaKatibiMi"
                    value={updatedPersonel.durusmaKatibiMi}
                    onChange={handleInputChange}
                  >
                    <option value="true">Evet</option>
                    <option value="false">Hayır</option>
                  </Input>
                </Col>
                <Col>
                  <Label>Çalıştığı Kişi</Label>
                  <Input
                    type="text"
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
                  />
                  <Button
                    className="mt-1"
                    color="info"
                    onClick={calistigiKisiGuncelleModalToggle}
                  >
                    Çalıştığı Kişi Güncelle
                  </Button>
                </Col>
              </Row>
            )}
            <div className="mt-3">
              <h4>
                İzinler{" "}
                <Badge color={personel.izindeMi ? "danger" : "success"}>
                  {personel.izindeMi ? "İZİNLİ" : "GÖREVDE"}
                </Badge>
              </h4>
              <hr />

              <div className="mt-2">
                <Button color="success">İzin Ekle</Button>
              </div>
              <Table>
                <thead>
                  <tr>
                    <th>İzin Tipi</th>
                    <th>İzin Başlangıç</th>
                    <th>İzin Bitiş</th>
                    <th>Yorum</th>
                  </tr>
                </thead>
                <tbody>
                  {personel.izinler.map((izin) => (
                    <tr key={izin._id}>
                      <td>{izin.reason}</td>
                      <td>{izin.startDate.split("T")[0]}</td>
                      <td>{izin.endDate.split("T")[0]}</td>
                      <td>{izin.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
        <PersonelCalistigiKisiGuncelleModal
          modal={showCalistigiKisiGuncelleModal}
          toggle={calistigiKisiGuncelleModalToggle}
          personel={personel}
          token={token}
        />
        <PersonelCalistigiBirimGuncelleModal
          modal={showCalistigiBirimGuncelleModal}
          toggle={calistigiBirimGuncelleModalToggle}
          personel={personel}
          token={token}
          selectedKurum={selectedKurum}
        />

      </div>
    </div>
  );
}
