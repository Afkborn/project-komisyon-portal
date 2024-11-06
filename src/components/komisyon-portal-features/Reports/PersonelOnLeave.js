import React, { useState } from "react";
import { Input, Label, Button, Form, Row, Col } from "reactstrap";
import axios from "axios";
import { renderDate_GGAAYYYY } from "../../actions/TimeActions";
import { getIzinType} from "../../actions/IzinActions";
// import html2pdf from "html2pdf.js";

import { generatePdf } from "../../actions/PdfActions";


export default function PersonelOnLeave({
  selectedKurum,
  token,
  showPersonelDetay,
}) {
  const [searchBy, setSearchBy] = useState("current");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [personelList, setPersonelList] = useState([]);
  const [aramaYapildiMi, setAramaYapildiMi] = useState(false);

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value);
    clearForm();
  };

  const clearForm = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setPersonelList([]);
    setAramaYapildiMi(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    setPersonelList([]);

    let url = "api/reports/izinliPersoneller?institutionId=" + selectedKurum.id;

    if (searchBy === "byDate") {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    let configuration = {
      method: "GET",
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {

        let izinliPersonelList = response.data.izinliPersonelList;

        // sort unvan.oncelikSirasi
        izinliPersonelList.sort((a, b) => {
          return a.unvan.oncelikSirasi - b.unvan.oncelikSirasi;
        });

        setPersonelList(izinliPersonelList);
        setAramaYapildiMi(true);
      })
      .catch((error) => {
        setAramaYapildiMi(true);
        console.log(error);
      });
  };

  // const exportPdf = () => {
  //   const element = document.getElementById("personelOnLeaveTable");

  //   // element içinde dön
  //   // id'si detayTD olanları sil
  //   let tempElement = element.cloneNode(true);
  //   let detayTDs = tempElement.querySelectorAll("#detayTD");
  //   detayTDs.forEach((td) => {
  //     td.remove();
  //   });

  //   const options = {
  //     margin: 0.5,
  //     filename: "PersonelOnLeave.pdf",
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 1 },
  //     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  //   };

  //   html2pdf().from(tempElement).set(options).save();
  // };

  return (
    <div>
      <h3>Rapor - İzinde Olan Personel</h3>
      <span>
        Bu rapor sayesinde seçili olan kurumda tarih bazlı veya güncel olarak
        izinde olan personelleri listeyebilir, excel veya pdf formatında dışa
        aktarabilirsiniz.
      </span>

      <hr />
      <div className="mt-3">
        <Form onSubmit={(e) => handleFormSubmit(e)}>
          {/* aramanın  ad veya soyad kullanılarak yapılacağını seçtiğimiz row */}
          <Row className="row-cols-lg-auto g-3 align-items-center">
            <Col>
              <Label check>
                <Input
                  type="radio"
                  name="searchBy"
                  value="current"
                  checked={searchBy === "current"}
                  onChange={handleSearchByChange}
                />{" "}
                Şuan İzinde Olanlar
              </Label>
            </Col>
            <Col>
              <Label check>
                <Input
                  type="radio"
                  name="searchBy"
                  value="byDate"
                  checked={searchBy === "byDate"}
                  onChange={handleSearchByChange}
                />{" "}
                Tarih Aralığında İzinde Olanlar
              </Label>
            </Col>
            <Button
              color="danger"
              type="submit"
              onClick={(e) => handleFormSubmit(e)}
            >
              Getir
            </Button>
          </Row>

          {/* arama eğer sicil ile yapılacak ise gösterilecek  form */}
          {searchBy === "byDate" && (
            <Row className="row-cols-lg-auto g-3 align-items-center mt-2">
              <Col>
                <Label className="" for="startDate">
                  Başlangıç Tarihi
                </Label>
                <Input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col>
                <Label className="" for="endDate">
                  Bitiş Tarihi
                </Label>
                <Input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
            </Row>
          )}
        </Form>

        {aramaYapildiMi && personelList.length === 0 && (
          <div className="alert alert-info mt-3" role="alert">
            Sonuç Bulunamadı
          </div>
        )}
        {personelList.length > 0 && (
          <div className="mt-3">
            <h5>İzinde Olan Personeller</h5>
            <table className="table" id="personelOnLeaveTable">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Sicil No</th>
                  <th scope="col">Ünvan</th>
                  <th scope="col">Adı Soyadı</th>
                  <th scope="col">Birim</th>
                  <th scope="col">İzin Türü</th>
                  <th scope="col">Başlangıç Tarihi</th>
                  <th scope="col">Bitiş Tarihi</th>
                  <th scope="col" id="detayTD"></th>
                </tr>
              </thead>
              <tbody>
                {personelList &&
                  personelList.map((personel, index) => (
                    <tr key={personel._id}>
                      <th scope="row">{index + 1}</th>
                      <td>{personel.sicil}</td>
                      <td>{personel.unvan.name}</td>
                      <td>
                        {personel.ad} {personel.soyad}
                        {personel.isTemporary && "(Geçici Personel)"}
                      </td>
                      <td>{personel.birim}</td>
                      <td>{getIzinType(personel.izinTur)}</td>
                      <td>{renderDate_GGAAYYYY(personel.izinBaslangic)}</td>
                      <td>{renderDate_GGAAYYYY(personel.izinBitis)}</td>
                      <td id="detayTD">
                        <Button
                          color="info"
                          size="sm"
                          onClick={() => {
                            showPersonelDetay(personel);
                          }}
                        >
                          Detay
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
                  "personelOnLeaveTable",
                  "İzinde Olan Personel",
                  "detayTD",
                  true
                );
              }}
            >
              Pdf'e Aktar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
