import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner } from "reactstrap";
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
      // Sicil numarası direkt erişilebilir olduğu için render gerekmiyor
    },
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
    printDocument(document, "engelliPersonelTable", "detayTD");
  };

  return (
    <div>
      <h3>Engelli Personel Listesi</h3>
      <span>
        Bu rapor ile tüm kurumlardaki engelli personellerin listesini
        görüntüleyebilirsiniz.
      </span>

      <Button
        className="m-1"
        color="danger"
        onClick={getEngelliPersonel}
        size="sm"
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
        engelliPersonelList.length > 0 && (
          <div className="mt-5">
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
    </div>
  );
}
