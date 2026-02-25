import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, CardHeader, CardBody, Alert } from "reactstrap";
import alertify from "alertifyjs";
import {
  renderDate_GGAAYYYY,
} from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import DataTable from "../../common/DataTable";

export default function GeciciPersonel({ token, showPersonelDetay }) {
  const [geciciPersonelList, setGeciciPersonelList] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

  const renderText = (text1, text2) => {
    if (text1 === text2) return text1;
    return text1 + " (" + text2 + ")";
  };

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
      render: (item) => `${item.ad} ${item.soyad}`,
    },
    {
      key: "unvan",
      header: "Ünvan",
      render: (item) => item?.title?.name || "-",
    },
    {
      key: "asilBirim",
      header: "Asıl Kurum - Birim",
      render: (item) =>
        item?.birimID?.name && item?.birimID?.institution?.name
          ? renderText(item.birimID.name, item.birimID.institution.name)
          : "-",
    },
    {
      key: "geciciBirim",
      header: "Geçici Birim - Kurum",
      render: (item) =>
        item?.temporaryBirimID?.name && item?.temporaryBirimID?.institution?.name
          ? renderText(
              item.temporaryBirimID.name,
              item.temporaryBirimID.institution.name
            )
          : "-",
    },
    {
      key: "gerekce",
      header: "Gerekçe",
      render: (item) => item?.temporaryReason || "-",
    },
    {
      key: "bitisTarihi",
      header: "Bitiş Tarihi",
      render: (item) =>
        item?.temporaryEndDate ? renderDate_GGAAYYYY(item.temporaryEndDate) : "-",
    },
    {
      key: "kalanGun",
      header: "Kalan Gün",
      dataType: "number",
      sortKey: "kalanGunNumeric",
      render: (item) => {
        if (!item.temporaryEndDate) return "-";
        const remaining = Math.ceil(
          (new Date(item.temporaryEndDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (remaining < 0) return "Gecikti";
        return `${remaining} gün`;
      },
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
        setWarnings(response?.data?.warnings || []);

        const list = response?.data?.personList || [];
        if (list.length === 0) {
          alertify.error("Geçici personel bulunamadı.");
          setGeciciPersonelList([]);
        } else {
          // Her kayda kalan gün numeric değeri ekle (sorting için)
          const listWithSorted = list.map((item) => {
            let kalanGunNumeric;
            
            if (!item.temporaryEndDate) {
              // Bitiş tarihi yok: 1000000 (sona)
              kalanGunNumeric = 1000000;
            } else {
              const diff = new Date(item.temporaryEndDate) - new Date();
              const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
              
              if (days < 0) {
                // Gecikti: negatif (en başa)
                kalanGunNumeric = days;
              } else {
                // Normal: 1000 + gün sayısı (artan sıra)
                kalanGunNumeric = 1000 + days;
              }
            }
            
            return { ...item, kalanGunNumeric };
          });

          // Bitiş tarihine göre sorta (gecikti başta, sonra bitiş tarihi yok, sonra normal)
          const sortedList = [...listWithSorted].sort((a, b) => {
            return a.kalanGunNumeric - b.kalanGunNumeric;
          });

          setGeciciPersonelList(sortedList);
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
    printDocument(document, "pasifPersonelTable", "detayTD", null, {
      title: "Geçici Personel Listesi",
    });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">Geçici Personel Listesi</h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            Bu rapor ile tüm kurumlardaki geçici personellerin listesini
            görüntüleyebilirsiniz.
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
            geciciPersonelList.length > 0 && (
              <div className="mt-4">
                {warnings.length > 0 && (
                  <Alert color="warning" className="mb-3">
                    <div className="fw-bold mb-2">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Uyarılar (Geçici birimi eklenmemiş personeller)
                    </div>
                    <ul className="mb-0">
                      {warnings.map((w) => (
                        <li key={w.sicil || w.message}>
                          {w.message ||
                            `${w.sicil} - ${w.ad || ""} ${w.soyad || ""}`}
                        </li>
                      ))}
                    </ul>
                  </Alert>
                )}
                <DataTable
                  data={geciciPersonelList}
                  columns={columns}
                  onDetailClick={showPersonelDetay}
                  tableName="pasifPersonelTable"
                  generatePdf={handleExportPdf}
                  printTable={handlePrint}
                  initialPageSize={15}
                />
              </div>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
}
