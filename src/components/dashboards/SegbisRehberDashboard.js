import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Table,
  Button,
  Badge,
  Spinner,
  InputGroup,
  Input,
  InputGroupText,
  Modal,
  ModalHeader,
  ModalBody,
  Alert,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import {
  FaSearch,
  FaBuilding,
  FaCity,
  FaUsers,
  FaPhoneAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaQrcode,
} from "react-icons/fa";
import axios from "axios";
import AYSNavbar from "../root/AYSNavbar";
import QRCode from "react-qr-code";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

export default function SegbisRehberDashboard() {
  // State tanımlamaları
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("cities"); // 'cities', 'units', 'personnel'
  const [searchTerm, setSearchTerm] = useState("");
  const [adliyeSearchTerm, setAdliyeSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userRoles, setUserRoles] = useState("");
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  // Sayfa yüklendiğinde illeri çek
  useEffect(() => {
    fetchCities();
    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.roles) {
          setUserRoles(decoded.roles || "");
        }
      } catch (e) {
        setUserRoles("");
      }
    }
    // eslint-disable-next-line
  }, []);

  // İlleri çekme fonksiyonu
  const fetchCities = async () => {
    setLoading(true);
    try {
      // Gerçek API çağrısı
      const response = await axios.get("/api/segbis/cities");
      setCities(response.data.cities);
      setLoading(false);

      // Mock veri kısmı kaldırıldı
    } catch (error) {
      console.error("İller çekilirken hata oluştu:", error);
      setLoading(false);

      // Hata durumunda boş bir dizi göster
      setCities([]);
    }
  };

  // Şehre göre birimleri çekme
  const fetchUnits = async (cityId) => {
    setLoading(true);
    try {
      // Gerçek API çağrısı - city ID veya name ile çağrılabilir
      const response = await axios.get(`/api/segbis/cities/${cityId}/units`);
      setUnits(response.data.units);
      setCurrentView("units");
      setLoading(false);

      // Mock veri kısmı kaldırıldı
    } catch (error) {
      console.error("Birimler çekilirken hata oluştu:", error);
      setLoading(false);

      // Hata durumunda boş bir dizi göster
      setUnits([]);
    }
  };

  // Birime göre personeli çekme
  const fetchPersonnel = async (unitId) => {
    setLoading(true);
    try {
      // Gerçek API çağrısı
      const response = await axios.get(`/api/segbis/units/${unitId}/personel`);
      setPersonnel(response.data.personnel);
      setCurrentView("personnel");
      setLoading(false);

      // Mock veri kısmı kaldırıldı
    } catch (error) {
      console.error("Personel çekilirken hata oluştu:", error);
      setLoading(false);

      // Hata durumunda boş bir dizi göster
      setPersonnel([]);
    }
  };

  // Şehir seçimi
  const selectCity = (city) => {
    searchTerm && setSearchTerm("");
    setSelectedCity(city);
    setSelectedUnit(null);
    fetchUnits(city.id);
  };

  // Birim seçimi
  const selectUnit = (unit) => {
    searchTerm && setSearchTerm("");
    setSelectedUnit(unit);
    fetchPersonnel(unit.id);
  };

  // Geri dönme işlemi
  const goBack = () => {
    if (currentView === "personnel") {
      setCurrentView("units");
      setSelectedUnit(null);
    } else if (currentView === "units") {
      setCurrentView("cities");
      setSelectedCity(null);
    }
  };

  // Personel detaylarını görüntüleme
  const viewPersonDetails = (person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  // Modalı kapatma
  const closeModal = () => {
    setShowModal(false);
    setSelectedPerson(null);
  };

  // Tarihi biçimlendiren fonksiyon
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Türkçe karakterleri ve büyük/küçük harfleri normalize eden fonksiyon
  function normalizeText(text) {
    return text
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");
  }

  // Filtre uygulama
  const applyFilter = (items, customTerm) => {
    const term = normalizeText(
      customTerm !== undefined ? customTerm : searchTerm
    );
    if (!term) return items;
    return items.filter(
      (item) =>
        normalizeText(item.name).includes(term) ||
        (item.title && normalizeText(item.title).includes(term)) ||
        (item.region && normalizeText(item.region).includes(term)) ||
        (item.type && normalizeText(item.type).includes(term)) ||
        (item.code && item.code.toString().includes(term))
    );
  };
  // Adliye arama kutusundan arama yapılınca adliye ekranına dön ve filtre uygula
  const handleAdliyeSearch = (e) => {
    const value = e.target.value;
    setAdliyeSearchTerm(value);
    setCurrentView("cities");
    setSelectedCity(null);
    setSelectedUnit(null);
    setSearchTerm("");
  };

  // Ünvana göre rozet rengi belirleme
  const getTitleColor = (title) => {
    switch (title) {
      case "Yazı İşleri Müdürü":
        return "primary";
      case "Katip":
        return "danger";
      case "Mübaşir":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Bölgeye göre rozet rengi belirleme
  const getRegionColor = (region) => {
    switch (region) {
      case "Marmara":
        return "primary";
      case "İç Anadolu":
        return "success";
      case "Ege":
        return "info";
      case "Akdeniz":
        return "warning";
      case "Karadeniz":
        return "dark";
      case "Doğu Anadolu":
        return "danger";
      case "Güneydoğu Anadolu":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Birim tipine göre rozet rengi belirleme
  const getUnitTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "mahkeme":
        return "primary";
      case "savcılık":
        return "danger";
      case "icra dairesi":
        return "warning";
      case "noter":
        return "info";
      default:
        return "secondary";
    }
  };

  // Telefon numarasını +90 555 555 55 55 formatına çeviren fonksiyon
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    // Sadece rakamları al
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      // 10 haneli ise başına +90 ekle
      return `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
        6,
        8
      )} ${digits.slice(8, 10)}`;
    }
    if (digits.length === 11 && digits.startsWith("0")) {
      // 0 ile başlıyorsa +90 ekle
      return `+90 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(
        7,
        9
      )} ${digits.slice(9, 11)}`;
    }
    return phone;
  };

  // Personel silme işlemi
  const handleDeletePerson = async (person) => {
    console.log(person);

    if (!person?._id) return;
    if (!window.confirm("Bu kişiyi silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(
        `/api/segbis/units/${selectedUnit.id}/personel/${person._id}`
      );
      await fetchPersonnel(selectedUnit.id);
    } catch (err) {
      alert(err?.response?.data?.message || "Personel silinirken hata oluştu.");
    }
  };

  // Kullanıcı rolü kontrol fonksiyonu
  const hasEditPermission = () => {
    if (!userRoles) return false;
    if (Array.isArray(userRoles)) {
      return userRoles.includes("segbis-uzman") || userRoles.includes("admin");
    }
    return (
      userRoles === "segbis-uzman" ||
      userRoles === "admin" ||
      (typeof userRoles === "string" &&
        (userRoles.split(",").includes("segbis-uzman") ||
          userRoles.split(",").includes("admin")))
    );
  };

  // Yeni personel ekleme modalı için state
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [addPersonForm, setAddPersonForm] = useState({
    name: "",
    title: "",
    phoneNumber: "",
    is_default: false,
  });
  const [addPersonLoading, setAddPersonLoading] = useState(false);
  const [addPersonError, setAddPersonError] = useState("");

  // Yeni personel ekleme modalını aç/kapat
  const openAddPersonModal = () => {
    setAddPersonForm({
      name: "",
      title: "",
      phoneNumber: "",
      is_default: false,
    });
    setAddPersonError("");
    setShowAddPersonModal(true);
  };
  const closeAddPersonModal = () => {
    setShowAddPersonModal(false);
    setAddPersonError("");
  };

  // Telefon numarası doğrulama fonksiyonu
  const validatePhoneNumber = (phone) => {
    // Sadece rakamları al
    const digits = phone.replace(/\D/g, "");
    // 10 hane olmalı ve başında 0 olmamalı
    return digits.length === 10 && !digits.startsWith("0");
  };

  // Yeni personel ekleme işlemi
  const submitAddPerson = async (e) => {
    e.preventDefault();
    setAddPersonError("");
    // Telefon numarası doğrulaması
    if (!validatePhoneNumber(addPersonForm.phoneNumber)) {
      setAddPersonError(
        "Telefon numarası 10 haneli olmalı, başında 0 olmamalı ve sadece rakam içermelidir."
      );
      return;
    }
    setAddPersonLoading(true);
    try {
      await axios.post(`/api/segbis/units/${selectedUnit.id}/personel`, {
        name: addPersonForm.name,
        title: addPersonForm.title,
        phoneNumber: addPersonForm.phoneNumber.replace(/\D/g, ""),
        is_default: addPersonForm.is_default,
      });
      // Başarılı ise personel listesini güncelle
      await fetchPersonnel(selectedUnit.id);
      setShowAddPersonModal(false);
    } catch (err) {
      setAddPersonError(
        err?.response?.data?.message || "Personel eklenirken hata oluştu."
      );
    }
    setAddPersonLoading(false);
  };

  // Form alanı değişikliği
  const handleAddPersonFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phoneNumber") {
      // Sadece rakamları al, maksimum 10 hane
      let digits = value.replace(/\D/g, "");
      if (digits.length > 10) digits = digits.slice(0, 10);
      setAddPersonForm((prev) => ({
        ...prev,
        [name]: digits,
      }));
    } else {
      setAddPersonForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Personel güncelleme modalı için state
  const [showUpdatePersonModal, setShowUpdatePersonModal] = useState(false);
  const [updatePersonForm, setUpdatePersonForm] = useState({
    name: "",
    title: "",
    phoneNumber: "",
    is_default: false,
  });
  const [updatePersonLoading, setUpdatePersonLoading] = useState(false);
  const [updatePersonError, setUpdatePersonError] = useState("");
  const [updatePersonId, setUpdatePersonId] = useState(null);

  // Güncelle modalını aç
  const openUpdatePersonModal = (person) => {
    setUpdatePersonId(person.id || person._id);
    setUpdatePersonForm({
      name: person.name || "",
      title: person.title || "",
      phoneNumber: (person.phone || person.phoneNumber || "").replace(
        /\D/g,
        ""
      ),
      is_default: !!person.isDefault || !!person.is_default,
    });
    setUpdatePersonError("");
    setShowUpdatePersonModal(true);
  };

  // Güncelle modalını kapat
  const closeUpdatePersonModal = () => {
    setShowUpdatePersonModal(false);
    setUpdatePersonError("");
    setUpdatePersonId(null);
  };

  // Güncelle form değişikliği
  const handleUpdatePersonFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phoneNumber") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 10) digits = digits.slice(0, 10);
      setUpdatePersonForm((prev) => ({
        ...prev,
        [name]: digits,
      }));
    } else {
      setUpdatePersonForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Personel güncelleme işlemi
  const submitUpdatePerson = async (e) => {
    e.preventDefault();
    setUpdatePersonError("");
    // Telefon numarası doğrulaması
    if (!validatePhoneNumber(updatePersonForm.phoneNumber)) {
      setUpdatePersonError(
        "Telefon numarası 10 haneli olmalı, başında 0 olmamalı ve sadece rakam içermelidir."
      );
      return;
    }
    setUpdatePersonLoading(true);
    try {
      await axios.put(
        `/api/segbis/units/${selectedUnit.id}/personel/${updatePersonId}`,
        {
          name: updatePersonForm.name,
          title: updatePersonForm.title,
          phoneNumber: updatePersonForm.phoneNumber.replace(/\D/g, ""),
          is_default: updatePersonForm.is_default,
        }
      );
      await fetchPersonnel(selectedUnit.id);
      setShowUpdatePersonModal(false);
    } catch (err) {
      setUpdatePersonError(
        err?.response?.data?.message || "Personel güncellenirken hata oluştu."
      );
    }
    setUpdatePersonLoading(false);
  };

  // Yeni birim ekleme modalı için state
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [addUnitForm, setAddUnitForm] = useState({
    cityId: "",
    il: "",
    ad: "",
  });
  const [addUnitLoading, setAddUnitLoading] = useState(false);
  const [addUnitError, setAddUnitError] = useState("");

  // Yeni birim ekleme modalını aç/kapat
  const openAddUnitModal = () => {
    setAddUnitForm({
      il: selectedCity?.name || "",
      ad: "",
    });
    setAddUnitError("");
    setShowAddUnitModal(true);
  };
  const closeAddUnitModal = () => {
    setShowAddUnitModal(false);
    setAddUnitError("");
  };

  // Yeni birim form değişikliği
  const handleAddUnitFormChange = (e) => {
    const { name, value } = e.target;
    setAddUnitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Yeni birim ekleme işlemi
  const submitAddUnit = async (e) => {
    e.preventDefault();
    setAddUnitError("");
    if (!addUnitForm.il || !addUnitForm.ad) {
      setAddUnitError("İl ve birim adı zorunludur.");
      return;
    }
    setAddUnitLoading(true);
    try {
      await axios.post("/api/segbis/units", {
        il: addUnitForm.il,
        ad: addUnitForm.ad,
      });
      // Yeni birim eklendikten sonra birimleri güncelle
      if (selectedCity?.id) await fetchUnits(selectedCity.id);
      setShowAddUnitModal(false);
    } catch (err) {
      setAddUnitError(
        err?.response?.data?.message || "Birim eklenirken hata oluştu."
      );
    }
    setAddUnitLoading(false);
  };

  return (
    <div className="segbis-rehber-dashboard">
      <AYSNavbar />
      <Container fluid className="p-4">
        {/* Her ekranda görünen adliye arama kutusu */}

        <Row className="mb-4">
          <Col>
            <h3 className="text-primary fw-bold">
              <FaPhoneAlt className="me-2" />
              SEGBİS Rehber
            </h3>
            <p className="text-muted">
              Adalet teşkilatı birimlerinin iletişim bilgilerini burada
              bulabilirsiniz.
            </p>
          </Col>
        </Row>
        <Row className="justify-content-center mb-4">
          <Col xs={12} md={8} lg={6}>
            <div className="adliye-search-box p-2 px-3 d-flex align-items-center shadow rounded-4 bg-white">
              <FaSearch className="me-2 text-primary fs-4" />
              <Input
                className="border-0 bg-transparent fs-5"
                style={{ boxShadow: "none" }}
                placeholder="Adliye adı, bölge veya plaka ile hızlı arayın..."
                value={adliyeSearchTerm}
                onChange={handleAdliyeSearch}
              />
              {adliyeSearchTerm && (
                <Button close onClick={() => setAdliyeSearchTerm("")} />
              )}
            </div>
          </Col>
        </Row>

        {/* Arama ve Navigasyon */}
        <Card className="shadow-sm border-0 mb-4">
          <CardHeader className="bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {currentView !== "cities" && (
                <Button color="light" className="me-3" onClick={goBack}>
                  <FaArrowLeft className="me-2" /> Geri
                </Button>
              )}
              <h5 className="mb-0">
                {currentView === "cities" && (
                  <>
                    <FaCity className="me-2" /> Adliyeler
                  </>
                )}
                {currentView === "units" && (
                  <>
                    <FaBuilding className="me-2" /> {selectedCity?.name}{" "}
                    ADLİYESİ BİRİMLERİ
                  </>
                )}
                {currentView === "personnel" && (
                  <>
                    <FaUsers className="me-2" /> {selectedUnit?.name} PERSONELİ
                  </>
                )}
              </h5>
            </div>
            <div className="col-md-4">
              <InputGroup>
                <InputGroupText
                  hidden={currentView === "cities"}
                  className="bg-light"
                >
                  <FaSearch />
                </InputGroupText>
                <Input
                  placeholder={
                    currentView === "cities"
                      ? "Adliye adı, bölge veya plaka ara..."
                      : currentView === "units"
                      ? "Birim adı ara..."
                      : "Ad, soyad veya ünvan ara..."
                  }
                  value={searchTerm}
                  hidden={currentView === "cities"}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button close onClick={() => setSearchTerm("")} />
                )}
              </InputGroup>
            </div>
            {/* Yeni Birim ve Personel Ekle Butonları */}
            {currentView === "personnel" && (
              <Button
                color="success"
                className="ms-3"
                disabled={!hasEditPermission()}
                onClick={openAddPersonModal}
              >
                + Yeni Personel Ekle
              </Button>
            )}
            {currentView === "units" && (
              <Button
                color="primary"
                className="ms-3"
                disabled={!hasEditPermission()}
                onClick={openAddUnitModal}
              >
                + Yeni Birim Ekle
              </Button>
            )}
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-center p-5">
                <Spinner color="primary" />
                <p className="text-muted mt-3">Veriler yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* İller Görünümü */}
                {currentView === "cities" && (
                  <>
                    {applyFilter(cities, adliyeSearchTerm).length === 0 ? (
                      <Alert color="info">
                        <FaInfoCircle className="me-2" />
                        Arama kriterine uygun il bulunamadı.
                      </Alert>
                    ) : (
                      <Row>
                        {applyFilter(cities, adliyeSearchTerm).map((city) => (
                          <Col md={4} key={city.id} className="mb-3">
                            <Card
                              className="h-100 shadow-sm border-0 city-card"
                              onClick={() => selectCity(city)}
                              style={{ cursor: "pointer" }}
                            >
                              <CardBody className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-3 me-3">
                                  <FaCity className="text-primary fs-4" />
                                </div>
                                <div>
                                  <h5 className="mb-1">{city.name}</h5>
                                  <div>
                                    <Badge className="me-2" color="secondary">
                                      {city.code}
                                    </Badge>
                                    <Badge color={getRegionColor(city.region)}>
                                      {city.region}
                                    </Badge>{" "}
                                    <Badge>{city.phone}</Badge>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </>
                )}

                {/* Birimler Görünümü */}
                {currentView === "units" && (
                  <>
                    {applyFilter(units).length === 0 ? (
                      <Alert color="info">
                        <FaInfoCircle className="me-2" />
                        Arama kriterine uygun birim bulunamadı.
                      </Alert>
                    ) : (
                      <ListGroup>
                        {applyFilter(units)
                          .sort((a, b) => {
                            // Özel sıralama fonksiyonu
                            const aName = a.name.toUpperCase();
                            const bName = b.name.toUpperCase();

                            // Sayıları çıkarma regex'i
                            const aMatch = aName.match(/^(\D*)(\d+)(.*)$/);
                            const bMatch = bName.match(/^(\D*)(\d+)(.*)$/);

                            // Eğer her ikisi de sayı içeriyorsa
                            if (aMatch && bMatch) {
                              // Sayı öncesi metinleri karşılaştır
                              const aPrefix = aMatch[1];
                              const bPrefix = bMatch[1];

                              if (aPrefix !== bPrefix) {
                                return aPrefix.localeCompare(bPrefix, "tr");
                              }

                              // Metinler aynıysa sayıları karşılaştır
                              const aNum = parseInt(aMatch[2], 10);
                              const bNum = parseInt(bMatch[2], 10);
                              return aNum - bNum;
                            }

                            // Normal alfabetik sıralama
                            return aName.localeCompare(bName, "tr");
                          })
                          .map((unit) => (
                            <ListGroupItem
                              key={unit.id}
                              action
                              className="d-flex align-items-center py-3 unit-item"
                              onClick={() => selectUnit(unit)}
                            >
                              <div className="bg-light rounded-circle p-3 me-3">
                                <FaBuilding className="text-primary" />
                              </div>
                              <div className="flex-grow-1">
                                <h5 className="mb-1">{unit.name}</h5>
                                <Badge color={getUnitTypeColor(unit.type)}>
                                  {unit.type}
                                </Badge>
                              </div>
                              <div>
                                <Button color="light" size="sm">
                                  Personeli Görüntüle
                                </Button>
                              </div>
                            </ListGroupItem>
                          ))}
                      </ListGroup>
                    )}
                  </>
                )}

                {/* Personel Görünümü */}
                {currentView === "personnel" && (
                  <>
                    {applyFilter(personnel).length === 0 ? (
                      <Alert color="info">
                        <FaInfoCircle className="me-2" />
                        Arama kriterine uygun personel bulunamadı.
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="align-middle shadow-sm">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: "5%" }}>#</th>
                              <th style={{ width: "15%" }}>Ünvan</th>
                              <th style={{ width: "25%" }}>Ad Soyad</th>
                              <th style={{ width: "20%" }}>Telefon</th>
                              <th style={{ width: "15%" }}>Eklenme Tarihi</th>
                              <th
                                style={{ width: "10%" }}
                                className="text-center"
                              >
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              // Varsayılan personeli en üstte göstermek için sıralama
                              const sortedPersonnel = [
                                ...applyFilter(personnel),
                              ].sort((a, b) => {
                                if (a.isDefault === b.isDefault) return 0;
                                return a.isDefault ? -1 : 1;
                              });
                              return sortedPersonnel.map((person, index) => (
                                <tr
                                  key={person.id}
                                  className={
                                    person.isDefault ? "table-success" : ""
                                  }
                                >
                                  <td>{index + 1}</td>
                                  <td>
                                    <Badge
                                      color={getTitleColor(person.title)}
                                      pill
                                      className="px-3 py-2"
                                    >
                                      {person.title}
                                    </Badge>
                                    {person.isDefault && (
                                      <Badge color="warning" className="ms-2">
                                        Varsayılan
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="fw-bold">{person.name}</td>
                                  <td>
                                    <span
                                      className="text-decoration-underline text-primary"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => viewPersonDetails(person)}
                                      title="Detayları Görüntüle"
                                    >
                                      <FaPhoneAlt className="me-2 text-success" />
                                      {formatPhoneNumber(person.phone)}
                                    </span>
                                  </td>
                                  <td>{formatDate(person.createdAt)}</td>
                                  <td className="text-center">
                                    <Button
                                      color="primary"
                                      size="sm"
                                      onClick={() => viewPersonDetails(person)}
                                      className="me-1"
                                    >
                                      <FaInfoCircle />
                                    </Button>
                                    <Button
                                      color="warning"
                                      size="sm"
                                      onClick={() =>
                                        openUpdatePersonModal(person)
                                      }
                                      className="me-1"
                                      disabled={!hasEditPermission()}
                                    >
                                      Güncelle
                                    </Button>
                                    <Button
                                      color="danger"
                                      size="sm"
                                      onClick={() => handleDeletePerson(person)}
                                      disabled={!hasEditPermission()}
                                    >
                                      Sil
                                    </Button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Personel Detay Modalı */}
      <Modal isOpen={showModal} toggle={closeModal}>
        <ModalHeader toggle={closeModal} className="bg-light">
          <FaUsers className="me-2" /> Personel Detayları
        </ModalHeader>
        <ModalBody>
          {selectedPerson && (
            <div>
              <div className="text-center mb-4">
                <div className="bg-light d-inline-block rounded-circle p-4 mb-3">
                  <FaUsers className="text-primary fs-1" />
                </div>
                <h4>{selectedPerson.name || "Belirtilmemiş"} </h4>
                <Badge
                  color={getTitleColor(selectedPerson.title)}
                  pill
                  className="px-3 py-2"
                >
                  {selectedPerson.title}
                </Badge>
              </div>

              <Row className="mb-4">
                <Col md={7}>
                  <Table bordered className="mb-0">
                    <tbody>
                      <tr>
                        <th className="bg-light" style={{ width: "30%" }}>
                          Telefon
                        </th>
                        <td>
                          <a
                            href={`tel:${selectedPerson.phone}`}
                            className="text-decoration-none"
                          >
                            <FaPhoneAlt className="me-2 text-success" />
                            {formatPhoneNumber(selectedPerson.phone)}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">Birim</th>
                        <td>{selectedUnit?.name}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Şehir</th>
                        <td>{selectedCity?.name}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={5} className="text-center">
                  <div className="p-3 border rounded">
                    <div className="mb-2">
                      <FaQrcode className="text-primary me-2" />
                      Telefon QR Kodu
                    </div>
                    <div
                      className="bg-white p-2 d-inline-block"
                      style={{ borderRadius: "8px" }}
                    >
                      <QRCode
                        value={`tel:90${selectedPerson.phone}`}
                        size={120}
                        level="M"
                      />
                    </div>
                    <div className="mt-2 text-muted small">
                      QR kodu telefonunuzla taratarak arama yapabilirsiniz.
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Yeni Personel Ekle Modalı */}
      <Modal isOpen={showAddPersonModal} toggle={closeAddPersonModal}>
        <ModalHeader toggle={closeAddPersonModal} className="bg-light">
          Yeni Personel Ekle
        </ModalHeader>
        <ModalBody>
          <form onSubmit={submitAddPerson}>
            <Row>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Eklenen Mahkeme</label>
                <Input
                  name="name"
                  value={`${selectedCity?.name} ${selectedUnit?.name}`}
                  disabled
                />
              </Col>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Ad Soyad</label>
                <Input
                  name="name"
                  value={addPersonForm.name}
                  onChange={handleAddPersonFormChange}
                  required
                  placeholder="Ad Soyad"
                />
              </Col>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Ünvan</label>
                <Input
                  type="select"
                  name="title"
                  value={addPersonForm.title}
                  onChange={handleAddPersonFormChange}
                  required
                >
                  <option value="">Seçiniz...</option>
                  <option value="Mübaşir">Mübaşir</option>
                  <option value="Katip">Katip</option>
                  <option value="Yazı İşleri Müdürü">Yazı İşleri Müdürü</option>
                  <option value="Diğer">Diğer</option>
                </Input>
              </Col>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Telefon</label>
                <Input
                  name="phoneNumber"
                  value={addPersonForm.phoneNumber}
                  onChange={handleAddPersonFormChange}
                  required
                  placeholder="Telefon Numarası (ör: 5551234567)"
                  maxLength={10}
                  pattern="[1-9][0-9]{9}"
                  title="Telefon numarası 10 haneli olmalı, başında 0 olmamalı ve sadece rakam içermelidir."
                  autoComplete="off"
                />
              </Col>
              <Col md={12} className="mb-3">
                <div className="form-check">
                  <Input
                    type="checkbox"
                    name="is_default"
                    checked={addPersonForm.is_default}
                    onChange={handleAddPersonFormChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label ms-2">Varsayılan</label>
                </div>
              </Col>
            </Row>
            {addPersonError && <Alert color="danger">{addPersonError}</Alert>}
            <div className="d-flex justify-content-end">
              <Button
                color="secondary"
                onClick={closeAddPersonModal}
                className="me-2"
                type="button"
              >
                İptal
              </Button>
              <Button color="success" type="submit" disabled={addPersonLoading}>
                {addPersonLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>

      {/* Personel güncelleme modalı */}
      <Modal isOpen={showUpdatePersonModal} toggle={closeUpdatePersonModal}>
        <ModalHeader toggle={closeUpdatePersonModal} className="bg-light">
          Personel Bilgilerini Güncelle
        </ModalHeader>
        <ModalBody>
          <form onSubmit={submitUpdatePerson}>
            <Row>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">
                  Güncellenen Mahkeme
                </label>
                <Input
                  name="mahkeme"
                  value={`${selectedCity?.name} ${selectedUnit?.name}`}
                  disabled
                />
              </Col>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Ad Soyad</label>
                <Input
                  name="name"
                  value={updatePersonForm.name}
                  onChange={handleUpdatePersonFormChange}
                  required
                  placeholder="Ad Soyad"
                />
              </Col>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Ünvan</label>
                <Input
                  type="select"
                  name="title"
                  value={updatePersonForm.title}
                  onChange={handleUpdatePersonFormChange}
                  required
                >
                  <option value="">Seçiniz...</option>
                  <option value="Mübaşir">Mübaşir</option>
                  <option value="Katip">Katip</option>
                  <option value="Yazı İşleri Müdürü">Yazı İşleri Müdürü</option>
                  <option value="Diğer">Diğer</option>
                </Input>
              </Col>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Telefon</label>
                <Input
                  name="phoneNumber"
                  value={updatePersonForm.phoneNumber}
                  onChange={handleUpdatePersonFormChange}
                  required
                  placeholder="Telefon Numarası (ör: 5551234567)"
                  maxLength={10}
                  pattern="[1-9][0-9]{9}"
                  title="Telefon numarası 10 haneli olmalı, başında 0 olmamalı ve sadece rakam içermelidir."
                  autoComplete="off"
                />
              </Col>
              <Col md={12} className="mb-3">
                <div className="form-check">
                  <Input
                    type="checkbox"
                    name="is_default"
                    checked={updatePersonForm.is_default}
                    onChange={handleUpdatePersonFormChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label ms-2">Varsayılan</label>
                </div>
              </Col>
            </Row>
            {updatePersonError && (
              <Alert color="danger">{updatePersonError}</Alert>
            )}
            <div className="d-flex justify-content-end">
              <Button
                color="secondary"
                onClick={closeUpdatePersonModal}
                className="me-2"
                type="button"
              >
                İptal
              </Button>
              <Button
                color="success"
                type="submit"
                disabled={updatePersonLoading}
              >
                {updatePersonLoading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>

      {/* Yeni Birim Ekle Modalı */}
      <Modal isOpen={showAddUnitModal} toggle={closeAddUnitModal}>
        <ModalHeader toggle={closeAddUnitModal} className="bg-light">
          Yeni Birim Ekle
        </ModalHeader>
        <ModalBody>
          <form onSubmit={submitAddUnit}>
            <Row>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">İl</label>
                <Input
                  name="il"
                  value={addUnitForm.il}
                  onChange={handleAddUnitFormChange}
                  required
                  placeholder="İl adı"
                  list="city-list"
                />
                <datalist id="city-list">
                  {cities.map((city) => (
                    <option key={city.id} value={city.name} />
                  ))}
                </datalist>
                <div className="text-muted small mt-1">
                  İl bilgisini değiştirirseniz yeni bir adliye oluşturulup
                  eklenecektir.
                </div>
              </Col>
              <Col md={12} className="mb-3">
                <label className="form-label fw-bold">Birim Adı</label>
                <Input
                  name="ad"
                  value={addUnitForm.ad}
                  onChange={handleAddUnitFormChange}
                  required
                  placeholder="Birim adı"
                />
              </Col>
            </Row>
            {addUnitError && <Alert color="danger">{addUnitError}</Alert>}
            <div className="d-flex justify-content-end">
              <Button
                color="secondary"
                onClick={closeAddUnitModal}
                className="me-2"
                type="button"
              >
                İptal
              </Button>
              <Button color="primary" type="submit" disabled={addUnitLoading}>
                {addUnitLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>

      {/* CSS Stilleri */}
      <style jsx="true">{`
        .segbis-rehber-dashboard .table-responsive {
          border-radius: 8px;
          overflow: hidden;
        }

        .city-card:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .unit-item:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
