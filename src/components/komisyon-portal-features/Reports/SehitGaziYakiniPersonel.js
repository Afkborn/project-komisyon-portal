import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Table } from "reactstrap";
import alertify from "alertifyjs";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";

export default function SehitGaziYakiniPersonel({ token, showPersonelDetay }) {
  const [sehitGaziYakiniPersonelList, setSehirGaziYakiniPersonelList] =
    useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);

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

  return (
    <div>
      {" "}
      <div>
        <h3>Şehit/Gazi Yakını Personel Listesi</h3>
        <span>
          Bu rapor ile tüm kurumlardaki şehit/gazi yakını olan personellerin
          listesini görüntüleyebilirsiniz.
        </span>
        <div>
          <Button
            className="m-3"
            color="danger"
            size="lg"
            id="getGeciciPersonel"
            onClick={(e) => getSehitGaziyakiniPersonel(e)}
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
              raporGetiriliyorMu || sehitGaziYakiniPersonelList.length === 0
            }
          >
            <Table striped id="sehitGaziYakiniPersonelTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sicil No</th>
                  <th>Ad Soyad</th>
                  <th>Kurum</th>
                  <th>Birim</th>
                  <th>Unvan</th>
                  <th id="detayTD">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {sehitGaziYakiniPersonelList.map((personel, index) => (
                  <tr key={personel._id}>
                    <th scope="row">{index + 1}</th>
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
                  "sehitGaziYakiniPersonelTable",
                  "Engelli Personel Listesi",
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
                printDocument(document, "sehitGaziYakiniPersonelTable", "detayTD");
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
