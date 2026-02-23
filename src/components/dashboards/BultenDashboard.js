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
  Collapse,
  FormGroup,
  Label,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import {
  FaSearch,
  FaExternalLinkAlt,
  FaNewspaper,
  FaRss,
  FaSyncAlt,
  FaFilter,
  FaCalendarAlt,
  FaCog,
  FaSave,
} from "react-icons/fa";
import AYSNavbar from "../root/AYSNavbar";

export default function BultenDashboard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    categories: {},
  });

  // Tarih filtresi için state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Ayarlar için state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);

  // Gelişmiş ayarlar için state
  const [cacheTime, setCacheTime] = useState(30);
  const [maxItems, setMaxItems] = useState(100);
  const [filterAdult, setFilterAdult] = useState(false);

  // RSS kaynaklarını tanımla - varsayılan değerler
  const defaultRssSources = [
    {
      id: 1,
      name: "Asayiş",
      url: "https://www.eskisehirekspres.net/rss/asayis",
      active: true,
    },
    {
      id: 2,
      name: "Gündem",
      url: "https://www.eskisehirekspres.net/rss/gundem",
      active: true,
    },
    {
      id: 3,
      name: "Ekonomi",
      url: "https://www.eskisehirekspres.net/rss/ekonomi",
      active: true,
    },
    {
      id: 4,
      name: "Siyaset",
      url: "https://www.eskisehirekspres.net/rss/siyaset",
      active: true,
    },
  ];

  const [rssSources, setRssSources] = useState(defaultRssSources);

  // Modal durumu
  const [showModal, setShowModal] = useState(false);

  // Sayfa yüklendikten sonra çalışacak effect
  useEffect(() => {
    // Önce ayarları yükle, sonra haberleri çek
    loadSettingsAndFetchNews();
    // eslint-disable-next-line
  }, []);

  // Ayarları yükle ve haberleri çek - yeni fonksiyon
  const loadSettingsAndFetchNews = async () => {
    try {
      // RSS kaynaklarını yükle
      const savedRssSources = localStorage.getItem("bultenRssSources");
      if (savedRssSources) {
        // Local storage'dan ayarlar var
        const parsedSources = JSON.parse(savedRssSources);
        setRssSources(parsedSources);
        // console.log("RSS kaynakları localStorage'dan yüklendi:", parsedSources);

        // Gelişmiş ayarları yükle
        const savedAdvancedSettings = localStorage.getItem(
          "bultenAdvancedSettings"
        );
        if (savedAdvancedSettings) {
          const settings = JSON.parse(savedAdvancedSettings);
          setCacheTime(settings.cacheTime || 30);
          setMaxItems(settings.maxItems || 100);
          setFilterAdult(settings.filterAdult || false);
        }

        // Ayarlar yüklendikten sonra küçük bir gecikme ile haberleri çek
        setTimeout(() => {
          fetchNews(parsedSources); // Yüklenen kaynakları doğrudan geçir
        }, 100);
      } else {
        // Local storage'da ayar yok, varsayılan değerlerle devam et
        console.log(
          "RSS kaynakları localStorage'da bulunamadı, varsayılan değerler kullanılıyor"
        );
        fetchNews(defaultRssSources); // Varsayılan kaynakları kullan
      }
    } catch (error) {
      console.error("Bülten ayarları yüklenirken hata oluştu:", error);
      // Hata durumunda varsayılan değerleri kullan
      setRssSources(defaultRssSources);
      fetchNews(defaultRssSources);
    }
  };

  // fetchNews fonksiyonunu parametre alacak şekilde güncelle
  const fetchNews = async (sourcesToUse = null) => {
    setLoading(true);
    try {
      // Parametre olarak geçilen kaynakları veya state'teki kaynakları kullan
      const sourceList = sourcesToUse || rssSources;
      // console.log("Kullanılan RSS kaynakları:", sourceList);

      // Sadece aktif RSS kaynaklarını kullan
      const activeFeeds = sourceList.filter((source) => source.active);
      // console.log("Aktif RSS kaynakları:", activeFeeds);

      if (activeFeeds.length === 0) {
        // console.log("Aktif RSS kaynağı bulunamadı");
        setNews([]);
        setLoading(false);
        return;
      }

      // Tüm aktif RSS kaynaklarından veri çekme
      const promises = activeFeeds.map((source) =>
        axios.get(`/api/rss_proxy?url=${encodeURIComponent(source.url)}`)
      );

      const responses = await Promise.all(promises);

      // Tüm sonuçları birleştir ve işle
      let allNews = [];
      responses.forEach((response, index) => {
        const source = activeFeeds[index];
        const items = response.data.items || [];

        // RSS verilerini daha kullanışlı bir formata dönüştür
        const processedItems = items.map((item) => ({
          ...item,
          category:
            item.categories?.length > 0 ? item.categories[0] : source.name,
          source: source.name,
          id: `${source.id}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        }));

        allNews = [...allNews, ...processedItems];
      });

      // Haberleri tarihe göre sırala (en yeniler en üstte)
      allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      setNews(allNews);
      // console.log(`${allNews.length} haber başarıyla yüklendi.`);
    } catch (error) {
      console.error("RSS verisi çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistik hesaplama
  useEffect(() => {
    if (news.length > 0) {
      // Bugünün tarihini al
      const today = new Date().toDateString();

      // Kategorileri say
      const categoryCount = {};
      news.forEach((item) => {
        if (item.category) {
          categoryCount[item.category] =
            (categoryCount[item.category] || 0) + 1;
        }
      });

      // Bugünkü haberleri say
      const todayNewsCount = news.filter((item) => {
        const itemDate = new Date(item.pubDate).toDateString();
        return itemDate === today;
      }).length;

      setStats({
        total: news.length,
        today: todayNewsCount,
        categories: categoryCount,
      });
    }
  }, [news]);

  // Haberi görüntüleme
  const viewArticle = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  // Haberin detay modalını kapat
  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };

  // RSS Kaynak Ayarlarını Kaydet
  const saveSettings = () => {
    try {
      // RSS kaynaklarını localStorage'e kaydet
      localStorage.setItem("bultenRssSources", JSON.stringify(rssSources));

      // Gelişmiş ayarları localStorage'e kaydet
      const advancedSettings = {
        cacheTime,
        maxItems,
        filterAdult,
      };
      localStorage.setItem(
        "bultenAdvancedSettings",
        JSON.stringify(advancedSettings)
      );

      // Başarı mesajı göster
      alert("Ayarlar başarıyla kaydedildi!");

      // Modalı kapat
      setShowSettingsModal(false);

      // Haberleri yeni ayarlarla yeniden yükle
      fetchNews(rssSources);
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata oluştu:", error);
      alert("Ayarlar kaydedilirken bir hata oluştu!");
    }
  };

  // RSS Kaynağının aktiflik durumunu değiştir
  const toggleSourceActive = (id) => {
    setRssSources(
      rssSources.map((source) =>
        source.id === id ? { ...source, active: !source.active } : source
      )
    );
  };

  // Tüm ayarları sıfırla
  const resetAllSettings = () => {
    if (
      window.confirm(
        "Tüm ayarları varsayılanlara sıfırlamak istediğinize emin misiniz?"
      )
    ) {
      // localStorage'den ayarları temizle
      localStorage.removeItem("bultenRssSources");
      localStorage.removeItem("bultenAdvancedSettings");

      // State'leri varsayılan değerlere sıfırla
      setRssSources(defaultRssSources);
      setCacheTime(30);
      setMaxItems(100);
      setFilterAdult(false);

      alert("Tüm ayarlar varsayılan değerlere sıfırlandı.");
    }
  };

  // Filtre uygula
  const filteredNews = news.filter((item) => {
    // Metin araması
    const searchMatch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contentSnippet?.toLowerCase().includes(searchTerm.toLowerCase());

    // Kategori filtresi
    const categoryMatch = categoryFilter
      ? item.category === categoryFilter
      : true;

    // Tarih filtresi
    let dateMatch = true;
    const itemDate = new Date(item.pubDate);

    if (startDate) {
      const startDateObj = new Date(startDate);
      dateMatch = dateMatch && itemDate >= startDateObj;
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // Günün sonuna ayarla
      dateMatch = dateMatch && itemDate <= endDateObj;
    }

    return searchMatch && categoryMatch && dateMatch;
  });

  // Haber kategorisine göre renk belirleme
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "asayiş":
        return "danger";
      case "gündem":
        return "primary";
      case "ekonomi":
        return "success";
      case "siyaset":
        return "warning";
      default:
        return "info";
    }
  };

  // Tarih formatını düzenleme - date-fns olmadan kendi formatımızı oluşturuyoruz
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }

      // Türkçe ay isimleri
      const months = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ];

      // Türkçe formatla (1 Ocak 2023 12:34)
      return `${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    } catch (e) {
      return dateStr; // Hata durumunda orijinal string'i döndür
    }
  };

  // İçerikten HTML etiketlerini temizleme
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="bulten-dashboard">
      <AYSNavbar />
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h3 className="text-primary fw-bold">
              <FaNewspaper className="me-2" />
              Bülten Yönetim Paneli
            </h3>
            <p className="text-muted">
              RSS kaynaklarından en güncel haberleri takip edebilirsiniz.
            </p>
          </Col>
        </Row>

        {/* İstatistik Kartları */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-primary p-3 text-white me-3">
                  <FaNewspaper className="fs-4" />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Toplam Haberler</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-success p-3 text-white me-3">
                  <i className="fas fa-calendar-day fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Bugünkü Haberler</h6>
                  <h3 className="mb-0">{stats.today}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-info p-3 text-white me-3">
                  <i className="fas fa-rss fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">RSS Kaynakları</h6>
                  <h3 className="mb-0">
                    {rssSources.filter((s) => s.active).length}
                  </h3>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-warning p-3 text-white me-3">
                  <i className="fas fa-tags fs-4"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Kategoriler</h6>
                  <h3 className="mb-0">
                    {Object.keys(stats.categories).length}
                  </h3>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-4">
          <CardHeader className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaRss className="me-2" />
              Bülten Haberleri
            </h5>
            <div>
              <Button
                color="primary"
                onClick={() => fetchNews(rssSources)}
                className="me-2"
              >
                <FaSyncAlt className="me-2" /> Yenile
              </Button>
              <Button
                color="secondary"
                outline
                onClick={() => setShowSettingsModal(true)}
              >
                <FaCog className="me-2" /> Ayarlar
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <Row className="mb-4">
              <Col md={3}>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <FaSearch />
                  </InputGroupText>
                  <Input
                    placeholder="Başlık veya içerik ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button close onClick={() => setSearchTerm("")} />
                  )}
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <FaFilter />
                  </InputGroupText>
                  <Input
                    type="select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">Tüm Kategoriler</option>
                    {Object.keys(stats.categories).map((category) => (
                      <option key={category} value={category}>
                        {category} ({stats.categories[category]})
                      </option>
                    ))}
                  </Input>
                </InputGroup>
              </Col>
              <Col md={2}>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <FaCalendarAlt />
                  </InputGroupText>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Başlangıç tarihi"
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <FaCalendarAlt />
                  </InputGroupText>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Bitiş tarihi"
                  />
                </InputGroup>
              </Col>
              <Col md={2} className="d-flex justify-content-end">
                <Button
                  color="secondary"
                  outline
                  className="w-100"
                  onClick={clearFilters}
                >
                  <i className="fas fa-times me-2"></i> Filtreleri Temizle
                </Button>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center p-5">
                <Spinner color="primary" />
                <p className="text-muted mt-3">Haberler yükleniyor...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <Alert color="info">
                <i className="fas fa-info-circle me-2"></i>
                {searchTerm || categoryFilter || startDate || endDate
                  ? "Arama kriterlerine uygun haber bulunamadı."
                  : "Henüz haber bulunmamaktadır."}
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle shadow-sm">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "5%" }}>#</th>
                      <th style={{ width: "10%" }}>Kategori</th>
                      <th style={{ width: "45%" }}>Başlık</th>
                      <th style={{ width: "15%" }}>Kaynak</th>
                      <th style={{ width: "15%" }}>Tarih</th>
                      <th style={{ width: "10%" }} className="text-center">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNews.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          <Badge
                            color={getCategoryColor(item.category)}
                            pill
                            className="px-3 py-2"
                          >
                            {item.category || "Genel"}
                          </Badge>
                        </td>
                        <td>
                          <div
                            className="fw-bold article-title"
                            title={item.title}
                          >
                            {item.title}
                          </div>
                          <div className="text-muted small article-snippet">
                            {stripHtml(item.contentSnippet).substring(0, 80)}...
                          </div>
                        </td>
                        <td>{item.source || "Eskişehir Ekspres"}</td>
                        <td>{formatDate(item.pubDate)}</td>
                        <td>
                          <div className="d-flex justify-content-center">
                            <Button
                              color="primary"
                              size="sm"
                              className="me-2"
                              onClick={() => viewArticle(item)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              color="info"
                              size="sm"
                              onClick={() => window.open(item.link, "_blank")}
                            >
                              <FaExternalLinkAlt />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Haber Detay Modalı */}
      <Modal isOpen={showModal} toggle={closeModal} size="lg">
        <ModalHeader toggle={closeModal} className="bg-light">
          {selectedArticle?.title}
          <div className="mt-2">
            <Badge
              color={getCategoryColor(selectedArticle?.category)}
              pill
              className="me-2"
            >
              {selectedArticle?.category || "Genel"}
            </Badge>
            <small className="text-muted">
              {selectedArticle && formatDate(selectedArticle.pubDate)}
            </small>
          </div>
        </ModalHeader>
        <ModalBody>
          {selectedArticle?.enclosure?.url && (
            <img
              src={selectedArticle.enclosure.url}
              alt={selectedArticle.title}
              className="img-fluid mb-3 rounded"
              style={{ maxHeight: "300px", width: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
          )}

          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html:
                selectedArticle?.content ||
                selectedArticle?.contentSnippet ||
                "",
            }}
          />

          <div className="mt-4 d-flex justify-content-between">
            <span className="text-muted">
              Kaynak: {selectedArticle?.source || "Eskişehir Ekspres"}
            </span>
            <Button
              color="primary"
              size="sm"
              onClick={() => window.open(selectedArticle?.link, "_blank")}
            >
              <FaExternalLinkAlt className="me-2" /> Kaynakta Oku
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Ayarlar Modalı */}
      <Modal
        isOpen={showSettingsModal}
        toggle={() => setShowSettingsModal(!showSettingsModal)}
      >
        <ModalHeader toggle={() => setShowSettingsModal(!showSettingsModal)}>
          <FaCog className="me-2" /> RSS Kaynak Ayarları
        </ModalHeader>
        <ModalBody>
          <p className="text-muted mb-3">
            Takip etmek istediğiniz RSS kaynaklarını seçin ve yönetin.
            <br />
            <small className="text-success">
              <i className="fas fa-info-circle me-1"></i>
              Ayarlarınız kaydedilecek ve tekrar ziyaret ettiğinizde
              korunacaktır.
            </small>
          </p>

          <div className="mb-3">
            <h6 className="fw-bold">Aktif RSS Kaynakları</h6>
            {rssSources.map((source) => (
              <div
                key={source.id}
                className="d-flex align-items-center mb-2 p-2 border rounded"
              >
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`rssSource${source.id}`}
                    checked={source.active}
                    onChange={() => toggleSourceActive(source.id)}
                  />
                  <label
                    className="form-check-label ms-2"
                    htmlFor={`rssSource${source.id}`}
                  >
                    {source.name}
                  </label>
                </div>
                <Badge
                  color={getCategoryColor(source.name)}
                  pill
                  className="ms-auto"
                >
                  {source.name}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h6 className="fw-bold mb-3">Gelişmiş Ayarlar</h6>
            <Button
              color="link"
              onClick={() => setSettingsCollapsed(!settingsCollapsed)}
              className="text-decoration-none p-0 mb-3"
            >
              <i
                className={`fas fa-chevron-${
                  settingsCollapsed ? "down" : "up"
                } me-2`}
              ></i>
              {settingsCollapsed ? "Detayları Göster" : "Detayları Gizle"}
            </Button>

            <Collapse isOpen={!settingsCollapsed}>
              <Card className="border-0 bg-light p-3">
                <FormGroup>
                  <Label for="cacheTime" className="fw-bold">
                    Önbellek Süresi (dakika)
                  </Label>
                  <Input
                    type="number"
                    id="cacheTime"
                    value={cacheTime}
                    onChange={(e) =>
                      setCacheTime(parseInt(e.target.value) || 30)
                    }
                    placeholder="30"
                    className="mb-3"
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="maxItems" className="fw-bold">
                    Maksimum Haber Sayısı
                  </Label>
                  <Input
                    type="number"
                    id="maxItems"
                    value={maxItems}
                    onChange={(e) =>
                      setMaxItems(parseInt(e.target.value) || 100)
                    }
                    placeholder="100"
                    className="mb-3"
                  />
                </FormGroup>

                <FormGroup check className="mb-0">
                  <Input
                    type="checkbox"
                    id="filterAdult"
                    checked={filterAdult}
                    onChange={(e) => setFilterAdult(e.target.checked)}
                  />
                  <Label for="filterAdult" check>
                    Yetişkin içeriği filtrele
                  </Label>
                </FormGroup>

                <hr className="my-3" />

                <div className="d-flex justify-content-end">
                  <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={resetAllSettings}
                  >
                    <i className="fas fa-undo-alt me-1"></i> Tüm ayarları
                    sıfırla
                  </Button>
                </div>
              </Card>
            </Collapse>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={saveSettings}>
            <FaSave className="me-2" /> Kaydet
          </Button>
          <Button color="secondary" onClick={() => setShowSettingsModal(false)}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>

      {/* CSS Stilleri */}
      <style jsx="true">{`
        .bulten-dashboard .table-responsive {
          border-radius: 8px;
          overflow: hidden;
        }

        .article-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 500px;
        }

        .article-snippet {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.3;
        }

        .article-content {
          line-height: 1.6;
          font-size: 1rem;
        }

        .article-content img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 4px;
        }

        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        /* Tarih seçici için stil */
        input[type="date"] {
          padding: 0.375rem 0.75rem;
        }
      `}</style>
    </div>
  );
}
