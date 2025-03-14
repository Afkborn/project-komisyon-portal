import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, CardHeader, CardBody, Alert } from "reactstrap";
import alertify from "alertifyjs";
import {
  renderDate_GGAAYYYY,
  calculateKalanGorevSuresi,
} from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import DataTable from "../../common/DataTable";

export default function UzaklastirilmisPersonel({ token, showPersonelDetay }) {
  const [uzaklastirilmisPersonelList, setUzaklastirilmisPersonelList] =
    useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

  const columns = [
    { key: "sicil", header: "Sicil No" },
    {
      key: "fullName",
      header: "Ad Soyad",
      render: (item) => `${item.ad} ${item.soyad}`,
    },
    {
      key: "kurum",
      header: "Kurum",
      render: (item) => item.birimID.institution.name,
    },
    {
      key: "birim",
      header: "Birim",
      render: (item) => item.birimID.name,
    },
    {
      key: "unvan",
      header: "Ünvan",
      render: (item) => item.title.name,
    },
    {
      key: "gerekce",
      header: "Gerekçe",
      render: (item) => item.suspensionReason || "BELİRTİLMEMİŞ",
    },
    {
      key: "bitisTarihi",
      header: "Bitiş Tarihi",
      render: (item) =>
        `${renderDate_GGAAYYYY(
          item.suspensionEndDate
        )} (${calculateKalanGorevSuresi(item.suspensionEndDate)})`,
    },
  ];

  const getGeciciPersonel = (e) => {
    const configuration = {
      method: "GET",
      url: "/api/persons/suspended",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setRaporGetiriliyorMu(true);
    axios(configuration)
      .then((response) => {
        setRaporGetiriliyorMu(false);
        if (response.data.personList.length === 0) {
          alertify.error("Uzaklaştırılmış personel bulunamadı.");
        } else {
          setUzaklastirilmisPersonelList(response.data.personList);
        }
      })
      .catch((error) => {
        alertify.error("Geçici personel listesi getirilirken bir hata oluştu.");
        setRaporGetiriliyorMu(false);
      });
  };

  const handleExportPdf = () => {
    generatePdf(
      document,
      "uzaklastirilmisPersonelTable",
      "Uzaklaştırılmış Personel Listesi",
      "detayTD"
    );
  };

  const handlePrint = () => {
    printDocument(document, "uzaklastirilmisPersonelTable", "detayTD", null, {
      title: "Uzaklaştırılmış Personel Listesi",
    });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-user-slash me-2"></i>
            Uzaklaştırılmış Personel Listesi
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            Bu rapor ile tüm kurumlardaki uzaklaştırılmış personellerin
            listesini görüntüleyebilirsiniz.
          </Alert>

          <Button
            color="danger"
            className="mb-4"
            onClick={getGeciciPersonel}
            size="lg"
            style={{ width: "200px" }}
          >
            <i className="fas fa-file-alt me-2"></i> Rapor Getir
          </Button>

          {raporGetiriliyorMu ? (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Rapor yükleniyor, bu işlem biraz zaman alabilir...
              </p>
            </div>
          ) : (
            uzaklastirilmisPersonelList.length > 0 && (
              <div className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardBody>
                    <h5 className="mb-3 text-danger">
                      <i className="fas fa-list me-2"></i>
                      Uzaklaştırılmış Personeller (
                      {uzaklastirilmisPersonelList.length} kişi)
                    </h5>
                    <DataTable
                      data={uzaklastirilmisPersonelList}
                      columns={columns}
                      onDetailClick={showPersonelDetay}
                      tableName="uzaklastirilmisPersonelTable"
                      generatePdf={handleExportPdf}
                      printTable={handlePrint}
                    />
                  </CardBody>
                </Card>
              </div>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
}
