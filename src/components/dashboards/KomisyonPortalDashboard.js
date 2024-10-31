import React, { useState } from "react";
import {
  Alert,
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
} from "reactstrap";

import logo from "../../assets/logo300.png";

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
import Cookies from "universal-cookie";
import axios from "axios";

import logoutSvg from "../../assets/logout.svg";

import {
  GET_institutions,
  GET_titles,
  GET_USER_DETAILS,
} from "../constants/AxiosConfiguration";

export default function KomisyonPortalDashboard() {
  const [selectedPersonelID, setSelectedPersonelID] = useState(null); // personel detay ekranında seçili personelin sicil numarası
  const [selectedBirimID, setSelectedBirimID] = useState(null); // personel detay ekranında seçili personelin sicil numarası

  const [selected, setSelected] = useState(0);
  const [user, setUser] = useState(null);
  const [kurumlar, setKurumlar] = useState([]);
  const [selectedKurum, setSelectedKurum] = useState(null);
  const [unvanlar, setUnvanlar] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  function changePage(rank) {
    setSelectedPersonelID(null);
    setSelectedBirimID(null);
    setSelected(rank);
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

  function getKurum() {
    axios(GET_institutions)
      .then((result) => {
        // sort result.data.InstitutionList by id
        result.data.InstitutionList.sort((a, b) => a.id - b.id);
        setKurumlar(result.data.InstitutionList);
        // eğer seçili kurum yoksa liste içerisinde isDefault olanı seç
        if (!selectedKurum) {
          const defaultKurum = result.data.InstitutionList.find(
            (kurum) => kurum.isDefault
          );
          setSelectedKurum(defaultKurum);
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
        setError(false);
        setErrorMessage("");
      })
      .catch((error) => {
        // delete cookie if user not found
        cookies.remove("TOKEN");
        window.location.href = "/login";
        const message = error.response.data.message || "Hata!";
        setError(true);
        setErrorMessage(message);
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

  const showPersonelDetay = (person) => {
    changePage(3);
    setSelectedPersonelID(person.sicil);
  };

  const showBirimPersonelListe = (birim) => {
    changePage(2);
    setSelectedBirimID(birim._id);
  };

  function onClick_listGroupItem(rank) {
    window.scrollTo(0, 0);
    changePage(rank);
  }

  function renderScreen() {
    switch (selected) {
      default:
        return (
          <KomisyonPortalWelcome
            user={user}
            token={token}
            showPersonelDetay={showPersonelDetay}
            showBirimPersonelListe={showBirimPersonelListe}
            selectedKurum={selectedKurum}
          />
        );
      case 1:
        return <Birimler selectedKurum={selectedKurum} token={token} />;
      case 2:
        return (
          <PersonelListeByBirim
            selectedKurum={selectedKurum}
            unvanlar={unvanlar}
            token={token}
            showPersonelDetay={showPersonelDetay}
            selectedBirimID={selectedBirimID}
          />
        );
      case 4:
        return (
          <Unvanlar
            unvanlar={unvanlar}
            updateUnvanlar={getUnvanlar}
            token={token}
          />
        );
      case 3:
        return (
          <PersonelDetay
            kurumlar={kurumlar}
            selectedPersonelID={selectedPersonelID}
            selectedKurum={selectedKurum}
            token={token}
            unvanlar={unvanlar}
          />
        );
      case 5:
        return (
          <Kurum
            kurumlar={kurumlar}
            selectedKurum={selectedKurum}
            setSelectedKurum={setSelectedKurum}
          />
        );
      case 6:
        return (
          <PersonelOnLeave
            selectedKurum={selectedKurum}
            token={token}
            showPersonelDetay={showPersonelDetay}
          />
        );
      case 7:
        return <UnitMissingClerk token={token} selectedKurum={selectedKurum} />;
      case 8:
        return (
          <KullaniciAyarlari user={user} token={token} getUser={getUser} />
        );
      case 9:
        return (
          <TumPersonelListe
            selectedKurum={selectedKurum}
            token={token}
            showPersonelDetay={showPersonelDetay}
            unvanlar={unvanlar}
          />
        );
      case 10:
        return (
          <PersonelSayi
            selectedKurum={selectedKurum}
            unvanlar={unvanlar}
            token={token}
          />
        );
      case 11:
        return (
          <TumPersonelTablo
            selectedKurum={selectedKurum}
            token={token}
            showPersonelDetay={showPersonelDetay}
          />
        );
      case 12:
        return (
          <PersonelAktar
            selectedKurum={selectedKurum}
            token={token}
            unvanlar={unvanlar}
          />
        );

      case 13:
        return <KomisyonPortalKullaniciYonetim user={user} token={token} />;

      case 14:
        return (
          <PasifPersonel
            // selectedKurum={selectedKurum}
            token={token}
            showPersonelDetay={showPersonelDetay}
          />
        );

      case 15:
        return <OzellikAktar selectedKurum={selectedKurum} token={token} />;

      case 16:
        return (
          <GeciciPersonel
            // selectedKurum={selectedKurum}
            token={token}
            showPersonelDetay={showPersonelDetay}
          />
        );

      case 17:
        return (
          <PersonelHareketleri
            // selectedKurum={selectedKurum}
            token={token}
            showPersonelDetay={showPersonelDetay}
            user={user}
            showBirimPersonelListe={showBirimPersonelListe}
            selectedKurum={selectedKurum}
          />
        );

      case 18:
        return (
          <UzaklastirilmisPersonel
            // selectedKurum={selectedKurum}
            token={token}
            showPersonelDetay={showPersonelDetay}
          />
        );
    }
  }

  function logout() {
    cookies.remove("TOKEN");
    window.location.href = "/login";
  }

  function handleHome() {
    window.location.href = "/";
  }

  const listGroupItems = [
    { id: 0, label: "Ana Sayfa", type: "item" },
    { id: 8, label: "Hesap Ayarları", type: "item" },
    {
      id: 13,
      label: "Portal Kullanıcı Yönetim",
      type: "item",
      visibleRoles: ["admin"],
    },
    { id: 1001, label: "Adliye Yönetim Sistemi", type: "heading" },
    { id: 5, label: "Kurum", type: "item" },
    { id: 4, label: "Ünvanlar", type: "item", hiddenRoles: ["komisyonbaskan"] },
    { id: 1, label: "Birimler", type: "item" },
    { id: 9, label: "Tüm Personel Listesi", type: "item" },
    { id: 2, label: "Birim Personel Listele", type: "item" },
    { id: 3, label: "Personel Detay", type: "item" },
    { id: 1002, label: "Raporlar", type: "heading" },
    { id: 6, label: "İzinde Olan Personel", type: "item" },
    { id: 7, label: "Eksik Katibi Olan Birimler", type: "item" },
    { id: 10, label: "Personel Sayısı", type: "item" },
    { id: 11, label: "Personel Tablosu", type: "item" },
    { id: 14, label: "Devren Gidenler", type: "item" },
    { id: 16, label: "Geçici Personel", type: "item" },
    { id: 18, label: "Uzaklaştırılmış Personel", type: "item" },
    { id: 17, label: "Personel Hareketleri", type: "item" },
    { id: 1003, label: "Aktarım", type: "heading", visibleRoles: ["admin"] },
    { id: 12, label: "Personel Aktar", type: "item", visibleRoles: ["admin"] },
    { id: 15, label: "Özellik Aktar", type: "item", visibleRoles: ["admin"] },
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

  return (
    <Container className="mt-5" fluid>
      <Row>
        <Col xs="12" lg="2">
          <div style={centerImage} onClick={(e) => handleHome()}>
            <img src={logo} style={{ width: "150px" }} alt="logo" />
          </div>
          <div className="mt-2">
            {user && (
              <div>
                <Alert className="bg-danger text-white">
                  Hoşgeldin{" "}
                  <b>
                    {user.name}
                  </b>{" "}
                  <img
                    src={logoutSvg}
                    style={imgStyle}
                    alt="logout"
                    onClick={() => {
                      logout();
                    }}
                  />
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
                    {item.label}
                  </ListGroupItemHeading>
                );
              } else {
                return (
                  <ListGroupItem
                    key={item.id}
                    onClick={() => onClick_listGroupItem(item.id)}
                    active={selected === item.id}
                    hidden={!isVisibleForRole}
                    className={
                      selected === item.id ? "bg-danger text-white" : ""
                    }
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f8d7da";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "";
                    }}
                  >
                    {item.label}
                  </ListGroupItem>
                );
              }
            })}
          </ListGroup>
        </Col>
        <Col xs="12" lg="9">
          {error && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}
          {renderScreen()}
        </Col>
      </Row>
    </Container>
  );
}
