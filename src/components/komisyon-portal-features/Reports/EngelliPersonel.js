import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, CardHeader, CardBody, Alert } from "reactstrap";
import alertify from "alertifyjs";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import DataTable from "../../common/DataTable";

export default function EngelliPersonel({ token, showPersonelDetay }) {
  const [engelliPersonelList, setEngelliPersonelList] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

  const columns = [
    {
      key: "sicil",
      header: "Sicil No",
      dataType: "number",
      // Sicil numarası direkt erişilebilir olduğu için render gerekmiyor
    },
    {
      key: "fullName",
      header: "Ad Soyad",
      dataType: "string",
      render: (item) => `${item.ad} ${item.soyad}`,
    },
    {
      key: "kurum",
      header: "Kurum",
      dataType: "string",
      render: (item) => item.birimID.institution.name,
    },
    {
      key: "birim",
      header: "Birim",
      dataType: "string",
      render: (item) => item.birimID.name,
    },
    {
      key: "unvan",
      header: "Ünvan",
      dataType: "string",
      render: (item) => item.title.name,
    },
  ];

  const getEngelliPersonel = (e) => {
    const configuration = {
      method: "GET",
      url: "/api/persons/disabled",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setRaporGetiriliyorMu(true);
    axios(configuration)
      .then((response) => {
        setRaporGetiriliyorMu(false);
        if (response.data.personList.length === 0) {
          alertify.error("Engelli personel bulunamadı.");
        } else {
          setEngelliPersonelList(response.data.personList);
        }
      })
      .catch((error) => {
        let errorMessage =
          error.response.data.message ||
          "Engelli personel listesi getirilirken bir hata oluştu.";
        alertify.error(errorMessage);
        setRaporGetiriliyorMu(false);
      });
  };

  const handleExportPdf = () => {
    generatePdf(
      document,
      "engelliPersonelTable",
      "Engelli Personel Listesi",
      "detayTD"
    );
  };

  const handlePrint = () => {
    printDocument(document, "engelliPersonelTable", "detayTD", null, {
      title: "Engelli Personel Listesi",
    });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">Engelli Personel Listesi</h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            Bu rapor ile tüm kurumlardaki engelli personellerin listesini
            görüntüleyebilirsiniz.
          </Alert>

          <Button
            color="danger"
            className="mb-4"
            onClick={getEngelliPersonel}
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
            engelliPersonelList.length > 0 && (
              <div className="mt-4">
                <DataTable
                  data={engelliPersonelList}
                  columns={columns}
                  onDetailClick={showPersonelDetay}
                  tableName="engelliPersonelTable"
                  generatePdf={handleExportPdf}
                  printTable={handlePrint}
                />
              </div>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
}
