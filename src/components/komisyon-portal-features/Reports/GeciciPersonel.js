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

export default function GeciciPersonel({ token, showPersonelDetay }) {
  const [geciciPersonelList, setGeciciPersonelList] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

  const renderText = (text1, text2) => {
    if (text1 === text2) return text1;
    return text1 + " (" + text2 + ")";
  };

  const columns = [
    {
      key: "sicil",
      header: "Sicil No",
    },
    {
      key: "fullName",
      header: "Ad Soyad",
      render: (item) => `${item.ad} ${item.soyad}`,
    },
    {
      key: "unvan",
      header: "Ünvan",
      render: (item) => item.title.name,
    },
    {
      key: "asilBirim",
      header: "Asıl Kurum - Birim",
      render: (item) =>
        renderText(item.birimID.name, item.birimID.institution.name),
    },
    {
      key: "geciciBirim",
      header: "Geçici Birim - Kurum",
      render: (item) =>
        renderText(
          item.temporaryBirimID.name,
          item.temporaryBirimID.institution.name
        ),
    },
    {
      key: "gerekce",
      header: "Gerekçe",
      render: (item) => item.temporaryReason,
    },
    {
      key: "bitisTarihi",
      header: "Bitiş Tarihi",
      render: (item) =>
        `${renderDate_GGAAYYYY(
          item.temporaryEndDate
        )} (${calculateKalanGorevSuresi(item.temporaryEndDate)})`,
    },
  ];

  const getGeciciPersonel = (e) => {
    const configuration = {
      method: "GET",
      url: "/api/persons/temporary",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setRaporGetiriliyorMu(true);
    axios(configuration)
      .then((response) => {
        setRaporGetiriliyorMu(false);
        if (response.data.personList.length === 0) {
          alertify.error("Geçici personel bulunamadı.");
        } else {
          setGeciciPersonelList(response.data.personList);
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
      "pasifPersonelTable",
      "Geçici Personel Listesi",
      "detayTD",
      true
    );
  };

  const handlePrint = () => {
    printDocument(document, "pasifPersonelTable", "detayTD");
  };

  return (
    <div>
      <h3>Geçici Personel Listesi</h3>
      <span>
        Bu rapor ile tüm kurumlardaki geçici personellerin listesini
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
        geciciPersonelList.length > 0 && (
          <div className="mt-5">
            <DataTable
              data={geciciPersonelList}
              columns={columns}
              onDetailClick={showPersonelDetay}
              tableName="pasifPersonelTable"
              generatePdf={handleExportPdf}
              printTable={handlePrint}
              initialPageSize={15} // Başlangıç değeri 15
            />
          </div>
        )
      )}
    </div>
  );
}
