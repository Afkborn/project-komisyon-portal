import React, { useState, useEffect } from "react";
import {
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

export default function KomisyonPortalWelcome({
  user,
  token,
  showPersonelDetay,
  showBirimPersonelListe,
}) {
  const [lastActivityList, setLastActivityList] = useState([]);
  const [lastActivityListLoading, setLastActivityListLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // pageSize değiştirilmediği için, setPageSize kaldırılabilir.

  useEffect(() => {
    getLastActivityList(); // Her sayfa değişikliğinde listeyi tekrar al
  }, [currentPage]); // currentPage bağımlılığı ile her sayfa değişiminde çağrılır

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
