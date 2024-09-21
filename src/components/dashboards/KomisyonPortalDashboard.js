import React, { useState } from "react";
import {
  Alert,
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  Button,
} from "reactstrap";

import logo from "../../assets/logo300.png";

import KomisyonPortalWelcome from "../komisyon-portal-features/KomisyonPortalWelcome";
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
import KomisyonPortalKullaniciYonetim from "../komisyon-portal-features/KomisyonPortalKullaniciYonetim";
import PasifPersonel from "../komisyon-portal-features/Reports/PasifPersonel";

import {
  GET_institutions,
  GET_titles,
  GET_USER_DETAILS,
} from "../constants/AxiosConfiguration";
import Cookies from "universal-cookie";
import axios from "axios";

export default function KomisyonPortalDashboard() {
  const [selectedPersonelID, setSelectedPersonelID] = useState(null);

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

  function onClick_listGroupItem(rank) {
    changePage(rank);
  }

  function renderScreen() {
    switch (selected) {
      default:
        return <KomisyonPortalWelcome user={user} token={token} />;
      case 1:
        return <Birimler selectedKurum={selectedKurum} token={token} />;
      case 2:
        return (
          <PersonelListeByBirim
            selectedKurum={selectedKurum}
            unvanlar={unvanlar}
            token={token}
            showPersonelDetay={showPersonelDetay}
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
            selectedKurum={selectedKurum}
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
                <Alert color="primary">
                  Hoşgeldin {user.name}{" "}
                  <Button size="sm" color="danger" onClick={() => logout()}>
                    Çıkış Yap
                  </Button>{" "}
                </Alert>
              </div>
            )}
          </div>

          <ListGroup className="mt-2" style={listGroupStyle}>
            <ListGroupItem
              key={0}
              onClick={() => onClick_listGroupItem(0)}
              active={selected === 0}
            >
              Ana Sayfa
            </ListGroupItem>

            <ListGroupItem
              key={8}
              onClick={() => onClick_listGroupItem(8)}
              active={selected === 8}
            >
              Hesap Ayarları
            </ListGroupItem>

            <ListGroupItem
              key={13}
              onClick={() => onClick_listGroupItem(13)}
              active={selected === 13}
              hidden={user && user.role !== "admin"}
            >
              Portal Kullanıcı Yönetim
            </ListGroupItem>

            <ListGroupItemHeading className="mt-3 text-center">
              Adliye Yönetim Sistemi <br />
            </ListGroupItemHeading>

            <ListGroupItemHeading className=" small mb-3 text-center">
              Seçili Kurum: <br />
              {selectedKurum && selectedKurum.name}
            </ListGroupItemHeading>

            <ListGroupItem
              key={5}
              onClick={() => onClick_listGroupItem(5)}
              active={selected === 5}
            >
              Kurum
            </ListGroupItem>

            <ListGroupItem
              key={4}
              onClick={() => onClick_listGroupItem(4)}
              active={selected === 4}
            >
              Ünvanlar
            </ListGroupItem>

            <ListGroupItem
              key={1}
              onClick={() => onClick_listGroupItem(1)}
              active={selected === 1}
            >
              Birimler
            </ListGroupItem>
            <ListGroupItem
              key={9}
              onClick={() => onClick_listGroupItem(9)}
              active={selected === 9}
            >
              Tüm Personel Listesi
            </ListGroupItem>

            <ListGroupItem
              key={2}
              onClick={() => onClick_listGroupItem(2)}
              active={selected === 2}
            >
              Birim Personel Listele
            </ListGroupItem>

            <ListGroupItem
              key={3}
              onClick={() => onClick_listGroupItem(3)}
              active={selected === 3}
            >
              Personel Detay
            </ListGroupItem>

            <ListGroupItemHeading className="mt-3 mb-3 text-center">
              Raporlar
            </ListGroupItemHeading>

            <ListGroupItem
              key={6}
              onClick={() => onClick_listGroupItem(6)}
              active={selected === 6}
            >
              İzinde Olan Personel
            </ListGroupItem>

            <ListGroupItem
              key={7}
              onClick={() => onClick_listGroupItem(7)}
              active={selected === 7}
            >
              Eksik Katibi Olan Birimler
            </ListGroupItem>

            <ListGroupItem
              key={10}
              onClick={() => onClick_listGroupItem(10)}
              active={selected === 10}
            >
              Personel Sayısı
            </ListGroupItem>

            <ListGroupItem
              key={11}
              onClick={() => onClick_listGroupItem(11)}
              active={selected === 11}
            >
              Personel Tablosu
            </ListGroupItem>

            <ListGroupItem
              key={14}
              onClick={() => onClick_listGroupItem(14)}
              active={selected === 14}
            >
              Pasif Personel
            </ListGroupItem>

            <ListGroupItemHeading className="mt-3 mb-3 text-center">
              Aktarım
            </ListGroupItemHeading>

            <ListGroupItem
              key={12}
              onClick={() => onClick_listGroupItem(12)}
              active={selected === 12}
            >
              Personel Aktar
            </ListGroupItem>
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
