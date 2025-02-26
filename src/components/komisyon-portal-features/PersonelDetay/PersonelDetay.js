import React, { useState, useEffect } from "react";
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
  FormGroup,
} from "reactstrap";
import axios from "axios";
import {
  renderDate_GGAAYYYY,
  calculateGorevSuresi,
} from "../../actions/TimeActions";
import alertify from "alertifyjs";
import PersonelUnvanGuncelleModal from "./PersonelUnvanGuncelleModal";
import PersonelDurumGuncelleModal from "./PersonelDurumGuncelleModal";
import PersonelCalistigiKisiGuncelleModal from "./PersonelCalistigiKisiGuncelleModal";
import PersonelCalistigiBirimGuncelleModal from "./PersonelCalistigiBirimGuncelleModal";
import PersonelIzinEkleModal from "./PersonelIzinEkleModal";
import PersonelSilModal from "./PersonelSilModal";

import { getIzinType } from "../../actions/IzinActions";
import { useParams, useNavigate } from "react-router-dom";

export default function PersonelDetay({
  kurumlar,
  selectedKurum,
  token,
  unvanlar,
}) {
  const { sicil: urlSicil } = useParams(); // URL'den gelen sicil parametresi
  const navigate = useNavigate();

  const [personel, setPersonel] = useState(null);
  const [personelKurum, setPersonelKurum] = useState(null);
  const [personeller, setPersoneller] = useState([]);
  const [updatedPersonel, setUpdatedPersonel] = useState({ ...personel });
  const [sicil, setSicil] = useState(urlSicil || ""); // sicil state'ini ekle
  const [ad, setAd] = useState(null);
  const [soyad, setSoyad] = useState(null);
  const [searchBy, setSearchBy] = useState("adSoyad");
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // URL'de sicil varsa personeli getir
    if (urlSicil) {
      getPersonelBySicil(urlSicil);
      setSicil(urlSicil); // sicil state'ini güncelle
    }
  }, [urlSicil]);

  const [showCalistigiKisiGuncelleModal, setShowCalistigiKisiGuncelleModal] =
    useState(false);
  const calistigiKisiGuncelleModalToggle = () => {
    setShowCalistigiKisiGuncelleModal(!showCalistigiKisiGuncelleModal);
  };

  const [showUnvanGuncelleModal, setShowUnvanGuncelleModal] = useState(false);
  const unvanGuncelleModalToggle = () => {
    setShowUnvanGuncelleModal(!showUnvanGuncelleModal);
  };

  const [showCalistigiBirimGuncelleModal, setShowCalistigiBirimGuncelleModal] =
    useState(false);
  const calistigiBirimGuncelleModalToggle = () => {
    setShowCalistigiBirimGuncelleModal(!showCalistigiBirimGuncelleModal);
  };

  const [showDeletePersonelModal, setShowDeletePersonelModal] = useState(false);
  const deletePersonelModalToggle = () => {
    setShowDeletePersonelModal(!showDeletePersonelModal);
  };

  const [showDurumDegistirModal, setShowDurumDegistirModal] = useState(false);
  const durumDegistirModalToggle = () => {
    setShowDurumDegistirModal(!showDurumDegistirModal);
  };

  const [showIzinEkleModal, setShowIzinEkleModal] = useState(false);

  const izinEkleModalToggle = () => {
    setShowIzinEkleModal(!showIzinEkleModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "isTemporary") {
      const isTemporary = value === "true"; // String değeri boolean'a çeviriyoruz

      // Eğer isTemporary false ise, ilgili alanları sıfırla
      if (!isTemporary) {
        setUpdatedPersonel({
          ...updatedPersonel,
          isTemporary: isTemporary,
          temporaryReason: "",
          temporaryEndDate: "",
          temporaryBirimID: null,
        });
      } else {
        setUpdatedPersonel({
          ...updatedPersonel,
          isTemporary: isTemporary,
        });
      }
    } else if (name === "isMartyrRelative" || name === "isDisabled") {
      setUpdatedPersonel({
        ...updatedPersonel,
        [name]: !updatedPersonel[name],
      });
    } else {
      setUpdatedPersonel({
        ...updatedPersonel,
        [name]: value,
      });
    }
  };

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
  };

  const updatedPersonelAttributes = (updatedPersonel) => {
    return {
      ad: updatedPersonel.ad,
      soyad: updatedPersonel.soyad,
      goreveBaslamaTarihi: updatedPersonel.goreveBaslamaTarihi.split("T")[0],
      durusmaKatibiMi: updatedPersonel.durusmaKatibiMi,
      description: updatedPersonel.description,
      level: updatedPersonel.level,

      tckn: updatedPersonel.tckn,
      phoneNumber: updatedPersonel.phoneNumber,
      birthDate:
        updatedPersonel.birthDate && updatedPersonel.birthDate.split("T")[0],
      birthPlace: updatedPersonel.birthPlace,
      bloodType: updatedPersonel.bloodType,
      keyboardType: updatedPersonel.keyboardType,

      isTemporary: updatedPersonel.isTemporary,
      temporaryReason: updatedPersonel.temporaryReason,
      temporaryEndDate:
        updatedPersonel.temporaryEndDate &&
        updatedPersonel.temporaryEndDate.split("T")[0],

      isMartyrRelative: updatedPersonel.isMartyrRelative,
      isDisabled: updatedPersonel.isDisabled,
    };
  };

  const clearUpdatedPersonel = () => {
    setUpdatedPersonel({
      ad: "",
      soyad: "",
      goreveBaslamaTarihi: "",
      durusmaKatibiMi: "",
      description: "",
      level: "",

      tckn: "",
      phoneNumber: "",
      birthDate: "",
      bloodType: "",
      keyboardType: "",

      isTemporary: "",
      temporaryReason: "",
      temporaryEndDate: "",
    });
  };

  const refreshPersonel = (afterDelete = false) => {
    if (afterDelete) {
      setPersonel(null);
      setUpdatedPersonel(null);
    } else {
      const configuration = {
        method: "GET",
        url: `/api/persons/bySicil/${personel.sicil}`, // URL'den komisyon-portal kısmını kaldırdık
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios(configuration)
        .then((response) => {
          setPersonel(response.data.person);

          // response.data.person.birimID.institutionID değerini kurumlar içinde ara ve bul
          let kurum = kurumlar.find(
            (kurum) => kurum.id === response.data.person.birimID.institutionID
          );
          setPersonelKurum(kurum);

          setUpdatedPersonel(updatedPersonelAttributes(response.data.person));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleIzinDelete = (izin) => {
    // get alertify confirm
    alertify.confirm(
      "İzin Silme",
      "İzin silmek istediğinize emin misiniz?",
      () => {
        const configuration = {
          method: "DELETE",
          url: `/api/leaves/${izin._id}`, // URL'den komisyon-portal kısmını kaldırdık
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        console.log(configuration);
        axios(configuration)
          .then((response) => {
            alertify.success("İzin silindi.");
            refreshPersonel(false);
          })
          .catch((error) => {
            console.log(error);
            alertify.error("İzin silinemedi.");
          });
      },
      () => {
        alertify.error("İşlem iptal edildi.");
      }
    );
  };

  const handleGecmisBirimDelete = (birim) => {
    // get alertify confirm
    alertify.confirm(
      "Birim Silme",
      "Birim silmek istediğinize emin misiniz?",
      () => {
        const configuration = {
          method: "DELETE",
          url: `/api/personunits/${birim._id}`, // URL'den komisyon-portal kısmını kaldırdık
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        axios(configuration)
          .then((response) => {
            alertify.success("Birim silindi.");
            refreshPersonel(false);
          })
          .catch((error) => {
            console.log(error);
            alertify.error("Birim silinemedi.");
          });
      },
      () => {
        alertify.error("İşlem iptal edildi.");
      }
    );
  };

  const handleUpdate = () => {
    setLoadSpinner(true);

    const configuration = {
      method: "PUT",
      url: `/api/persons/${personel._id}`, // URL'den komisyon-portal kısmını kaldırdık
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
        let errorMessage =
          error.response.data.message ||
          "Personel Bilgisi Güncellenirken Hata Oluştu!";
        setLoadSpinner(false);
        alertify.error(errorMessage);
      });
  };

  const getPersonelBySicil = (sicil) => {
    clearUpdatedPersonel();
    setLoadSpinner(true);
    const configuration = {
      method: "GET",
      url: `/api/persons/bySicil/${sicil}`, // URL'den komisyon-portal kısmını kaldırdık
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        setPersonel(response.data.person);

        if (!response.data.person.birimID) {
          setLoadSpinner(false);
          alertify.error(
            "Personel birimi hatalı, sicil numarası ile destek alın."
          );
          setPersonel(null);
          setUpdatedPersonel(null);
          return;
        }

        let kurum = kurumlar.find(
          (kurum) => kurum.id === response.data.person.birimID.institutionID
        );

        setPersonelKurum(kurum);
        setUpdatedPersonel(updatedPersonelAttributes(response.data.person));
        setLoadSpinner(false);
      })
      .catch((error) => {
        console.log(error);
        setLoadSpinner(false);
        alertify.error("Personel bulunamadı.");
        setPersonel(null);
        setUpdatedPersonel(null);
      });

    setError(false);
  };

  const getPersonelByAdSoyad = (ad, soyad) => {
    setLoadSpinner(true);
    clearUpdatedPersonel();
    if (ad) ad = ad.trim();
    if (soyad) soyad = soyad.trim();

    const configuration = {
      method: "GET",
      url: `/api/persons/byAdSoyad/`, // URL'den komisyon-portal kısmını kaldırdık
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

          if (!person.birimID) {
            setLoadSpinner(false);
            alertify.error(
              "Personel birimi hatalı, sicil numarası ile destek alın."
            );
            setPersonel(null);
            setUpdatedPersonel(null);
            return;
          }

          let kurum = kurumlar.find(
            (kurum) => kurum.id === person.birimID.institutionID
          );

          setPersonelKurum(kurum);
          console.log("oh yeh");
          setUpdatedPersonel(updatedPersonelAttributes(person));
        }
      })
      .catch((error) => {
        console.log(error);
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
        navigate(`/komisyon-portal/personel-detay/${sicil}`);
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
        Kurum seçimi yapmanıza gerek yok, sistemde{" "}
        <b> kayıtlı tüm personelleri</b> arayabilirsiniz.
        <br />
        Personelin birimini değiştirebilir, izin bilgisi ekleyebilir veya
        güncelleyebilirsiniz.
      </span>
      <hr />
      <div>
        {/* Arama formunu her zaman göster - urlSicil kontrolünü kaldırdık */}
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
                  <Button
                    color="danger"
                    type="submit"
                    onClick={(e) => handleFormSubmit(e)}
                  >
                    Getir
                  </Button>
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
                    onChange={(e) =>
                      navigate(
                        `/komisyon-portal/personel-detay/${e.target.value}`
                      )
                    }
                  />
                </Col>
                <Col>
                  <Button
                    color="danger"
                    type="submit"
                    onClick={(e) => handleFormSubmit(e)}
                  >
                    Getir
                  </Button>
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
                    <td>
                      {person.sicil} {person.status === false && "(P)"}
                    </td>
                    <td>{person.ad}</td>
                    <td>{person.soyad}</td>
                    <td>
                      {person.birimID
                        ? person.birimID.name
                        : "BİLİNMEYEN BİRİM"}
                    </td>
                    <td>
                      {person.title ? person.title.name : "BELİRTİLMEMİŞ"}
                    </td>
                    <td>
                      <Button
                        color="info"
                        size="sm"
                        onClick={(e) => {
                          setPersoneller([]);
                          window.scrollTo(0, 0);
                          navigate(
                            `/komisyon-portal/personel-detay/${person.sicil}`
                          );
                          // setPersonel(person);
                          // let kurum = kurumlar.find(
                          //   (kurum) => kurum.id === person.birimID.institutionID
                          // );
                          // setPersonelKurum(kurum);
                          // setUpdatedPersonel(updatedPersonelAttributes(person));
                          // setPersoneller([]);
                          // window.scrollTo(0, 0);
                        }}
                      >
                        DETAY
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {personel && (
          <div className="mt-5">
            <h4>Özlük</h4>
            <hr />

            <Row className="mt-2">
              <Col>
                <Label>Personel Durum</Label>
                <Input
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
              </Col>
              <Col hidden={personel.status}>
                <Label>Ayrılış Nedeni</Label>
                <Input
                  type="text"
                  value={
                    personel.deactivationReason
                      ? personel.deactivationReason
                      : ""
                  }
                  disabled
                />
              </Col>

              <Col>
                <Label>Geçici Personel</Label>
                <Input
                  type="select"
                  name="isTemporary"
                  id="isTemporary"
                  value={updatedPersonel.isTemporary ? "true" : "false"} // Boolean değeri stringe çeviriyoruz
                  onChange={handleInputChange}
                >
                  <option value="true">Evet</option>
                  <option value="false">Hayır</option>
                </Input>
              </Col>
            </Row>

            <Row hidden={personel.isSuspended === false}>
              <Col>
                <Label>Uzaklaştırma Gerekçe</Label>
                <Input
                  type="text"
                  name="suspensionReason"
                  id="suspensionReason"
                  value={
                    personel.suspensionReason
                      ? personel.suspensionReason
                      : "BELİRTİLMEMİŞ"
                  }
                  disabled
                />
              </Col>
              <Col>
                <Label>Uzaklaştırma Bitiş Tarihi</Label>
                <Input
                  type="text"
                  name="suspensionEndDate"
                  id="suspensionEndDate"
                  value={renderDate_GGAAYYYY(personel.suspensionEndDate)}
                  disabled
                />
              </Col>
            </Row>

            <Row hidden={!updatedPersonel.isTemporary}>
              <Col>
                <Label>Geçici Personel Açıklama</Label>
                <Input
                  type="text"
                  name="temporaryReason"
                  id="temporaryReason"
                  value={updatedPersonel.temporaryReason}
                  onChange={handleInputChange}
                />
              </Col>
              <Col>
                <Label>Geçici Personel Bitiş Tarihi</Label>
                <Input
                  type="date"
                  name="temporaryEndDate"
                  id="temporaryEndDate"
                  value={updatedPersonel.temporaryEndDate}
                  onChange={handleInputChange}
                />
              </Col>
              <Col>
                <Label> Geçici Personel Birim </Label>
                <Input
                  type="text"
                  value={
                    personel.temporaryBirimID
                      ? personel.temporaryBirimID.name
                      : "BELİRTİLMEMİŞ"
                  }
                  disabled
                />
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
              <Col>
                <FormGroup className="my-2">
                  <Label for="isMartyrRelative" className="toggle-switch">
                    <Input
                      type="checkbox"
                      name="isMartyrRelative"
                      id="isMartyrRelative"
                      checked={updatedPersonel.isMartyrRelative}
                      onChange={handleInputChange}
                    />
                    <span></span> Şehit Gazi Yakını
                  </Label>
                </FormGroup>
                <FormGroup className="my-2">
                  <Label for="isDisabled" className="toggle-switch">
                    <Input
                      type="checkbox"
                      name="isDisabled"
                      id="isDisabled"
                      checked={updatedPersonel.isDisabled}
                      onChange={handleInputChange}
                    />
                    <span></span> Engelli
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col hidden>
                <Label hidden>Çalıştığı Kurum </Label>
                <Input
                  type="text"
                  value={personelKurum ? personelKurum.name : "-"}
                  disabled
                  hidden
                />
              </Col>
              <Col>
                <Label>Çalıştığı Birim </Label>
                <Input type="text" value={personel.birimID.name} disabled />
              </Col>

              <Col>
                <Label>Birimde Çalıştığı Süre</Label>
                <Input
                  type="text"
                  value={calculateGorevSuresi(personel.birimeBaslamaTarihi)}
                  disabled
                />
              </Col>

              <Col>
                <Label>Ünvan</Label>
                <Input
                  type="text"
                  value={personel.title ? personel.title.name : "BELİRTİLMEMİŞ"}
                  disabled
                />
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

            {personel.title && personel.title.kind === "zabitkatibi" && (
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

            {personel.title &&
              (personel.title.kind === "yaziislerimudürü" ||
                personel.title.kind === "mubasir") && (
                <Row className="mt-2">
                  <Col>
                    <Label>İkinci Birim</Label>
                    <Input
                      type="text"
                      name="ikinciBirimID"
                      id="ikinciBirimID"
                      value={
                        personel.ikinciBirimID
                          ? personel.ikinciBirimID.name
                          : "İkinci Birim Tanımlanmamış"
                      }
                      disabled
                    ></Input>
                  </Col>
                </Row>
              )}

            <Row className="mt-2">
              <Col>
                <Label>Açıklama</Label>
                <Input
                  type="text"
                  id="description"
                  name="description"
                  value={updatedPersonel.description}
                  onChange={handleInputChange}
                />
              </Col>
              <Col>
                <Label>Seviye (1 Çok İyi - 5 Çok Kötü)</Label>
                <Input
                  type="number"
                  id="level"
                  name="level"
                  value={updatedPersonel.level}
                  onChange={handleInputChange}
                  min={1}
                  max={5}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <Label>TC Kimlik Numarası</Label>
                <Input
                  type="text"
                  id="tckn"
                  name="tckn"
                  value={updatedPersonel.tckn}
                  onChange={handleInputChange}
                />
              </Col>

              <Col>
                <Label>Telefon Numarası</Label>
                <Input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={updatedPersonel.phoneNumber}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <Label>Doğum Tarihi</Label>
                <Input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={updatedPersonel.birthDate}
                  onChange={handleInputChange}
                />
              </Col>
              <Col hidden={!updatedPersonel.birthDate}>
                <Label>Yaş</Label>
                <Input
                  type="text"
                  value={calculateGorevSuresi(updatedPersonel.birthDate)}
                  disabled
                />
              </Col>
              <Col>
                <Label>Doğum Yeri</Label>
                <Input
                  type="text"
                  id="birthPlace"
                  name="birthPlace"
                  value={updatedPersonel.birthPlace}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <Label>Kan Grubu</Label>
                <Input
                  type="select"
                  name="bloodType"
                  id="bloodType"
                  value={updatedPersonel.bloodType}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz</option>
                  <option value="0+">0 Rh+</option>
                  <option value="0-">0 Rh-</option>
                  <option value="A+">A Rh+</option>
                  <option value="A-">A Rh-</option>
                  <option value="B+">B Rh+</option>
                  <option value="B-">B Rh-</option>
                  <option value="AB+">AB Rh+</option>
                  <option value="AB-">AB Rh-</option>
                </Input>
              </Col>

              <Col>
                <Label>Kullandığı Klavye</Label>
                <Input
                  type="select"
                  name="keyboardType"
                  id="keyboardType"
                  value={updatedPersonel.keyboardType}
                  onChange={handleInputChange}
                >
                  <option value="">Seçiniz</option>
                  <option value="F">F Klavye</option>
                  <option value="Q">Q Klavye</option>
                </Input>
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <Button
                  className="m-1"
                  onClick={(e) => handleUpdate(e)}
                  color="success"
                >
                  Değişiklikleri Kaydet
                </Button>
                <Button
                  onClick={calistigiBirimGuncelleModalToggle}
                  className="m-1"
                  color="primary"
                >
                  Birim Değiştir
                </Button>
                <Button
                  className="m-1"
                  color="warning"
                  onClick={durumDegistirModalToggle}
                >
                  Durum Değiştir
                </Button>

                <Button
                  className="m-1"
                  color="info"
                  onClick={unvanGuncelleModalToggle}
                >
                  Ünvan Değiştir
                </Button>

                <Button
                  onClick={deletePersonelModalToggle}
                  className="m-1"
                  color="danger"
                >
                  Sil
                </Button>
              </Col>
            </Row>

            {/* İZİNLER */}
            <div className="mt-5">
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
                      <td>
                        {renderDate_GGAAYYYY(izin.startDate.split("T")[0])}
                      </td>
                      <td>
                        {" "}
                        {renderDate_GGAAYYYY(izin.endDate.split("T")[0])}
                      </td>
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

            {/* ÇALIŞTIĞI BİRİMLER */}
            <div className="mt-5">
              <h4>Çalıştığı Birimler </h4>
              <hr />
              <Table>
                <thead>
                  <tr>
                    <th>Birim Adı</th>
                    <th>Birime Başlangıç Tarihi </th>
                    <th>Birimden Ayrılış Tarihi </th>
                    <th>Süre </th>
                    <th>Gerekçe</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {personel.gecmisBirimler.map((birim) => (
                    <tr key={birim._id}>
                      <td>{birim.unitID.name}</td>
                      <td>{birim.startDate.split("T")[0]}</td>
                      <td>{birim.endDate.split("T")[0]}</td>
                      <td>{calculateGorevSuresi(birim.startDate)}</td>
                      <td>{birim.detail}</td>
                      <td>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={(e) => {
                            handleGecmisBirimDelete(birim);
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
        <PersonelDurumGuncelleModal
          modal={showDurumDegistirModal}
          toggle={durumDegistirModalToggle}
          personel={personel}
          token={token}
          refreshPersonel={refreshPersonel}
        />
        <PersonelUnvanGuncelleModal
          modal={showUnvanGuncelleModal}
          toggle={unvanGuncelleModalToggle}
          personel={personel}
          token={token}
          refreshPersonel={refreshPersonel}
          unvanlar={unvanlar}
        />

        <PersonelSilModal
          modal={showDeletePersonelModal}
          toggle={deletePersonelModalToggle}
          personel={personel}
          token={token}
          refreshPersonel={refreshPersonel}
        />
      </div>
    </div>
  );
}
