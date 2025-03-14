import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, CardHeader, CardBody, Alert } from "reactstrap";
import alertify from "alertifyjs";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import DataTable from "../../common/DataTable";

export default function SehitGaziYakiniPersonel({ token, showPersonelDetay }) {
  const [sehitGaziYakiniPersonelList, setSehirGaziYakiniPersonelList] =
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
  ];

  const getSehitGaziyakiniPersonel = (e) => {
    const configuration = {
      method: "GET",
      url: "/api/persons/martyrRelative",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setRaporGetiriliyorMu(true);
    axios(configuration)
      .then((response) => {
        setRaporGetiriliyorMu(false);
        if (response.data.personList.length === 0) {
          alertify.error("Şehit/Gazi yakını personel bulunamadı.");
        } else {
          setSehirGaziYakiniPersonelList(response.data.personList);
        }
      })
      .catch((error) => {
        let errorMessage =
          error.response.data.message ||
          "Şehit/Gazi yakını personel listesi getirilirken bir hata oluştu.";
        alertify.error(errorMessage);
        setRaporGetiriliyorMu(false);
      });
  };

  const handleExportPdf = () => {
    generatePdf(
      document,
      "sehitGaziYakiniPersonelTable",
      "Şehit/Gazi Yakını Personel Listesi",
      "detayTD"
    );
  };

  const handlePrint = () => {
    printDocument(document, "sehitGaziYakiniPersonelTable", "detayTD", null, {
      title: "Şehit/Gazi Yakını Personel Listesi",
    });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-users me-2"></i>
            Şehit/Gazi Yakını Personel Listesi
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            Bu rapor ile tüm kurumlardaki şehit/gazi yakını olan personellerin
            listesini görüntüleyebilirsiniz.
          </Alert>

          <Button
            color="danger"
            className="mb-4"
            onClick={getSehitGaziyakiniPersonel}
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
            sehitGaziYakiniPersonelList.length > 0 && (
              <div className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardBody>
                    <h5 className="mb-3 text-danger">
                      <i className="fas fa-list me-2"></i>
                      Şehit/Gazi Yakını Personeller (
                      {sehitGaziYakiniPersonelList.length} kişi)
                    </h5>
                    <DataTable
                      data={sehitGaziYakiniPersonelList}
                      columns={columns}
                      onDetailClick={showPersonelDetay}
                      tableName="sehitGaziYakiniPersonelTable"
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
