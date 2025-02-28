import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";

export default function PersonelSayi({ selectedKurum, unvanlar, token }) {
  const [spinner, setSpinner] = useState(false);
  const [personelSayisi, setPersonelSayisi] = useState(0);
  const [personelUnvanlari, setPersonelUnvanlari] = useState([]);
  const [personelBirimleri, setPersonelBirimleri] = useState([]);
  const [personelUnvanTipi, setPersonelUnvanTipi] = useState([]);
  const [accordionOpen, setAccordionOpen] = useState("1");

  const accordionToggle = (id) => {
    if (accordionOpen === id) {
      setAccordionOpen();
    } else {
      setAccordionOpen(id);
    }
  };

  const tableMahkemePersonelAccordionToggle = (id) => {
    if (openItems.includes(id)) {
      setOpenItems(openItems.filter((item) => item !== id)); // Kapalı hale getirme
    } else {
      setOpenItems([...openItems, id]); // Açık hale getirme
    }
  };

  const [openItems, setOpenItems] = React.useState(
    personelBirimleri.map((birim) => birim.unit) // Tüm birimlerin açık olması için birim.unit listesini alıyoruz.
  );

  const getPersonelSayisi = async () => {
    setSpinner(true);
    const configuration = {
      method: "GET",
      url:
        "/api/reports/toplamPersonelSayisi?institutionId=" + selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        console.log("Personel sayısı getirildi");
        setSpinner(false);
        setPersonelSayisi(response.data.personCount);
        setPersonelUnvanlari(response.data.titlePersonCountList);
        setPersonelBirimleri(response.data.unitPersonCountList);
        setOpenItems(
          response.data.unitPersonCountList.map((birim) => birim.unit)
        );

        setPersonelUnvanTipi(response.data.unitTypePersonCountList);
      })
      .catch((error) => {
        console.log(error);
        setSpinner(false);
      });
  };

  useEffect(() => {
    if (selectedKurum && personelSayisi === 0) {
      console.log("Personel sayısı getiriliyor");
      getPersonelSayisi();
    }
    // eslint-disable-next-line
  }, [selectedKurum, personelSayisi]);

  return (
    <div className="personel-tablo-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">Personel Sayısı</h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            Personel sayısı ekranı ile birlikte toplam personel sayısı, hangi
            ünvanda ne kadar personel olduğu ve hangi birimde kaç personel
            olduğu bilgilerine ulaşabilirsiniz.
          </Alert>

          {spinner ? (
            <div className="text-center my-5">
              <Spinner
                color="danger"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Personel sayıları getiriliyor, lütfen bekleyiniz...
              </p>
            </div>
          ) : personelUnvanlari.length > 0 ? (
            <div>
              <Alert color="success" className="d-flex align-items-center">
                <i className="fas fa-info-circle me-2 fs-4"></i>
                <div>
                  <strong>{selectedKurum.name}</strong> kurumunda toplam{" "}
                  <Badge color="danger" pill className="fs-6 px-3 py-2">
                    {personelSayisi}
                  </Badge>{" "}
                  adet personel bulunmaktadır.
                </div>
              </Alert>

              <Card className="mb-4 border-0 shadow-sm">
                <CardBody>
                  <Accordion
                    open={accordionOpen}
                    toggle={accordionToggle}
                    className="border-0"
                  >
                    <AccordionItem className="border-0 mb-3">
                      <AccordionHeader
                        targetId="1"
                        className="bg-light rounded"
                      >
                        <i className="fas fa-user-tie me-2"></i> Ünvan Bazlı
                        Sayılar
                      </AccordionHeader>
                      <AccordionBody accordionId="1" className="pt-4">
                        <div className="table-responsive">
                          <table
                            className="table table-striped table-hover"
                            id="tableUnvanPersonel"
                          >
                            <thead className="table-light">
                              <tr>
                                <th>Ünvan</th>
                                <th>Personel Sayısı</th>
                              </tr>
                            </thead>
                            <tbody>
                              {personelUnvanlari.map((unvan) => (
                                <tr key={unvan.title}>
                                  <td>{unvan.title}</td>
                                  <td>
                                    <Badge color="info" pill>
                                      {unvan.personCount}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Row className="mt-3">
                          <Col>
                            <Button
                              color="danger"
                              className="me-2"
                              onClick={() =>
                                generatePdf(
                                  document,
                                  "tableUnvanPersonel",
                                  "Ünvan Bazlı Personel Sayıları"
                                )
                              }
                            >
                              <i className="fas fa-file-pdf me-1"></i> PDF'e
                              Aktar
                            </Button>

                            <Button
                              color="secondary"
                              onClick={(e) => {
                                printDocument(document, "tableUnvanPersonel");
                              }}
                            >
                              <i className="fas fa-print me-1"></i> Yazdır
                            </Button>
                          </Col>
                        </Row>
                      </AccordionBody>
                    </AccordionItem>

                    <AccordionItem className="border-0 mb-3">
                      <AccordionHeader
                        targetId="2"
                        className="bg-light rounded"
                      >
                        <i className="fas fa-balance-scale me-2"></i> Mahkeme
                        Tipi Bazlı Sayılar
                      </AccordionHeader>
                      <AccordionBody accordionId="2" className="pt-4">
                        <div className="table-responsive">
                          <table
                            className="table table-striped table-hover"
                            id="tableMahkemeTipPersonel"
                          >
                            <thead className="table-light">
                              <tr>
                                <th>Mahkeme Tipi</th>
                                <th>Personel Sayısı</th>
                              </tr>
                            </thead>
                            <tbody>
                              {personelUnvanTipi.map((birim) => (
                                <tr key={birim.unit}>
                                  <td>{birim.unitType}</td>
                                  <td>
                                    <Badge color="info" pill>
                                      {birim.personCount}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Row className="mt-3">
                          <Col>
                            <Button
                              color="danger"
                              className="me-2"
                              onClick={() =>
                                generatePdf(
                                  document,
                                  "tableMahkemeTipPersonel",
                                  "Mahkeme Tipi Bazlı Personel Sayıları"
                                )
                              }
                            >
                              <i className="fas fa-file-pdf me-1"></i> PDF'e
                              Aktar
                            </Button>
                            <Button
                              color="secondary"
                              onClick={(e) => {
                                printDocument(
                                  document,
                                  "tableMahkemeTipPersonel"
                                );
                              }}
                            >
                              <i className="fas fa-print me-1"></i> Yazdır
                            </Button>
                          </Col>
                        </Row>
                      </AccordionBody>
                    </AccordionItem>

                    <AccordionItem className="border-0">
                      <AccordionHeader
                        targetId="3"
                        className="bg-light rounded"
                      >
                        <i className="fas fa-building me-2"></i> Mahkeme Bazlı
                        Sayılar
                      </AccordionHeader>
                      <AccordionBody accordionId="3" className="pt-4">
                        <Accordion
                          className="border-0"
                          id="tableMahkemePersonel"
                          open={openItems}
                          toggle={tableMahkemePersonelAccordionToggle}
                          stayOpen
                        >
                          {personelBirimleri.map((birim) => (
                            <AccordionItem
                              key={birim.unit}
                              className="mb-2 border"
                            >
                              <AccordionHeader targetId={birim.unit}>
                                <span className="fw-bold">{birim.unit}</span>
                                <Badge color="danger" pill className="ms-2">
                                  {birim.personCount} Personel
                                </Badge>
                              </AccordionHeader>
                              <AccordionBody accordionId={birim.unit}>
                                <div className="table-responsive">
                                  <table className="table table-sm table-bordered">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Ünvan</th>
                                        <th>Sayı</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {birim.titlePersonCountList.map(
                                        (unvan) => (
                                          <tr key={unvan.title}>
                                            <td>{unvan.title}</td>
                                            <td>
                                              <Badge color="info" pill>
                                                {unvan.personCount}
                                              </Badge>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </AccordionBody>
                            </AccordionItem>
                          ))}
                        </Accordion>

                        <Row className="mt-4">
                          <Col>
                            <Button
                              color="danger"
                              className="me-2"
                              onClick={() =>
                                generatePdf(
                                  document,
                                  "tableMahkemePersonel",
                                  "Mahkeme Bazlı Personel Sayıları"
                                )
                              }
                            >
                              <i className="fas fa-file-pdf me-1"></i> PDF'e
                              Aktar
                            </Button>

                            <Button
                              color="secondary"
                              onClick={(e) => {
                                printDocument(document, "tableMahkemePersonel");
                              }}
                            >
                              <i className="fas fa-print me-1"></i> Yazdır
                            </Button>
                          </Col>
                        </Row>
                      </AccordionBody>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
