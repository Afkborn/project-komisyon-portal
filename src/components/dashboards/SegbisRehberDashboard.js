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
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Sayfa yüklendiğinde illeri çek
  useEffect(() => {
    fetchCities();
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

  // Filtre uygulama
  const applyFilter = (items) => {
    if (!searchTerm) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title &&
          item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.region &&
          item.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type &&
          item.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.code && item.code.toString().includes(searchTerm.toLowerCase()))
    );
  };

  // Ünvana göre rozet rengi belirleme
  const getTitleColor = (title) => {
    switch (title?.toLowerCase()) {
      case "hakim":
      case "hâkim":
        return "danger";
      case "cumhuriyet savcısı":
      case "savcı":
        return "success";
      case "yazı işleri müdürü":
        return "primary";
      case "zabıt kâtibi":
        return "info";
      case "mübaşir":
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
        return "light";
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
      return `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }
    if (digits.length === 11 && digits.startsWith("0")) {
      // 0 ile başlıyorsa +90 ekle
      return `+90 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
    }
    return phone;
  };

  return (
    <div className="segbis-rehber-dashboard">
      <AYSNavbar />
      <Container fluid className="p-4">
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
                <InputGroupText className="bg-light">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button close onClick={() => setSearchTerm("")} />
                )}
              </InputGroup>
            </div>
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
                    {applyFilter(cities).length === 0 ? (
                      <Alert color="info">
                        <FaInfoCircle className="me-2" />
                        Arama kriterine uygun il bulunamadı.
                      </Alert>
                    ) : (
                      <Row>
                        {applyFilter(cities).map((city) => (
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
                                    </Badge>
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

                              <th
                                style={{ width: "10%" }}
                                className="text-center"
                              >
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {applyFilter(personnel).map((person, index) => (
                              <tr key={person.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <Badge
                                    color={getTitleColor(person.title)}
                                    pill
                                    className="px-3 py-2"
                                  >
                                    {person.title}
                                  </Badge>
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

                                <td className="text-center">
                                  <Button
                                    color="primary"
                                    size="sm"
                                    onClick={() => viewPersonDetails(person)}
                                  >
                                    <FaInfoCircle />
                                  </Button>
                                </td>
                              </tr>
                            ))}
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
                        value={`tel:${selectedPerson.phone}`}
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
