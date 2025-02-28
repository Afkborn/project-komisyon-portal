import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner } from "reactstrap";
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
    <div>
      <h3>Devren Giden Personel Listesi</h3>
      <span>
        Bu rapor ile tüm kurumlarda devren giden personellerin listesini
        görüntüleyebilirsiniz.
      </span>

      <Button
        color="danger"
        className="m-1"
        size="sm"
        onClick={getPasifPersonel}
        style={{ width: "200px" }}
      >
        Rapor Getir
      </Button>

      {raporGetiriliyorMu ? (
        <div className="m-5">
          <Spinner color="danger" />
          <span className="m-2">
            Rapor yükleniyor, bu işlem biraz zaman alabilir.
          </span>
        </div>
      ) : (
        pasifPersonelList.length > 0 && (
          <div className="mt-5">
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
    </div>
  );
}
