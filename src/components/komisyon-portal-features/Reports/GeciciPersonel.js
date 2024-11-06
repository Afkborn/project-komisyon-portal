import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Table } from "reactstrap";
import alertify from "alertifyjs";
import {
  renderDate_GGAAYYYY,
  calculateKalanGorevSuresi,
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

  const renderText = (text1, text2) => {
    if (text1 === text2) {
      return text1;
    }
    return text1 + " (" + text2 + ")";
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
            color="danger"
            className="m-3"
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

          <div hidden={raporGetiriliyorMu || geciciPersonelList.length === 0}>
            <Table striped id="pasifPersonelTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sicil No</th>
                  <th>Ad Soyad</th>
                  <th>Unvan</th>
                  <th>Asıl Kurum - Birim</th>
                  {/* <th>Asıl Birim</th> */}
                  <th>Geçici Birim - Kurum </th>
                  {/* <th>Geçici Birim</th> */}
                  <th>Gerekçe</th>
                  <th>Bitiş Tarihi</th>
                  <th id="detayTD">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {geciciPersonelList.map((personel, index) => (
                  <tr key={personel._id}>
                    <th scope="row">{index + 1}</th>
                    <td>{personel.sicil}</td>
                    <td>
                      {personel.ad} {personel.soyad}
                    </td>
                    <td>{personel.title.name}</td>
                    <td>
                      {renderText(
                        personel.birimID.name,
                        personel.birimID.institution.name
                      )}
                    </td>

                    <td>
                      {renderText(
                        personel.temporaryBirimID.name,
                        personel.temporaryBirimID.institution.name
                      )}
                    </td>

                    <td>{personel.temporaryReason}</td>
                    <td>
                      {renderDate_GGAAYYYY(personel.temporaryEndDate)} (
                      {calculateKalanGorevSuresi(personel.temporaryEndDate)})
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
              color="danger"
              id="exportPdf"
              onClick={(e) => {
                generatePdf(
                  document,
                  "pasifPersonelTable",
                  "Geçici Personel Listesi",
                  "detayTD",
                  true
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
