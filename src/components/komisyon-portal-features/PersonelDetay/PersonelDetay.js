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
  Card,
  CardHeader,
  CardBody,
  InputGroup,
  InputGroupText,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
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
  const { sicil: urlSicil } = useParams();
  const navigate = useNavigate();

  const [personel, setPersonel] = useState(null);

  const [personeller, setPersoneller] = useState([]);
  const [updatedPersonel, setUpdatedPersonel] = useState({ ...personel });
  const [sicil, setSicil] = useState(urlSicil || "");
  const [ad, setAd] = useState(null);
  const [soyad, setSoyad] = useState(null);
  const [searchBy, setSearchBy] = useState("adSoyad");
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  // Modal durumları
  const [showCalistigiKisiGuncelleModal, setShowCalistigiKisiGuncelleModal] =
    useState(false);
  const [showUnvanGuncelleModal, setShowUnvanGuncelleModal] = useState(false);
  const [showCalistigiBirimGuncelleModal, setShowCalistigiBirimGuncelleModal] =
    useState(false);
  const [showDeletePersonelModal, setShowDeletePersonelModal] = useState(false);
  const [showDurumDegistirModal, setShowDurumDegistirModal] = useState(false);
  const [showIzinEkleModal, setShowIzinEkleModal] = useState(false);

  // Toggle fonksiyonları
  const calistigiKisiGuncelleModalToggle = () =>
    setShowCalistigiKisiGuncelleModal(!showCalistigiKisiGuncelleModal);
  const unvanGuncelleModalToggle = () =>
    setShowUnvanGuncelleModal(!showUnvanGuncelleModal);
  const calistigiBirimGuncelleModalToggle = () =>
    setShowCalistigiBirimGuncelleModal(!showCalistigiBirimGuncelleModal);
  const deletePersonelModalToggle = () =>
    setShowDeletePersonelModal(!showDeletePersonelModal);
  const durumDegistirModalToggle = () =>
    setShowDurumDegistirModal(!showDurumDegistirModal);
  const izinEkleModalToggle = () => setShowIzinEkleModal(!showIzinEkleModal);

  // Tab değişimi
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    // URL'de sicil varsa personeli getir
    if (urlSicil) {
      getPersonelBySicil(urlSicil);
      setSicil(urlSicil);
    }
    // eslint-disable-next-line
  }, [urlSicil]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "isTemporary") {
      const isTemporary = value === "true";

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
    // ...existing code...
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
    // ...existing code...
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
    // ...existing code...
    if (afterDelete) {
      setPersonel(null);
      setUpdatedPersonel(null);
    } else {
      const configuration = {
        method: "GET",
        url: `/api/persons/bySicil/${personel.sicil}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios(configuration)
        .then((response) => {
          setPersonel(response.data.person);

          setUpdatedPersonel(updatedPersonelAttributes(response.data.person));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleIzinDelete = (izin) => {
    // ...existing code...
    alertify.confirm(
      "İzin Silme",
      "İzin silmek istediğinize emin misiniz?",
      () => {
        const configuration = {
          method: "DELETE",
          url: `/api/leaves/${izin._id}`,
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
    // ...existing code...
    alertify.confirm(
      "Birim Silme",
      "Birim silmek istediğinize emin misiniz?",
      () => {
        const configuration = {
          method: "DELETE",
          url: `/api/personunits/${birim._id}`,
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
    // ...existing code...
    setLoadSpinner(true);

    const configuration = {
      method: "PUT",
      url: `/api/persons/${personel._id}`,
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
    // ...existing code...
    clearUpdatedPersonel();
    setLoadSpinner(true);
    const configuration = {
      method: "GET",
      url: `/api/persons/bySicil/${sicil}`,
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
    // ...existing code...
    setLoadSpinner(true);
    clearUpdatedPersonel();
    if (ad) ad = ad.trim();
    if (soyad) soyad = soyad.trim();

    const configuration = {
      method: "GET",
      url: `/api/persons/byAdSoyad/`,
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
    // ...existing code...
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

  // Statü badge'ı için renk belirle
  const getStatusColor = () => {
    if (!personel) return "secondary";
    if (!personel.status) return "danger";
    if (personel.isSuspended) return "warning";
    return "success";
  };

  return (
    <div className="personel-detay-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-user-circle me-2"></i>
            Personel Detay
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <div>
              Sicil ile birlikte personel hakkında detaylı bilgi alabilirsiniz.
              Kurum seçimi yapmanıza gerek yok, sistemde{" "}
              <b>kayıtlı tüm personelleri</b> arayabilirsiniz. Personelin
              birimini değiştirebilir, izin bilgisi ekleyebilir veya
              güncelleyebilirsiniz.
            </div>
          </Alert>

          {/* Arama Formu */}
          <Card className="border-0 shadow-sm mb-4">
            <CardBody className="bg-light">
              <Form onSubmit={(e) => handleFormSubmit(e)}>
                <Row className="align-items-end">
                  <Col md={3}>
                    <FormGroup className="mb-md-0">
                      <Label className="fw-bold">Arama Tipi</Label>
                      <div>
                        <FormGroup check inline>
                          <Input
                            type="radio"
                            name="searchBy"
                            id="searchBySicil"
                            value="sicil"
                            checked={searchBy === "sicil"}
                            onChange={handleSearchByChange}
                          />
                          <Label check for="searchBySicil">
                            <i className="fas fa-id-card me-1"></i> Sicil ile
                          </Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Input
                            type="radio"
                            name="searchBy"
                            id="searchByAdSoyad"
                            value="adSoyad"
                            checked={searchBy === "adSoyad"}
                            onChange={handleSearchByChange}
                          />
                          <Label check for="searchByAdSoyad">
                            <i className="fas fa-user me-1"></i> Ad Soyad ile
                          </Label>
                        </FormGroup>
                      </div>
                    </FormGroup>
                  </Col>

                  {searchBy === "sicil" ? (
                    <Col md={6}>
                      <FormGroup className="mb-md-0">
                        <Label for="sicil" className="fw-bold">
                          Sicil Numarası
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-hashtag"></i>
                          </InputGroupText>
                          <Input
                            id="sicil"
                            name="sicil"
                            placeholder="Örn: 123456"
                            type="number"
                            min="0"
                            value={sicil}
                            onChange={(e) => setSicil(e.target.value)}
                          />
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  ) : (
                    <Col md={6}>
                      <Row>
                        <Col md={6}>
                          <FormGroup className="mb-md-0">
                            <Label for="ad" className="fw-bold">
                              Adı
                            </Label>
                            <InputGroup>
                              <InputGroupText>
                                <i className="fas fa-user"></i>
                              </InputGroupText>
                              <Input
                                id="ad"
                                name="ad"
                                placeholder="Adı"
                                type="text"
                                value={ad || ""}
                                onChange={(e) => setAd(e.target.value)}
                              />
                            </InputGroup>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup className="mb-md-0">
                            <Label for="soyad" className="fw-bold">
                              Soyadı
                            </Label>
                            <Input
                              id="soyad"
                              name="soyad"
                              placeholder="Soyadı"
                              type="text"
                              value={soyad || ""}
                              onChange={(e) => setSoyad(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Col>
                  )}

                  <Col md={3}>
                    <Button color="danger" type="submit" className="w-100">
                      <i className="fas fa-search me-2"></i> Personel Ara
                    </Button>
                  </Col>
                </Row>

                {error && (
                  <Alert color="danger" className="mt-3 mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errorMessage}
                  </Alert>
                )}
              </Form>
            </CardBody>
          </Card>

          {/* Yükleme Spinner'ı */}
          {loadSpinner && (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Personel bilgileri yükleniyor...
              </p>
            </div>
          )}

          {/* Personel Listesi (Birden fazla sonuç bulunduğunda) */}
          {personeller.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-users me-2"></i>
                  Personel Arama Sonuçları
                  <Badge color="danger" pill className="ms-2">
                    {personeller.length} kişi
                  </Badge>
                </h5>
              </CardHeader>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <Table hover striped className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Sicil</th>
                        <th>Ad</th>
                        <th>Soyad</th>
                        <th>Birim</th>
                        <th>Ünvan</th>
                        <th className="text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personeller.map((person) => (
                        <tr key={person._id}>
                          <td>
                            {person.sicil}{" "}
                            {person.status === false && (
                              <Badge color="danger" pill size="sm">
                                Pasif
                              </Badge>
                            )}
                          </td>
                          <td>{person.ad}</td>
                          <td>{person.soyad}</td>
                          <td>
                            {person.birimID ? (
                              person.birimID.name
                            ) : (
                              <Badge color="warning">BİLİNMEYEN BİRİM</Badge>
                            )}
                          </td>
                          <td>
                            {person.title ? (
                              <Badge color="primary" pill>
                                {person.title.name}
                              </Badge>
                            ) : (
                              <Badge color="secondary" pill>
                                BELİRTİLMEMİŞ
                              </Badge>
                            )}
                          </td>
                          <td className="text-center">
                            <Button
                              color="info"
                              size="sm"
                              onClick={(e) => {
                                setPersoneller([]);
                                window.scrollTo(0, 0);
                                navigate(
                                  `/komisyon-portal/personel-detay/${person.sicil}`
                                );
                              }}
                            >
                              <i className="fas fa-eye me-1"></i> Detay
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Personel Detay */}
          {personel && (
            <div className="mt-4">
              <Card className="border-0 shadow-sm mb-4">
                <CardHeader className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#e74c3c",
                          color: "#fff",
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      >
                        {personel.ad.charAt(0)}
                        {personel.soyad.charAt(0)}
                      </div>
                      <div>
                        <h4 className="mb-0">
                          {personel.ad} {personel.soyad}
                        </h4>
                        <div className="text-muted">
                          {personel.title
                            ? personel.title.name
                            : "Ünvan Belirtilmemiş"}{" "}
                          | Sicil: {personel.sicil}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center">
                      <Badge
                        color={getStatusColor()}
                        pill
                        className="me-3 px-3 py-2"
                      >
                        {personel.status
                          ? personel.isSuspended
                            ? "Uzaklaştırılmış"
                            : "Aktif"
                          : "Pasif"}
                      </Badge>

                      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle
                          color="danger"
                          size="sm"
                          className="d-flex align-items-center"
                        >
                          <i className="fas fa-cog me-1"></i> İşlemler
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem
                            onClick={calistigiBirimGuncelleModalToggle}
                          >
                            <i className="fas fa-building me-2"></i>Birim
                            Değiştir
                          </DropdownItem>
                          <DropdownItem onClick={unvanGuncelleModalToggle}>
                            <i className="fas fa-user-tie me-2"></i>Ünvan
                            Değiştir
                          </DropdownItem>
                          <DropdownItem onClick={durumDegistirModalToggle}>
                            <i className="fas fa-exchange-alt me-2"></i>Durum
                            Değiştir
                          </DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem
                            className="text-danger"
                            onClick={deletePersonelModalToggle}
                          >
                            <i className="fas fa-trash me-2"></i>Sil
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  <Nav tabs className="mb-4">
                    <NavItem>
                      <NavLink
                        className={`${activeTab === "1" ? "active" : ""}`}
                        onClick={() => toggleTab("1")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-id-card me-2"></i>
                        Kişisel Bilgiler
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`${activeTab === "2" ? "active" : ""}`}
                        onClick={() => toggleTab("2")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-calendar-alt me-2"></i>
                        İzinler
                        {personel.izindeMi && (
                          <Badge color="danger" pill className="ms-2">
                            İZİNLİ
                          </Badge>
                        )}
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`${activeTab === "3" ? "active" : ""}`}
                        onClick={() => toggleTab("3")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-history me-2"></i>
                        Çalıştığı Birimler
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={activeTab}>
                    {/* Kişisel Bilgiler Sekmesi */}
                    <TabPane tabId="1">
                      <Card className="border-0 mb-4">
                        <CardBody className="bg-light">
                          <Row className="mb-3">
                            <Col md={4}>
                              <FormGroup>
                                <Label className="text-muted small text-uppercase">
                                  Durum
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control-plaintext fw-bold"
                                  value={
                                    personel.status
                                      ? personel.isSuspended
                                        ? "Aktif (Uzaklaştırma)"
                                        : "Aktif"
                                      : "Pasif"
                                  }
                                  disabled
                                />
                              </FormGroup>
                            </Col>
                            <Col md={4} hidden={personel.status}>
                              <FormGroup>
                                <Label className="text-muted small text-uppercase">
                                  Ayrılış Nedeni
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control-plaintext fw-bold"
                                  value={
                                    personel.deactivationReason
                                      ? personel.deactivationReason
                                      : "BELİRTİLMEMİŞ"
                                  }
                                  disabled
                                />
                              </FormGroup>
                            </Col>
                            <Col md={4}>
                              <FormGroup>
                                <Label className="fw-bold" for="isTemporary">
                                  Geçici Personel
                                </Label>
                                <Input
                                  type="select"
                                  name="isTemporary"
                                  id="isTemporary"
                                  value={
                                    updatedPersonel.isTemporary
                                      ? "true"
                                      : "false"
                                  }
                                  onChange={handleInputChange}
                                  className="form-select"
                                >
                                  <option value="true">Evet</option>
                                  <option value="false">Hayır</option>
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>

                          {/* Uzaklaştırma Bilgileri */}
                          <Row
                            className="mb-3"
                            hidden={personel.isSuspended === false}
                          >
                            <Col md={6}>
                              <FormGroup>
                                <Label className="text-muted small text-uppercase">
                                  Uzaklaştırma Gerekçe
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control-plaintext fw-bold"
                                  value={
                                    personel.suspensionReason
                                      ? personel.suspensionReason
                                      : "BELİRTİLMEMİŞ"
                                  }
                                  disabled
                                />
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label className="text-muted small text-uppercase">
                                  Uzaklaştırma Bitiş Tarihi
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control-plaintext fw-bold"
                                  value={renderDate_GGAAYYYY(
                                    personel.suspensionEndDate
                                  )}
                                  disabled
                                />
                              </FormGroup>
                            </Col>
                          </Row>

                          {/* Geçici Personel Bilgileri */}
                          <Row
                            className="mb-4"
                            hidden={!updatedPersonel.isTemporary}
                          >
                            <Col md={4}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Geçici Personel Açıklama
                                </Label>
                                <Input
                                  type="text"
                                  name="temporaryReason"
                                  id="temporaryReason"
                                  value={updatedPersonel.temporaryReason || ""}
                                  onChange={handleInputChange}
                                  placeholder="Geçici görevlendirme gerekçesi"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={4}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Geçici Personel Bitiş Tarihi
                                </Label>
                                <Input
                                  type="date"
                                  name="temporaryEndDate"
                                  id="temporaryEndDate"
                                  value={updatedPersonel.temporaryEndDate || ""}
                                  onChange={handleInputChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md={4}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Geçici Personel Birim
                                </Label>
                                <Input
                                  type="text"
                                  value={
                                    personel.temporaryBirimID
                                      ? personel.temporaryBirimID.name
                                      : "BELİRTİLMEMİŞ"
                                  }
                                  disabled
                                />
                              </FormGroup>
                            </Col>
                          </Row>

                          <hr className="my-4" />

                          {/* Temel Bilgiler */}
                          <h5 className="mb-3 text-danger">
                            <i className="fas fa-id-card me-2"></i>
                            Kişisel Bilgiler
                          </h5>
                          <Row className="mb-3">
                            <Col md={3}>
                              <FormGroup>
                                <Label className="fw-bold">Sicil</Label>
                                <Input
                                  type="text"
                                  value={personel.sicil}
                                  disabled
                                  className="bg-light"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={3}>
                              <FormGroup>
                                <Label className="fw-bold">Ad</Label>
                                <Input
                                  id="ad"
                                  name="ad"
                                  type="text"
                                  value={updatedPersonel.ad || ""}
                                  onChange={handleInputChange}
                                  placeholder="Adı"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={3}>
                              <FormGroup>
                                <Label className="fw-bold">Soyad</Label>
                                <Input
                                  type="text"
                                  id="soyad"
                                  name="soyad"
                                  value={updatedPersonel.soyad || ""}
                                  onChange={handleInputChange}
                                  placeholder="Soyadı"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={3}>
                              <div className="d-flex flex-column justify-content-between h-100">
                                <div>
                                  <div className="form-check form-switch mb-2">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id="isMartyrRelative"
                                      name="isMartyrRelative"
                                      checked={
                                        updatedPersonel.isMartyrRelative ||
                                        false
                                      }
                                      onChange={handleInputChange}
                                    />
                                    <Label
                                      className="form-check-label fw-bold"
                                      for="isMartyrRelative"
                                    >
                                      Şehit Gazi Yakını
                                    </Label>
                                  </div>
                                  <div className="form-check form-switch">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id="isDisabled"
                                      name="isDisabled"
                                      checked={
                                        updatedPersonel.isDisabled || false
                                      }
                                      onChange={handleInputChange}
                                    />
                                    <Label
                                      className="form-check-label fw-bold"
                                      for="isDisabled"
                                    >
                                      Engelli
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Çalıştığı Birim
                                </Label>
                                <InputGroup>
                                  <Input
                                    type="text"
                                    value={personel.birimID.name}
                                    disabled
                                    className="bg-light"
                                  />
                                  <Button
                                    color="primary"
                                    outline
                                    onClick={calistigiBirimGuncelleModalToggle}
                                    title="Birim Değiştir"
                                  >
                                    <i className="fas fa-exchange-alt"></i>
                                  </Button>
                                </InputGroup>
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Birimde Çalıştığı Süre
                                </Label>
                                <Input
                                  type="text"
                                  value={calculateGorevSuresi(
                                    personel.birimeBaslamaTarihi
                                  )}
                                  disabled
                                  className="bg-light"
                                />
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">Ünvan</Label>
                                <InputGroup>
                                  <Input
                                    type="text"
                                    value={
                                      personel.title
                                        ? personel.title.name
                                        : "BELİRTİLMEMİŞ"
                                    }
                                    disabled
                                    className="bg-light"
                                  />
                                  <Button
                                    color="primary"
                                    outline
                                    onClick={unvanGuncelleModalToggle}
                                    title="Ünvan Değiştir"
                                  >
                                    <i className="fas fa-exchange-alt"></i>
                                  </Button>
                                </InputGroup>
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <Row>
                                <Col md={6}>
                                  <FormGroup>
                                    <Label className="fw-bold">
                                      Göreve Başlama Tarihi
                                    </Label>
                                    <Input
                                      type="date"
                                      id="goreveBaslamaTarihi"
                                      name="goreveBaslamaTarihi"
                                      value={
                                        updatedPersonel.goreveBaslamaTarihi ||
                                        ""
                                      }
                                      onChange={handleInputChange}
                                    />
                                  </FormGroup>
                                </Col>
                                <Col md={6}>
                                  <FormGroup>
                                    <Label className="fw-bold">
                                      Görev Süresi
                                    </Label>
                                    <Input
                                      type="text"
                                      value={calculateGorevSuresi(
                                        personel.goreveBaslamaTarihi
                                      )}
                                      disabled
                                      className="bg-light"
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          {/* Zabıt Katibi veya Yazı İşleri Müdürü ise */}
                          {personel.title &&
                            (personel.title.kind === "zabitkatibi" ||
                              personel.title.kind === "yaziislerimudürü" ||
                              personel.title.kind === "mubasir") && (
                              <>
                                <hr className="my-4" />
                                <h5 className="mb-3 text-danger">
                                  <i className="fas fa-link me-2"></i>
                                  Bağlantılı Bilgiler
                                </h5>
                                <Row className="mb-3">
                                  {personel.title.kind === "zabitkatibi" && (
                                    <>
                                      <Col md={6}>
                                        <FormGroup>
                                          <Label className="fw-bold">
                                            Duruşma Katibi
                                          </Label>
                                          <Input
                                            type="select"
                                            name="durusmaKatibiMi"
                                            id="durusmaKatibiMi"
                                            value={
                                              updatedPersonel.durusmaKatibiMi 
                                            }
                                            onChange={handleInputChange}
                                            className="form-select"
                                          >
                                            <option value="true">Evet</option>
                                            <option value="false">Hayır</option>
                                          </Input>
                                        </FormGroup>
                                      </Col>
                                      <Col md={6}>
                                        <FormGroup>
                                          <Label className="fw-bold">
                                            Çalıştığı Kişi
                                          </Label>
                                          <InputGroup>
                                            <Input
                                              type="text"
                                              value={
                                                personel.calistigiKisi
                                                  ? `${personel.calistigiKisi.title.name} | ${personel.calistigiKisi.ad} ${personel.calistigiKisi.soyad} - ${personel.calistigiKisi.sicil}`
                                                  : "BELİRTİLMEMİŞ"
                                              }
                                              disabled
                                              className="bg-light"
                                            />
                                            <Button
                                              color="primary"
                                              outline
                                              onClick={
                                                calistigiKisiGuncelleModalToggle
                                              }
                                            >
                                              <i className="fas fa-exchange-alt"></i>
                                            </Button>
                                          </InputGroup>
                                        </FormGroup>
                                      </Col>
                                    </>
                                  )}

                                  {(personel.title.kind ===
                                    "yaziislerimudürü" ||
                                    personel.title.kind === "mubasir") && (
                                    <Col md={6}>
                                      <FormGroup>
                                        <Label className="fw-bold">
                                          İkinci Birim
                                        </Label>
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
                                          className="bg-light"
                                        />
                                      </FormGroup>
                                    </Col>
                                  )}
                                </Row>
                              </>
                            )}

                          <hr className="my-4" />
                          <h5 className="mb-3 text-danger">
                            <i className="fas fa-info-circle me-2"></i>
                            Ek Bilgiler
                          </h5>
                          <Row className="mb-3">
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">Açıklama</Label>
                                <Input
                                  type="text"
                                  id="description"
                                  name="description"
                                  value={updatedPersonel.description || ""}
                                  onChange={handleInputChange}
                                  placeholder="Personel hakkında açıklama"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Seviye (1 Çok İyi - 5 Çok Kötü)
                                </Label>
                                <Input
                                  type="select"
                                  id="level"
                                  name="level"
                                  value={updatedPersonel.level || ""}
                                  onChange={handleInputChange}
                                  className="form-select"
                                >
                                  <option value="">Seçiniz</option>
                                  <option value="1">1 - Çok İyi</option>
                                  <option value="2">2 - İyi</option>
                                  <option value="3">3 - Orta</option>
                                  <option value="4">4 - Kötü</option>
                                  <option value="5">5 - Çok Kötü</option>
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>

                          <hr className="my-4" />
                          <h5 className="mb-3 text-danger">
                            <i className="fas fa-address-card me-2"></i>
                            İletişim ve Kişisel Detaylar
                          </h5>
                          <Row className="mb-3">
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  TC Kimlik Numarası
                                </Label>
                                <Input
                                  type="text"
                                  id="tckn"
                                  name="tckn"
                                  value={updatedPersonel.tckn || ""}
                                  onChange={handleInputChange}
                                  placeholder="TC Kimlik Numarası"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Telefon Numarası
                                </Label>
                                <InputGroup>
                                  <InputGroupText>
                                    <i className="fas fa-phone"></i>
                                  </InputGroupText>
                                  <Input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={updatedPersonel.phoneNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder="Örn: 0505 123 4567"
                                  />
                                </InputGroup>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={3}>
                              <FormGroup>
                                <Label className="fw-bold">Doğum Tarihi</Label>
                                <Input
                                  type="date"
                                  id="birthDate"
                                  name="birthDate"
                                  value={updatedPersonel.birthDate || ""}
                                  onChange={handleInputChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md={3} hidden={!updatedPersonel.birthDate}>
                              <FormGroup>
                                <Label className="fw-bold">Yaş</Label>
                                <Input
                                  type="text"
                                  value={
                                    updatedPersonel.birthDate
                                      ? calculateGorevSuresi(
                                          updatedPersonel.birthDate
                                        )
                                      : ""
                                  }
                                  disabled
                                  className="bg-light"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={3}>
                              <FormGroup>
                                <Label className="fw-bold">Doğum Yeri</Label>
                                <Input
                                  type="text"
                                  id="birthPlace"
                                  name="birthPlace"
                                  value={updatedPersonel.birthPlace || ""}
                                  onChange={handleInputChange}
                                  placeholder="Doğum yeri"
                                />
                              </FormGroup>
                            </Col>
                            <Col md={3}>
                              <FormGroup>
                                <Label className="fw-bold">Kan Grubu</Label>
                                <Input
                                  type="select"
                                  name="bloodType"
                                  id="bloodType"
                                  value={updatedPersonel.bloodType || ""}
                                  onChange={handleInputChange}
                                  className="form-select"
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
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <FormGroup>
                                <Label className="fw-bold">
                                  Kullandığı Klavye
                                </Label>
                                <div className="d-flex">
                                  <div className="form-check form-check-inline">
                                    <Input
                                      className="form-check-input"
                                      type="radio"
                                      name="keyboardType"
                                      id="keyboardF"
                                      value="F"
                                      checked={
                                        updatedPersonel.keyboardType === "F"
                                      }
                                      onChange={handleInputChange}
                                    />
                                    <Label
                                      className="form-check-label"
                                      for="keyboardF"
                                    >
                                      F Klavye
                                    </Label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <Input
                                      className="form-check-input"
                                      type="radio"
                                      name="keyboardType"
                                      id="keyboardQ"
                                      value="Q"
                                      checked={
                                        updatedPersonel.keyboardType === "Q"
                                      }
                                      onChange={handleInputChange}
                                    />
                                    <Label
                                      className="form-check-label"
                                      for="keyboardQ"
                                    >
                                      Q Klavye
                                    </Label>
                                  </div>
                                </div>
                              </FormGroup>
                            </Col>
                          </Row>

                          <hr className="my-4" />

                          {/* Değişiklikleri Kaydet Butonu */}
                          <div className="d-flex justify-content-end">
                            <Button
                              onClick={(e) => handleUpdate(e)}
                              color="success"
                              size="lg"
                            >
                              <i className="fas fa-save me-2"></i>
                              Değişiklikleri Kaydet
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </TabPane>

                    {/* İzinler Sekmesi */}
                    <TabPane tabId="2">
                      <Card className="border-0">
                        <CardBody>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">
                              <i className="fas fa-calendar-alt me-2"></i>
                              İzinler
                              {personel.izindeMi ? (
                                <Badge color="danger" pill className="ms-2">
                                  İZİNLİ
                                </Badge>
                              ) : (
                                <Badge color="success" pill className="ms-2">
                                  GÖREVDE
                                </Badge>
                              )}
                            </h5>

                            <Button
                              onClick={izinEkleModalToggle}
                              color="success"
                            >
                              <i className="fas fa-plus-circle me-2"></i>
                              Yeni İzin Ekle
                            </Button>
                          </div>

                          {personel.izinler.length === 0 ? (
                            <Alert color="info">
                              <i className="fas fa-info-circle me-2"></i>
                              Personele ait izin kaydı bulunmamaktadır.
                            </Alert>
                          ) : (
                            <div className="table-responsive">
                              <Table hover striped bordered>
                                <thead className="table-light">
                                  <tr>
                                    <th>İzin Tipi</th>
                                    <th>İzin Başlangıç</th>
                                    <th>İzin Bitiş</th>
                                    <th>Yorum</th>
                                    <th style={{ width: "100px" }}>İşlemler</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {personel.izinler.map((izin) => (
                                    <tr key={izin._id}>
                                      <td>
                                        <Badge color="info" pill>
                                          {getIzinType(izin.reason)}
                                        </Badge>
                                      </td>
                                      <td>
                                        {renderDate_GGAAYYYY(
                                          izin.startDate.split("T")[0]
                                        )}
                                      </td>
                                      <td>
                                        {renderDate_GGAAYYYY(
                                          izin.endDate.split("T")[0]
                                        )}
                                      </td>
                                      <td>{izin.comment}</td>
                                      <td className="text-center">
                                        <Button
                                          size="sm"
                                          color="danger"
                                          onClick={() => handleIzinDelete(izin)}
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </TabPane>

                    {/* Çalıştığı Birimler Sekmesi */}
                    <TabPane tabId="3">
                      <Card className="border-0">
                        <CardBody>
                          <h5 className="mb-4">
                            <i className="fas fa-history me-2"></i>
                            Çalıştığı Birimler
                          </h5>

                          {personel.gecmisBirimler.length === 0 ? (
                            <Alert color="info">
                              <i className="fas fa-info-circle me-2"></i>
                              Personelin birim değişiklik geçmişi
                              bulunmamaktadır.
                            </Alert>
                          ) : (
                            <div className="table-responsive">
                              <Table hover striped bordered>
                                <thead className="table-light">
                                  <tr>
                                    <th>Birim Adı</th>
                                    <th>Başlangıç Tarihi</th>
                                    <th>Ayrılış Tarihi</th>
                                    <th>Çalışma Süresi</th>
                                    <th>Gerekçe</th>
                                    <th style={{ width: "100px" }}>İşlemler</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {personel.gecmisBirimler.map((birim) => (
                                    <tr key={birim._id}>
                                      <td>{birim.unitID.name}</td>
                                      <td>
                                        {renderDate_GGAAYYYY(
                                          birim.startDate.split("T")[0]
                                        )}
                                      </td>
                                      <td>
                                        {renderDate_GGAAYYYY(
                                          birim.endDate.split("T")[0]
                                        )}
                                      </td>
                                      <td>
                                        {calculateGorevSuresi(
                                          birim.startDate,
                                          birim.endDate
                                        )}
                                      </td>
                                      <td>{birim.detail || "-"}</td>
                                      <td className="text-center">
                                        <Button
                                          size="sm"
                                          color="danger"
                                          onClick={() =>
                                            handleGecmisBirimDelete(birim)
                                          }
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Modal Components */}
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
        </CardBody>
      </Card>
    </div>
  );
}
