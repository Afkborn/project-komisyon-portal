import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Table } from "reactstrap";
import alertify from "alertifyjs";
import {
  renderDate_GGAAYYYY,
  calculateKalanGorevSuresi,
} from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";
export default function UzaklastirilmisPersonel({ token, showPersonelDetay }) {
  const [uzaklastirilmisPersonelList, setUzaklastirilmisPersonelList] =
    useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

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

  return (
    <div>
      {" "}
      <div>
        <h3>Uzaklaştırılmış Personel Listesi</h3>
        <span>
          Bu rapor ile tüm kurumlardaki uzaklaştırılmış personellerin listesini
          görüntüleyebilirsiniz.
        </span>
        <div>
          <Button
            className="m-3"
            color="danger"
            size="lg"
            id="getGeciciPersonel"
            onClick={(e) => getGeciciPersonel(e)}
            style={{ width: "200px" }}
          >
            Rapor Getir
          </Button>

          <div>
            {raporGetiriliyorMu && (
              <div className="m-5">
                <Spinner color="danger" />
                <span className="m-2">
                  Rapor yükleniyor, bu işlem biraz zaman alabilir.
                </span>
              </div>
            )}
          </div>

          <div
            hidden={
              raporGetiriliyorMu || uzaklastirilmisPersonelList.length === 0
            }
          >
            <Table striped id="uzaklastirilmisPersonelTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sicil No</th>
                  <th>Ad Soyad</th>
                  <th>Kurum</th>
                  <th>Birim</th>
                  <th>Unvan</th>
                  <th>Gerekçe</th>
                  <th>Bitiş Tarihi</th>
                  <th id="detayTD">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {uzaklastirilmisPersonelList.map((personel, index) => (
                  <tr key={personel._id}>
                    <td>{index + 1}</td>
                    <td>{personel.sicil}</td>
                    <td>
                      {personel.ad} {personel.soyad}
                    </td>
                    <td>{personel.birimID.institution.name}</td>
                    <td>{personel.birimID.name}</td>
                    <td>{personel.title.name}</td>
                    <td>
                      {personel.suspensionReason
                        ? personel.suspensionReason
                        : "BELİRTİLMEMİŞ"}
                    </td>
                    <td>
                      {renderDate_GGAAYYYY(personel.suspensionEndDate)} (
                      {calculateKalanGorevSuresi(personel.suspensionEndDate)})
                    </td>
                    <td id="detayTD">
                      <Button
                        color="info"
                        onClick={(e) => showPersonelDetay(personel)}
                      >
                        Detay
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button
              disabled
              color="danger"
              className="m-3"
              size="lg"
              id="exportExcel"
              type="submit"
            >
              Excel'e Aktar
            </Button>
            <Button
              className="m-3"
              size="lg"
              id="exportPdf"
              color="danger"
              onClick={(e) => {
                generatePdf(
                  document,
                  "uzaklastirilmisPersonelTable",
                  "Uzaklaştırılmış Personel Listesi",
                  "detayTD"
                );
              }}
            >
              Pdf'e Aktar
            </Button>

            <Button
              className="m-3"
              size="lg"
              id="print"
              color="danger"
              onClick={(e) => {
                printDocument(
                  document,
                  "uzaklastirilmisPersonelTable",
                  "detayTD"
                );
              }}
            >
              Yazdır
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
