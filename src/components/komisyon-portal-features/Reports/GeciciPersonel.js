import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Table } from "reactstrap";
import alertify from "alertifyjs";
import {
  renderDate_GGAAYYYY,
  calculateKalanGorevSuresi
} from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";

export default function GeciciPersonel({ token, showPersonelDetay }) {
  const [geciciPersonelList, setGeciciPersonelList] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

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
        setGeciciPersonelList(response.data.personList);
        setRaporGetiriliyorMu(false);
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
        <h3>Geçici Personel Listesi</h3>
        <span>
          Bu rapor ile tüm kurumlardaki geçici personellerin listesini
          görüntüleyebilirsiniz.
        </span>
        <div>
          <Button
            className="m-3"
            size="lg"
            id="getGeciciPersonel"
            onClick={(e) => getGeciciPersonel(e)}
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

          <div hidden={raporGetiriliyorMu || geciciPersonelList.length === 0}>
            <Table striped id="pasifPersonelTable">
              <thead>
                <tr>
                  <th>Sicil No</th>
                  <th>Ad Soyad</th>
                  <th>Asıl Kurum</th>
                  <th>Geçici Kurum</th>
                  <th>Gerekçe</th>
                  <th>Bitiş Tarihi</th>
                  <th id="detayTD">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {geciciPersonelList.map((personel) => (
                  <tr key={personel._id}>
                    <td>{personel.sicil}</td>
                    <td>
                      {personel.ad} {personel.soyad}
                    </td>
                    <td>{personel.birimID.institution.name}</td>
                    <td>{personel.temporaryBirimID.institution.name}</td>
                    <td>{personel.temporaryReason}</td>
                    <td>
                      {renderDate_GGAAYYYY(personel.temporaryEndDate)} (
                      {calculateKalanGorevSuresi(personel.temporaryEndDate)})
                    </td>
                    <td id="detayTD">
                      <Button onClick={(e) => showPersonelDetay(personel)}>
                        Detay
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button
              disabled
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
              onClick={(e) => {
                generatePdf(
                  document,
                  "pasifPersonelTable",
                  "Geçici Personel Listesi",
                  "detayTD"
                );
              }}
            >
              Pdf'e Aktar
            </Button>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
