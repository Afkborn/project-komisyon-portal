import React, { useState, useEffect } from "react";
import {
  Button,
  Badge,
  Spinner,
  Label,
  FormGroup,
  Input,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Table,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";

export default function UnitMissingClerk({ token, selectedKurum }) {
  const [aramaYapilacakBirimler, setAramaYapilacakBirimler] = useState([]);
  const [eksikKatibiOlanBirimler, setEksikKatibiOlanBirimler] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getEksikKatipAramasiYapilacakBirimler = () => {
    setIsLoading(true);

    const configuration = {
      method: "GET",
      url:
        "/api/reports/eksikKatipAramasiYapilacakBirimler?institutionId=" +
        selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setAramaYapilacakBirimler(
          response.data.eksikKatipKontrolEdilecekBirimler
        );

        if (response.data.eksikKatipKontrolEdilecekBirimler.length === 0) {
          alertify.error("Rapor için birim bulunamadı.");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        console.log(errorMessage);
        alertify.error(errorMessage);
      });
  };

  useEffect(() => {
    if (token) {
      getEksikKatipAramasiYapilacakBirimler();
    }
    // eslint-disable-next-line
  }, [token]);

  const handleGetRapor = (e) => {
    setIsLoading(true);

    setEksikKatibiOlanBirimler([]);
    let configuration = {
      method: "GET",
      url:
        "/api/reports/eksikKatibiOlanBirimler?institutionId=" +
        selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setEksikKatibiOlanBirimler(response.data.eksikKatipOlanBirimler);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-clipboard-list me-2"></i>
            Eksik Katibi Olan Birimler
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            Bu rapor ile birlikte eksik katibi olan birimler listelenebilir.
          </Alert>

          <Card className="mb-4 border-light">
            <CardBody>
              <Row className="align-items-end">
                <Col md={8}>
                  <FormGroup>
                    <Label
                      for="kontrolEdilecekBirimListesi"
                      className="fw-bold"
                    >
                      <i className="fas fa-building me-1"></i>
                      Kontrol Edilecek Birim Listesi
                    </Label>
                    <Input
                      id="kontrolEdilecekBirimListesi"
                      multiple
                      name="selectMulti"
                      type="select"
                      disabled
                      className="form-control-sm"
                      style={{ height: "150px" }}
                    >
                      {aramaYapilacakBirimler.map((birim) => (
                        <option key={birim.id} value={birim.id}>
                          {birim.birimAdi}
                        </option>
                      ))}
                    </Input>
                    <small className="text-muted">
                      Toplam {aramaYapilacakBirimler.length} birim kontrol
                      edilecektir.
                    </small>
                  </FormGroup>
                </Col>
                <Col md={4} className="text-center">
                  <Button
                    disabled={aramaYapilacakBirimler.length === 0}
                    className="mt-3 w-100"
                    size="lg"
                    color="danger"
                    id="getRapor"
                    onClick={(e) => handleGetRapor(e)}
                  >
                    <i className="fas fa-file-alt me-2"></i>
                    Rapor Getir
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {isLoading && (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Rapor yükleniyor, lütfen bekleyiniz...
              </p>
            </div>
          )}

          {eksikKatibiOlanBirimler.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardBody>
                <h5 className="mb-3 text-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Eksik Katibi Olan Birimler ({
                    eksikKatibiOlanBirimler.length
                  }{" "}
                  birim)
                </h5>

                <div className="table-responsive">
                  <Table
                    hover
                    striped
                    className="border"
                    id="unitMissingClerkTable"
                  >
                    <thead className="table-light">
                      <tr>
                        <th>Birim Adı</th>
                        <th className="text-center">Gereken Katip Sayısı</th>
                        <th className="text-center">Mevcut Katip Sayısı</th>
                        <th className="text-center">Eksik Katip Sayısı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eksikKatibiOlanBirimler.map((birim) => (
                        <tr key={birim._id}>
                          <td>{birim.birimAdi}</td>
                          <td className="text-center">
                            {birim.gerekenKatipSayisi}
                          </td>
                          <td className="text-center">
                            {birim.mevcutKatipSayisi}
                          </td>
                          <td className="text-center">
                            <Badge
                              color={
                                birim.eksikKatipSayisi > 0
                                  ? "danger"
                                  : "success"
                              }
                              pill
                              style={{
                                fontSize: "0.9rem",
                                padding: "0.35em 0.65em",
                              }}
                            >
                              {birim.eksikKatipSayisi}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="mt-4">
                  <Button
                    className="me-2"
                    size="md"
                    id="exportPdf"
                    color="danger"
                    onClick={(e) => {
                      generatePdf(
                        document,
                        "unitMissingClerkTable",
                        "Eksik Katibi Olan Birimler Listesi",
                        "detayTD"
                      );
                    }}
                  >
                    <i className="fas fa-file-pdf me-1">PDF'e Aktar</i>{" "}
                  </Button>

                  <Button
                    size="md"
                    id="print"
                    color="secondary"
                    onClick={(e) => {
                      printDocument(
                        document,
                        "unitMissingClerkTable",
                        "detayTD"
                      );
                    }}
                  >
                    <i className="fas fa-print me-1"></i> Yazdır
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
