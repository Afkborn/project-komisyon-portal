import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Badge,
} from "reactstrap";

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

  const getPersonelSayisi = async () => {
    setSpinner(true);
    const configuration = {
      method: "GET",
      url: "api/reports/toplamPersonelSayisi?institutionId=" + selectedKurum.id,
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
    <div>
      <h3>Personel Sayısı</h3>
      <span>
        Personel sayısı ekranı ile birlikte toplam personel sayısı, hangi
        ünvanda ne kadar personel olduğu ve hangi birimde kaç personel olduğu
        bilgilerine ulaşabilirsiniz.
      </span>

      <hr />

      {spinner && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      {personelUnvanlari.length > 0 && (
        <div>
          <h4>
            {selectedKurum.name}nde toplam{" "}
            <Badge color="success">{personelSayisi}</Badge> adet personel
            bulunmaktadır.
          </h4>
          <Accordion open={accordionOpen} toggle={accordionToggle}>
            <AccordionItem>
              <AccordionHeader targetId="1">
                Ünvan Bazlı Sayılar
              </AccordionHeader>
              <AccordionBody accordionId="1">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Ünvan</th>
                      <th>Personel Sayısı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personelUnvanlari.map((unvan) => (
                      <tr key={unvan.title}>
                        <td>{unvan.title}</td>
                        <td>{unvan.personCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionBody>
            </AccordionItem>
            <AccordionItem>
              <AccordionHeader targetId="2">
                Mahkeme Tipi Bazlı Sayılar
              </AccordionHeader>
              <AccordionBody accordionId="2">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Mahkeme Tipi</th>
                      <th>Personel Sayısı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personelUnvanTipi.map((birim) => (
                      <tr key={birim.unit}>
                        <td>{birim.unitType}</td>
                        <td>{birim.personCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionBody>
            </AccordionItem>
            <AccordionItem>
              <AccordionHeader targetId="3">
                Mahkeme Bazlı Sayılar
              </AccordionHeader>
              <AccordionBody accordionId="3">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Mahkeme</th>
                      <th>Personel Sayısı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personelBirimleri.map((birim) => (
                      <tr key={birim.unit}>
                        <td>{birim.unit}</td>
                        <td>{birim.personCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionBody>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
