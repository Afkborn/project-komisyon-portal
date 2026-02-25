import guide_red from "../../assets/guide-red.svg";
import courthouse_red from "../../assets/courthouse-red.svg";
import email_red from "../../assets/email-red.svg";
import admin_user from "../../assets/admin-user.svg";
import epsisLogo from "../../assets/epsis-logo.png";
import eskBaro from "../../assets/esk-baro.png";

// Handler fonksiyonları
export const applicationHandlers = {
  handleKomisyonPortal: () => {
    window.location.href = "/komisyon-portal/ana-sayfa";
  },
  handleSegbisRehber: () => {
    window.location.href = "/segbis-rehber";
  },
  handleBiNot: () => {
    window.location.href = "/binot";
  },
  handleAysKys: () => {
    window.location.href = "/ays-kys";
  },
  handleEskisehirAdliyesiWeb: () => {
    window.open("https://eskisehir.adalet.gov.tr/", "_blank");
  },
  handleUyapMail: () => {
    window.open("https://eposta.uyap.gov.tr/", "_blank");
  },
  handleBaroLevha: () => {
    window.location.href = "/eskisehir-baro-levha";
  },
  handleSantralPortal: () => {
    window.location.href = "/santral-portal";
  },
  handleBulletin: () => {
    window.location.href = "/bulten";
  },
  handleHesapAyarları: () => {
    window.location.href = "/hesap-ayarları";
  },
};

// Uygulama konfigürasyonu
export const HOME_APPLICATIONS = [
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
    actionKey: "handleKomisyonPortal",
    visible: true,
    color: "danger",
  },
  {
    id: 2,
    label: "SEGBİS Rehber",
    detail: "SEGBİS rehberine ulaşmak için tıklayınız.",
    type: "item",
    actionKey: "handleSegbisRehber",
    image: guide_red,
    visible: true,
    color: "info",
  },
  {
    id: 3,
    label: "BiNot",
    detail:
      "BiNot uygulaması adliye personellerinin birim içinde notlarını tutması için oluşturulmuş bir uygulamadır.",
    type: "item",
    actionKey: "handleBiNot",
    image: admin_user,
    visible: true,
    visibleRoles: ["binot-kullanici", "admin"],
    color: "secondary",
  },
  {
    id: 4,
    label: "AYS Kullanıcı Yönetim Sistemi",
    detail:
      "Adliye Yönetim Sistemi kullanıcı yönetim paneline gitmek için tıklayınız.",
    type: "item",
    visibleRoles: ["admin"],
    image: admin_user,
    actionKey: "handleAysKys",
    visible: true,
    color: "dark",
  },
  {
    id: 5,
    label: "Hesap Ayarları",
    detail: "Hesap ayarlarınızı görüntülemek ve düzenlemek için tıklayınız.",
    type: "item",
    image: admin_user,
    actionKey: "handleHesapAyarları",
    visible: true,
    visibleWhenLoggedIn: true,
    color: "dark",
  },
  {
    id: 6,
    label: "Eskişehir Adliyesi",
    detail: "Eskişehir Adliyesi resmi web sayfasına gitmek için tıklayınız.",
    type: "item",
    image: courthouse_red,
    actionKey: "handleEskisehirAdliyesiWeb",
    visible: true,
    color: "success",
  },
  {
    id: 7,
    label: "UYAP Mail",
    detail:
      "UYAP Mail hizmeti ile adliye personelleri arasında güvenli bir şekilde mail gönderip alabilirsiniz.",
    type: "item",
    image: email_red,
    actionKey: "handleUyapMail",
    visible: true,
    color: "warning",
  },
  {
    id: 8,
    label: "Eskişehir Barosu Levhası",
    detail: "Eskişehir Barosu Levhasına ulaşmak için tıklayınız.",
    type: "item",
    actionKey: "handleBaroLevha",
    image: eskBaro,
    visible: true,
    color: "dark",
  },
  {
    id: 9,
    label: "Santral Portal",
    detail:
      "Santral portalı ile adliyede çalışan personellerin dahili numaralarını ve bilgilerini görüntüleyebilirsiniz.",
    type: "item",
    image: guide_red,
    actionKey: "handleSantralPortal",
    visible: false,
    color: "primary",
  },
];
