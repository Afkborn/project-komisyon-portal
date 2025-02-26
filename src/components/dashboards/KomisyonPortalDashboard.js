import React, { useState, useEffect } from "react";
import {
  Alert,
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  Badge,
  Tooltip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
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
import KomisyonPortalKullaniciYonetim from "../komisyon-portal-features/KomisyonPortalKullaniciYonetim";
import PasifPersonel from "../komisyon-portal-features/Reports/PasifPersonel";
import GeciciPersonel from "../komisyon-portal-features/Reports/GeciciPersonel";
import PersonelHareketleri from "../komisyon-portal-features/Reports/PersonelHareketleri";
import UzaklastirilmisPersonel from "../komisyon-portal-features/Reports/UzaklastirilmisPersonel";
import SehitGaziYakiniPersonel from "../komisyon-portal-features/Reports/SehitGaziYakiniPersonel";
import EngelliPersonel from "../komisyon-portal-features/Reports/EngelliPersonel";
import Cookies from "universal-cookie";
import axios from "axios";
import alertify from "alertifyjs";
import logoutSvg from "../../assets/logout.svg";

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
} from "react-router-dom"; // useNavigate ve useLocation ekledik

export default function KomisyonPortalDashboard() {
  const [selectedBirimID, setSelectedBirimID] = useState(null); // personel detay ekranında seçili personelin sicil numarası

  // tablodan bir personel'e tıklandığı zaman tabloya tekrar dönmek için tablo sonuçlarını saklayalım
  const [tableResults, setTableResults] = useState([]);
  const [tableType, setTableType] = useState(null);
  const [user, setUser] = useState(null);
  const [kurumlar, setKurumlar] = useState([]);
  const [selectedKurum, setSelectedKurum] = useState(null);
  const [unvanlar, setUnvanlar] = useState([]);
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");
  const navigate = useNavigate();
  const location = useLocation();
  const [showKurumChangeModal, setShowKurumChangeModal] = useState(false);
  const [selectedNewKurum, setSelectedNewKurum] = useState(null);

  function changeKurum(kurum) {
    setSelectedNewKurum(kurum);
    setShowKurumChangeModal(true);
  }

  function handleKurumChangeConfirm() {
    setSelectedKurum(selectedNewKurum);
    localStorage.setItem("selectedKurum", JSON.stringify(selectedNewKurum));
    setShowKurumChangeModal(false);
    alertify.success("Kurum değiştirildi.");
    navigate("/komisyon-portal/ana-sayfa");
  }

  function changePage(rank) {
    window.scrollTo(0, 0);

    setSelectedBirimID(null);

    if (rank === 11 || rank === 3) {
      return;
    }
    setTableResults([]);
    setTableType(null);
  }

  useState(() => {
    if (user === null) {
      getUser();
    }
    if (kurumlar.length === 0) {
      getKurum();
    }
    if (unvanlar.length === 0) {
      getUnvanlar();
    }
  }, []);

  useEffect(() => {
    // Sayfa yüklendiğinde local storage'dan kurum bilgisini al
    const savedKurum = localStorage.getItem("selectedKurum");
    if (savedKurum && !selectedKurum) {
      setSelectedKurum(JSON.parse(savedKurum));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {}, [tableResults]);

  function getKurum() {
    axios(GET_institutions)
      .then((result) => {
        // sort result.data.InstitutionList by id
        result.data.InstitutionList.sort((a, b) => a.id - b.id);
        setKurumlar(result.data.InstitutionList);
        // Local storage'dan kayıtlı kurum bilgisini al
        const savedKurum = localStorage.getItem("selectedKurum");
        if (savedKurum) {
          setSelectedKurum(JSON.parse(savedKurum));
        } else {
          // Eğer local storage'da kurum yoksa default kurumu seç ve kaydet
          const defaultKurum = result.data.InstitutionList.find(
            (kurum) => kurum.isDefault
          );
          setSelectedKurum(defaultKurum);
          localStorage.setItem("selectedKurum", JSON.stringify(defaultKurum));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getUnvanlar() {
    setUnvanlar([]);
    axios(GET_titles(token))
      .then((result) => {
        let unvanlar = result.data.titleList;
        unvanlar.sort((a, b) => a.oncelikSirasi - b.oncelikSirasi);
        setUnvanlar(unvanlar);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getUser() {
    axios(GET_USER_DETAILS(token))
      .then((result) => {
        setUser(result.data.user);
      })
      .catch((error) => {
        // delete cookie if user not found
        cookies.remove("TOKEN");
        window.location.href = "/login";
      });
  }

  const listGroupStyle = {
    cursor: "pointer",
  };

  const centerImage = {
    display: "flex",
    justifyContent: "center",

    //clickable cursor
    cursor: "pointer",
  };

  const showPersonelDetay = (person, result = null, tableType = null) => {
    if (person && person.sicil) {
      if (result) {
        setTableResults(result);
        setTableType(tableType);
      }
      navigate(`personel-detay/${person.sicil}`);
    }
  };

  const showBirimPersonelListe = (birim) => {
    changePage(2);
    setSelectedBirimID(birim._id);
  };

  function logout() {
    localStorage.removeItem("selectedKurum"); // Çıkış yaparken kurum bilgisini temizle
    cookies.remove("TOKEN");
    window.location.href = "/login";
  }

  function handleHome() {
    window.location.href = "/";
  }

  // Link'in active olup olmadığını kontrol eden yardımcı fonksiyon
  const isActivePath = (path) => {
    const currentPath = location.pathname.split("/").pop(); // URL'in son kısmını al
    const itemPath = path || "";
    return currentPath === itemPath.toLowerCase().replace(/\s+/g, "-");
  };

  const listGroupItems = [
    { id: 0, label: "Ana Sayfa", type: "item", path: "ana-sayfa" },
    { id: 8, label: "Hesap Ayarları", type: "item", path: "hesap-ayarlari" },
    {
      id: 13,
      label: "Portal Kullanıcı Yönetim",
      type: "item",
      visibleRoles: ["admin"],
      path: "portal-kullanici-yonetim",
    },
    { id: 1001, label: "Eskişehir Personel Sistemi", type: "heading" },
    {
      id: 1004,
      label: "",
      type: "heading",
      detail: selectedKurum ? selectedKurum.name : "",
    },
    { id: 5, label: "Kurum", type: "item", path: "kurum" },
    {
      id: 4,
      label: "Ünvanlar",
      type: "item",
      hiddenRoles: ["komisyonbaskan"],
      path: "unvanlar",
    },
    { id: 1, label: "Birimler", type: "item", path: "birimler" },
    {
      id: 9,
      label: "Tüm Personel Listesi",
      type: "item",
      path: "tum-personel-listesi",
    },
    {
      id: 2,
      label: "Birim Personel Listele",
      type: "item",
      path: "birim-personel-listele",
    },
    { id: 3, label: "Personel Detay", type: "item", path: "personel-detay" },
    { id: 1002, label: "Raporlar", type: "heading" },
    {
      id: 6,
      label: "İzinde Olan Personel",
      type: "item",
      path: "izinde-olan-personel",
    },
    {
      id: 7,
      label: "Eksik Katibi Olan Birimler",
      type: "item",
      path: "eksik-katibi-olan-birimler",
    },
    { id: 10, label: "Personel Sayısı", type: "item", path: "personel-sayisi" },
    {
      id: 11,
      label: "Personel Tablosu",
      type: "item",
      path: "personel-tablosu",
    },
    { id: 14, label: "Devren Gidenler", type: "item", path: "devren-gidenler" },
    { id: 16, label: "Geçici Personel", type: "item", path: "gecici-personel" },
    {
      id: 18,
      label: "Uzaklaştırılmış Personel",
      type: "item",
      path: "uzaklastirilmis-personel",
    },
    {
      id: 19,
      label: "Şehit/Gazi Yakını Personel",
      type: "item",
      path: "sehit-gazi-yakini-personel",
    },
    {
      id: 20,
      label: "Engelli Personel",
      type: "item",
      path: "engelli-personel",
    },
    {
      id: 17,
      label: "Personel Hareketleri",
      type: "item",
      path: "personel-hareketleri",
    },
    {
      id: 1003,
      label: "Aktarım",
      type: "heading",
      visibleRoles: ["admin"],
      path: "aktarim",
    },
    {
      id: 12,
      label: "Personel Aktar",
      type: "item",
      visibleRoles: ["admin"],
      path: "personel-aktar",
    },
    {
      id: 15,
      label: "Özellik Aktar",
      type: "item",
      visibleRoles: ["admin"],
      path: "ozellik-aktar",
    },
  ];

  const imgStyle = {
    cursor: "pointer",
    width: "22px",
    height: "22px",
    float: "right",
    marginLeft: "10px",
    justifyContent: "center",
    alignItems: "center",
  };

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toolTipToogle = () => setTooltipOpen(!tooltipOpen);

  return (
    <>
      <Container className="mt-5" fluid>
        <Row>
          <Col xs="12" lg="2">
            <div
              style={centerImage}
              onClick={(e) => handleHome()}
              onMouseOver={(e) =>
                (e.currentTarget.querySelector("img").style.transform =
                  "rotateY(360deg)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.querySelector("img").style.transform =
                  "rotateY(0deg)")
              }
            >
              <img
                id="logo"
                src={logo}
                style={{
                  width: "150px",
                  transition: "transform 0.5s ease-in-out",
                }}
                alt="logo"
              />
            </div>

            <div className="mt-2">
              {user && (
                <div>
                  <Alert className="bg-danger text-white">
                    Hoşgeldin <b>{user.name}</b>{" "}
                    <img
                      id="logout"
                      src={logoutSvg}
                      style={imgStyle}
                      alt="logout"
                      onClick={() => {
                        logout();
                      }}
                    />
                    <Tooltip
                      placement="right"
                      isOpen={tooltipOpen}
                      target="logout"
                      toggle={toolTipToogle}
                    >
                      Çıkış Yap
                    </Tooltip>
                  </Alert>
                </div>
              )}
            </div>

            <ListGroup className="mt-2" style={listGroupStyle}>
              {listGroupItems.map((item) => {
                const isVisibleForRole =
                  (!item.visibleRoles ||
                    item.visibleRoles.length === 0 ||
                    (user && item.visibleRoles.includes(user.role))) &&
                  (!item.hiddenRoles ||
                    item.hiddenRoles.length === 0 ||
                    (user && !item.hiddenRoles.includes(user.role)));

                if (item.type === "heading") {
                  return (
                    <ListGroupItemHeading
                      key={item.id}
                      hidden={!isVisibleForRole}
                      className="mt-3 text-center font-weight-bold"
                    >
                      {item.label}{" "}
                      {item.detail && (
                        <Badge color="danger">{item.detail}</Badge>
                      )}
                    </ListGroupItemHeading>
                  );
                } else {
                  const path =
                    item.path || item.label.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <Link
                      to={path}
                      key={item.id}
                      style={{ textDecoration: "none" }}
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      <ListGroupItem
                        active={isActivePath(
                          item.path ||
                            item.label.toLowerCase().replace(/\s+/g, "-")
                        )}
                        hidden={!isVisibleForRole}
                        className={
                          isActivePath(item.path || item.label)
                            ? "bg-danger text-white"
                            : ""
                        }
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#f8d7da";
                          // text bold
                          e.target.style.fontWeight = "bold";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "";
                          // text normal
                          e.target.style.fontWeight = "normal";
                        }}
                      >
                        {item.label}
                      </ListGroupItem>
                    </Link>
                  );
                }
              })}
            </ListGroup>
          </Col>
          <Col xs="12" lg="9">
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
                element={
                  <Birimler selectedKurum={selectedKurum} token={token} />
                }
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
                path="personel-detay"
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
              {/* Diğer componentler için route'lar */}
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
                  <UnitMissingClerk
                    token={token}
                    selectedKurum={selectedKurum}
                  />
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
                path="portal-kullanici-yonetim"
                element={
                  <KomisyonPortalKullaniciYonetim user={user} token={token} />
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
          </Col>
        </Row>
      </Container>

      <Modal
        isOpen={showKurumChangeModal}
        toggle={() => setShowKurumChangeModal(false)}
        centered
      >
        <ModalHeader toggle={() => setShowKurumChangeModal(false)}>
          Kurum Değiştirme
        </ModalHeader>
        <ModalBody>
          <p>Kurumu değiştirmek istediğinize emin misiniz?</p>
          <p>
            <strong>Seçilen Kurum:</strong> {selectedNewKurum?.name}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleKurumChangeConfirm}>
            Evet
          </Button>
          <Button
            color="secondary"
            onClick={() => setShowKurumChangeModal(false)}
          >
            Hayır
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
