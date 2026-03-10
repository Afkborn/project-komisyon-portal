import React, { useState } from "react";
import {
  Button,
  Input,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Badge,
  Form,
  FormGroup,
  Label,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import { FaImages, FaUpload, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function FotografAktar({ token }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewSiciller, setPreviewSiciller] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successfulSicils, setSuccessfulSicils] = useState([]);
  const [failedSicils, setFailedSicils] = useState([]);

  const normalizeSicilList = (list) => {
    if (!Array.isArray(list)) return [];

    return list
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return String(item);
        }
        if (item?.sicil !== undefined && item?.sicil !== null) {
          return String(item.sicil);
        }
        if (item?.sicilNo !== undefined && item?.sicilNo !== null) {
          return String(item.sicilNo);
        }
        return "";
      })
      .filter(Boolean);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    const siciller = files
      .map((file) => file.name.replace(/\.[^/.]+$/, "").trim())
      .filter(Boolean);

    setSelectedFiles(files);
    setPreviewSiciller(siciller);
    setSuccessfulSicils([]);
    setFailedSicils([]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      alertify.error("Lutfen en az bir fotograf secin");
      return;
    }

    setUploading(true);
    setSuccessfulSicils([]);
    setFailedSicils([]);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await axios({
        method: "POST",
        url: "/api/persons/bulk-photo",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: formData,
      });

      const responseData = response?.data || {};
      const successful = normalizeSicilList(
        responseData.successful || responseData.success || [],
      );
      const failed = normalizeSicilList(
        responseData.failed || responseData.notFound || [],
      );

      setSuccessfulSicils(successful);
      setFailedSicils(failed);

      alertify.success("Toplu fotograf yukleme islemi tamamlandi");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Bir hata olustu. Fotograf aktarimi tamamlanamadi.";
      alertify.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fotograf-aktar-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-primary text-white">
          <h3 className="mb-0">
            <FaImages className="me-2" />
            Aktarim - Toplu Fotograf Yukleme
          </h3>
        </CardHeader>

        <CardBody>
          <Alert color="info" className="mb-4">
            Personellere ait fotograflari toplu olarak yukleyebilirsiniz.
            Dosya adlarinizin sicil ile eslesecek sekilde duzenli oldugundan emin
            olunuz.
          </Alert>

          <Form onSubmit={handleUpload}>
            <Row>
              <Col lg={8}>
                <FormGroup>
                  <Label for="bulkPhotoInput" className="fw-bold">
                    Fotograf Dosyalari (JPG, JPEG, PNG)
                  </Label>
                  <Input
                    id="bulkPhotoInput"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />

                  {previewSiciller.length > 0 && (
                    <div className="mt-3">
                      <Label className="fw-bold mb-2 d-block">
                        Secilen Siciller (Guncellenecek):
                      </Label>
                      <div className="d-flex flex-wrap">
                        {previewSiciller.map((sicil, index) => (
                          <Badge
                            key={`${sicil}-${index}`}
                            color="secondary"
                            className="me-1 mb-1"
                          >
                            {sicil}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </FormGroup>
              </Col>

              <Col lg={4} className="d-flex align-items-end">
                <Button
                  color="primary"
                  className="w-100"
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                >
                  {uploading ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Yukleniyor...
                    </>
                  ) : (
                    <>
                      <FaUpload className="me-2" /> Fotograflari Yukle
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>

          <div className="mt-2 text-muted">
            Secilen dosya sayisi: <strong>{selectedFiles.length}</strong>
          </div>

          {(successfulSicils.length > 0 || failedSicils.length > 0) && (
            <div className="mt-4">
              {successfulSicils.length > 0 && (
                <Alert color="success" className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaCheckCircle className="me-2" />
                    <strong>Basariyla guncellenen siciller:</strong>
                  </div>
                  <div>
                    {successfulSicils.map((sicil) => (
                      <Badge key={`ok-${sicil}`} color="success" className="me-1 mb-1">
                        {sicil}
                      </Badge>
                    ))}
                  </div>
                </Alert>
              )}

              {failedSicils.length > 0 && (
                <Alert color="danger" className="mb-0">
                  <div className="d-flex align-items-center mb-2">
                    <FaTimesCircle className="me-2" />
                    <strong>Sistemde bulunamayan siciller (Yuklenmedi):</strong>
                  </div>
                  <div>
                    {failedSicils.map((sicil) => (
                      <Badge key={`fail-${sicil}`} color="danger" className="me-1 mb-1">
                        {sicil}
                      </Badge>
                    ))}
                  </div>
                </Alert>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
