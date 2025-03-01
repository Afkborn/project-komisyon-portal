import React, { useState, useEffect } from "react";
import {
  FormGroup,
  Input,
  Label,
  Badge,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Button,
  Row,
  Col,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import DataTable from "../../common/DataTable";

export default function TumPersonelListe({
  selectedKurum,
  token,
  showPersonelDetay,
  unvanlar,
}) {
  const [personeller, setPersoneller] = useState([]);
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [selectedUnvan, setSelectedUnvan] = useState(undefined);
  const [isDurusmaKatibiChecked, setIsDurusmaKatibiChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    {
      key: "sicil",
      header: "Sicil No",
      render: (item) => (
        <span className="fw-bold text-secondary">{item.sicil}</span>
      ),
    },
    {
      key: "fullName",
      header: "Ad Soyad",
      render: (item) => (
        <div className="d-flex align-items-center">
          <div
            className="avatar-circle me-2"
            style={{
              backgroundColor: stringToColor(item.ad + item.soyad),
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {item.ad.charAt(0)}
            {item.soyad.charAt(0)}
          </div>
          <span className="fw-bold">
            {item.ad} {item.soyad}
          </span>
        </div>
      ),
    },
    {
      key: "unvan",
      header: "Ünvan",
      render: (item) => (
        <div>
          <Badge color="danger" pill className="me-1">
            {item.title.name}
          </Badge>
          {item.durusmaKatibiMi && (
            <Badge color="warning" pill className="ms-1">
              Duruşma
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Açıklama",
      render: (item) => (
        <div>
          {item.description && (
            <span className="text-muted">{item.description}</span>
          )}
          <div className="mt-1">
            {item.level && (
              <Badge color="success" pill className="me-1">
                Seviye {item.level}
              </Badge>
            )}
            {item.isTemporary && (
              <Badge color="info" pill className="me-1">
                Geçici
              </Badge>
            )}
            {item.izindeMi && (
              <Badge color="danger" pill className="me-1">
                İzinde
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "birim",
      header: "Birim",
      render: (item) => (
        <Badge color="light" className="text-dark border">
          {item.birimID.name}
        </Badge>
      ),
    },
  ];

  useEffect(() => {
    if (selectedKurum && personeller.length === 0) {
      getPersoneller();
    }
    // eslint-disable-next-line
  }, [selectedKurum]);

  const getPersoneller = () => {
    setLoadSpinner(true);
    const configuration = {
      method: "GET",
      url: "/api/persons?institutionId=" + selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        // Sort by title.oncelikSirasi, then birimID.oncelikSirasi, and finally birimID.series
        const sortedPersonel = response.data.personList.sort((a, b) => {
          const titleComparison = a.title.oncelikSirasi - b.title.oncelikSirasi;
          if (titleComparison !== 0) return titleComparison;

          const birimOncelikComparison =
            a.birimID.oncelikSirasi - b.birimID.oncelikSirasi;
          if (birimOncelikComparison !== 0) return birimOncelikComparison;

          return a.birimID.series - b.birimID.series;
        });

        setPersoneller(sortedPersonel);
        setLoadSpinner(false);
      })
      .catch((error) => {
        console.log(error);
        alertify.error("Personel listesi alınırken bir hata oluştu");
        setLoadSpinner(false);
      });
  };

  const handleUnvanChange = (e) => {
    setSelectedUnvan(
      e.target.value === "0"
        ? undefined
        : unvanlar.find((u) => u.name === e.target.value)
    );
  };

  const getFilteredData = () => {
    let filtered = [...personeller];

    if (selectedUnvan && selectedUnvan.name !== "0") {
      filtered = filtered.filter((p) => p.title.name === selectedUnvan.name);
    }

    if (isDurusmaKatibiChecked) {
      filtered = filtered.filter((p) => p.durusmaKatibiMi === true);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sicil.toString().includes(searchTerm) ||
          (p.birimID.name &&
            p.birimID.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  // İsim ve soyisime göre renk üretme fonksiyonu
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      "#4e79a7",
      "#f28e2c",
      "#e15759",
      "#76b7b2",
      "#59a14f",
      "#edc949",
      "#af7aa1",
      "#ff9da7",
      "#9c755f",
      "#bab0ab",
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const filteredData = getFilteredData();

  return (
    <div className="personel-liste-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Tüm Personel Listesi
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <span>
              {selectedKurum && <strong>{selectedKurum.name}</strong>} kurumuna
              kayıtlı tüm personeller listelenmektedir. Arama yapabilir veya
              ünvana göre filtreleyebilirsiniz.
            </span>
          </Alert>

          <Card className="border-0 shadow-sm mb-4">
            <CardBody className="bg-light">
              <Row className="g-3">
                <Col md={4}>
                  <FormGroup>
                    <Label for="selectUnvan" className="fw-bold">
                      <i className="fas fa-user-tie me-1"></i> Ünvan Filtresi
                    </Label>
                    <Input
                      type="select"
                      name="selectUnvan"
                      id="selectUnvan"
                      onChange={handleUnvanChange}
                      className="form-select"
                      value={selectedUnvan ? selectedUnvan.name : "0"}
                    >
                      <option value="0">Tüm Ünvanlar</option>
                      {unvanlar.map((unvan) => (
                        <option key={unvan.name} value={unvan.name}>
                          {unvan.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label for="searchInput" className="fw-bold">
                      <i className="fas fa-search me-1"></i> Personel Ara
                    </Label>
                    <InputGroup>
                      <Input
                        type="text"
                        id="searchInput"
                        placeholder="Ad, Soyad, Sicil veya Birim..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <InputGroupText
                          style={{ cursor: "pointer" }}
                          onClick={() => setSearchTerm("")}
                        >
                          <i className="fas fa-times"></i>
                        </InputGroupText>
                      )}
                    </InputGroup>
                  </FormGroup>
                </Col>

                <Col md={4} className="d-flex align-items-end">
                  {selectedUnvan && selectedUnvan.kind === "zabitkatibi" && (
                    <FormGroup check className="ms-2 mb-3">
                      <Input
                        type="checkbox"
                        id="durusmaKatibiCheck"
                        onChange={(e) =>
                          setIsDurusmaKatibiChecked(e.target.checked)
                        }
                        checked={isDurusmaKatibiChecked}
                      />
                      <Label check for="durusmaKatibiCheck">
                        <Badge color="warning" pill className="me-1">
                          Duruşma
                        </Badge>
                        Sadece Duruşma Katipleri
                      </Label>
                    </FormGroup>
                  )}

                  <Button
                    color="secondary"
                    className="ms-auto mb-3"
                    onClick={getPersoneller}
                    title="Listeyi Yenile"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {loadSpinner ? (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">Personel listesi yükleniyor...</p>
            </div>
          ) : personeller.length === 0 ? (
            <Alert color="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Personel bulunamadı.
            </Alert>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Personel Listesi
                  <Badge color="danger" pill className="ms-2">
                    {filteredData.length} personel
                  </Badge>
                </h5>

                {personeller.length !== filteredData.length && (
                  <Badge color="info" pill>
                    Filtrelendi: {filteredData.length} / {personeller.length}
                  </Badge>
                )}
              </div>

              <DataTable
                data={filteredData}
                columns={columns}
                onDetailClick={showPersonelDetay}
                tableName="tumPersonelTable"
                initialPageSize={50}
                tableClassName="table-hover"
                striped={true}
                customRowClassName={(row) =>
                  row.izindeMi ? "table-danger bg-opacity-25" : ""
                }
                // Sıralama işlemi DataTable içinde ele alınacak
                disableExternalSort={false}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
