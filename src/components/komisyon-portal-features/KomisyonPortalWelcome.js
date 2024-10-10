import React, { useState, useEffect } from "react";
import {
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import { PieChart, pieChartDefaultProps } from "react-minimal-pie-chart";

export default function KomisyonPortalWelcome({
  user,
  token,
  showPersonelDetay,
  showBirimPersonelListe,
  selectedKurum,
}) {
  const [lastActivityList, setLastActivityList] = useState([]);
  const [lastActivityListLoading, setLastActivityListLoading] = useState(false);

  const [katipChartLoading, setKatipChartLoading] = useState(false);
  const [katipChart, setKatipChart] = useState([]);
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(undefined);

  const data = katipChart.map((entry, i) => {
    if (hovered === i) {
      return {
        ...entry,
        color: "grey",
      };
    }
    return entry;
  });

  const lineWidth = 60;

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // pageSize değiştirilmediği için, setPageSize kaldırılabilir.

  useEffect(() => {
    if (lastActivityList.length === 0) getLastActivityList();
    if (katipChart.length === 0 && selectedKurum) getKatipChart();
    // eslint-disable-next-line
  }, [currentPage, selectedKurum]); // currentPage bağımlılığı ile her sayfa değişiminde çağrılır

  const getKatipChart = () => {
    setKatipChartLoading(true);
    let configuration = {
      method: "GET",
      url:
        `/api/reports/mahkemeSavcilikKatipSayisi?institutionId=` +
        selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setKatipChart(response.data.pieChartData);
        setKatipChartLoading(false);
      })
      .catch((error) => {
        let errorMessage = error.response?.data?.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        setKatipChartLoading(false);
      });
  };

  const getLastActivityList = () => {
    setLastActivityListLoading(true);
    let configuration = {
      method: "GET",
      url: `/api/activities/?page=${currentPage}&pageSize=${pageSize}&maxPageCount=10`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setLastActivityList(response.data.activityList);
        setPageCount(response.data.pageCount); // Sayfa sayısını doğru şekilde ayarladık
        setLastActivityListLoading(false);
      })
      .catch((error) => {
        let errorMessage = error.response?.data?.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        setLastActivityListLoading(false);
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

  const handleTdOnClickBirimPersonelListe = (birim) => {
    showBirimPersonelListe(birim);
  };

  const renderHedef = (activity) => {
    let typeField = activity.type.field || "";
    if (typeField === "") return <td></td>;
    if (typeField === "unitID") {
      if (!activity.unitID) return <td></td>;
      return (
        <td
          style={clickableTdStyle}
          onClick={() => handleTdOnClickBirimPersonelListe(activity.unitID)}
        >
          {activity.unitID.name}
        </td>
      );
    }
    if (typeField === "personID") {
      if (!activity.personID) return <td></td>;
      return (
        <td
          style={clickableTdStyle}
          onClick={() => handleTdOnClickPersonel(activity.personID)}
        >
          {activity.personID.ad} {activity.personID.soyad} (
          {activity.personID.sicil})
        </td>
      );
    }
    if (typeField === "titleID") {
      if (!activity.titleID) return <td></td>;
      return <td>{activity.titleID.name}</td>;
    }
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

      <div>
        <Row>
          <Col xs="6" className="text-center">
            <h4>Personel İstatistikleri</h4>
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
                {data.map((entry, index) => (
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
                    <span>{entry.title} ({entry.value} kişi) </span>
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
              data={data}
              radius={pieChartDefaultProps.radius - 6}
              lineWidth={60}
              segmentsStyle={{ transition: "stroke .3s", cursor: "pointer" }}
              segmentsShift={(index) => (index === selected ? 6 : 1)}
              animate
              label={({ dataEntry }) => Math.round(dataEntry.percentage) + "%"}
              labelPosition={100 - lineWidth / 2}
              labelStyle={{
                fill: "#fff",
                opacity: 0.75,
                pointerEvents: "none",
              }}
              onClick={(_, index) => {
                setSelected(index === selected ? undefined : index);
              }}
              onMouseOver={(_, index) => {
                setHovered(index);
              }}
              onMouseOut={() => {
                setHovered(undefined);
              }}
            />
          </Col>

          <Col xs="6" className="text-center">
            <h4>BURAYA NE KOYALIM</h4>
          </Col>
        </Row>
      </div>

      <div hidden={!lastActivityListLoading}>
        <Spinner color="primary">
          <span className="sr-only">Yükleniyor...</span>
        </Spinner>
      </div>
      <div>
        <h4> Son 100 Aktivite</h4>

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
                onClick={() => setCurrentPage(currentPage - 1)}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => (
              <PaginationItem key={i} active={i + 1 === currentPage}>
                <PaginationLink onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem disabled={currentPage >= pageCount}>
              <PaginationLink
                next
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </PaginationItem>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
