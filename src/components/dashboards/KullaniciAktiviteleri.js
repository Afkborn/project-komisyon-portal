import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Spinner,
  Button,
  Badge,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import alertify from "alertifyjs";
import AYSNavbar from "../root/AYSNavbar";
import { renderDate_GGAAYYYY } from "../actions/TimeActions";
import Cookies from "universal-cookie"; // Cookie yönetimi için import ekleyelim

export default function KullaniciAktiviteleri() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const cookies = new Cookies(); // Cookie yönetimi için ekleyelim
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    getActivities(currentPage);
  }, [userId, currentPage]);

  const getActivities = (page) => {
    axios({
      method: "GET",
      url: `/api/activities/${userId}?page=${page}&limit=100`,
      headers: {
        Authorization: `Bearer ${cookies.get("TOKEN")}`,
      },
    })
      .then((response) => {
        setActivities(response.data.activityList);
        setPageCount(response.data.pageCount);
        setLoading(false);
      })
      .catch((error) => {
        alertify.error("Aktiviteler yüklenirken hata oluştu");
        setLoading(false);
      });
  };

  // Aktivite tipine göre badge rengi belirleme
  const getActivityBadgeColor = (type) => {
    switch (type.filterType) {
      case "person":
        return "primary";
      case "report":
        return "info";
      case "unit":
        return "success";
      case "title":
        return "warning";
      case "leave":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Aktivite detayını formatlama
  const formatActivityDetail = (activity) => {
    let detail = [];

    if (activity.personID) {
      detail.push(
        `Personel: ${activity.personID.ad} ${activity.personID.soyad}`
      );
    }
    if (activity.unitID) {
      detail.push(`Birim: ${activity.unitID.name}`);
    }
    if (activity.titleID) {
      detail.push(`Ünvan: ${activity.titleID.name}`);
    }
    if (activity.leaveID) {
      detail.push(`İzin ID: ${activity.leaveID}`);
    }
    if (activity.description) {
      detail.push(`Not: ${activity.description}`);
    }

    return detail.length > 0 ? detail.join(" | ") : "Detay bulunmuyor";
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pageCount; i++) {
      pages.push(
        <PaginationItem key={i} active={i === currentPage}>
          <PaginationLink onClick={() => setCurrentPage(i)}>{i}</PaginationLink>
        </PaginationItem>
      );
    }
    return (
      <Pagination className="d-flex justify-content-center mt-3">
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink first onClick={() => setCurrentPage(1)} />
        </PaginationItem>
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink
            previous
            onClick={() => setCurrentPage(currentPage - 1)}
          />
        </PaginationItem>
        {pages}
        <PaginationItem disabled={currentPage === pageCount}>
          <PaginationLink
            next
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </PaginationItem>
        <PaginationItem disabled={currentPage === pageCount}>
          <PaginationLink last onClick={() => setCurrentPage(pageCount)} />
        </PaginationItem>
      </Pagination>
    );
  };

  return (
    <div>
      <AYSNavbar />
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>Kullanıcı Aktiviteleri</h3>
            {user && (
              <p>
                <strong>
                  {user.name} {user.surname}
                </strong>{" "}
                ({user.username}) kullanıcısının sistem hareketleri
                listelenmektedir.
              </p>
            )}
          </div>
          <Button color="secondary" onClick={() => navigate("/ays-kys")}>
            Geri Dön
          </Button>
        </div>

        {loading ? (
          <div className="text-center p-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <>
            <Table hover responsive>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "15%" }}>Tarih</th>
                  <th style={{ width: "20%" }}>Uygulama</th>
                  <th style={{ width: "20%" }}>İşlem Tipi</th>
                  <th>Detay</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr key={activity._id}>
                    <td>{index * currentPage + 1}</td>
                    <td>{renderDate_GGAAYYYY(activity.createdAt)}</td>
                    <td>{activity.type.app}</td>
                    <td>
                      <Badge
                        color={getActivityBadgeColor(activity.type)}
                        className="me-2"
                      >
                        {activity.type.filterType}
                      </Badge>
                      {activity.type.name}
                    </td>
                    <td>{formatActivityDetail(activity)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {renderPagination()}
          </>
        )}
      </Container>
    </div>
  );
}
