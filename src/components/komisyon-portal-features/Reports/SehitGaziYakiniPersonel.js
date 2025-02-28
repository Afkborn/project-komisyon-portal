import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner } from "reactstrap";
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
    printDocument(document, "sehitGaziYakiniPersonelTable", "detayTD");
  };

  return (
    <div>
      <h3>Şehit/Gazi Yakını Personel Listesi</h3>
      <span>
        Bu rapor ile tüm kurumlardaki şehit/gazi yakını olan personellerin
        listesini görüntüleyebilirsiniz.
      </span>

      <Button
        color="danger"
        className="m-1"
        size="sm"
        onClick={getSehitGaziyakiniPersonel}
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
        sehitGaziYakiniPersonelList.length > 0 && (
          <div className="mt-5">
            <DataTable
              data={sehitGaziYakiniPersonelList}
              columns={columns}
              onDetailClick={showPersonelDetay}
              tableName="sehitGaziYakiniPersonelTable"
              generatePdf={handleExportPdf}
              printTable={handlePrint}
            />
          </div>
        )
      )}
    </div>
  );
}
