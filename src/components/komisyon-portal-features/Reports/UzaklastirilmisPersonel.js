import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner } from "reactstrap";
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
    printDocument(document, "uzaklastirilmisPersonelTable", "detayTD");
  };

  return (
    <div>
      <h3>Uzaklaştırılmış Personel Listesi</h3>
      <span>
        Bu rapor ile tüm kurumlardaki uzaklaştırılmış personellerin listesini
        görüntüleyebilirsiniz.
      </span>

      <Button
        color="danger"
        className="m-1"
        size="sm"
        onClick={getGeciciPersonel}
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
        uzaklastirilmisPersonelList.length > 0 && (
          <div className="mt-5">
            <DataTable
              data={uzaklastirilmisPersonelList}
              columns={columns}
              onDetailClick={showPersonelDetay}
              tableName="uzaklastirilmisPersonelTable"
              generatePdf={handleExportPdf}
              printTable={handlePrint}
            />
          </div>
        )
      )}
    </div>
  );
}
