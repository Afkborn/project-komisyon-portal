import React, { useState } from "react";
import {
  Input,
  Label,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Alert,
  FormGroup,
} from "reactstrap";
import axios from "axios";
import { renderDate_GGAAYYYY } from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import alertify from "alertifyjs";
import DataTable from "../../common/DataTable";

export default function YariZamanliCalisanPersonel({
  token,
  showPersonelDetay,
}) {
  const [searchBy, setSearchBy] = useState("active");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [personelList, setPersonelList] = useState([]);
  const [aramaYapildiMi, setAramaYapildiMi] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      key: "sicil",
      dataType: "number",
      header: "Sicil No",
    },
    {
      key: "unvan",
      header: "Ünvan",
      dataType: "string",
      render: (item) => item.unvan.name,
    },
    {
      key: "fullName",
      header: "Ad Soyad",
      dataType: "string",
      render: (item) =>
        `${item.ad} ${item.soyad}${
          item.isTemporary ? " (Geçici Personel)" : ""
        }`,
    },
    {
      key: "birim",
      header: "Birim",
      dataType: "string",
      render: (item) => item.birim,
    },
    {
      key: "partTimeStartDate",
      header: "Başlangıç Tarihi",
      dataType: "date",
      render: (item) => renderDate_GGAAYYYY(item.partTimeStartDate),
    },
    {
      key: "partTimeEndDate",
      header: "Bitiş Tarihi",
      dataType: "date",
      render: (item) => renderDate_GGAAYYYY(item.partTimeEndDate),
    },
    {
      key: "partTimeReason",
      header: "Gerekçe",
      dataType: "string",
      render: (item) => item.partTimeReason || "-",
    },
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setPersonelList([]);
    setLoading(true);

    let url = "/api/reports/partTimePersonnel";
    if (searchBy === "active") {
      url += "?status=active";
    } else if (searchBy === "byDate") {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    axios({
      method: "GET",
      url: url,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const sortedList = response.data.partTimePersonnelList.sort(
          (a, b) => a.unvan.oncelikSirasi - b.unvan.oncelikSirasi,
        );
        setPersonelList(sortedList);
        setAramaYapildiMi(true);
        setLoading(false);
      })
      .catch((error) => {
        alertify.error("Veriler alınırken bir hata oluştu");
        setAramaYapildiMi(true);
        setLoading(false);
      });
  };

  const handleExportPdf = () => {
    generatePdf(
      document,
      "yariZamanliCalisanTable",
      "Yarı Zamanlı Çalışan Personel",
      "detayTD",
      true,
    );
  };

  const handlePrint = () => {
    printDocument(document, "yariZamanliCalisanTable", "detayTD", null, {
      title: "Yarı Zamanlı Çalışan Personel",
    });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">Yarı Zamanlı Çalışan Personel</h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            Bu rapor sayesinde <b>tüm kurumlarda</b> yarı zamanlı çalışan
            personelleri listeleyebilirsiniz.
          </Alert>

          <Card className="mb-4 border-light">
            <CardBody>
              <Form>
                <Row className="row-cols-lg-auto g-3 align-items-center mb-3">
                  <Col>
                    <FormGroup check inline>
                      <Input
                        type="radio"
                        name="searchBy"
                        value="active"
                        checked={searchBy === "active"}
                        onChange={(e) => setSearchBy(e.target.value)}
                      />
                      <Label check>Şuan Aktif Olanlar</Label>
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup check inline>
                      <Input
                        type="radio"
                        name="searchBy"
                        value="byDate"
                        checked={searchBy === "byDate"}
                        onChange={(e) => setSearchBy(e.target.value)}
                      />
                      <Label check>Tarih Aralığında Olanlar</Label>
                    </FormGroup>
                  </Col>
                </Row>

                {searchBy === "byDate" && (
                  <Row className="mb-3">
                    <Col md={3}>
                      <FormGroup>
                        <Label for="startDate">Başlangıç Tarihi</Label>
                        <Input
                          type="date"
                          name="startDate"
                          id="startDate"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="form-control-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label for="endDate">Bitiş Tarihi</Label>
                        <Input
                          type="date"
                          name="endDate"
                          id="endDate"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="form-control-sm"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                )}

                <Button
                  color="danger"
                  size="lg"
                  onClick={handleFormSubmit}
                  style={{ width: "200px" }}
                >
                  <i className="fas fa-file-alt me-2"></i> Rapor Getir
                </Button>
              </Form>
            </CardBody>
          </Card>

          {loading ? (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Rapor yükleniyor, lütfen bekleyiniz...
              </p>
            </div>
          ) : aramaYapildiMi && personelList.length === 0 ? (
            <Alert color="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Arama kriterlerinize uygun sonuç bulunamadı.
            </Alert>
          ) : (
            personelList.length > 0 && (
              <div className="mt-4">
                <h5 className="mb-3">
                  <i className="fas fa-users me-2"></i>
                  Yarı Zamanlı Çalışan Personeller ({personelList.length} kişi)
                </h5>
                <DataTable
                  data={personelList}
                  columns={columns}
                  onDetailClick={showPersonelDetay}
                  tableName="yariZamanliCalisanTable"
                  generatePdf={handleExportPdf}
                  printTable={handlePrint}
                  initialPageSize={30}
                />
              </div>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
}
