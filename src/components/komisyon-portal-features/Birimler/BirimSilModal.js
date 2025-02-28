import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Badge,
  Spinner,
  Card,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

function BirimSilModal({ modal, toggle, birim, token, getBirimler }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);

    const configuration = {
      method: "DELETE",
      url: `/api/units/${birim?._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then(() => {
        alertify.success("Birim başarıyla silindi.");
        toggle();
        getBirimler();
      })
      .catch((error) => {
        let errorMessage =
          error.response?.data?.message || "Birim silinirken bir hata oluştu.";
        if (error.response?.data?.code === 400) {
          errorMessage =
            "Bu birim personel kayıtlarına bağlı olduğu için silinemez.";
        }
        alertify.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!birim) return null;

  return (
    <Modal isOpen={modal} toggle={toggle} backdrop="static">
      <ModalHeader toggle={toggle} className="bg-danger text-white">
        <i className="fas fa-trash-alt me-2"></i>
        Birim Silme İşlemi
      </ModalHeader>

      <ModalBody>
        <Alert color="warning" className="d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
          <div>
            <h6 className="alert-heading mb-1">DİKKAT!</h6>
            <p className="mb-0">
              Silme işlemi geri alınamaz. Birimi silmeden önce bu birimin
              altında yer alan personelleri başka bir birime aktarmanız
              gerekebilir.
            </p>
          </div>
        </Alert>

        <Card className="border shadow-sm mt-3">
          <div className="card-header bg-light">
            <h6 className="mb-0">
              <i className="fas fa-info-circle me-2 text-primary"></i>
              Silinecek Birim Detayları
            </h6>
          </div>

          <ListGroup flush>
            <ListGroupItem className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Birim Adı:</span>
              <span className="fw-bold">{birim.name}</span>
            </ListGroupItem>

            {birim.unitType && (
              <>
                <ListGroupItem className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Birim Tipi:</span>
                  <Badge color="primary" pill className="px-3 py-2">
                    {birim.unitType.name}
                  </Badge>
                </ListGroupItem>

                <ListGroupItem className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Birim Alanı:</span>
                  <Badge
                    color={
                      birim.unitType.unitType === "Ceza" ? "danger" : "success"
                    }
                    pill
                  >
                    {birim.unitType.unitType}
                  </Badge>
                </ListGroupItem>
              </>
            )}

            <ListGroupItem className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Durum:</span>
              {birim.status ? (
                <Badge color="success" pill>
                  Aktif
                </Badge>
              ) : (
                <Badge color="danger" pill>
                  Pasif
                </Badge>
              )}
            </ListGroupItem>

            {birim.delegationType && (
              <ListGroupItem className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Heyet Durumu:</span>
                {birim.delegationType === "heyet" ? (
                  <Badge color="dark">Heyet</Badge>
                ) : (
                  <Badge color="secondary">Tekli</Badge>
                )}
              </ListGroupItem>
            )}
          </ListGroup>
        </Card>

        <div className="mt-4 text-center">
          <h6 className="text-danger mb-3">
            Bu işlem geri alınamaz. Onaylıyor musunuz?
          </h6>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          <i className="fas fa-times-circle me-1"></i> Vazgeç
        </Button>{" "}
        <Button color="danger" onClick={handleDelete} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-1" /> Siliniyor...
            </>
          ) : (
            <>
              <i className="fas fa-trash-alt me-1"></i> Evet, Birimi Sil
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default BirimSilModal;
