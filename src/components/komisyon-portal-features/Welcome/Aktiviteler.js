import React, { useState, useEffect } from "react";
import {
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
  Input,
  FormGroup,
  Label,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Badge,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

export default function Aktiviteler({
  token,
  showPersonelDetay,
  showBirimPersonelListe,
  personelHareketleri,
}) {
  const [lastActivityList, setLastActivityList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [userList, setUserList] = useState([]);

  // Filtre durumları
  const [selectedUser, setSelectedUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filtreVarMi, setFiltreVarMi] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value || null);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value || null);
  };

  const handleUserSelectChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleClearFilter = () => {
    setSelectedUser("");
    setFilterType("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    getLastActivityList();
  };

  useEffect(() => {
    getLastActivityList();
    if (userList.length === 0) {
      getUserList();
    }
    // eslint-disable-next-line
  }, [currentPage]);

  const getUserList = () => {
    let configuration = {
      method: "GET",
      url: "/api/users/names",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((response) => {
        setUserList(response.data.users);
      })
      .catch((error) => {
        let errorMessage = error.response?.data?.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
      });
  };

  const handlePaginationClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handleTdOnClickPersonel = (personel) => {
    showPersonelDetay(personel);
  };

  const handleTdOnClickBirimPersonelListe = (birim) => {
    showBirimPersonelListe(birim);
  };

  const renderHedef = (activity) => {
    let typeField = activity.type.field || "";

    if (typeField === "") return <td>-</td>;

    if (typeField === "unitID") {
      if (!activity.unitID) return <td>-</td>;
      return (
        <td>
          <Button
            color="link"
            className="p-0 text-decoration-none"
            onClick={() => handleTdOnClickBirimPersonelListe(activity.unitID)}
            id={`unit-${activity._id}`}
          >
            <Badge color="info" pill className="px-2 py-1">
              <i className="fas fa-building me-1"></i>
              {activity.unitID.name}
            </Badge>
          </Button>
          <UncontrolledTooltip target={`unit-${activity._id}`}>
            Bu birime ait personel listesini görüntüle
          </UncontrolledTooltip>
        </td>
      );
    }

    if (typeField === "personID") {
      if (!activity.personID) return <td>-</td>;
      return (
        <td>
          <Button
            color="link"
            className="p-0 text-decoration-none"
            onClick={() => handleTdOnClickPersonel(activity.personID)}
            id={`person-${activity._id}`}
          >
            <Badge color="primary" pill className="px-2 py-1">
              <i className="fas fa-user me-1"></i>
              {activity.personID.ad} {activity.personID.soyad} (
              {activity.personID.sicil})
            </Badge>
          </Button>
          <UncontrolledTooltip target={`person-${activity._id}`}>
            Personel detaylarını görüntüle
          </UncontrolledTooltip>
        </td>
      );
    }

    if (typeField === "titleID") {
      if (!activity.titleID) return <td>-</td>;
      return (
        <td>
          <Badge color="secondary" pill className="px-2 py-1">
            <i className="fas fa-user-tag me-1"></i>
            {activity.titleID.name}
          </Badge>
        </td>
      );
    }

    return <td>-</td>;
  };

  // İşlem tipine göre renk belirle
  const getActivityTypeColor = (activity) => {
    const type = activity.type.name?.toLowerCase() || "";

    if (type.includes("ekle") || type.includes("başla")) return "success";
    if (
      type.includes("sil") ||
      type.includes("çıkar") ||
      type.includes("ayrıl")
    )
      return "danger";
    if (type.includes("güncelle") || type.includes("değiştir"))
      return "warning";
    if (type.includes("nakil") || type.includes("görev")) return "info";
    if (type.includes("rapor")) return "dark";

    return "secondary";
  };

  // Tarih formatlama
  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("tr-TR", options);
  };

  const getLastActivityList = () => {
    setIsLoading(true);

    // Filtre var mı kontrolü
    const hasFilter =
      selectedUser || filterType || startDate || endDate || personelHareketleri;
    setFiltreVarMi(hasFilter);

    let url = `/api/activities/?page=${currentPage}&pageSize=${pageSize}&maxPageCount=10&app=EPSİS`;

    if (filterType && !personelHareketleri) {
      url += `&filterType=${filterType}`;
    }

    if (personelHareketleri) {
      url += `&personelHareketleri=${personelHareketleri}`;
    }

    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    if (selectedUser) {
      url += `&userID=${selectedUser}`;
    }

    let configuration = {
      method: "GET",
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setLastActivityList(response.data.activityList);
        setPageCount(response.data.pageCount);
   
        setIsLoading(false);
      })
      .catch((error) => {
        let errorMessage = error.response?.data?.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        setIsLoading(false);
      });
  };

  return (
    <div className="aktiviteler-container">
      <Card className="shadow-sm mb-4 border-0">
        <CardBody className="pb-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="fas fa-filter me-2 text-primary"></i>
              Filtreler
            </h5>
            <Button
              color="link"
              className="p-0 text-decoration-none"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i
                className={`fas fa-chevron-${showFilters ? "up" : "down"} me-1`}
              ></i>
              {showFilters ? "Filtreleri Gizle" : "Filtreleri Göster"}
            </Button>
          </div>

          {showFilters && (
            <div className="filter-container">
              <Row className="mb-3">
                <Col md={3}>
                  <FormGroup>
                    <Label for="userSelect" className="fw-bold">
                      <i className="fas fa-user me-1 text-primary"></i>{" "}
                      Kullanıcı
                    </Label>
                    <Input
                      type="select"
                      name="select"
                      id="userSelect"
                      onChange={handleUserSelectChange}
                      value={selectedUser}
                      className="form-select"
                    >
                      <option value="">Tüm Kullanıcılar</option>
                      {userList &&
                        userList.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} {user.surname}
                          </option>
                        ))}
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={3} hidden={personelHareketleri}>
                  <FormGroup>
                    <Label for="filterType" className="fw-bold">
                      <i className="fas fa-tasks me-1 text-primary"></i> İşlem
                      Tipi
                    </Label>
                    <Input
                      type="select"
                      name="select"
                      id="filterType"
                      value={filterType}
                      onChange={handleFilterTypeChange}
                      className="form-select"
                    >
                      <option value="">Tüm İşlemler</option>
                      <option value="person">Personel İşlemleri</option>
                      <option value="unit">Birim İşlemleri</option>
                      <option value="title">Ünvan İşlemleri</option>
                      <option value="report">Rapor İşlemleri</option>
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={3}>
                  <FormGroup>
                    <Label for="startDateTime" className="fw-bold">
                      <i className="fas fa-calendar-alt me-1 text-primary"></i>{" "}
                      Başlangıç Tarihi
                    </Label>
                    <Input
                      type="date"
                      name="date"
                      id="startDateTime"
                      value={startDate || ""}
                      onChange={handleStartDateChange}
                      className={startDate ? "border-primary" : ""}
                    />
                  </FormGroup>
                </Col>

                <Col md={3}>
                  <FormGroup>
                    <Label for="endDateTime" className="fw-bold">
                      <i className="fas fa-calendar-alt me-1 text-primary"></i>{" "}
                      Bitiş Tarihi
                    </Label>
                    <Input
                      type="date"
                      name="date"
                      id="endDateTime"
                      onChange={handleEndDateChange}
                      value={endDate || ""}
                      className={endDate ? "border-primary" : ""}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mb-3">
                <Button
                  color="secondary"
                  className="me-2"
                  onClick={handleClearFilter}
                  disabled={!filtreVarMi}
                >
                  <i className="fas fa-undo me-1"></i> Filtreleri Temizle
                </Button>
                <Button color="primary" onClick={handleApplyFilter}>
                  <i className="fas fa-search me-1"></i> Filtrele
                </Button>
              </div>

              {filtreVarMi && (
                <Alert color="info" className="d-flex mb-3">
                  <i className="fas fa-info-circle me-2 fs-5"></i>
                  <div>
                    <strong>Aktif Filtreler:</strong>{" "}
                    {selectedUser &&
                      userList.find((u) => u._id === selectedUser) && (
                        <Badge color="primary" className="me-1 px-2">
                          Kullanıcı:{" "}
                          {userList.find((u) => u._id === selectedUser).name}{" "}
                          {userList.find((u) => u._id === selectedUser).surname}
                        </Badge>
                      )}
                    {filterType && (
                      <Badge color="primary" className="me-1 px-2">
                        İşlem Türü:{" "}
                        {filterType === "person"
                          ? "Personel"
                          : filterType === "unit"
                          ? "Birim"
                          : filterType === "title"
                          ? "Ünvan"
                          : "Rapor"}
                      </Badge>
                    )}
                    {startDate && (
                      <Badge color="primary" className="me-1 px-2">
                        Başlangıç: {startDate}
                      </Badge>
                    )}
                    {endDate && (
                      <Badge color="primary" className="me-1 px-2">
                        Bitiş: {endDate}
                      </Badge>
                    )}
                    {personelHareketleri && (
                      <Badge color="primary" className="me-1 px-2">
                        Sadece Personel Hareketleri
                      </Badge>
                    )}
                  </div>
                </Alert>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div>
            <h5 className="mb-0">
              <i className="fas fa-history me-2 text-primary"></i>
              {personelHareketleri ? "Personel Hareketleri" : "Son Aktiviteler"}
            </h5>
          </div>

          <Badge color="dark" pill className="px-3 py-2">
            {isLoading ? (
              <>
                <Spinner size="sm" color="light" /> Yükleniyor...
              </>
            ) : (
              <></>
            )}
          </Badge>
        </div>

        <div className="table-responsive">
          <Table hover className="mb-0 align-middle" size="sm">
            <thead className="table-light">
              <tr>
                <th className="text-center">#</th>
                <th>Kullanıcı</th>
                <th>İşlem</th>
                <th>Hedef</th>
                <th>Tarih</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2 text-muted mb-0">
                      Veriler yükleniyor...
                    </p>
                  </td>
                </tr>
              ) : lastActivityList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <i className="fas fa-info-circle me-2 text-muted fs-4"></i>
                    <p className="mt-2 text-muted mb-0">Kayıt bulunamadı</p>
                  </td>
                </tr>
              ) : (
                lastActivityList.map((activity, index) => (
                  <tr key={activity._id}>
                    <td className="text-center fw-bold text-muted">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-2">
                          {activity.userID && activity.userID.name.charAt(0)}
                          {activity.userID && activity.userID.surname.charAt(0)}
                        </div>
                        <div>
                          {activity.userID && activity.userID.name}{" "}
                          {activity.userID && activity.userID.surname}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge
                        color={getActivityTypeColor(activity)}
                        className="px-2 py-1"
                      >
                        {activity.type.name}
                      </Badge>
                    </td>
                    {renderHedef(activity)}
                    <td>
                      <span className="text-muted">
                        <i className="far fa-clock me-1"></i>
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </td>
                    <td>
                      {activity.description ? (
                        <span className="text-wrap">
                          {activity.description}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {pageCount > 1 && (
          <div className="d-flex justify-content-center p-3">
            <Pagination
              aria-label="Sayfa navigasyonu"
              size="sm"
              className="mb-0"
            >
              <PaginationItem disabled={currentPage <= 1}>
                <PaginationLink first onClick={() => handlePaginationClick(1)}>
                  <i className="fas fa-angle-double-left"></i>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem disabled={currentPage <= 1}>
                <PaginationLink
                  previous
                  onClick={() => handlePaginationClick(currentPage - 1)}
                >
                  <i className="fas fa-angle-left"></i>
                </PaginationLink>
              </PaginationItem>

              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                let pageNum;
                if (pageCount <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pageCount - 2) {
                  pageNum = pageCount - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={i} active={pageNum === currentPage}>
                    <PaginationLink
                      onClick={() => handlePaginationClick(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem disabled={currentPage >= pageCount}>
                <PaginationLink
                  next
                  onClick={() => handlePaginationClick(currentPage + 1)}
                >
                  <i className="fas fa-angle-right"></i>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem disabled={currentPage >= pageCount}>
                <PaginationLink
                  last
                  onClick={() => handlePaginationClick(pageCount)}
                >
                  <i className="fas fa-angle-double-right"></i>
                </PaginationLink>
              </PaginationItem>
            </Pagination>
          </div>
        )}
      </Card>

      <style jsx>{`
        .avatar-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e0e0e0;
          color: #757575;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .aktiviteler-container {
          animation: fadeIn 0.5s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
