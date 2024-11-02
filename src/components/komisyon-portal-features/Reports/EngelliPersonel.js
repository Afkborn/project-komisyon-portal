import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Table } from "reactstrap";
import alertify from "alertifyjs";
import { generatePdf } from "../../actions/PdfActions";

export default function EngelliPersonel({ token, showPersonelDetay }) {
  const [engelliPersonelList, setEngelliPersonelList] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

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

  return (
    <div>
      {" "}
      <div>
        <h3>Engelli Personel Listesi</h3>
        <span>
          Bu rapor ile tüm kurumlardaki engelli personellerin listesini
          görüntüleyebilirsiniz.
        </span>
        <div>
          <Button
            className="m-3"
            color="danger"
            size="lg"
            id="getGeciciPersonel"
            onClick={(e) => getEngelliPersonel(e)}
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

          <div hidden={raporGetiriliyorMu || engelliPersonelList.length === 0}>
            <Table striped id="engelliPersonelTable">
              <thead>
                <tr>
                  <th>Sicil No</th>
                  <th>Ad Soyad</th>
                  <th>Kurum</th>
                  <th>Birim</th>
                  <th>Unvan</th>
                  <th id="detayTD">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {engelliPersonelList.map((personel) => (
                  <tr key={personel._id}>
                    <td>{personel.sicil}</td>
                    <td>
                      {personel.ad} {personel.soyad}
                    </td>
                    <td>{personel.birimID.institution.name}</td>
                    <td>{personel.birimID.name}</td>
                    <td>{personel.title.name}</td>
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
                  "engelliPersonelTable",
                  "Engelli Personel Listesi",
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
