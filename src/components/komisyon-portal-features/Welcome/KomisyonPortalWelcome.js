import React, { useState, useEffect } from "react";
import { Table, Spinner, Row, Col, Alert } from "reactstrap";
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
    if (katipChart.length === 0 && selectedKurum) getKatipChart();
    if (urgentJobs.length === 0 && selectedKurum) getUrgentJobs();
    // eslint-disable-next-line
  }, [selectedKurum]);

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
        setKatipChart(response.data.katipPieChartData);
        setUnvanChart(response.data.unvanPieChartData);
        setKatipChartLoading(false);
      })
      .catch((error) => {
        let errorMessage = error.response?.data?.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        setKatipChartLoading(false);
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
    color: "#007bff",
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
      <span style={timeStyle}>Saat {new Date().toLocaleTimeString()}</span>
      <h3>Hoşgeldin {user && user.name}!</h3>

      <p>
        Bu uygulama, personel bilgileri üzerinde okuma, ekleme, güncelleme ve
        silme işlemlerini gerçekleştirmek için geliştirilmiştir.
      </p>
      <hr></hr>
      {/* PIE CHARTS */}
      <div>
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
              label={({ dataEntry }) => Math.round(dataEntry.percentage) + "%"}
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
              label={({ dataEntry }) => Math.round(dataEntry.percentage) + "%"}
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
      {urgentJobsLoading && (
        <Spinner color="primary">
          <span className="sr-only">Yükleniyor...</span>
        </Spinner>
      )}
      <div className="mt-3" hidden={urgentJobsLoading}>
        {urgentJobs && urgentJobs.length === 0 && (
          <Alert color="success">
            Yapılması gereken acele bir iş yok gibi gözüküyor, rahatsın :)
          </Alert>
        )}
        {urgentJobs && urgentJobs.length > 0 && (
          <div className="mt-2">
            <h4> Acele İşler</h4>
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

      {/* SON 100 AKTİVİTE */}
      <div>
        <Aktiviteler
          token={token}
          user={user}
          showPersonelDetay={showPersonelDetay}
          showBirimPersonelListe={showBirimPersonelListe}
        />
        {/* <h4> Son 100 Aktivite</h4>

        <Table striped size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Kullanıcı</th>
              <th>İşlem</th>
              <th>Hedef</th>
              <th>İşlem Tarihi</th>
              <th>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {lastActivityList.map((activity, index) => (
              <tr key={activity._id}>
                <th scope="row">{(currentPage - 1) * pageSize + index + 1}</th>
                <td>
                  {activity.userID.name} {activity.userID.surname}
                </td>
                <td>{activity.type.name}</td>
                {renderHedef(activity)}
                <td>{new Date(activity.createdAt).toLocaleString()}</td>
                <td>{activity.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pagination aria-label="Sayfa navigasyonu">
            <PaginationItem disabled={currentPage <= 1}>
              <PaginationLink
                previous
                onClick={() => handlePaginationClick(currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => (
              <PaginationItem key={i} active={i + 1 === currentPage}>
                <PaginationLink onClick={() => handlePaginationClick(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem disabled={currentPage >= pageCount}>
              <PaginationLink
                next
                onClick={() => handlePaginationClick(currentPage + 1)}
              />
            </PaginationItem>
          </Pagination>
        </div> */}
      </div>
    </div>
  );
}
