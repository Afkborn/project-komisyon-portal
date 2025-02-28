import React, { useState } from "react";
import { Input, Label, Button, Form, Row, Col, Spinner } from "reactstrap";
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
      header: "Sicil No",
    },
    {
      key: "unvan",
      header: "Ünvan",
      render: (item) => item.unvan.name,
    },
    {
      key: "fullName",
      header: "Ad Soyad",
      render: (item) =>
        `${item.ad} ${item.soyad}${
          item.isTemporary ? " (Geçici Personel)" : ""
        }`,
    },
    {
      key: "birim",
      header: "Birim",
      render: (item) => item.birim,
    },
    {
      key: "izinTur",
      header: "İzin Türü",
      render: (item) => getIzinType(item.izinTur),
    },
    {
      key: "izinBaslangic",
      header: "Başlangıç Tarihi",
      render: (item) => renderDate_GGAAYYYY(item.izinBaslangic),
    },
    {
      key: "izinBitis",
      header: "Bitiş Tarihi",
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
    printDocument(document, "personelOnLeaveTable", "detayTD");
  };

  return (
    <div>
      <h3>Rapor - İzinde Olan Personel</h3>
      <span>
        Bu rapor sayesinde <b>tüm kurumlarda</b> tarih bazlı veya güncel olarak
        izinde olan personelleri listeyebilirsiniz.
      </span>
      <hr />

      <Form className="mb-4">
        <Row className="row-cols-lg-auto g-3 align-items-center">
          <Col>
            <Label check>
              <Input
                type="radio"
                name="searchBy"
                value="current"
                checked={searchBy === "current"}
                onChange={(e) => setSearchBy(e.target.value)}
              />{" "}
              Şuan İzinde Olanlar
            </Label>
          </Col>
          <Col>
            <Label check>
              <Input
                type="radio"
                name="searchBy"
                value="byDate"
                checked={searchBy === "byDate"}
                onChange={(e) => setSearchBy(e.target.value)}
              />{" "}
              Tarih Aralığında İzinde Olanlar
            </Label>
          </Col>
        </Row>

        {searchBy === "byDate" && (
          <Row className="mt-3">
            <Col md={3}>
              <Label for="startDate">Başlangıç Tarihi</Label>
              <Input
                type="date"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Label for="endDate">Bitiş Tarihi</Label>
              <Input
                type="date"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
          </Row>
        )}

        <Row className="mt-3">
          <Col md={4}>
            <Label for="reason">İzin Tipi</Label>
            <Input type="select" onChange={handleReasonChange}>
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
          </Col>
        </Row>

        <Button
          color="danger"
          className="mt-3"
          size="lg"
          onClick={handleFormSubmit}
        >
          Rapor Getir
        </Button>
      </Form>

      {loading ? (
        <div className="text-center">
          <Spinner color="primary" />
          <p>Rapor yükleniyor, lütfen bekleyiniz...</p>
        </div>
      ) : aramaYapildiMi && personelList.length === 0 ? (
        <div className="alert alert-info">Sonuç bulunamadı.</div>
      ) : (
        personelList.length > 0 && (
          <div className="mt-4">
            <h5>İzinde Olan Personeller ({personelList.length} kişi)</h5>
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
    </div>
  );
}
