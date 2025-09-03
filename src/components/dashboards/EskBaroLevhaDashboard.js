import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Input,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  Alert,
} from "reactstrap";
import AYSNavbar from "../root/AYSNavbar";

export default function EskBaroLevhaDashboard() {
  const [search, setSearch] = useState({
    sicil: "",
    name: "",
    surname: "",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Arama kutusu değişikliği
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Arama işlemi
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/barolevha_proxy/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "list",
          sicil: search.sicil,
          name: search.name,
          surname: search.surname,
        }),
      });
      const data = await res.json();
      if (
        data.success &&
        Array.isArray(data.lawyers) &&
        data.lawyers.length > 0
      ) {
        setResults(data.lawyers);
      } else {
        setResults([]);
        setError("Sonuç bulunamadı.");
      }
    } catch {
      setError("Arama sırasında hata oluştu.");
    }
    setLoading(false);
  };

  // Detay modalı aç
  const openDetail = async (item) => {
    setDetailLoading(true);
    setShowModal(true);
    try {
      const res = await fetch("/api/barolevha_proxy/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "info",
          sicil: item.sicil,
        }),
      });
      const data = await res.json();
      if (data.success && data.lawyer) {
        setDetail(data.lawyer);
      } else {
        setDetail(null);
      }
    } catch {
      setDetail(null);
    }
    setDetailLoading(false);
  };

  // Detay modalı kapat
  const closeModal = () => {
    setShowModal(false);
    setDetail(null);

  };

  return (
    <div>
      <AYSNavbar />

      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h3 className="text-primary fw-bold">Eskişehir Barosu Levhası</h3>
            <p className="text-muted">
              Sicil numarası, ad veya soyad ile avukat arayabilirsiniz.
            </p>
          </Col>
        </Row>
        <Card className="mb-4">
          <CardBody>
            <Row className="g-2 align-items-end">
              <Col md={3}>
                <label className="form-label">Sicil No</label>
                <Input
                  name="sicil"
                  value={search.sicil}
                  onChange={handleChange}
                  placeholder="Sicil No"
                />
              </Col>
              <Col md={3}>
                <label className="form-label">Ad</label>
                <Input
                  name="name"
                  value={search.name}
                  onChange={handleChange}
                  placeholder="Ad"
                />
              </Col>
              <Col md={3}>
                <label className="form-label">Soyad</label>
                <Input
                  name="surname"
                  value={search.surname}
                  onChange={handleChange}
                  placeholder="Soyad"
                />
              </Col>
              <Col md={3}>
                <Button
                  color="primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Ara"}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
        {error && <Alert color="danger">{error}</Alert>}
        {results.length > 0 && (
          <Card>
            <CardBody>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Sicil No</th>
                    <th>Ad</th>
                    <th>Soyad</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => (
                    <tr
                      key={item.sicil}
                      style={{ cursor: "pointer" }}
                      onClick={() => openDetail(item)}
                    >
                      <td>{item.sicil}</td>
                      <td>{item.name}</td>
                      <td>{item.surname}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="text-muted small">
                Sonuçlardan birine tıklayarak detayları görebilirsiniz.
              </div>
            </CardBody>
          </Card>
        )}
        <Modal isOpen={showModal} toggle={closeModal}>
          <ModalHeader toggle={closeModal}>Avukat Detayı</ModalHeader>
          <ModalBody>
            {detailLoading ? (
              <div className="text-center py-4">
                <Spinner color="primary" />
              </div>
            ) : detail ? (
              <div>
                {detail.photoUrl && (
                  <div className="text-center mb-3">
                    <img
                      src={detail.photoUrl}
                      alt={detail.fullName}
                      style={{ maxWidth: "120px", borderRadius: "8px" }}
                    />
                  </div>
                )}
                <div className="mb-2">
                  <strong>Ad Soyad:</strong> {detail.fullName}
                </div>
                <div className="mb-2">
                  <strong>Sicil No:</strong> {detail.sicil}
                </div>
                <div className="mb-2">
                  <strong>Telefon:</strong> {detail.phone || "-"}
                </div>
                <div className="mb-2">
                  <strong>Faks:</strong> {detail.fax || "-"}
                </div>
                <div className="mb-2">
                  <strong>E-posta:</strong> {detail.email || "-"}
                </div>
                <div className="mb-2">
                  <strong>Adres:</strong> {detail.address || "-"}
                </div>
              </div>
            ) : (
              <Alert color="danger">Detay bilgisi alınamadı.</Alert>
            )}
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
}
