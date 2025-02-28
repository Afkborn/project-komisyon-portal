import React from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Row,
  Col,
} from "reactstrap";

export default function Kurum({ kurumlar, selectedKurum, setSelectedKurum }) {
  const handleKurumChange = (kurum) => {
    setSelectedKurum(kurum);
  };

  return (
    <div className="kurum-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-building me-2"></i>
            Kurum Listesi
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            Sistemde kayıtlı olan kurumlar listelenmektedir. İşlem yapmak
            istediğiniz kurumu seçiniz.
          </Alert>

          <Row>
            {kurumlar.map((kurum, index) => (
              <Col md={6} className="mb-3" key={kurum.id}>
                <Card
                  className={`h-100 ${
                    selectedKurum && selectedKurum.id === kurum.id
                      ? "border-danger"
                      : "border"
                  }`}
                  style={{
                    transition: "all 0.3s ease",
                    boxShadow:
                      selectedKurum && selectedKurum.id === kurum.id
                        ? "0 0 0 0.2rem rgba(220, 53, 69, 0.25)"
                        : "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardHeader
                    className={`d-flex justify-content-between align-items-center ${
                      selectedKurum && selectedKurum.id === kurum.id
                        ? "bg-danger text-white"
                        : "bg-light"
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      <Badge
                        color={
                          selectedKurum && selectedKurum.id === kurum.id
                            ? "light"
                            : "danger"
                        }
                        pill
                        className="me-2"
                      >
                        {index + 1}
                      </Badge>
                      <h5 className="mb-0 fw-bold">{kurum.name}</h5>
                    </div>

                    {kurum.status === false && (
                      <Badge color="warning" pill>
                        Pasif Kurum
                      </Badge>
                    )}
                  </CardHeader>

                  <CardBody className="pb-2">
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">
                        <i className="fas fa-layer-group me-2"></i>
                        Kurum Birimleri:
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {kurum.types.map((altBirim) => (
                          <Badge
                            color="light"
                            className="border text-dark"
                            key={altBirim.id}
                          >
                            {altBirim.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-end mt-3">
                      <Button
                        onClick={() => handleKurumChange(kurum)}
                        color={
                          selectedKurum && selectedKurum.id === kurum.id
                            ? "success"
                            : "danger"
                        }
                        size="sm"
                        disabled={kurum.status === false}
                        style={{ width: "120px" }}
                      >
                        {selectedKurum && selectedKurum.id === kurum.id ? (
                          <>
                            <i className="fas fa-check me-1"></i> Seçili
                          </>
                        ) : (
                          <>
                            <i className="fas fa-hand-pointer me-1"></i> Seç
                          </>
                        )}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {selectedKurum && (
            <Alert color="success" className="mt-4 d-flex align-items-center">
              <i className="fas fa-info-circle fs-4 me-3"></i>
              <div>
                <strong>{selectedKurum.name}</strong> kurumu seçildi. Soldaki
                menüden işlem yapabilirsiniz.
              </div>
            </Alert>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
