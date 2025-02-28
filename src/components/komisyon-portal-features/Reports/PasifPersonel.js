import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, CardHeader, CardBody, Alert } from "reactstrap";
import alertify from "alertifyjs";
import {
  calculateGorevSuresi,
  renderDate_GGAAYYYY,
} from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import DataTable from "../../common/DataTable";

export default function PasifPersonel({ token, showPersonelDetay }) {
  const [pasifPersonelList, setPasifPersonelList] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

  const columns = [
    { key: "sicil", header: "Sicil No" },
    { key: "ad", header: "Adı" },
    { key: "soyad", header: "Soyadı" },
    {
      key: "unvan",
      header: "Ünvan",
      render: (item) => item.title.name,
    },
    {
      key: "gerekce",
      header: "Gerekçe",
      render: (item) => item.deactivationReason,
    },
    {
      key: "tarih",
      header: "Tarih",
      render: (item) =>
        `${renderDate_GGAAYYYY(item.deactivationDate)} (${calculateGorevSuresi(
          item.deactivationDate
        )})`,
    },
  ];

  const getPasifPersonel = (e) => {
    const configuration = {
      method: "GET",
      url: "/api/persons/deactivated",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setRaporGetiriliyorMu(true);
    axios(configuration)
      .then((response) => {
        setRaporGetiriliyorMu(false);
        if (response.data.personList.length === 0) {
          alertify.error("Devren giden personel bulunamadı.");
        } else {
          setPasifPersonelList(response.data.personList);
        }
      })
      .catch((error) => {
        alertify.error(
          "Devren giden personel listesi getirilirken bir hata oluştu."
        );
        setRaporGetiriliyorMu(false);
      });
  };

  const handleExportPdf = () => {
    generatePdf(
      document,
      "pasifPersonelTable",
      "Devren Giden Personel Listesi",
      "detayTD",
      true
    );
  };

  const handlePrint = () => {
    printDocument(document, "pasifPersonelTable", "detayTD");
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">Devren Giden Personel Listesi</h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            Bu rapor ile tüm kurumlarda devren giden personellerin listesini
            görüntüleyebilirsiniz.
          </Alert>

          <Button
            color="danger"
            className="mb-4"
            onClick={getPasifPersonel}
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
            pasifPersonelList.length > 0 && (
              <div className="mt-4">
                <DataTable
                  data={pasifPersonelList}
                  columns={columns}
                  onDetailClick={showPersonelDetay}
                  tableName="pasifPersonelTable"
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
