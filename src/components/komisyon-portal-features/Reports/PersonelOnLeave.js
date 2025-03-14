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
import { getIzinType } from "../../actions/IzinActions";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import alertify from "alertifyjs";
import DataTable from "../../common/DataTable";

export default function PersonelOnLeave({ token, showPersonelDetay }) {
  const [searchBy, setSearchBy] = useState("current");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState("");
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
      key: "izinTur",
      header: "İzin Türü",
      dataType: "string",
      render: (item) => getIzinType(item.izinTur),
    },
    {
      key: "izinBaslangic",
      header: "Başlangıç Tarihi",
      dataType: "date",
      render: (item) => renderDate_GGAAYYYY(item.izinBaslangic),
    },
    {
      key: "izinBitis",
      header: "Bitiş Tarihi",
      dataType: "date",
      render: (item) => renderDate_GGAAYYYY(item.izinBitis),
    },
  ];

  const handleReasonChange = (e) => {
    if (e.target.value === "Tüm İzin Türleri") {
      setReason("");
      return;
    }
    setReason(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setPersonelList([]);
    setLoading(true);

    let url = "/api/reports/izinliPersoneller";
    if (searchBy === "byDate") {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    if (reason) {
      url += `${url.includes("?") ? "&" : "?"}reason=${reason}`;
    }

    axios({
      method: "GET",
      url: url,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const sortedList = response.data.izinliPersonelList.sort(
          (a, b) => a.unvan.oncelikSirasi - b.unvan.oncelikSirasi
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
      "personelOnLeaveTable",
      "İzinde Olan Personel",
      "detayTD",
      true
    );
  };

  const handlePrint = () => {
    printDocument(document, "personelOnLeaveTable", "detayTD", null, {
      title: "İzinde Olan Personel",
    });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">İzinde Olan Personel</h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            Bu rapor sayesinde <b>tüm kurumlarda</b> tarih bazlı veya güncel
            olarak izinde olan personelleri listeyebilirsiniz.
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
                        value="current"
                        checked={searchBy === "current"}
                        onChange={(e) => setSearchBy(e.target.value)}
                      />
                      <Label check>Şuan İzinde Olanlar</Label>
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
                      <Label check>Tarih Aralığında İzinde Olanlar</Label>
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

                <Row className="mb-3">
                  <Col md={4}>
                    <FormGroup>
                      <Label for="reason">İzin Tipi</Label>
                      <Input
                        type="select"
                        id="reason"
                        onChange={handleReasonChange}
                        className="form-control-sm"
                      >
                        <option>Tüm İzin Türleri</option>
                        <option value="YILLIK_IZIN">Yıllık İzin</option>
                        <option value="RAPOR_IZIN">Raporlu İzin</option>
                        <option value="UCRETSIZ_IZIN">Ücretsiz İzin</option>
                        <option value="MAZERET_IZIN">Mazeret İzin</option>
                        <option value="DOGUM_IZIN">Doğum İzni</option>
                        <option value="OLUM_IZIN">Ölüm İzni</option>
                        <option value="EVLENME_IZIN">Evlenme İzni</option>
                        <option value="REFAKAT_IZIN">Refakat İzni</option>
                        <option value="DIGER_IZIN">Diğer</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

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
                  İzinde Olan Personeller ({personelList.length} kişi)
                </h5>
                <DataTable
                  data={personelList}
                  columns={columns}
                  onDetailClick={showPersonelDetay}
                  tableName="personelOnLeaveTable"
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
