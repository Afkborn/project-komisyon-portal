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
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import Aktiviteler from "./Aktiviteler";
import { PieChart, pieChartDefaultProps } from "react-minimal-pie-chart";
import {
  renderDate_GGAAYYYY,
  calculateKalanGorevSuresi,
} from "../../actions/TimeActions";
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

  // urgent jobs
  const [urgentJobs, setUrgentJobs] = useState([]);
  const [urgentJobsLoading, setUrgentJobsLoading] = useState(false);

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

    // Cleanup fonksiyonu
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [selectedKurum]); // selectedKurum değiştiğinde effect'i tekrar çalıştır

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
    float: "right",
    color: "#d91d0f",
    fontSize: "20px",
    fontWeight: "bold",
  };

  const clickableTdStyle = {
    cursor: "pointer",
    textDecoration: "underline",
  };

  const handleTdOnClickPersonel = (personel) => {
    showPersonelDetay(personel);
  };

  return (
    <div>
      <div>
        <Card>
          <CardBody>
            <CardTitle tag="h3" className="font-weight-bold">
              Hoşgeldin{" "}
              {user && (
                <span style={{ color: "red" }}>
                  {user.role === "komisyonbaskan" ? "REİS" : ""}
                </span>
              )}
              {user && user.role !== "komisyonbaskan" && (
                <span style={{ color: "red" }}>{user.name}</span>
              )}
              <span style={timeStyle}>{saat}</span>
            </CardTitle>
            <CardText className="lead">
              Komisyon Portal sistemine hoşgeldiniz. Sistemdeki güncel bilgilere
              ulaşabilir, işlemlerinizi gerçekleştirebilirsiniz.
            </CardText>
          </CardBody>
        </Card>
      </div>

      <div className="mt-3" hidden={urgentJobsLoading}>
        {urgentJobs && urgentJobs.length === 0 && (
          <Alert color="success">
            Acele bir iş yok gibi görünüyor, hayırlı işler dilerim 😊
          </Alert>
        )}
        {urgentJobs && urgentJobs.length > 0 && (
          <div className="mt-2">
            <div>
              <h5>Acele İşler</h5>
            </div>

            <Table striped size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>İş Tanımı</th>
                  <th>Hedef</th>
                  <th>İşin Bitiş Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {urgentJobs.map((job, index) => (
                  <tr key={job.personID}>
                    <th scope="row">{index + 1}</th>
                    <td>{job.urgentJobType}</td>
                    <td
                      style={clickableTdStyle}
                      onClick={() => handleTdOnClickPersonel(job)}
                    >
                      {job.ad} {job.soyad} ({job.sicil})
                    </td>
                    <td>
                      {renderDate_GGAAYYYY(job.urgentJobEndDate)} (
                      {calculateKalanGorevSuresi(job.urgentJobEndDate)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      <hr></hr>
      {/* PIE CHARTS */}
      <div hidden={!katipTitleChartVisible}>
        <Row>
          {katipChartLoading && (
            <Col xs="12" className="text-center">
              <Spinner color="primary">
                <span className="sr-only">Yükleniyor...</span>
              </Spinner>
            </Col>
          )}

          <Col xs="6" className="text-center">
            <h4>Zabıt Katibi İstatistikleri</h4>
            <div>
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
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: entry.color,
                        marginRight: "8px",
                      }}
                    ></div>
                    <span>
                      {entry.title} ({entry.value} kişi){" "}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <PieChart
              style={{
                fontFamily:
                  '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                fontSize: "8px",
                height: "300px",
              }}
              data={katipChartData}
              radius={pieChartDefaultProps.radius - 6}
              lineWidth={60}
              segmentsStyle={{ transition: "stroke .3s", cursor: "pointer" }}
              segmentsShift={(index) => (index === katipChartSelected ? 6 : 1)}
              animate
              label={({ dataEntry }) => {
                if (dataEntry.percentage < 5) return "";
                return Math.round(dataEntry.percentage) + "%";
              }}
              labelPosition={100 - widthOfLine / 2}
              labelStyle={{
                fill: "#fff",
                opacity: 0.75,
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
          </Col>

          <Col xs="6" className="text-center">
            <h4>Ünvan İstatistikleri</h4>
            <div>
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
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        backgroundColor: entry.color,
                        marginRight: "8px",
                      }}
                    ></div>
                    <span>
                      {entry.title} ({entry.value} kişi){" "}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <PieChart
              style={{
                fontFamily:
                  '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                fontSize: "8px",
                height: "300px",
              }}
              data={unvanChartData}
              radius={pieChartDefaultProps.radius - 6}
              lineWidth={60}
              segmentsStyle={{ transition: "stroke .3s", cursor: "pointer" }}
              segmentsShift={(index) => (index === unvanChartSelected ? 6 : 1)}
              animate
              label={({ dataEntry }) => {
                if (dataEntry.percentage < 5) return "";
                return Math.round(dataEntry.percentage) + "%";
              }}
              labelPosition={100 - widthOfLine / 2}
              labelStyle={{
                fill: "#fff",
                opacity: 0.75,
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
          </Col>
        </Row>
      </div>

      {/* ACELE İŞLER  */}
      {/* {urgentJobsLoading && (
        <Spinner color="primary">
          <span className="sr-only">Yükleniyor...</span>
        </Spinner>
      )} */}

      <hr></hr>
      <div>
        <h5>Aktiviteler</h5>
        <Aktiviteler
          token={token}
          user={user}
          showPersonelDetay={showPersonelDetay}
          showBirimPersonelListe={showBirimPersonelListe}
          personelHareketleri={false}
        />
      </div>
    </div>
  );
}
