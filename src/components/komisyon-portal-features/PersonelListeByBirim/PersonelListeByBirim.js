import React, { useState, useEffect } from "react";
import {
  FormGroup,
  Input,
  Label,
  Badge,
  Spinner,
  Button,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  InputGroup,
  InputGroupText,
  Alert,
  Table,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import axios from "axios";
import PersonelEkleModal from "./PersonelEkleModal";
import {
  renderDate_GGAAYYYY,
  calculateGorevSuresi,
  calculateBirimGorevSuresi,
} from "../../actions/TimeActions";

export default function PersonelListeByBirim({
  unvanlar,
  token,
  selectedKurum,
  showPersonelDetay,
  selectedBirimID,
}) {
  const [kurum, setKurum] = useState(null);
  const [tumBirimler, setTumBirimler] = useState([]);
  const [birimler, setBirimler] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBirim, setSelectedBirim] = useState("");
  const [personel, setPersonel] = useState([]);
  const [showPersonelEkleModal, setShowPersonelEkleModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [birimTypes, setBirimTypes] = useState([]);

  // Modal toggle fonksiyonu
  const personelEkleToggle = () =>
    setShowPersonelEkleModal(!showPersonelEkleModal);

  // Birim arama işlevi
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtrelenmiş birimler
  const filteredBirimler = birimler.filter((birim) => {
    const searchTerms = searchQuery.toLowerCase().split(" ");
    return searchTerms.every((term) => birim.name.toLowerCase().includes(term));
  });

  // Kurum değiştikçe birimleri yükle
  useEffect(() => {
    if (selectedKurum) {
      setKurum(selectedKurum);
      getBirimler(selectedKurum.id);
    }
     // eslint-disable-next-line 
  }, [selectedKurum]);

  // Birim tipi değişikliği
  const handleTypeChange = (typeId) => {
    
    setActiveTab(typeId);

    // Tab "all" (tümü) seçilmiş ise, tüm birimleri göster
    if (typeId === "all") {
      setBirimler(tumBirimler);
    } else {
      // İlgili tipe ait birimleri filtrele
      setBirimler(
        tumBirimler.filter(
          (birim) => birim.unitType.institutionTypeId === typeId
        )
      );
    }

    // Seçili birimi ve personel listesini sıfırla
    setSelectedBirim("");
    setPersonel([]);
  };

  // Personel detay sayfasına yönlendirme
  const handlePersonDetailButton_Click = (person) => {
    showPersonelDetay(person);
  };

  // Birim seçimi değişince personelleri getir
  const handleBirimChange = (event) => {
    if (event.target.value === "Seçiniz") {
      return;
    }

    setShowSpinner(true);

    let selectedBirim = birimler.find(
      (birim) => birim.name === event.target.value
    );

    setSelectedBirim(selectedBirim);
    setPersonel([]);

    const configuration = {
      method: "GET",
      url: `/api/persons/${selectedBirim._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        // Personelleri önceliklendirme ve sıralama
        result.data.persons.sort((a, b) => {
          if (a.title === null) {
            return 1;
          }
          if (a.title?.oncelikSirasi !== b.title?.oncelikSirasi) {
            return a.title.oncelikSirasi - b.title.oncelikSirasi;
          }
          return a.sicil - b.sicil;
        });

        setPersonel(result.data.persons);
        setShowSpinner(false);
      })
      .catch((error) => {
        console.log(error);
        setShowSpinner(false);
      });
  };

  // Kuruma ait birimleri getir
  function getBirimler(typeID) {
    setShowSpinner(true);

    const configuration = {
      method: "GET",
      url: `/api/units/institution/${typeID}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        // Birimleri sırala
        const sortedUnits = result.data.unitList.sort((a, b) => {
          if (a.unitType.oncelikSirasi !== b.unitType.oncelikSirasi) {
            return a.unitType.oncelikSirasi - b.unitType.oncelikSirasi;
          }
          return a.series - b.series;
        });

        setTumBirimler(sortedUnits);
        setBirimler(sortedUnits);

        // Birim tiplerini çıkar ve benzersiz olanları al
        console.log(sortedUnits); // 90 tane birim burada var.

        // const types = [];
        let institutionTypes = result.data.institution.types;

        // sortedUnits.forEach((unit) => {
        //   // Birim tipini types dizisine ekle eğer daha önce eklenmemişse
        //   if (!types.some((t) => t.id === unit.unitType.institutionTypeId)) {
        //     console.log(unit.unitType.institutionTypeId);
        //     types.push({
        //       id: unit.unitType.institutionTypeId,
        //       name: unit.unitType.unitType,
        //     });
        //   }
        // });

        // // Öncelik sırasına göre sırala
        // types.sort((a, b) => a.oncelikSirasi - b.oncelikSirasi);

        // setBirimTypes(types);
        setBirimTypes(institutionTypes);
        setShowSpinner(false);
      })
      .catch((error) => {
        console.log(error);
        setShowSpinner(false);
      });
  }

  // Personel durumuna göre arka plan rengi belirle
  const getRowClassName = (person) => {
    if (!person.status) return "table-danger bg-opacity-25"; // Pasif
    if (person.isSuspended) return "table-warning bg-opacity-25"; // Uzaklaştırılmış
    if (person.izindeMi) return "table-info bg-opacity-25"; // İzinde
    return ""; // Normal durum
  };

  // İsim ve soyisime göre renk üretme fonksiyonu
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      "#4e79a7",
      "#f28e2c",
      "#e15759",
      "#76b7b2",
      "#59a14f",
      "#edc949",
      "#af7aa1",
      "#ff9da7",
      "#9c755f",
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  // Kullanıcı avatarı
  const renderUserAvatar = (ad, soyad) => {
    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center me-2"
        style={{
          backgroundColor: stringToColor(ad + soyad),
          width: "30px",
          height: "30px",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        {ad.charAt(0)}
        {soyad.charAt(0)}
      </div>
    );
  };

  return (
    <div className="personel-liste-birim-container">
      <Card className="shadow-sm mb-4">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Birime Göre Personel Listesi
          </h3>
        </CardHeader>

        <CardBody>
          <Alert color="info" className="mb-4">
            <div className="d-flex">
              <i className="fas fa-info-circle me-3 fs-4"></i>
              <div>
                <p className="mb-0">
                  Bu ekranda birim seçerek personel listesine ulaşabilirsiniz.
                  Seçilen kuruma ait birimler listelenir ve birime göre
                  filtreleme yapabilirsiniz.
                </p>
                <p className="mb-0">
                  <strong>Kurumunuz:</strong>{" "}
                  {selectedKurum?.name || "Kurum Seçilmedi"}
                </p>
              </div>
            </div>
          </Alert>

          {kurum && (
            <>
              {/* Birim Tipleri Tabs */}
              <div className="mb-3">
                <h5 className="mb-2 text-danger">
                  <i className="fas fa-layer-group me-2"></i>
                  Birim Tipi Seçin
                </h5>

                <Nav tabs className="mb-3 border-0">
                  <NavItem>
                    <NavLink
                      className={`${
                        activeTab === "all" ? "active bg-light" : ""
                      } cursor-pointer rounded-top`}
                      onClick={() => handleTypeChange("all")}
                    >
                      <i className="fas fa-globe me-1"></i> Tüm Birimler
                    </NavLink>
                  </NavItem>

                  {birimTypes.map((type) => (
                    <NavItem key={type.id}>
                      <NavLink
                        className={`${
                          activeTab === type.id ? "active bg-light" : ""
                        } cursor-pointer rounded-top`}
                        onClick={() => handleTypeChange(type.id)}
                      >
                        {type.name}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                <TabContent activeTab={activeTab} className="mt-3">
                  <TabPane tabId={activeTab}>
                    <Card className="border shadow-sm">
                      <CardBody className="bg-light">
                        <Row>
                          <Col md={12} lg={6}>
                            {/* Birim Arama */}
                            <FormGroup className="mb-3">
                              <Label for="searchBirim" className="fw-bold">
                                <i className="fas fa-search me-1"></i> Birim Ara
                              </Label>
                              <InputGroup>
                                <Input
                                  id="searchBirim"
                                  onChange={handleSearchChange}
                                  value={searchQuery}
                                  placeholder="Birim adı ile arama yapın..."
                                />
                                {searchQuery && (
                                  <InputGroupText
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setSearchQuery("")}
                                  >
                                    <i className="fas fa-times"></i>
                                  </InputGroupText>
                                )}
                              </InputGroup>
                              <small className="text-muted">
                                Örn: "1. Asliye" veya "İcra" gibi anahtar
                                kelimeler girebilirsiniz
                              </small>
                            </FormGroup>
                          </Col>

                          <Col md={12} lg={6}>
                            {/* Birim Seçimi */}
                            <FormGroup className="mb-3">
                              <Label for="selectBirim" className="fw-bold">
                                <i className="fas fa-building me-1"></i> Birim
                                Seçin
                              </Label>
                              <Input
                                id="selectBirim"
                                onChange={(e) => handleBirimChange(e)}
                                name="select"
                                type="select"
                                className="form-select"
                                value={selectedBirim ? selectedBirim.name : ""}
                                disabled={birimler.length === 0}
                              >
                                <option value="">Seçiniz</option>
                                {filteredBirimler.map((birim) => (
                                  <option key={birim._id} value={birim.name}>
                                    {birim.name}{" "}
                                  </option>
                                ))}
                              </Input>
                              <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                  {filteredBirimler.length} adet birim
                                  listeleniyor
                                </small>
                                <Badge color="secondary" pill>
                                  {filteredBirimler.length} /{" "}
                                  {tumBirimler.length}
                                </Badge>
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </TabPane>
                </TabContent>
              </div>
            </>
          )}

          {/* Yükleniyor Spinner */}
          {showSpinner && (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Veriler yükleniyor, lütfen bekleyin...
              </p>
            </div>
          )}

          {/* Personel Listesi */}
          {selectedBirim && !showSpinner && (
            <div className="personel-list-section mt-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="fas fa-user-friends me-2"></i>
                      <strong>{selectedBirim.name}</strong> Personel Listesi
                      <Badge color="danger" pill className="ms-2">
                        {personel.length} personel
                      </Badge>
                    </h5>

                    <Button
                      color="success"
                      onClick={personelEkleToggle}
                      size="sm"
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Personel Ekle
                    </Button>
                  </div>
                </CardHeader>

                <CardBody className="p-0">
                  {personel.length === 0 ? (
                    <Alert color="warning" className="m-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Bu birimde kayıtlı personel bulunmamaktadır.
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table hover bordered className="mb-0" striped>
                        <thead className="bg-light">
                          <tr>
                            <th style={{ width: "80px" }}>Sicil</th>
                            <th>Ad Soyad</th>
                            <th>Ünvan</th>
                            <th>Birimde Çalışma Süresi</th>
                            <th>Toplam Çalışma Süresi</th>
                            <th>Durumlar</th>
                            <th
                              style={{ width: "90px" }}
                              className="text-center"
                            >
                              İşlem
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {personel.map((person) => (
                            <tr
                              key={person._id}
                              className={getRowClassName(person)}
                            >
                              <td>
                                <Badge
                                  color={person.status ? "primary" : "danger"}
                                  pill
                                  className="px-2"
                                >
                                  {person.sicil}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {renderUserAvatar(person.ad, person.soyad)}
                                  <div>
                                    <span className="fw-bold">
                                      {person.ad} {person.soyad}
                                    </span>
                                    {person.description && (
                                      <div>
                                        <small className="text-muted">
                                          {person.description}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                {person.title ? (
                                  <Badge
                                    color="primary"
                                    pill
                                    className="px-3 py-2"
                                  >
                                    {person.title.name}
                                  </Badge>
                                ) : (
                                  <Badge color="secondary">BELİRTİLMEMİŞ</Badge>
                                )}
                              </td>
                              <td>
                                <div>
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-calendar-day me-1 text-muted"></i>
                                    {renderDate_GGAAYYYY(
                                      person.birimeBaslamaTarihi
                                    )}
                                  </div>
                                  <Badge color="info" pill className="mt-1">
                                    {calculateBirimGorevSuresi(
                                      person.birimeBaslamaTarihi
                                    )}
                                  </Badge>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-calendar-alt me-1 text-muted"></i>
                                    {renderDate_GGAAYYYY(
                                      person.goreveBaslamaTarihi
                                    )}
                                  </div>
                                  <Badge color="success" pill className="mt-1">
                                    {calculateGorevSuresi(
                                      person.goreveBaslamaTarihi
                                    )}
                                  </Badge>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {person.level && (
                                    <Badge color="success" className="me-1">
                                      Seviye {person.level}
                                    </Badge>
                                  )}
                                  {person.isTemporary && (
                                    <Badge color="warning" className="me-1">
                                      Geçici
                                    </Badge>
                                  )}
                                  {person.durusmaKatibiMi && (
                                    <Badge color="dark" className="me-1">
                                      Duruşma Katibi
                                    </Badge>
                                  )}
                                  {person.izindeMi && (
                                    <Badge color="danger">İzinde</Badge>
                                  )}
                                  {person.isMartyrRelative && (
                                    <Badge color="info">Şehit Yakını</Badge>
                                  )}
                                  {person.isDisabled && (
                                    <Badge color="secondary">Engelli</Badge>
                                  )}
                                </div>
                                {person.calistigiKisi && (
                                  <div className="mt-1 small d-flex align-items-center">
                                    <i className="fas fa-user-tie me-1 text-muted"></i>
                                    <span className="text-muted">
                                      {person.calistigiKisi.ad}{" "}
                                      {person.calistigiKisi.soyad}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="text-center">
                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={() =>
                                    handlePersonDetailButton_Click(person)
                                  }
                                  title="Personel Detayları"
                                >
                                  <i className="fas fa-eye"></i>
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
            </div>
          )}
        </CardBody>
      </Card>

      {/* Personel Ekle Modal */}
      <PersonelEkleModal
        modal={showPersonelEkleModal}
        toggle={personelEkleToggle}
        token={token}
        unvanlar={unvanlar}
        birim={selectedBirim}
        handleBirimChange={handleBirimChange}
        personel={personel}
      />
    </div>
  );
}
