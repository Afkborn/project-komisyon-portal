import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, CardHeader, CardBody, Alert } from "reactstrap";
import alertify from "alertifyjs";
import { renderDate_GGAAYYYY } from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
import DataTable from "../../common/DataTable";

export default function GorevSure4BPersonel({ token, showPersonelDetay, selectedKurum }) {
  const [expiring4BPersonelList, setExpiring4BPersonelList] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

  const columns = [
    {
      key: "sicil",
      header: "Sicil No",
      dataType: "number",
    },
    {
      key: "fullName",
      header: "Ad Soyad",
      render: (item) => `${item.ad} ${item.soyad}`,
    },
    {
      key: "title",
      header: "Ünvan",
      render: (item) => item?.title || "-",
    },
    {
      key: "birim",
      header: "Birim",
      render: (item) => item?.birim || "-",
    },
    {
      key: "goreveBaslamaTarihi",
      header: "Göreve Başlama Tarihi",
      render: (item) =>
        item?.goreveBaslamaTarihi
          ? renderDate_GGAAYYYY(item.goreveBaslamaTarihi)
          : "-",
    },
    {
      key: "tenureEndDate",
      header: "Görev Süresi Bitiş Tarihi",
      render: (item) =>
        item?.tenureEndDate ? renderDate_GGAAYYYY(item.tenureEndDate) : "-",
    },
    {
      key: "gunKalması",
      header: "Kalan Gün",
      dataType: "number",
      sortKey: "gunKalmasıNumeric",
      render: (item) => {
        const gun = item?.gunKalması;
        if (gun === undefined || gun === null) return "-";
        if (gun < 0) return "Süresi Doldu";
        return `${gun} gün`;
      },
    },
  ];

  const getExpiring4BPersonel = (e) => {
    const institutionId = selectedKurum?.id;

    if (!institutionId) {
      alertify.error("Kurum bilgisi alınamadı.");
      return;
    }

    const configuration = {
      method: "GET",
      url: `/api/reports/expiring4BPersonnel?institutionId=${institutionId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    setRaporGetiriliyorMu(true);
    axios(configuration)
      .then((response) => {
        setRaporGetiriliyorMu(false);

        const list = response?.data?.expiring4BPersonnel || [];
        if (list.length === 0) {
          alertify.error("Görev süresi sona ermiş veya 1 ay içinde sona erecek personel bulunamadı.");
          setExpiring4BPersonelList([]);
        } else {
          // Her kayda numeric değeri ekle (sorting için)
          const listWithSorted = list.map((item) => {
            const gunKalması = item?.gunKalması ?? 0;
            return { ...item, gunKalmasıNumeric: gunKalması };
          });

          // Kalan güne göre sırlat (az olanı önce)
          const sortedList = [...listWithSorted].sort((a, b) => {
            return a.gunKalmasıNumeric - b.gunKalmasıNumeric;
          });

          setExpiring4BPersonelList(sortedList);
          alertify.success(
            `${sortedList.length} personel bulundu (Süresi sona ermiş veya 1 ay içinde sona erecekler).`
          );
        }
      })
      .catch((error) => {
        setRaporGetiriliyorMu(false);
        console.error("Rapor getirme hatası:", error);
        
        if (error?.response?.status === 404) {
          alertify.error("Endpoint bulunamadı. Lütfen backend'i kontrol edin.");
        } else if (error?.response?.status === 400) {
          alertify.error("Hatalı istek. Kurum ID'si olunamadı.");
        } else {
          alertify.error("Rapor getirilirken bir hata oluştu.");
        }
      });
  };

  const handleExportPdf = () => {
    generatePdf(
      document,
      "expiring4BPersonelTable",
      "Görev Süresi Sona Ermiş / Sona Ermek Üzere Olan Personel",
      "detayTD",
      true
    );
  };

  const handlePrint = () => {
    printDocument(document, "expiring4BPersonelTable", "detayTD", null, {
      title: "Görev Süresi Sona Ermiş / Sona Ermek Üzere Olan Personel",
    });
  };

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">Görev Süresi Sona Ermiş / Sona Ermek Üzere Olan Personel</h3>
        </CardHeader>
        <CardBody>
          <Alert color="danger" className="mb-4">
            <strong>Uyarı:</strong> Bu rapor, (657/4B) maddesine göre atanmış ve
            görev süreleri <strong>sona ermiş veya ilerleyen 1 ay içinde sona erecek</strong> olan personelleri
            listelenir. Sonuçlar bitiş tarihine göre (yakın tarihleri önce)
            sıralanır.
          </Alert>

          <Button
            color="danger"
            className="mb-4"
            onClick={getExpiring4BPersonel}
            size="lg"
            style={{ width: "200px" }}
          >
            <i className="fas fa-hourglass-end me-2"></i> Rapor Getir
          </Button>

          {raporGetiriliyorMu ? (
            <div className="text-center my-5">
              <Spinner
                color="warning"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Rapor yükleniyor, bu işlem biraz zaman alabilir...
              </p>
            </div>
          ) : (
            expiring4BPersonelList.length > 0 && (
              <div className="mt-4">
                <DataTable
                  data={expiring4BPersonelList}
                  columns={columns}
                  onDetailClick={showPersonelDetay}
                  tableName="expiring4BPersonelTable"
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
