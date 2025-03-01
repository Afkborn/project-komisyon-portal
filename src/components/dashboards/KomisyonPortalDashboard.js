import React, { useState, useEffect } from "react";
import {
  Alert,
  Container,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Nav,
  Spinner,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import logo from "../../assets/epsis-logo.png";
import KomisyonPortalWelcome from "../komisyon-portal-features/Welcome/KomisyonPortalWelcome";
import Birimler from "../komisyon-portal-features/Birimler/Birimler";
import TumPersonelListe from "../komisyon-portal-features/TumPersonelListe/TumPersonelListe";
import PersonelListeByBirim from "../komisyon-portal-features/PersonelListeByBirim/PersonelListeByBirim";
import PersonelDetay from "../komisyon-portal-features/PersonelDetay/PersonelDetay";
import Unvanlar from "../komisyon-portal-features/Unvanlar";
import Kurum from "../komisyon-portal-features/Kurum";
import PersonelOnLeave from "../komisyon-portal-features/Reports/PersonelOnLeave";
import UnitMissingClerk from "../komisyon-portal-features/Reports/UnitMissingClerk";
import KullaniciAyarlari from "../komisyon-portal-features/KullaniciAyarlari";
import PersonelSayi from "../komisyon-portal-features/Reports/PersonelSayi";
import TumPersonelTablo from "../komisyon-portal-features/Reports/TumPersonelTablo";
import PersonelAktar from "../komisyon-portal-features/Aktarim/PersonelAktar";
import OzellikAktar from "../komisyon-portal-features/Aktarim/OzellikAktar";
import PasifPersonel from "../komisyon-portal-features/Reports/PasifPersonel";
import GeciciPersonel from "../komisyon-portal-features/Reports/GeciciPersonel";
import PersonelHareketleri from "../komisyon-portal-features/Reports/PersonelHareketleri";
import UzaklastirilmisPersonel from "../komisyon-portal-features/Reports/UzaklastirilmisPersonel";
import SehitGaziYakiniPersonel from "../komisyon-portal-features/Reports/SehitGaziYakiniPersonel";
import EngelliPersonel from "../komisyon-portal-features/Reports/EngelliPersonel";
import Cookies from "universal-cookie";
import axios from "axios";
import alertify from "alertifyjs";
import {
  GET_institutions,
  GET_titles,
  GET_USER_DETAILS,
} from "../constants/AxiosConfiguration";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

export default function KomisyonPortalDashboard() {
  const [selectedBirimID, setSelectedBirimID] = useState(null);
  const [tableResults, setTableResults] = useState([]);
  const [tableType, setTableType] = useState(null);
  const [user, setUser] = useState(null);
  const [kurumlar, setKurumlar] = useState([]);
  const [selectedKurum, setSelectedKurum] = useState(null);
  const [unvanlar, setUnvanlar] = useState([]);
  const [showKurumChangeModal, setShowKurumChangeModal] = useState(false);
  const [selectedNewKurum, setSelectedNewKurum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Responsive navigation states
  const [collapsed, setCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarColor, setNavbarColor] = useState("bg-white");

  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  // Toggle functions
  const toggleNavbar = () => setCollapsed(!collapsed);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Change kurum function
  function changeKurum(kurum) {
    setSelectedNewKurum(kurum);
    setShowKurumChangeModal(true);
  }

  // Confirm kurum change
  function handleKurumChangeConfirm() {
    setSelectedKurum(selectedNewKurum);
    localStorage.setItem("selectedKurum", JSON.stringify(selectedNewKurum));
    setShowKurumChangeModal(false);
    alertify.success(`${selectedNewKurum.name} olarak değiştirildi`);
    navigate("/komisyon-portal/ana-sayfa");
  }

  // Reset page state
  function changePage(rank) {
    window.scrollTo(0, 0);
    setSelectedBirimID(null);

    if (rank === 11 || rank === 3) {
      return;
    }
    setTableResults([]);
    setTableType(null);
  }

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getUser(), getKurum(), getUnvanlar()]);
      } catch (error) {
        console.error("Initial data loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);

    // Scroll event for navbar color change
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 10) {
        setNavbarColor("bg-white shadow-sm");
      } else {
        setNavbarColor("bg-white");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line
  }, []);

  // Load saved kurum from localStorage
  useEffect(() => {
    const savedKurum = localStorage.getItem("selectedKurum");
    if (savedKurum && !selectedKurum) {
      setSelectedKurum(JSON.parse(savedKurum));
    }
    // eslint-disable-next-line
  }, []);

  // Get user data
  async function getUser() {
    try {
      const result = await axios(GET_USER_DETAILS(token));
      setUser(result.data.user);
    } catch (error) {
      console.error("User fetch error:", error);
      cookies.remove("TOKEN");
      window.location.href = "/login";
    }
  }

  // Get institutions data
  async function getKurum() {
    try {
      const result = await axios(GET_institutions);
      const sortedInstitutions = result.data.InstitutionList.sort(
        (a, b) => a.id - b.id
      );
      setKurumlar(sortedInstitutions);

      // Get default or saved institution
      const savedKurum = localStorage.getItem("selectedKurum");
      if (savedKurum) {
        setSelectedKurum(JSON.parse(savedKurum));
      } else {
        const defaultKurum = sortedInstitutions.find((k) => k.isDefault);
        setSelectedKurum(defaultKurum);
        localStorage.setItem("selectedKurum", JSON.stringify(defaultKurum));
      }
    } catch (error) {
      console.error("Institutions fetch error:", error);
      alertify.error("Kurum bilgileri alınamadı.");
    }
  }

  // Get titles data
  async function getUnvanlar() {
    try {
      const result = await axios(GET_titles(token));
      const sortedTitles = result.data.titleList.sort(
        (a, b) => a.oncelikSirasi - b.oncelikSirasi
      );
      setUnvanlar(sortedTitles);
    } catch (error) {
      console.error("Titles fetch error:", error);
    }
  }

  // Show personel detail page
  const showPersonelDetay = (person, result = null, tableType = null) => {
    if (person && person.sicil) {
      if (result) {
        setTableResults(result);
        setTableType(tableType);
      }
      navigate(`personel-detay/${person.sicil}`);
    }
  };

  // Show birim personel list
  const showBirimPersonelListe = (birim) => {
    changePage(2);
    setSelectedBirimID(birim._id);
    navigate("birim-personel-listele");
  };

  // Logout function
  function logout() {
    // Tüm yerel depolamayı temizle
    localStorage.removeItem("selectedKurum");

    // Cookie'yi doğru şekilde temizle (path ve domain parametreleriyle)
    cookies.remove("TOKEN", { path: "/" });

    // Tarayıcı önbelleğini temizle ve session'ı sonlandır
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }

    // Sayfayı tamamen yeniden yükle ve ana sayfaya yönlendir
    window.location.href = "/";

    // Alternatif olarak daha güçlü bir çözüm
    setTimeout(() => {
      if (cookies.get("TOKEN")) {
        // Eğer token hala duruyorsa, sayfayı tamamen yenile
        window.location.reload(true);
      }
    }, 100);
  }

  // Portal Navigation
  function handlePortal() {
    navigate("/");
  }

  // Home navigation
  function handleHome() {
    navigate("/komisyon-portal/ana-sayfa");
  }

  // Check if path is active
  const isActivePath = (path) => {
    const currentPath = location.pathname.split("/").pop();
    const itemPath = path || "";
    return currentPath === itemPath.toLowerCase().replace(/\s+/g, "-");
  };

  // Menu items configuration
  const menuItems = [
    {
      id: 0,
      label: "Ana Sayfa",
      type: "item",
      path: "ana-sayfa",
      icon: "fas fa-home",
    },
    { id: 1001, label: "Eskişehir Personel Sistemi", type: "heading" },
    // {
    //   id: 1004,
    //   label: "Seçili Kurum",
    //   type: "heading",
    //   detail: selectedKurum ? selectedKurum.name : "",
    // },
    {
      id: 4,
      label: "Ünvanlar",
      type: "item",
      hiddenRoles: ["komisyonbaskan"],
      path: "unvanlar",
      icon: "fas fa-user-tag",
    },
    {
      id: 1,
      label: "Birimler",
      type: "item",
      path: "birimler",
      icon: "fas fa-sitemap",
    },
    {
      id: 9,
      label: "Tüm Personel Listesi",
      type: "item",
      path: "tum-personel-listesi",
      icon: "fas fa-users",
    },
    {
      id: 3,
      label: "Personel Özlük",
      type: "item",
      path: "personel-ozluk",
      icon: "fas fa-id-card",
    },
    {
      id: 2,
      label: "Birim Personel Listele",
      type: "item",
      path: "birim-personel-listele",
      icon: "fas fa-user-friends",
    },
    // Reports section
    { id: 1002, label: "Raporlar", type: "heading" },
    {
      id: 6,
      label: "İzinde Olan Personel",
      type: "item",
      path: "izinde-olan-personel",
      icon: "fas fa-plane-departure",
    },
    {
      id: 7,
      label: "Eksik Katibi Olan Birimler",
      type: "item",
      path: "eksik-katibi-olan-birimler",
      icon: "fas fa-user-minus",
    },
    {
      id: 10,
      label: "Personel Sayısı",
      type: "item",
      path: "personel-sayisi",
      icon: "fas fa-chart-pie",
    },
    {
      id: 11,
      label: "Personel Tablosu",
      type: "item",
      path: "personel-tablosu",
      icon: "fas fa-table",
    },
    {
      id: 14,
      label: "Devren Gidenler",
      type: "item",
      path: "devren-gidenler",
      icon: "fas fa-sign-out-alt",
    },
    {
      id: 16,
      label: "Geçici Personel",
      type: "item",
      path: "gecici-personel",
      icon: "fas fa-hourglass-half",
    },
    {
      id: 18,
      label: "Uzaklaştırılmış Personel",
      type: "item",
      path: "uzaklastirilmis-personel",
      icon: "fas fa-user-slash",
    },
    {
      id: 19,
      label: "Şehit/Gazi Yakını Personel",
      type: "item",
      path: "sehit-gazi-yakini-personel",
      icon: "fas fa-medal",
    },
    {
      id: 20,
      label: "Engelli Personel",
      type: "item",
      path: "engelli-personel",
      icon: "fas fa-wheelchair",
    },
    {
      id: 17,
      label: "Personel Hareketleri",
      type: "item",
      path: "personel-hareketleri",
      icon: "fas fa-exchange-alt",
    },
    // Admin section
    {
      id: 1003,
      label: "Yönetim",
      type: "heading",
      visibleRoles: ["admin"],
    },
    {
      id: 12,
      label: "Personel Aktar",
      type: "item",
      visibleRoles: ["admin"],
      path: "personel-aktar",
      icon: "fas fa-file-import",
    },
    {
      id: 15,
      label: "Özellik Aktar",
      type: "item",
      visibleRoles: ["admin"],
      path: "ozellik-aktar",
      icon: "fas fa-cogs",
    },
  ];

  // Render sidebar menu items
  const renderMenuItem = (item) => {
    // Check if item should be visible for user's role
    const isVisibleForRole =
      (!item.visibleRoles ||
        item.visibleRoles.length === 0 ||
        (user &&
          user.roles.some((role) => item.visibleRoles.includes(role)))) &&
      (!item.hiddenRoles ||
        item.hiddenRoles.length === 0 ||
        (user && !user.roles.some((role) => item.hiddenRoles.includes(role))));

    if (!isVisibleForRole) return null;

    if (item.type === "heading") {
      return (
        <div
          key={item.id}
          className="sidebar-heading py-2 px-3 text-uppercase text-muted fw-bold fs-7 mt-3"
        >
          {item.label}
          {item.detail && (
            <Badge color="danger" pill className="ms-2">
              {item.detail}
            </Badge>
          )}
        </div>
      );
    }

    const path = item.path || item.label.toLowerCase().replace(/\s+/g, "-");
    const isActive = isActivePath(path);

    return (
      <Link
        to={path}
        key={item.id}
        className={`sidebar-item d-flex align-items-center px-3 py-2 text-decoration-none 
          ${isActive ? "active bg-danger text-white" : "text-dark"}`}
        onClick={() => {
          window.scrollTo(0, 0);
          if (window.innerWidth < 992) {
            setSidebarOpen(false);
          }
        }}
      >
        <i
          className={`${item.icon || "fas fa-circle"} me-2 ${
            isActive ? "text-white" : "text-primary"
          }`}
        ></i>
        <span>{item.label}</span>
        {isActive && <i className="fas fa-chevron-right ms-auto"></i>}
      </Link>
    );
  };

  // Loading indicator
  if (isLoading) {
    return (
      <div className="loading-container d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <img
            src={logo}
            alt="EPSİS"
            className="mb-4"
            style={{ width: "150px" }}
          />
          <Spinner color="danger" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">
            Uygulama yükleniyor, lütfen bekleyin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container d-flex">
      {/* Sidebar */}
      <div
        className={`sidebar bg-light border-end ${
          sidebarOpen ? "open" : "closed"
        }`}
        id="sidebar"
      >
        {/* Sidebar Logo */}
        <div className="sidebar-logo text-center py-4 border-bottom">
          <img
            src={logo}
            alt="EPSİS"
            className="logo-img"
            onClick={handleHome}
            style={{ width: "130px", cursor: "pointer" }}
          />
        </div>

        {/* User Info */}
        {user && (
          <div className="user-info px-3 py-3 border-bottom">
            <div className="d-flex align-items-center">
              <div className="user-avatar bg-danger text-white rounded-circle me-2">
                {user.name?.charAt(0)}
                {user.surname?.charAt(0)}
              </div>
              <div className="user-details flex-grow-1">
                <div className="user-name fw-bold">
                  {user.name} {user.surname}
                </div>
                <div className="user-role small text-muted">
                  {user.roles?.map((role) => (
                    <Badge key={role} color="danger" className="me-1">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle color="link" className="p-0 text-dark">
                  <i className="fas fa-ellipsis-v"></i>
                </DropdownToggle>
                <DropdownMenu end>
                  <DropdownItem onClick={() => navigate("hesap-ayarlari")}>
                    <i className="fas fa-user-cog me-2"></i>Hesap Ayarları
                  </DropdownItem>
                  <DropdownItem onClick={logout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Çıkış Yap
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        )}

        {/* Sidebar Navigation */}
        <div className="sidebar-menu overflow-auto py-2">
          {menuItems.map(renderMenuItem)}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer text-center p-3 border-top">
          <small className="text-muted">
            &copy; {new Date().getFullYear()} EPSİS
          </small>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content flex-grow-1">
        {/* Navbar */}
        <Navbar className={`dashboard-navbar px-3 ${navbarColor}`} expand="md">
          <NavbarBrand className="d-lg-none">
            <Button
              color="light"
              className="me-2 border-0"
              onClick={toggleSidebar}
            >
              <i className="fas fa-bars"></i>
            </Button>
            EPSİS
          </NavbarBrand>
          <NavbarToggler onClick={toggleNavbar} className="d-lg-none ms-auto" />
          <Collapse isOpen={!collapsed} navbar className="justify-content-end">
            <Nav navbar>
              <div className="d-flex align-items-center">
                {selectedKurum && (
                  <div className="me-3 d-none d-sm-block">
                    <Badge color="danger" pill className="px-3 py-2">
                      <i className="fas fa-building me-1"></i>
                      {selectedKurum.name}
                    </Badge>
                  </div>
                )}
                <Button
                  color="light"
                  size="sm"
                  className="me-2"
                  onClick={() => navigate("kurum")}
                >
                  <i className="fas fa-exchange-alt me-1"></i>
                  Kurum Değiştir
                </Button>
                <Button color="danger" size="sm" onClick={handlePortal}>
                  <i className="fas fa-home me-1"></i>
                  Ana Sayfa
                </Button>
              </div>
            </Nav>
          </Collapse>
        </Navbar>

        {/* Page Content Container */}
        <Container fluid className="p-4">
          <Routes>
            <Route
              path="/ana-sayfa"
              element={
                <KomisyonPortalWelcome
                  user={user}
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                  showBirimPersonelListe={showBirimPersonelListe}
                  selectedKurum={selectedKurum}
                />
              }
            />
            <Route
              path="birimler"
              element={<Birimler selectedKurum={selectedKurum} token={token} />}
            />
            <Route
              path="personel-tablosu"
              element={
                <TumPersonelTablo
                  selectedKurum={selectedKurum}
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                  tableResults={tableResults}
                  tableType={tableType}
                />
              }
            />
            <Route
              path="personel-ozluk"
              element={
                <PersonelDetay
                  kurumlar={kurumlar}
                  selectedKurum={selectedKurum}
                  token={token}
                  unvanlar={unvanlar}
                />
              }
            />
            <Route
              path="personel-ozluk/:sicil"
              element={
                <PersonelDetay
                  kurumlar={kurumlar}
                  selectedKurum={selectedKurum}
                  token={token}
                  unvanlar={unvanlar}
                />
              }
            />
            <Route
              path="personel-detay/:sicil"
              element={
                <PersonelDetay
                  kurumlar={kurumlar}
                  selectedKurum={selectedKurum}
                  token={token}
                  unvanlar={unvanlar}
                />
              }
            />
            <Route
              path="hesap-ayarlari"
              element={<KullaniciAyarlari token={token} getUser={getUser} />}
            />
            <Route
              path="unvanlar"
              element={
                <Unvanlar
                  unvanlar={unvanlar}
                  updateUnvanlar={getUnvanlar}
                  token={token}
                />
              }
            />
            <Route
              path="kurum"
              element={
                <Kurum
                  kurumlar={kurumlar}
                  selectedKurum={selectedKurum}
                  setSelectedKurum={changeKurum}
                />
              }
            />
            <Route
              path="tum-personel-listesi"
              element={
                <TumPersonelListe
                  selectedKurum={selectedKurum}
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                  unvanlar={unvanlar}
                />
              }
            />
            <Route
              path="birim-personel-listele"
              element={
                <PersonelListeByBirim
                  selectedKurum={selectedKurum}
                  unvanlar={unvanlar}
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                  selectedBirimID={selectedBirimID}
                />
              }
            />
            <Route
              path="izinde-olan-personel"
              element={
                <PersonelOnLeave
                  selectedKurum={selectedKurum}
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                />
              }
            />
            <Route
              path="eksik-katibi-olan-birimler"
              element={
                <UnitMissingClerk token={token} selectedKurum={selectedKurum} />
              }
            />
            <Route
              path="personel-sayisi"
              element={
                <PersonelSayi
                  selectedKurum={selectedKurum}
                  unvanlar={unvanlar}
                  token={token}
                />
              }
            />
            <Route
              path="devren-gidenler"
              element={
                <PasifPersonel
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                />
              }
            />
            <Route
              path="ozellik-aktar"
              element={
                <OzellikAktar selectedKurum={selectedKurum} token={token} />
              }
            />
            <Route
              path="gecici-personel"
              element={
                <GeciciPersonel
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                />
              }
            />
            <Route
              path="personel-hareketleri"
              element={
                <PersonelHareketleri
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                  user={user}
                  showBirimPersonelListe={showBirimPersonelListe}
                  selectedKurum={selectedKurum}
                />
              }
            />
            <Route
              path="uzaklastirilmis-personel"
              element={
                <UzaklastirilmisPersonel
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                />
              }
            />
            <Route
              path="sehit-gazi-yakini-personel"
              element={
                <SehitGaziYakiniPersonel
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                />
              }
            />
            <Route
              path="engelli-personel"
              element={
                <EngelliPersonel
                  token={token}
                  showPersonelDetay={showPersonelDetay}
                />
              }
            />
            <Route
              path="personel-aktar"
              element={
                <PersonelAktar
                  selectedKurum={selectedKurum}
                  token={token}
                  unvanlar={unvanlar}
                />
              }
            />
          </Routes>
        </Container>
      </div>

      {/* Kurum Change Modal */}
      <Modal
        isOpen={showKurumChangeModal}
        toggle={() => setShowKurumChangeModal(false)}
        centered
      >
        <ModalHeader toggle={() => setShowKurumChangeModal(false)}>
          <i className="fas fa-exchange-alt me-2"></i>
          Kurum Değiştirme
        </ModalHeader>
        <ModalBody>
          <div className="text-center mb-3">
            <i className="fas fa-building text-primary fa-3x mb-3"></i>
            <h5>Kurum değiştirmek istediğinize emin misiniz?</h5>
          </div>
          <Alert color="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Kurum değişikliği yaptığınızda mevcut çalışmanız etkilenebilir.
          </Alert>
          <Card className="mb-3">
            <CardBody className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Seçilen Kurum:</strong>
                <div>{selectedNewKurum?.name}</div>
              </div>
              <Badge color="danger" pill>
                Yeni
              </Badge>
            </CardBody>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleKurumChangeConfirm}>
            <i className="fas fa-check me-1"></i>
            Değiştir
          </Button>{" "}
          <Button
            color="secondary"
            onClick={() => setShowKurumChangeModal(false)}
          >
            <i className="fas fa-times me-1"></i>
            İptal
          </Button>
        </ModalFooter>
      </Modal>

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 992 && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global Styles */}
      <style jsx="true">{`
        .dashboard-container {
          min-height: 100vh;
          overflow-x: hidden;
        }

        .sidebar {
          width: 250px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1030;
          transition: all 0.3s ease;
          overflow-y: auto;
          scrollbar-width: thin; /* Firefox için ince scrollbar */
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent; /* Firefox için scrollbar rengi */
        }

        /* WebKit (Chrome, Safari, Edge) tarayıcılar için scrollbar stilleri */
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }

        .sidebar.closed {
          transform: translateX(-100%);
        }

        .main-content {
          margin-left: 250px;
          width: calc(100% - 250px);
          transition: all 0.3s ease;
          overflow-x: hidden;
        }

        /* Ana içerik scrollbar stilini özelleştirme */
        .main-content::-webkit-scrollbar {
          width: 8px;
        }

        .main-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .main-content::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }

        .sidebar-closed .main-content {
          margin-left: 0;
          width: 100%;
        }

        /* Sidebar menü bölümünün scrollbar'ını gizle/özelleştir */
        .sidebar-menu {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }

        .sidebar-menu::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.25);
        }

        /* Genel olarak tüm sayfa için scrollbar stili */
        body::-webkit-scrollbar {
          width: 8px;
        }

        body::-webkit-scrollbar-track {
          background: transparent;
        }

        body::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }

        body::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.25);
        }

        .dashboard-navbar {
          position: sticky;
          top: 0;
          z-index: 1020;
          transition: all 0.3s ease;
        }

        .sidebar-item {
          border-radius: 4px;
          margin: 2px 8px;
          transition: all 0.2s ease;
        }

        .sidebar-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .sidebar-item.active {
          font-weight: 500;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1025;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .fs-7 {
          font-size: 0.8rem;
        }

        @media (max-width: 991.98px) {
          .sidebar {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
