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
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

export default function Aktiviteler({
  token,
  showPersonelDetay,
  showBirimPersonelListe,
}) {
  const [lastActivityList, setLastActivityList] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // pageSize doesn't change, no need to use setPageSize
  const [isLoading, setIsLoading] = useState(false);

  const [userList, setUserList] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [filtreVarMi, setFiltreVarMi] = useState(false);

  const handleFilterTypeChange = (e) => {
    if (e.target.value === "") {
      setFilterType("");
    } else {
      setFilterType(e.target.value);
    }
  };

  const handleStartDateChange = (e) => {
    if (e.target.value === "") {
      setStartDate(null);
    } else {
      setStartDate(e.target.value);
    }
  };

  const handleEndDateChange = (e) => {
    if (e.target.value === "") {
      setEndDate(null);
    } else {
      setEndDate(e.target.value);
    }
  };

  const handleUserSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "") {
      setSelectedUser(null); // Seçim yapılmadığında null olarak ayarlayın
      return; // Boş seçildiğinde işlemi durdurun
    }
    setSelectedUser(selectedValue);
  };

  const handleClearFilter = () => {
    setSelectedUser("");
    setFilterType("");
    setStartDate(null);
    setEndDate(null);
  };

  useEffect(() => {
    getLastActivityList(); // Fetch data when currentPage changes
    // eslint-disable-next-line
    if (userList.length === 0) {
      getUserList();
    }
  }, [currentPage, filterType, selectedUser, startDate, endDate]);

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
      setCurrentPage(pageNumber); // No need to call getLastActivityList, useEffect will handle it
    }
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

  const getLastActivityList = () => {
    setFiltreVarMi(false);
    setIsLoading(true);
    let url = `/api/activities/?page=${currentPage}&pageSize=${pageSize}&maxPageCount=10`;
    if (filterType !== "") {
      url += `&filterType=${filterType}`;
      setFiltreVarMi(true);
    }
    if (startDate) {
      url += `&startDate=${startDate}`;
      setFiltreVarMi(true);
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
      setFiltreVarMi(true);
    }
    if (selectedUser) {
      url += `&userID=${selectedUser}`;
      setFiltreVarMi(true);
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
        setPageCount(response.data.pageCount); // Update page count correctly
        setIsLoading(false);
      })
      .catch((error) => {
        let errorMessage = error.response?.data?.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <h5>Son Aktiviteler </h5>
      <div>
        <Row>
          <Col>
            <FormGroup>
              <Label for="userSelect">Kullanıcı</Label>
              <Input
                type="select"
                name="select"
                id="userSelect"
                onChange={handleUserSelectChange}
                value={selectedUser || ""}
              >
                <option value="">Seçiniz</option>{" "}
                {userList &&
                  userList.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} {user.surname}
                    </option>
                  ))}
              </Input>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label for="filterType">İşlem</Label>
              <Input
                type="select"
                name="select"
                id="filterType"
                value={filterType || ""}
                onChange={handleFilterTypeChange}
              >
                <option value={""}>Seçiniz</option>
                <option value={"person"}>Personel</option>
                <option value={"unit"}>Birim</option>
                <option value={"title"}>Ünvan</option>
                <option value={"report"}>Rapor</option>
              </Input>
            </FormGroup>
          </Col>

          <Col>
            <FormGroup>
              <Label for="startDateTime">Başlangıç Tarihi</Label>
              <Input
                type="date"
                name="date"
                id="startDateTime"
                value={startDate || ""}
                onChange={handleStartDateChange}
              />
            </FormGroup>
          </Col>

          <Col>
            <FormGroup>
              <Label for="endDateTime">Bitiş Tarihi</Label>
              <Input
                type="date"
                name="date"
                id="endDateTime"
                onChange={handleEndDateChange}
                value={endDate || ""}
              />
            </FormGroup>
          </Col>

          <Button
            hidden={!filtreVarMi}
            onClick={handleClearFilter}
            color="danger"
          >
            Filtre sıfırla
          </Button>
        </Row>
      </div>

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
          {isLoading ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                <Spinner color="primary" /> {/* Spinner shown while loading */}
              </td>
            </tr>
          ) : (
            lastActivityList.map((activity, index) => (
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
            ))
          )}
        </tbody>
      </Table>

      {pageCount > 1 && (
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
        </div>
      )}
    </div>
  );
}
