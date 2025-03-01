import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Tooltip,
  Badge,
  Alert,
  Card,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import {
  FaBuilding,
  FaInfoCircle,
  FaClipboard,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

function BirimGuncelleModal({ modal, toggle, birim, token, getBirimler }) {
  const [updatedBirim, setUpdatedBirim] = useState({ ...birim });
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const toolTipToogle = () => setTooltipOpen(!tooltipOpen);

  const handleCancel = () => {
    setUpdatedBirim({ ...birim });
    setFormChanged(false);
    toggle();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBirim({
      ...updatedBirim,
      [name]: value,
    });
    setFormChanged(true);
  };

  useEffect(() => {
    setUpdatedBirim({ ...birim });
    setFormChanged(false);
    setIdCopied(false);
  }, [birim]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(birim._id);
    setIdCopied(true);
    alertify.success("ID Kopyalandı");

    setTimeout(() => {
      setIdCopied(false);
    }, 2000);
  };

  const handleUpdate = () => {
    setLoading(true);
    const configuration = {
      method: "PUT",
      url: "api/units/" + birim._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: updatedBirim,
    };
    axios(configuration)
      .then(() => {
        alertify.success("Birim başarıyla güncellendi.");
        getBirimler();
        setLoading(false);
        setFormChanged(false);
        toggle();
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        alertify.error("Birim güncellenirken bir hata oluştu.");
      });
  };

  const cardStyle = {
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    marginBottom: "15px",
  };

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle} className="modal-lg">
        <ModalHeader toggle={toggle} className="bg-light">
          <div className="d-flex align-items-center">
            <FaBuilding className="mr-2" size={20} />
            <span className="font-weight-bold">Birim Güncelle</span>
          </div>
        </ModalHeader>

        <ModalBody className="px-4 py-4">
          {birim && (
            <Form>
              <Card className="mb-4" style={cardStyle} body>
                <h6 className="text-muted mb-3">Birim Kimlik Bilgileri</h6>
                <div className="d-flex justify-content-between">
                  <FormGroup className="mb-0">
                    <Label id="kurumDisiID" className="text-muted small">
                      Kurum ID <FaInfoCircle id="infoIcon" className="ml-1" />
                    </Label>
                    <Tooltip
                      placement="right"
                      isOpen={tooltipOpen}
                      target="infoIcon"
                      toggle={toolTipToogle}
                    >
                      Kurum ID numarası geçici personeli kurum dışında bir
                      birime atamak için kullanılır.
                    </Tooltip>
                    <InputGroup>
                      <Input
                        type="text"
                        value={birim._id}
                        disabled
                        className="bg-light text-muted"
                      />
                      <Button
                        color={idCopied ? "success" : "secondary"}
                        onClick={handleCopyId}
                        className="d-flex align-items-center"
                      >
                        {idCopied ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaClipboard className="mr-1" />
                        )}
                        {idCopied ? "Kopyalandı" : "Kopyala"}
                      </Button>
                    </InputGroup>
                  </FormGroup>
                </div>
              </Card>

              <Card className="mb-3" style={cardStyle} body>
                <h6 className="text-muted mb-3">Birim Tip Bilgileri</h6>
                <div className="d-flex flex-wrap">
                  <FormGroup className="mb-3 mr-4">
                    <Label for="unitTypeName" className="text-muted small">
                      Birim Tipi
                    </Label>
                    <div>
                      <Badge color="info" pill className="px-3 py-2">
                        {birim.unitType.name}
                      </Badge>
                    </div>
                  </FormGroup>
                  {birim.isMahkeme && (
                    <FormGroup className="mb-3">
                      <Label for="unitTypeType" className="text-muted small">
                        Alt Birim Tipi
                      </Label>
                      <div>
                        <Badge color="primary" pill className="px-3 py-2">
                          {birim.unitType.unitType}
                        </Badge>
                      </div>
                    </FormGroup>
                  )}
                </div>
              </Card>

              <Card className="mb-3" style={cardStyle} body>
                <h6 className="text-muted mb-3">Birim Detay Bilgileri</h6>
                <div className="row">
                  <div className="col-md-6">
                    <FormGroup>
                      <Label for="birimAdi" className="text-muted small">
                        Birim Adı <span className="text-danger">*</span>
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <FaBuilding size={14} />
                        </InputGroupText>
                        <Input
                          type="text"
                          name="name"
                          id="birimAdi"
                          placeholder="Birim Adı"
                          value={updatedBirim.name}
                          onChange={handleInputChange}
                          required
                          className="shadow-none"
                        />
                      </InputGroup>
                    </FormGroup>

                    <FormGroup>
                      <Label for="minKatipSayi" className="text-muted small">
                        Gerekli Minimum Katip Sayısı
                      </Label>
                      <InputGroup>
                        <InputGroupText>#</InputGroupText>
                        <Input
                          type="number"
                          name="minClertCount"
                          id="minKatipSayi"
                          placeholder="Gerekli Katip Sayısı"
                          value={updatedBirim.minClertCount}
                          min={1}
                          onChange={handleInputChange}
                          className="shadow-none"
                        />
                      </InputGroup>
                    </FormGroup>
                  </div>

                  <div className="col-md-6">
                    {birim.isMahkeme && (
                      <FormGroup>
                        <Label for="sira" className="text-muted small">
                          Sıra
                        </Label>
                        <InputGroup>
                          <InputGroupText>#</InputGroupText>
                          <Input
                            type="number"
                            name="series"
                            id="sira"
                            placeholder="Sıra"
                            value={updatedBirim.series}
                            min={1}
                            onChange={handleInputChange}
                            className="shadow-none"
                          />
                        </InputGroup>
                      </FormGroup>
                    )}

                    <FormGroup>
                      <Label for="status" className="text-muted small">
                        Durum
                      </Label>
                      <Input
                        type="select"
                        name="status"
                        id="status"
                        value={updatedBirim.status}
                        onChange={handleInputChange}
                        className="shadow-none"
                      >
                        <option value={true}>Aktif</option>
                        <option value={false}>Pasif</option>
                      </Input>
                    </FormGroup>

                    {birim.isMahkeme && (
                      <FormGroup>
                        <Label for="heyetSayi" className="text-muted small">
                          Heyet Sayısı
                        </Label>
                        <Input
                          type="select"
                          name="delegationType"
                          id="heyetSayi"
                          value={updatedBirim.delegationType}
                          onChange={handleInputChange}
                          className="shadow-none"
                        >
                          <option value={"1"}>1</option>
                          <option value={"1/2"}>1/2</option>
                          <option value={"1/3"}>1/3</option>
                        </Input>
                      </FormGroup>
                    )}
                  </div>
                </div>
              </Card>

              {formChanged && (
                <Alert color="warning" className="d-flex align-items-center">
                  <FaExclamationTriangle className="mr-2" size={20} />
                  <div>
                    Birim bilgilerinde değişiklik yaptınız. Değişiklikleri
                    kaydetmek için "Güncelle" butonuna tıklayınız.
                  </div>
                </Alert>
              )}
            </Form>
          )}
        </ModalBody>
        <ModalFooter className="bg-light">
          <Button
            color="success"
            onClick={handleUpdate}
            disabled={loading || !formChanged}
            className="px-4"
          >
            {loading ? "Güncelleniyor..." : "Güncelle"}
          </Button>{" "}
          <Button color="secondary" onClick={handleCancel} disabled={loading}>
            İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default BirimGuncelleModal;
