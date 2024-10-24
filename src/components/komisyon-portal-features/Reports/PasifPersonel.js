import React, { useState } from "react";
import axios from "axios";
import { Button, Spinner, Table } from "reactstrap";
import alertify from "alertifyjs";
import {
  calculateGorevSuresi,
  renderDate_GGAAYYYY,
} from "../../actions/TimeActions";
import { generatePdf } from "../../actions/PdfActions";

export default function PasifPersonel({
  selectedKurum,
  token,
  showPersonelDetay,
}) {
  const [pasifPersonelList, setPasifPersonelList] = useState([]);
  const [raporGetiriliyorMu, setRaporGetiriliyorMu] = useState(false);
  const getPasifPersonel = (e) => {
    const configuration = {
      method: "GET",
      url: "/api/persons/deactivated", 
      // ?institutionId=" + selectedKurum.id
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setRaporGetiriliyorMu(true);
    axios(configuration)
      .then((response) => {
        setPasifPersonelList(response.data.personList);
        setRaporGetiriliyorMu(false);
      })
      .catch((error) => {
        alertify.error("Pasif personel listesi getirilirken bir hata oluştu.");
        setRaporGetiriliyorMu(false);
      });
  };

  return (
    <div>
      <h3>Durumu Pasif Olan Personel Listesi</h3>
      <span>
        Bu rapor ile tüm  kurumlarda durumu pasif olan personellerin
        listesini görüntüleyebilirsiniz.
      </span>
      <div>
        <Button
          className="m-3"
          size="lg"
          id="getPasifPersonel"
          onClick={(e) => getPasifPersonel(e)}
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

        <div hidden={raporGetiriliyorMu || pasifPersonelList.length === 0}>
          <Table striped id="pasifPersonelTable">
            <thead>
              <tr>
                <th>Sicil No</th>
                <th>Adı</th>
                <th>Soyadı</th>
                <th>Gerekçe</th>
                <th>Tarih</th>
                <th id="detayTD">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pasifPersonelList.map((personel) => (
                <tr key={personel._id}>
                  <td>{personel.sicil}</td>
                  <td>{personel.ad}</td>
                  <td>{personel.soyad}</td>
                  <td>{personel.deactivationReason}</td>
                  <td>
                    {renderDate_GGAAYYYY(personel.deactivationDate)} (
                    {calculateGorevSuresi(personel.deactivationDate)})
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
                "Durumu Pasif Personel Listesi",
                "detayTD"
              );
            }}
          >
            Pdf'e Aktar
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}
