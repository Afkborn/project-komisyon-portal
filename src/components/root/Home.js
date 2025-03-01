import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardImg,
  CardBody,
  CardText,
  Row,
  Col,
  Badge,
  Button,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption,
} from "reactstrap";
import { GET_USER_DETAILS } from "../constants/AxiosConfiguration";
import Cookies from "universal-cookie";
import axios from "axios";
import guide_red from "../../assets/guide-red.svg";
import courthouse_red from "../../assets/courthouse-red.svg";
import email_red from "../../assets/email-red.svg";
import admin_user from "../../assets/admin-user.svg";
import epsisLogo from "../../assets/epsis-logo.png";
import AYSNavbar from "./AYSNavbar";
import "../../styles/Home.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  // Bültenler ve haberler için state
  const [bulletins, setBulletins] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Örnek bültenler (API'den gelecek)
  const dummyBulletins = [
    {
      id: 1,
      title: "Adliye Haftalık Bülten - 15 Mayıs 2023",
      // image: "https://via.placeholder.com/800x400?text=Eskişehir+Adliyesi+Bülteni",
      shortDescription: "Bu haftaki adliye etkinlikleri ve duyuruları",
      date: "15 Mayıs 2023",
      link: "#",
    },
    {
      id: 2,
      title: "Yeni Görevlendirme Duyurusu - 8 Mayıs 2023",
      // image: "#",
      shortDescription: "Önemli görevlendirmeler ve personel değişiklikleri",
      date: "8 Mayıs 2023",
      link: "#",
    },
    {
      id: 3,
      title: "Adalet Bakanlığı Genelgesi - 1 Mayıs 2023",
      // image: "#",
      shortDescription: "Yeni genelge ve uygulamalar hakkında bilgilendirme",
      date: "1 Mayıs 2023",
      link: "#",
    },
  ];

  useEffect(() => {
    if (user === null) {
      getUser();
    }

    // API'den bülten verilerini çek
    // Şimdilik dummy veri kullanıyoruz

    setBulletins(dummyBulletins);
    // eslint-disable-next-line
  }, []);

  function getUser() {
    axios(GET_USER_DETAILS(token))
      .then((result) => {
        setUser(result.data.user);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  // Carousel fonksiyonları
  const next = () => {
    if (animating) return;
    const nextIndex =
      activeIndex === bulletins.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex =
      activeIndex === 0 ? bulletins.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  // Uygulama yönlendirme fonksiyonları
  function handleKomisyonPortal() {
    window.location.href = "/komisyon-portal/ana-sayfa";
  }

  function handleSantralPortal() {
    window.location.href = "/santral-portal";
  }

  function handleSegbisRehber() {
    window.location.href = "/segbis-rehber";
  }

  function handleEskisehirAdliyesiWebPage() {
    window.open("https://eskisehir.adalet.gov.tr/", "_blank");
  }

  function handleUyapMail() {
    window.open("https://eposta.uyap.gov.tr/", "_blank");
  }

  function handleAysKullaniciYonetimSistemi() {
    window.location.href = "/ays-kys";
  }

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const listGroupItems = [
    {
      id: 1,
      label: "EPSİS",
      detail:
        "Eskişehir Personel Sistemi ile adliye personellerinin bilgilerini görüntüleyebilirsiniz.",
      type: "item",
      visibleRoles: [
        "komisyonbaskan",
        "komisyonuye",
        "komisyonkatip",
        "komisyonmudur",
        "admin",
      ],
      image: epsisLogo,
      onClick: handleKomisyonPortal,
      visible: true,
      color: "danger",
    },
    {
      id: 2,
      label: "Santral Portal",
      detail:
        "Santral portalı ile adliyede çalışan personellerin dahili numaralarını ve bilgilerini görüntüleyebilirsiniz.",
      type: "item",
      image: guide_red,
      onClick: handleSantralPortal,
      visible: false,
      color: "primary",
    },
    {
      id: 3,
      label: "Eskişehir Adliyesi",
      detail: "Eskişehir Adliyesi resmi web sayfasına gitmek için tıklayınız.",
      type: "item",
      image: courthouse_red,
      onClick: handleEskisehirAdliyesiWebPage,
      visible: true,
      color: "success",
    },
    {
      id: 4,
      label: "UYAP Mail",
      detail:
        "UYAP Mail hizmeti ile adliye personelleri arasında güvenli bir şekilde mail gönderip alabilirsiniz.",
      type: "item",
      image: email_red,
      onClick: handleUyapMail,
      visible: true,
      color: "warning",
    },
    {
      id: 5,
      label: "SEGBİS Rehber",
      detail: "SEGBİS rehberine ulaşmak için tıklayınız.",
      type: "item",
      onClick: handleSegbisRehber,
      image: guide_red,
      visible: true,
      color: "info",
    },
    {
      id: 6,
      label: "AYS Kullanıcı Yönetim Sistemi",
      detail:
        "Adliye Yönetim Sistemi kullanıcı yönetim paneline gitmek için tıklayınız.",
      type: "item",
      visibleRoles: ["admin"],
      image: admin_user,
      onClick: handleAysKullaniciYonetimSistemi,
      visible: true,
      color: "dark",
    },
  ];

  // Login fonksiyonu (eksik olan)
  function handleLogin() {
    window.location.href = "/login";
  }

  // Carousel öğeleri oluşturma fonksiyonu - güncellenmiş
  const renderSlides = () => {
    return bulletins.map((bulletin) => {
      return (
        <CarouselItem
          onExiting={() => setAnimating(true)}
          onExited={() => setAnimating(false)}
          key={bulletin.id}
          className="bulletin-carousel-item"
        >
          <div className="carousel-image-container">
            <img
              src={bulletin.image}
              alt={bulletin.title}
              className="carousel-image"
              onError={(e) => {
                // Resim yüklenemezse varsayılan resim kullan
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/800x400?text=Eskişehir+Adliyesi+Bülteni";
              }}
            />
          </div>
          <CarouselCaption
            captionHeader={bulletin.title}
            captionText={
              <>
                <p className="carousel-date">{bulletin.date}</p>
                <p>{bulletin.shortDescription}</p>
                <Button
                  color="light"
                  outline
                  size="sm"
                  className="mt-2"
                  href={bulletin.link}
                >
                  Detaylar <i className="fas fa-arrow-right ms-1"></i>
                </Button>
              </>
            }
          />
        </CarouselItem>
      );
    });
  };

  return (
    <div className="home-page">
      <AYSNavbar />

      <div className="hero-section">
        <Container>
          <div className="text-center py-5">
            <h1 className="display-4 hero-title">
              Eskişehir Adliyesi Yönetim Sistemi
            </h1>
            <p className="lead hero-subtitle">
              Adliye personelleri için tüm hizmetlere tek noktadan erişim
            </p>
            {!user && (
              <Button
                color="danger"
                size="lg"
                className="mt-3 hero-button"
                onClick={handleLogin}
              >
                <i className="fas fa-sign-in-alt mr-2"></i> Giriş Yapın
              </Button>
            )}
          </div>
        </Container>
      </div>

      <Container className="main-content py-5">
        <Row className="mb-4">
          <Col>
            <div className="section-header">
              <h3 className="section-title">
                <i className="fas fa-th-large me-2"></i>
                Uygulamalar
              </h3>
              <p className="section-description">
                Adliye personeli olarak erişebileceğiniz uygulamalar aşağıda
                listelenmiştir
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Sol taraftaki uygulamalar bölümü */}
          <Col lg="8">
            <div className="app-cards">
              <Row>
                {listGroupItems.map((item, index) => {
                  const isVisibleForRole =
                    (!item.visibleRoles ||
                      item.visibleRoles.length === 0 ||
                      (user &&
                        user.roles.some((role) =>
                          item.visibleRoles.includes(role)
                        ))) &&
                    (!item.hiddenRoles ||
                      item.hiddenRoles.length === 0 ||
                      (user &&
                        !user.roles.some((role) =>
                          item.hiddenRoles.includes(role)
                        ))) &&
                    item.visible;

                  const isHovered = hoveredIndex === index;

                  if (!isVisibleForRole) return null;

                  return (
                    <Col key={index} md="6" lg="4" className="mb-4">
                      <Card
                        className={`app-card ${isHovered ? "hover" : ""}`}
                        onClick={() => item.onClick()}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className={`app-card-header bg-${item.color}`}>
                          <CardImg
                            alt={`${item.label} Logo`}
                            src={item.image}
                            className="app-card-image"
                          />
                        </div>
                        <CardBody>
                          <Badge color={item.color} pill className="mb-2">
                            {item.label}
                          </Badge>
                          <CardText>{item.detail}</CardText>
                          <div className="app-card-action">
                            <i className="fas fa-arrow-right"></i>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Col>

          {/* Sağ taraftaki bölüm */}
          <Col lg="4">
            <div className="side-content">
              <div className="bulletin-section">
                <h3 className="section-title">
                  <i className="fas fa-newspaper me-2"></i>
                  Haftalık Bülten
                </h3>
                <Card className="bulletin-card mb-4">
                  <CardBody>
                    {bulletins.length > 0 ? (
                      <div className="bulletin-carousel-wrapper">
                        <Carousel
                          activeIndex={activeIndex}
                          next={next}
                          previous={previous}
                          interval={8000}
                          className="bulletin-carousel"
                          dark={false}
                          ride="carousel"
                          slide
                        >
                          <CarouselIndicators
                            items={bulletins}
                            activeIndex={activeIndex}
                            onClickHandler={goToIndex}
                            className="carousel-indicators"
                          />
                          {renderSlides()}
                          <CarouselControl
                            direction="prev"
                            directionText="Önceki"
                            onClickHandler={previous}
                          />
                          <CarouselControl
                            direction="next"
                            directionText="Sonraki"
                            onClickHandler={next}
                          />
                        </Carousel>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="fas fa-inbox fa-3x mb-3 text-muted"></i>
                        <p>Henüz bülten bulunmamaktadır.</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>

              <div className="quick-info-section">
                <h3 className="section-title">
                  <i className="fas fa-info-circle me-2"></i>
                  Hızlı Bilgiler
                </h3>
                <Card className="quick-info-card shadow-sm">
                  <CardBody>
                    <div className="quick-info-item">
                      <div className="quick-info-icon bg-danger">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                      <div className="quick-info-content">
                        <h5>Çalışma Saatleri</h5>
                        <p>Pazartesi-Cuma: 08:30-17:30</p>
                      </div>
                    </div>

                    <div className="quick-info-item">
                      <div className="quick-info-icon bg-primary">
                        <i className="fas fa-phone"></i>
                      </div>
                      <div className="quick-info-content">
                        <h5>Santral</h5>
                        <p>0222 123 45 67</p>
                      </div>
                    </div>

                    <div className="quick-info-item">
                      <div className="quick-info-icon bg-success">
                        <i className="fas fa-envelope"></i>
                      </div>
                      <div className="quick-info-content">
                        <h5>E-posta</h5>
                        <p>iletisim@eskisehiradliyesi.gov.tr</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <footer className="footer">
        <Container>
          <div className="text-center py-4">
            <p className="mb-1">
              © 2023 Eskişehir Adliyesi - Tüm hakları saklıdır
            </p>
            <p className="developer-info mb-0">Developed by Bilgehan Kalay</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
