import React, { useState, useEffect } from "react";
import {
  Table,
  FormGroup,
  Input,
  Label,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Alert,
  InputGroup,
  InputGroupText,
  Spinner,
  UncontrolledTooltip,
} from "reactstrap";
import BirimEkleModal from "./BirimEkleModal";
import BirimSilModal from "./BirimSilModal";
import BirimGuncelleModal from "./BirimGuncelleModal";
import axios from "axios";

export default function Birimler({ selectedKurum, token }) {
  const [selectedFilterOption, setSelectedFilterOption] = useState("Ceza");
  const [kurum, setKurum] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(0);
  const [birimler, setBirimler] = useState([]);
  const [birimlerFiltered, setBirimlerFiltered] = useState([]);
  const [showBirimEkleModal, setShowBirimEkleModal] = useState(false);
  const [showBirimSilModal, setShowBirimSilModal] = useState(false);
  const [deleteSelectedBirim, setDeleteSelectedBirim] = useState(null);
  const [showBirimGuncelleModal, setShowBirimGuncelleModal] = useState(false);
  const [updateSelectedBirim, setUpdateSelectedBirim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal toggle fonksiyonları
  const birimEkleToggle = () => setShowBirimEkleModal(!showBirimEkleModal);
  const birimSilToggle = () => setShowBirimSilModal(!showBirimSilModal);
  const birimGuncelleToggle = () =>
    setShowBirimGuncelleModal(!showBirimGuncelleModal);

  const handleRadioFilterChange = (e) => {
    setSelectedFilterOption(e.target.value);
    filterBirimler(e.target.value, searchQuery);
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchQuery(searchValue);
    filterBirimler(selectedFilterOption, searchValue);
  };

  // Birim filtreleme fonksiyonu - Düzenlendi
  const filterBirimler = (filterOption, query) => {
    if (!birimler || birimler.length === 0) return;

    let filtered = birimler;

    // "Tümü" tabında değilsek (yani mahkemeler, savcılık veya genel birimler tabında isek)
    // Ve özel bir filtre seçilmediyse, filtreleme yapmadan devam et
    if (selectedTypeId !== 0) {
      setBirimlerFiltered(filtered);
      return;
    }

    // Önce birim tipine göre filtrele
    if (filterOption) {
      filtered = filtered.filter(
        (birim) => birim.unitType.unitType === filterOption
      );
    }

    // Sonra arama sorgusuna göre filtrele
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(
        (birim) =>
          birim.name.toLowerCase().includes(searchLower) ||
          birim.unitType.name.toLowerCase().includes(searchLower)
      );
    }

    setBirimlerFiltered(filtered);
  };

  function handleNavLinkClick(type) {
    if (selectedTypeId === type.id) return;

    setSelectedTypeId(type.id);
    setSearchQuery("");

    // Tab değiştiğinde, eğer mahkemeler tabına geçtiyse Ceza/Hukuk filtresini uygula
    // Diğer tablarda filtreleme işlemi yapmayacağız
    if (type.id === 0) {
      filterBirimler(selectedFilterOption, "");
    }
  }

  function handleButtonAddBirim() {
    if (kurum === null) return alert("Lütfen önce bir kurum seçiniz");
    setShowBirimEkleModal(true);
  }

  function getBirimler(kurum) {
    if (!kurum) return;

    setLoading(true);

    const configuration = {
      method: "GET",
      url: `/api/units/institution/${kurum.id}`,
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

        setBirimler(sortedUnits);

        // Önce tüm birimleri set et (diğer sekmelerde filtersiz kullanılacak)
        setBirimlerFiltered(sortedUnits);

        // Eğer mahkeme sekmesindeyse (0), Ceza/Hukuk filtresini uygula
        if (selectedTypeId === 0) {
          filterBirimler(selectedFilterOption, "");
        }

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }

  function handleBirimDelete(birim) {
    setDeleteSelectedBirim(birim);
    setShowBirimSilModal(true);
  }

  function handleBirimUpdate(birim, isMahkeme = true) {
    const updatedBirim = { ...birim, isMahkeme };
    setUpdateSelectedBirim(updatedBirim);
    setShowBirimGuncelleModal(true);
  }

  // Mahkeme birimi satırı render etme
  function renderMahkemeBirim(birim) {
    return (
      <tr
        key={birim._id}
        className={birim.status ? "" : "table-danger bg-opacity-25"}
      >
        <td>
          <Badge color="primary" pill className="px-3 py-2">
            {birim.unitType.name}
          </Badge>
        </td>
        <td>
          <Badge
            color={birim.unitType.unitType === "Ceza" ? "danger" : "success"}
            pill
          >
            {birim.unitType.unitType}
          </Badge>
        </td>
        <td>{birim.series === 0 ? "-" : birim.series}</td>
        <td>
          <span className="fw-bold">{birim.name}</span>
        </td>
        <td>
          {birim.status ? (
            <Badge color="success" pill className="px-3">
              Aktif
            </Badge>
          ) : (
            <Badge color="danger" pill className="px-3">
              Pasif
            </Badge>
          )}
        </td>
        <td className="text-center">
          <Badge color="info" pill className="px-3">
            {birim.minClertCount}
          </Badge>
        </td>
        <td>
          {birim.delegationType === "heyet" ? (
            <Badge color="dark">Heyet</Badge>
          ) : (
            <Badge color="secondary">Tekli</Badge>
          )}
        </td>
        <td className="text-center">
          <Button
            id={`edit-${birim._id}`}
            color="primary"
            size="sm"
            className="me-2"
            onClick={() => handleBirimUpdate(birim)}
          >
            <i className="fas fa-edit"></i>
          </Button>
          <UncontrolledTooltip target={`edit-${birim._id}`} placement="top">
            Birimi Düzenle
          </UncontrolledTooltip>

          <Button
            id={`delete-${birim._id}`}
            color="danger"
            size="sm"
            onClick={() => handleBirimDelete(birim)}
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
          <UncontrolledTooltip target={`delete-${birim._id}`} placement="top">
            Birimi Sil
          </UncontrolledTooltip>
        </td>
      </tr>
    );
  }

  // Savcılık ve genel birim render etme
  function renderSavcilikVeGenel(birim) {
    return (
      <tr
        key={birim._id}
        className={birim.status ? "" : "table-danger bg-opacity-25"}
      >
        <td>
          <Badge color="primary" pill className="px-3 py-2">
            {birim.unitType.name}
          </Badge>
        </td>
        <td>
          <span className="fw-bold">{birim.name}</span>
        </td>
        <td>
          {birim.status ? (
            <Badge color="success" pill className="px-3">
              Aktif
            </Badge>
          ) : (
            <Badge color="danger" pill className="px-3">
              Pasif
            </Badge>
          )}
        </td>
        <td className="text-center">
          <Button
            id={`edit-${birim._id}`}
            color="primary"
            size="sm"
            className="me-2"
            onClick={() => handleBirimUpdate(birim, false)}
          >
            <i className="fas fa-edit"></i>
          </Button>
          <UncontrolledTooltip target={`edit-${birim._id}`} placement="top">
            Birimi Düzenle
          </UncontrolledTooltip>

          <Button
            id={`delete-${birim._id}`}
            color="danger"
            size="sm"
            onClick={() => handleBirimDelete(birim)}
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
          <UncontrolledTooltip target={`delete-${birim._id}`} placement="top">
            Birimi Sil
          </UncontrolledTooltip>
        </td>
      </tr>
    );
  }

  function renderTabPane(type) {
    if (selectedTypeId === 0) {
      return (
        <div>
          <Card className="shadow-sm mb-4 border-0">
            <CardBody className="bg-light">
              <Row>
                <Col md={6}>
                  <FormGroup className="mb-3">
                    <Label for="radioBirimType" className="fw-bold mb-2">
                      <i className="fas fa-filter me-2 text-primary"></i>
                      Birim Alanı Filtrele
                    </Label>
                    <div>
                      <div className="form-check form-check-inline">
                        <Input
                          className="form-check-input"
                          type="radio"
                          name="radio"
                          id="radioCeza"
                          value="Ceza"
                          checked={selectedFilterOption === "Ceza"}
                          onChange={handleRadioFilterChange}
                        />
                        <Label className="form-check-label" for="radioCeza">
                          <Badge color="danger" pill className="me-1">
                            Ceza
                          </Badge>
                        </Label>
                      </div>

                      <div className="form-check form-check-inline">
                        <Input
                          className="form-check-input"
                          type="radio"
                          name="radio"
                          id="radioHukuk"
                          value="Hukuk"
                          checked={selectedFilterOption === "Hukuk"}
                          onChange={handleRadioFilterChange}
                        />
                        <Label className="form-check-label" for="radioHukuk">
                          <Badge color="success" pill className="me-1">
                            Hukuk
                          </Badge>
                        </Label>
                      </div>
                    </div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label for="search" className="fw-bold">
                      <i className="fas fa-search me-2 text-primary"></i>
                      Birim Ara
                    </Label>
                    <InputGroup>
                      <Input
                        type="text"
                        name="search"
                        id="search"
                        placeholder="Birim adı ile arama yapın..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                      {searchQuery && (
                        <InputGroupText
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSearchQuery("");
                            filterBirimler(selectedFilterOption, "");
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </InputGroupText>
                      )}
                    </InputGroup>
                    <small className="text-muted">
                      Örn: "1. Asliye", "Ağır Ceza" gibi anahtar kelimelerle
                      arama yapabilirsiniz
                    </small>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-gavel me-2 text-primary"></i>
                Mahkeme Birimleri
                <Badge color="danger" pill className="ms-2">
                  {birimlerFiltered.length} adet
                </Badge>
              </h5>
              <Badge
                color={selectedFilterOption === "Ceza" ? "danger" : "success"}
                pill
                className="px-3 py-2"
              >
                {selectedFilterOption}
              </Badge>
            </CardHeader>

            <div className="table-responsive">
              <Table hover striped className="mb-0" size="sm">
                <thead className="table-light">
                  <tr>
                    <th>Birim Tipi</th>
                    <th>Alan</th>
                    <th>Sıra</th>
                    <th>Adı</th>
                    <th>Durum</th>
                    <th className="text-center">Min. Katip</th>
                    <th>Heyet/Tek</th>
                    <th className="text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <Spinner color="primary" size="sm" className="me-2" />
                        Birimler yükleniyor...
                      </td>
                    </tr>
                  ) : birimlerFiltered.length > 0 ? (
                    birimlerFiltered.map((birim) =>
                      birim.unitType.institutionTypeId === 0
                        ? renderMahkemeBirim(birim)
                        : null
                    )
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-3 text-muted">
                        <i className="fas fa-info-circle me-2"></i>
                        Bu kriterlere uygun birim bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
      );
    } else if (selectedTypeId === 1) {
      // SAVCILIK RENDER
      // Burada ayrıca bir filtrelemeye gerek yok, doğrudan institutionTypeId === 1 olan birimleri filtrele
      const filteredSavcilikBirimleri = birimler.filter(
        (birim) => birim.unitType.institutionTypeId === selectedTypeId
      );

      return (
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-white">
            <h5 className="mb-0">
              <i className="fas fa-balance-scale me-2 text-primary"></i>
              Savcılık Birimleri
              <Badge color="primary" pill className="ms-2">
                {filteredSavcilikBirimleri.length} adet
              </Badge>
            </h5>
          </CardHeader>

          <div className="table-responsive">
            <Table hover striped className="mb-0" size="sm">
              <thead className="table-light">
                <tr>
                  <th>Birim Tipi</th>
                  <th>Adı</th>
                  <th>Durum</th>
                  <th className="text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <Spinner color="primary" size="sm" className="me-2" />
                      Birimler yükleniyor...
                    </td>
                  </tr>
                ) : filteredSavcilikBirimleri.length > 0 ? (
                  filteredSavcilikBirimleri.map((birim) =>
                    renderSavcilikVeGenel(birim)
                  )
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      <i className="fas fa-info-circle me-2"></i>
                      Bu bölümde henüz kayıtlı birim bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      );
    } else {
      // GENEL RENDER
      // Burada ayrıca bir filtrelemeye gerek yok, doğrudan institutionTypeId === 2 (veya seçili tip) olan birimleri filtrele
      const filteredGenelBirimler = birimler.filter(
        (birim) => birim.unitType.institutionTypeId === selectedTypeId
      );

      return (
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-white">
            <h5 className="mb-0">
              <i className="fas fa-building me-2 text-primary"></i>
              Genel Birimler
              <Badge color="primary" pill className="ms-2">
                {filteredGenelBirimler.length} adet
              </Badge>
            </h5>
          </CardHeader>

          <div className="table-responsive">
            <Table hover striped className="mb-0" size="sm">
              <thead className="table-light">
                <tr>
                  <th>Birim Tipi</th>
                  <th>Adı</th>
                  <th>Durum</th>
                  <th className="text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <Spinner color="primary" size="sm" className="me-2" />
                      Birimler yükleniyor...
                    </td>
                  </tr>
                ) : filteredGenelBirimler.length > 0 ? (
                  filteredGenelBirimler.map((birim) =>
                    renderSavcilikVeGenel(birim)
                  )
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      <i className="fas fa-info-circle me-2"></i>
                      Bu bölümde henüz kayıtlı birim bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      );
    }
  }

  useEffect(() => {
    if (!selectedKurum) {
      // Kurum seçili değilse local storage'dan default kurumu çek
      const storedKurum = localStorage.getItem("selectedKurum")
        ? JSON.parse(localStorage.getItem("selectedKurum"))
        : null;

      if (storedKurum) {
        setKurum(storedKurum);
        getBirimler(storedKurum);
      }
    } else {
      setKurum(selectedKurum);
      getBirimler(selectedKurum);
    }
    // eslint-disable-next-line
  }, [selectedKurum]);

  // Sayfa ilk yüklendiğinde ve birimler değiştiğinde çalışacak
  useEffect(() => {
    if (birimler.length > 0) {
      // Eğer mahkeme sekmesindeyse (0), Ceza/Hukuk filtresini uygula
      if (selectedTypeId === 0) {
        filterBirimler(selectedFilterOption, searchQuery);
      }
    }
  }, [birimler]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="birimler-container">
      <Card className="shadow-sm border-0 mb-4">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-sitemap me-2"></i>
            Birim Yönetimi
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="d-flex align-items-center">
            <i className="fas fa-info-circle me-3 fs-4"></i>
            <div>
              <p className="mb-0">
                Bu ekranda kuruma ait tüm birimleri görebilir, yeni birim
                ekleyebilir, mevcut birimleri düzenleyebilir veya
                silebilirsiniz.
              </p>
              {/* <p className="mb-1">
                <strong>Seçili Kurum:</strong>{" "}
                {kurum?.name || "Kurum Seçilmedi"}
              </p> */}
            </div>
          </Alert>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 text-primary">
              <i className="fas fa-list-ul me-2"></i>
              Birim Listesi
            </h5>
            <Button
              color="success"
              onClick={handleButtonAddBirim}
              disabled={!kurum}
              className="d-flex align-items-center"
            >
              <i className="fas fa-plus-circle me-2"></i>
              Yeni Birim Ekle
            </Button>
          </div>

          {!kurum ? (
            <Alert color="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Birim listesini görüntülemek için lütfen önce bir kurum seçiniz.
            </Alert>
          ) : (
            <>
              <Nav tabs className="border-bottom-0 mb-4">
                {kurum &&
                  kurum.types.map((type) => (
                    <NavItem key={type.id}>
                      <NavLink
                        className={`${
                          selectedTypeId === type.id ? "active bg-light" : ""
                        } rounded-top cursor-pointer`}
                        onClick={() => handleNavLinkClick(type)}
                      >
                        <i
                          className={`fas ${
                            type.id === 0
                              ? "fa-gavel"
                              : type.id === 1
                              ? "fa-balance-scale"
                              : "fa-building"
                          } me-1`}
                        ></i>
                        {type.name}
                      </NavLink>
                    </NavItem>
                  ))}
              </Nav>

              <TabContent activeTab={selectedTypeId} className="shadow-sm">
                {kurum &&
                  kurum.types.map((type) =>
                    type.id === selectedTypeId ? (
                      <TabPane tabId={type.id} key={type.id}>
                        {renderTabPane(type)}
                      </TabPane>
                    ) : null
                  )}
              </TabContent>
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal Bileşenleri */}
      <BirimEkleModal
        modal={showBirimEkleModal}
        toggle={birimEkleToggle}
        kurum={kurum}
        token={token}
        getBirimler={getBirimler}
      />
      <BirimSilModal
        modal={showBirimSilModal}
        toggle={birimSilToggle}
        birim={deleteSelectedBirim}
        token={token}
        getBirimler={getBirimler}
      />
      <BirimGuncelleModal
        modal={showBirimGuncelleModal}
        toggle={birimGuncelleToggle}
        birim={updateSelectedBirim}
        token={token}
        getBirimler={getBirimler}
      />
    </div>
  );
}
