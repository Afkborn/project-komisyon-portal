import React, { useState, useEffect } from "react";
import {
  Table,
  Spinner,
  Row,
  Col,
  Alert,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Container,
  CardHeader,
  Progress,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import Aktiviteler from "./Aktiviteler";
import { PieChart, pieChartDefaultProps } from "react-minimal-pie-chart";
import {
  renderDate_GGAAYYYY,
  calculateKalanGorevSuresi,
} from "../../actions/TimeActions";

// İkonlar için
import {
  FaExclamationCircle,
  FaChartPie,
  FaUser,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";

export default function KomisyonPortalWelcome({
  user,
  token,
  showPersonelDetay,
  showBirimPersonelListe,
  selectedKurum,
}) {
  const [saat, setSaat] = useState(new Date().toLocaleTimeString());

  // last aktivite
  const widthOfLine = 60;

  // pie chart
  const [katipChartLoading, setKatipChartLoading] = useState(false);
  const [katipChart, setKatipChart] = useState([]);
  const [unvanChart, setUnvanChart] = useState([]);
  const [katipChartSelected, setKatipChartSelected] = useState(0);
  const [unvanChartSelected, setUnvanChartSelected] = useState(0);
  const [katipHovered, setKatipHovered] = useState(undefined);
  const [unvanHovered, setUnvanHovered] = useState(undefined);
  const [katipTitleChartVisible, setKatipTitleChartVisible] = useState(true);

  // infaz koruma table
  const [infazKorumaTableData, setInfazKorumaTableData] = useState([]);
  const [infazKorumaTableVisible, setInfazKorumaTableVisible] = useState(false);
  // urgent jobs
  const [urgentJobs, setUrgentJobs] = useState([]);
  const [urgentJobsLoading, setUrgentJobsLoading] = useState(false);

  // Bugünün tarihi
  const today = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const katipChartData = katipChart.map((entry, i) => {
    if (katipHovered === i) {
      return {
        ...entry,
        color: "grey",
      };
    }
    return entry;
  });

  const unvanChartData = unvanChart.map((entry, i) => {
    if (unvanHovered === i) {
      return {
        ...entry,
        color: "grey",
      };
    }
    return entry;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSaat(new Date().toLocaleTimeString());
    }, 1000);

    if (katipChart.length === 0 && selectedKurum) getKatipChart();
    if (urgentJobs.length === 0 && selectedKurum) getUrgentJobs();
    if (infazKorumaTableData.length === 0 && selectedKurum)
      getİnfazKorumaTable();
    // Cleanup fonksiyonu
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [selectedKurum]); // selectedKurum değiştiğinde effect'i tekrar çalıştır

  const getİnfazKorumaTable = () => {
    let configuration = {
      method: "GET",
      url:
        `/api/reports/infazKorumaMemurSayisi?institutionId=` + selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setInfazKorumaTableVisible(true);
        setInfazKorumaTableData(response.data.infazKorumaTable);
      })
      .catch((error) => {
        if (error.response?.data?.infazKorumaTitleChartVisible === false) {
          setInfazKorumaTableVisible(false);
        } else {
          console.log(error);
          let errorMessage =
            error.response?.data?.message || "Bir hata oluştu.";
          alertify.error(errorMessage);
        }
      });
  };

  const getKatipChart = () => {
    setKatipChartLoading(true);
    let configuration = {
      method: "GET",
      url: `/api/reports/chartData?institutionId=` + selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setKatipTitleChartVisible(true);
        setKatipChart(response.data.katipPieChartData);
        setUnvanChart(response.data.unvanPieChartData);
        setKatipChartLoading(false);
      })
      .catch((error) => {
        setKatipChartLoading(false);
        if (error.response?.data?.katipTitleChartVisible === false) {
          setKatipTitleChartVisible(false);
        } else {
          let errorMessage =
            error.response?.data?.message || "Bir hata oluştu.";
          alertify.error(errorMessage);
        }
      });
  };

  const getUrgentJobs = () => {
    setUrgentJobsLoading(true);
    let configuration = {
      method: "GET",
      url: `/api/reports/urgentJobs?institutionId=${selectedKurum.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        // response.data

        setUrgentJobs(response.data.urgentJobs);
        setUrgentJobsLoading(false);
      })
      .catch((error) => {
        let errorMessage = error.response?.data?.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        setUrgentJobsLoading(false);
      });
  };

  const timeStyle = {
    color: "#3f51b5",
    fontSize: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const cardStyle = {
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    border: "none",
    marginBottom: "20px",
  };

  const headerStyle = {
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #eaeaea",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    padding: "15px 20px",
  };

  const clickableTdStyle = {
    cursor: "pointer",
    textDecoration: "none",
    color: "#3f51b5",
    fontWeight: "500",
  };

  const handleTdOnClickPersonel = (personel) => {
    showPersonelDetay(personel);
  };

  // Tarihin geçip geçmediğini kontrol eden fonksiyon
  const isDatePassed = (date) => {
    return new Date(date) < new Date();
  };

  // Acil işlerin önceliğine göre badge rengi
  const getUrgencyBadge = (endDate) => {
    const days = calculateKalanGorevSuresi(endDate).split(" ")[0];

    if (isDatePassed(endDate)) {
      return (
        <Badge color="danger" pill>
          Süresi Geçmiş
        </Badge>
      );
    } else if (parseInt(days) <= 3) {
      return (
        <Badge color="warning" pill>
          Kritik
        </Badge>
      );
    } else if (parseInt(days) <= 7) {
      return (
        <Badge color="info" pill>
          Yaklaşan
        </Badge>
      );
    }
    return (
      <Badge color="success" pill>
        Planlanmış
      </Badge>
    );
  };

  return (
    <Container fluid className="p-0">
      <Card className="mb-4" style={cardStyle}>
        <CardHeader style={headerStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="m-0 font-weight-bold">
                EPSİS - Eskişehir Personel Sistemi
              </h3>
              <p className="text-muted small mb-0">{today}</p>
            </div>
            <div style={timeStyle}>
              <FaClock />
              {saat}
            </div>
          </div>
        </CardHeader>
        <CardBody className="py-4">
          <Row className="align-items-center">
            <Col md="2" className="text-center mb-3 mb-md-0">
              {/* <div
                style={{
                  width: "100px",
                  height: "100px",
                  background: "#e9ecef",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "8px",
                }}
              >
                <span>
                  {user.name?.charAt(0)}
                  {user.surname?.charAt(0)}
                </span>
              </div> */}

              <div
                style={{
                  background: "#f0f4ff",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                {/* <FaUser size={10} color="#3f51b5" /> */}
                <span>
                  {user.name?.charAt(0)}
                  {user.surname?.charAt(0)}
                </span>
              </div>
            </Col>
            <Col md="10">
              <CardTitle tag="h4" className="font-weight-bold mb-1">
                Hoşgeldiniz,{" "}
                {user && (
                  <span style={{ color: "#3f51b5" }}>
                    {user.roles.includes("komisyonbaskan")
                      ? " REİS"
                      : user.name}
                  </span>
                )}
              </CardTitle>
              <CardText className="lead mb-0">
                EPSİS'e hoşgeldiniz. Sistemdeki güncel bilgilere ulaşabilir,
                işlemlerinizi kolayca gerçekleştirebilirsiniz.
              </CardText>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Acele İşler Bölümü */}
      <div className="mt-3" hidden={urgentJobsLoading}>
        <Card style={cardStyle}>
          <CardHeader style={headerStyle} className="d-flex align-items-center">
            <FaExclamationCircle size={18} className="mr-2" color="#dc3545" />
            <h5 className="mb-0 font-weight-bold">Acele İşler</h5>
          </CardHeader>
          <CardBody>
            {urgentJobs && urgentJobs.length === 0 && (
              <Alert color="success" className="d-flex align-items-center mb-0">
                <div className="mr-3">
                  <span
                    role="img"
                    aria-label="success"
                    style={{ fontSize: "24px" }}
                  >
                    😊
                  </span>
                </div>
                <div>
                  <p className="font-weight-bold mb-0">
                    Acele bir iş yok gibi görünüyor
                  </p>
                  <p className="small mb-0">Hayırlı işler dileriz</p>
                </div>
              </Alert>
            )}

            {urgentJobs && urgentJobs.length > 0 && (
              <div className="table-responsive">
                <Table
                  hover
                  className="border-bottom"
                  style={{ borderRadius: "8px", overflow: "hidden" }}
                >
                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th>İş Tipi</th>
                      <th>Durum</th>
                      <th>Hedef</th>
                      <th>Bitiş Tarihi</th>
                      <th>Kalan Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentJobs.map((job, index) => (
                      <tr
                        id={job.personID}
                        className="align-middle"
                        key={job.personID}
                        style={{ transition: "all 0.2s" }}
                      >
                        <th scope="row">{index + 1}</th>
                        <td>
                          <span className="font-weight-medium">
                            {job.urgentJobType}
                          </span>
                        </td>
                        <td>{getUrgencyBadge(job.urgentJobEndDate)}</td>
                        <td
                          style={clickableTdStyle}
                          onClick={() => handleTdOnClickPersonel(job)}
                        >
                          <div className="d-flex align-items-center">
                            <div
                              style={{
                                width: "30px",
                                height: "30px",
                                background: "#e9ecef",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "8px",
                              }}
                            >
                              <span>
                                {job.ad[0]}
                                {job.soyad[0]}
                              </span>
                            </div>
                            {job.ad} {job.soyad}
                            <small className="text-muted ml-2">
                              ({job.sicil} - {job.title})
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt
                              size={14}
                              className="mr-2"
                              color="#6c757d"
                            />
                            {renderDate_GGAAYYYY(job.urgentJobEndDate)}
                          </div>
                        </td>
                        <td
                          style={{
                            color: isDatePassed(job.urgentJobEndDate)
                              ? "#dc3545"
                              : "inherit",
                            fontWeight: isDatePassed(job.urgentJobEndDate)
                              ? "bold"
                              : "normal",
                          }}
                        >
                          {calculateKalanGorevSuresi(job.urgentJobEndDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* İstatistikler */}
      <div hidden={!katipTitleChartVisible}>
        <Card style={cardStyle}>
          <CardHeader style={headerStyle} className="d-flex align-items-center">
            <FaChartPie size={18} className="mr-2" color="#3f51b5" />
            <h5 className="mb-0 font-weight-bold">Personel İstatistikleri</h5>
          </CardHeader>
          <CardBody>
            {katipChartLoading && (
              <div className="text-center py-5">
                <Spinner color="primary" size="lg">
                  <span className="sr-only">Yükleniyor...</span>
                </Spinner>
                <p className="mt-2 text-muted">İstatistikler yükleniyor...</p>
              </div>
            )}

            <Row className="mt-4">
              <Col lg="6" className="text-center mb-4 mb-lg-0">
                <Card
                  className="bg-light h-100"
                  style={{ border: "none", borderRadius: "8px" }}
                >
                  <CardHeader style={{ background: "#f8f9fa", border: "none" }}>
                    <h5 className="mb-0 font-weight-bold">
                      Zabıt Katibi Dağılımı
                    </h5>
                  </CardHeader>
                  <CardBody>
                    <div className="d-flex flex-column flex-md-row">
                      <div
                        className="order-2 order-md-1"
                        style={{ flex: 1, minHeight: "250px" }}
                      >
                        <PieChart
                          style={{
                            fontFamily:
                              '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                            fontSize: "8px",
                            height: "100%",
                          }}
                          data={katipChartData}
                          radius={pieChartDefaultProps.radius - 6}
                          lineWidth={60}
                          segmentsStyle={{
                            transition: "stroke .3s",
                            cursor: "pointer",
                          }}
                          segmentsShift={(index) =>
                            index === katipChartSelected ? 6 : 1
                          }
                          animate
                          label={({ dataEntry }) => {
                            if (dataEntry.percentage < 5) return "";
                            return Math.round(dataEntry.percentage) + "%";
                          }}
                          labelPosition={100 - widthOfLine / 2}
                          labelStyle={{
                            fill: "#fff",
                            opacity: 0.85,
                            fontWeight: "bold",
                            pointerEvents: "none",
                          }}
                          onClick={(_, index) => {
                            setKatipChartSelected(
                              index === katipChartSelected ? undefined : index
                            );
                          }}
                          onMouseOver={(_, index) => {
                            setKatipHovered(index);
                          }}
                          onMouseOut={() => {
                            setKatipHovered(undefined);
                          }}
                        />
                      </div>
                      <div
                        className="order-1 order-md-2 mb-3 mb-md-0"
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          className="legend"
                          style={{
                            display: "flex",
                            justifyContent: "start",
                            flexDirection: "column",
                            alignItems: "start",
                          }}
                        >
                          {katipChartData.map((entry, index) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "12px",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                background:
                                  index === katipChartSelected
                                    ? "#f0f4ff"
                                    : "transparent",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onClick={() =>
                                setKatipChartSelected(
                                  index === katipChartSelected
                                    ? undefined
                                    : index
                                )
                              }
                            >
                              <div
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  backgroundColor: entry.color,
                                  marginRight: "12px",
                                  borderRadius: "3px",
                                }}
                              ></div>
                              <div>
                                <span style={{ fontWeight: "500" }}>
                                  {entry.title}
                                </span>
                                <div className="d-flex align-items-center mt-1">
                                  <Progress
                                    value={entry.value}
                                    max={katipChartData.reduce(
                                      (acc, curr) => acc + curr.value,
                                      0
                                    )}
                                    style={{ height: "4px", width: "100px" }}
                                    color={entry.color.replace("#", "")}
                                  />
                                  <span className="ml-2 small">
                                    {entry.value} kişi
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              <Col lg="6" className="text-center">
                <Card
                  className="bg-light h-100"
                  style={{ border: "none", borderRadius: "8px" }}
                >
                  <CardHeader style={{ background: "#f8f9fa", border: "none" }}>
                    <h5 className="mb-0 font-weight-bold">Ünvan Dağılımı</h5>
                  </CardHeader>
                  <CardBody>
                    <div className="d-flex flex-column flex-md-row">
                      <div
                        className="order-2 order-md-1"
                        style={{ flex: 1, minHeight: "250px" }}
                      >
                        <PieChart
                          style={{
                            fontFamily:
                              '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                            fontSize: "8px",
                            height: "100%",
                          }}
                          data={unvanChartData}
                          radius={pieChartDefaultProps.radius - 6}
                          lineWidth={60}
                          segmentsStyle={{
                            transition: "stroke .3s",
                            cursor: "pointer",
                          }}
                          segmentsShift={(index) =>
                            index === unvanChartSelected ? 6 : 1
                          }
                          animate
                          label={({ dataEntry }) => {
                            if (dataEntry.percentage < 5) return "";
                            return Math.round(dataEntry.percentage) + "%";
                          }}
                          labelPosition={100 - widthOfLine / 2}
                          labelStyle={{
                            fill: "#fff",
                            opacity: 0.85,
                            fontWeight: "bold",
                            pointerEvents: "none",
                          }}
                          onClick={(_, index) => {
                            setUnvanChartSelected(
                              index === unvanChartSelected ? undefined : index
                            );
                          }}
                          onMouseOver={(_, index) => {
                            setUnvanHovered(index);
                          }}
                          onMouseOut={() => {
                            setUnvanHovered(undefined);
                          }}
                        />
                      </div>
                      <div
                        className="order-1 order-md-2 mb-3 mb-md-0"
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          className="legend"
                          style={{
                            display: "flex",
                            justifyContent: "start",
                            flexDirection: "column",
                            alignItems: "start",
                          }}
                        >
                          {unvanChartData.map((entry, index) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "12px",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                background:
                                  index === unvanChartSelected
                                    ? "#f0f4ff"
                                    : "transparent",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onClick={() =>
                                setUnvanChartSelected(
                                  index === unvanChartSelected
                                    ? undefined
                                    : index
                                )
                              }
                            >
                              <div
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  backgroundColor: entry.color,
                                  marginRight: "12px",
                                  borderRadius: "3px",
                                }}
                              ></div>
                              <div>
                                <span style={{ fontWeight: "500" }}>
                                  {entry.title}
                                </span>
                                <div className="d-flex align-items-center mt-1">
                                  <Progress
                                    value={entry.value}
                                    max={unvanChartData.reduce(
                                      (acc, curr) => acc + curr.value,
                                      0
                                    )}
                                    style={{ height: "4px", width: "100px" }}
                                    color={entry.color.replace("#", "")}
                                  />
                                  <span className="ml-2 small">
                                    {entry.value} kişi
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>

      {/* İNFAZ KORUMA TABLE */}
      <div hidden={!infazKorumaTableVisible}>
        <Card style={cardStyle}>
          <CardHeader style={headerStyle} className="d-flex align-items-center">
            <FaUser size={18} className="mr-2" color="#3f51b5" />
            <h5 className="mb-0 font-weight-bold">
              İnfaz Koruma Memur Sayıları
            </h5>
          </CardHeader>
          <CardBody>
            <div className="table-responsive">
              <Table
                hover
                className="mb-0"
                style={{ borderRadius: "8px", overflow: "hidden" }}
              >
                <thead className="bg-light">
                  <tr>
                    <th>Kurum Adı</th>
                    <th>Toplam İnfaz Koruma Memuru Sayısı</th>
                    <th>Toplam İnfaz Koruma Baş Memur Sayısı</th>
                  </tr>
                </thead>
                <tbody>
                  {infazKorumaTableData.map((entry, index) => (
                    <tr key={index}>
                      <td className="font-weight-medium">
                        {entry.institutionName}
                      </td>
                      <td>
                        <Badge color="info" pill className="px-3 py-2">
                          {entry.infazKorumaMemurSayisi}
                        </Badge>
                      </td>
                      <td>
                        <Badge color="primary" pill className="px-3 py-2">
                          {entry.infazKorumaBasMemurSayisi}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card style={cardStyle} className="mt-4">
        <CardHeader style={headerStyle} className="d-flex align-items-center">
          <h5 className="mb-0 font-weight-bold">Son Aktiviteler</h5>
        </CardHeader>
        <CardBody>
          <Aktiviteler
            token={token}
            user={user}
            showPersonelDetay={showPersonelDetay}
            showBirimPersonelListe={showBirimPersonelListe}
            personelHareketleri={false}
          />
        </CardBody>
      </Card>
    </Container>
  );
}
