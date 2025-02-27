import React, { useState } from "react";
import {
  Container,
  Card,
  CardGroup,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
} from "reactstrap";
import { GET_USER_DETAILS } from "../constants/AxiosConfiguration";
import Cookies from "universal-cookie";
import axios from "axios";
import guide_red from "../../assets/guide-red.svg";
import courthouse_red from "../../assets/courthouse-red.svg";
import email_red from "../../assets/email-red.svg";
import admin_user from "../../assets/admin-user.svg";
// import humanresources_red from "../../assets/humanresources-red.svg";
import epsisLogo from "../../assets/epsis-logo.png";
import AYSNavbar from "./AYSNavbar";

export default function Home() {
  const [user, setUser] = useState(null);
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  function getUser() {
    axios(GET_USER_DETAILS(token))
      .then((result) => {
        setUser(result.data.user);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  useState(() => {
    if (user === null) {
      getUser();
    }
  }, []);

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

  const cardImgStyle = {
    width: "100%",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: "8px",
  };

  const cardStyle = {
    cursor: "pointer",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const cardHoverStyle = {
    transform: "scale(1.05)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const listGroupItems = [
    // hiddenRoles, visibleRoles
    {
      id: 1,
      label: "EPSİS",
      detail:
        "Eskişehir Personel Sistemi ile adliye personellerinin bilgilerini görüntüleyebilirsiniz.",
      type: "item",
      visibleRoles: ["komisyonbaskan", "komisyonuye", "komisyonkatip", "admin"],
      image: epsisLogo,
      onClick: handleKomisyonPortal,
      visible: true,
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
    },
    {
      id: 3,
      label: "Eskişehir Adliyesi",
      detail: "Eskişehir Adliyesi resmi web sayfasına gitmek için tıklayınız.",
      type: "item",
      image: courthouse_red,
      onClick: handleEskisehirAdliyesiWebPage,
      visible: true,
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
    },
    {
      id: 5,
      label: "SEGBİS Rehber",
      detail: "SEGBİS rehberine ulaşmak için tıklayınız.",
      type: "item",
      onClick: handleSegbisRehber,
      image: guide_red,
      visible: true,
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
    },
  ];

  return (
    <div>
      <AYSNavbar />

      <Container>
        <div className="mt-5">
          <h5 className="text-center">
            Hoşgeldiniz, yetkiniz olan uygulamalara erişmek için giriş yapmanız
            gerekmektedir.
          </h5>
          <CardGroup>
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

              return (
                <Card
                  key={index}
                  className="m-3"
                  style={{
                    ...cardStyle,
                    ...(isHovered ? cardHoverStyle : {}),
                  }}
                  onClick={() => item.onClick()}
                  hidden={!isVisibleForRole}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <CardImg
                    alt="Komisyon Portal Logo"
                    src={item.image}
                    top
                    style={cardImgStyle}
                  />
                  <CardBody>
                    <CardTitle tag="h5" className="text-center">
                      {item.label}
                    </CardTitle>
                    <CardText className="text-center">{item.detail}</CardText>
                  </CardBody>
                </Card>
              );
            })}
          </CardGroup>
        </div>
      </Container>
    </div>
  );
}
