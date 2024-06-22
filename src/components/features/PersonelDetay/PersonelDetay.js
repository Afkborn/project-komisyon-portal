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
import PersonelIzinEkleModal from "./PersonelIzinEkleModal";
import { getIzinType } from "../../actions/IzinActions";

export default function PersonelDetay({ selectedKurum, token }) {
  const [personel, setPersonel] = useState(null);
  const [personeller, setPersoneller] = useState([]);
  const [updatedPersonel, setUpdatedPersonel] = useState({ ...personel });
  const [sicil, setSicil] = useState(null);
  const [ad, setAd] = useState(null);
  const [soyad, setSoyad] = useState(null);
  const [searchBy, setSearchBy] = useState("adSoyad");
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

  const [showIzinEkleModal, setShowIzinEkleModal] = useState(false);

  const izinEkleModalToggle = () => {
    setShowIzinEkleModal(!showIzinEkleModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUpdatedPersonel({
      ...updatedPersonel,
      [name]: value,
    });
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
  };

  const refreshPersonel = () => {
    const configuration = {
      method: "GET",
      url: "api/persons/bySicil/" + sicil,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        setPersonel(response.data.person);
        setUpdatedPersonel({
          goreveBaslamaTarihi:
            response.data.person.goreveBaslamaTarihi.split("T")[0],
          ad: response.data.person.ad,
          soyad: response.data.person.soyad,
          durusmaKatibiMi: response.data.person.durusmaKatibiMi,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleIzinDelete = (izin) => {
    console.log(izin);
    const configuration = {
      method: "DELETE",
      url: "api/leaves/" + izin._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    console.log(configuration);
    axios(configuration)
      .then((response) => {
        alertify.success("İzin silindi.");
        refreshPersonel();
      })
      .catch((error) => {
        console.log(error);
        alertify.error("İzin silinemedi.");
      });
  };

  const handleUpdate = () => {
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

  const getPersonelBySicil = (sicil) => {
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
        setPersonel(response.data.person);
        setUpdatedPersonel({
          goreveBaslamaTarihi: response.data.person.goreveBaslamaTarihi,
          ad: response.data.person.ad,
          soyad: response.data.person.soyad,
          durusmaKatibiMi: response.data.person.durusmaKatibiMi,
        });
        setLoadSpinner(false);
      })
      .catch((error) => {
        setLoadSpinner(false);
        alertify.error("Personel bulunamadı.");
        setPersonel(null);
        setUpdatedPersonel(null);
      });

    setError(false);
  };

  const getPersonelByAdSoyad = (ad, soyad) => {
    setLoadSpinner(true);
    const configuration = {
      method: "GET",
      url: "api/persons/byAdSoyad/",
      params: {
        ad: ad,
        soyad: soyad,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        setLoadSpinner(false);
        let personsCount = response.data.persons.length;
        if (personsCount > 1) {
          setPersoneller(response.data.persons);
        } else if (personsCount === 0) {
          setPersonel(null);
          setUpdatedPersonel(null);
          alertify.error("Personel bulunamadı.");
        } else {
          let person = response.data.persons[0];
          setPersonel(person);
          setUpdatedPersonel({
            goreveBaslamaTarihi: person.goreveBaslamaTarihi,
            ad: person.ad,
            soyad: person.soyad,
            durusmaKatibiMi: person.durusmaKatibiMi,
          });
        }
      })
      .catch((error) => {
        setLoadSpinner(false);
        setPersonel(null);
        setUpdatedPersonel(null);
        alertify.error("Personel bulunamadı.");
      });

    setError(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setPersonel(null);
    setPersoneller([]);
    if (searchBy === "sicil") {
      if (sicil) {
        getPersonelBySicil(sicil);
      } else {
        setError(true);
        setErrorMessage("Sicil numarası boş bırakılamaz.");
      }
    } else {
      if (ad || soyad) {
        getPersonelByAdSoyad(ad, soyad);
      } else {
        setError(true);
        setErrorMessage("Ad ve soyad boş bırakılamaz.");
      }
    }
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
            {/* aramanın  ad veya soyad kullanılarak yapılacağını seçtiğimiz row */}
            <Row className="row-cols-lg-auto g-3 align-items-center">
              <Col>
                <Label check>
                  <Input
                    type="radio"
                    name="searchBy"
                    value="sicil"
                    checked={searchBy === "sicil"}
                    onChange={handleSearchByChange}
                  />{" "}
                  Sicil ile Ara
                </Label>
              </Col>
              <Col>
                <Label check>
                  <Input
                    type="radio"
                    name="searchBy"
                    value="adSoyad"
                    checked={searchBy === "adSoyad"}
                    onChange={handleSearchByChange}
                  />{" "}
                  Ad Soyad ile Ara
                </Label>
              </Col>
            </Row>

            {/* arama eğer adsoyad ile yapılacak ise gösterilecek  form */}
            {searchBy === "adSoyad" && (
              <Row className="row-cols-lg-auto g-3 align-items-center mt-2">
                <Col>
                  <Label className="visually-hidden" for="ad">
                    Ad
                  </Label>
                  <Input
                    id="ad"
                    name="ad"
                    placeholder="Adı"
                    type="text"
                    value={ad}
                    onChange={(e) => setAd(e.target.value)}
                  />
                </Col>
                <Col>
                  <Label className="visually-hidden" for="soyad">
                    Soyad
                  </Label>
                  <Input
                    id="soyad"
                    name="soyad"
                    placeholder="Soyadı"
                    type="text"
                    value={soyad}
                    onChange={(e) => setSoyad(e.target.value)}
                  />
                </Col>
                <Col>
                  <Button type="submit" onClick={(e) => handleFormSubmit(e)}>Getir</Button>
                </Col>
              </Row>
            )}

            {/* arama eğer sicil ile yapılacak ise gösterilecek  form */}
            {searchBy === "sicil" && (
              <Row className="row-cols-lg-auto g-3 align-items-center mt-2">
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
                  <Button type="submit" onClick={(e) => handleFormSubmit(e)}>Getir</Button>
                </Col>
              </Row>
            )}
          </Form>
        </div>

        <div className="mt-1" hidden={!loadSpinner}>
          <Spinner type="grow" color="danger" />
        </div>
        <div className="mt-1" hidden={!error}>
          <span className="text-danger">{errorMessage}</span>
        </div>

        {personeller.length > 0 && (
          <div>
            <hr />
            <h4> {personeller.length} adet personel bulundu</h4>
            <Table>
              <thead>
                <tr>
                  <th>Sicil</th>
                  <th>Ad</th>
                  <th>Soyad</th>
                  <th>Birim</th>
                  <th>Ünvan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {personeller.map((person) => (
                  <tr key={person._id}>
                    <td>{person.sicil}</td>
                    <td>{person.ad}</td>
                    <td>{person.soyad}</td>
                    <td>{person.birimID.name}</td>
                    <td>{person.title.name}</td>
                    <td>
                      <Button
                        color="info"
                        size="sm"
                        onClick={(e) => {
                          setPersonel(person);
                          setUpdatedPersonel({
                            goreveBaslamaTarihi: person.goreveBaslamaTarihi,
                            ad: person.ad,
                            soyad: person.soyad,
                            durusmaKatibiMi: person.durusmaKatibiMi,
                          });
                          setPersoneller([]);
                        }}
                      >
                        Detayları Gör
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

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
                <Button
                  onClick={calistigiBirimGuncelleModalToggle}
                  className="m-1"
                  color="primary"
                >
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
                <Button onClick={izinEkleModalToggle} color="success">
                  İzin Ekle
                </Button>
              </div>
              <Table>
                <thead>
                  <tr>
                    <th>İzin Tipi</th>
                    <th>İzin Başlangıç</th>
                    <th>İzin Bitiş</th>
                    <th>Yorum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {personel.izinler.map((izin) => (
                    <tr key={izin._id}>
                      <td>{getIzinType(izin.reason)}</td>
                      <td>{izin.startDate.split("T")[0]}</td>
                      <td>{izin.endDate.split("T")[0]}</td>
                      <td>{izin.comment}</td>
                      <td>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={(e) => {
                            handleIzinDelete(izin);
                          }}
                        >
                          Sil
                        </Button>
                      </td>
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
          refreshPersonel={refreshPersonel}
        />
        <PersonelCalistigiBirimGuncelleModal
          modal={showCalistigiBirimGuncelleModal}
          toggle={calistigiBirimGuncelleModalToggle}
          personel={personel}
          token={token}
          selectedKurum={selectedKurum}
          refreshPersonel={refreshPersonel}
        />
        <PersonelIzinEkleModal
          modal={showIzinEkleModal}
          toggle={izinEkleModalToggle}
          personel={personel}
          token={token}
          refreshPersonel={refreshPersonel}
        />
      </div>
    </div>
  );
}
