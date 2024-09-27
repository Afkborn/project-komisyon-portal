import React, { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  Input,
  Label,
  FormText,
  Table,
  Button,
} from "reactstrap";
import axios from "axios";

export default function OzellikAktar({ selectedKurum, token }) {
  const [aktarimIzinVerilenAttributes, setAktarimIzinVerilenAttributes] =
    useState([]);

  const [dosyaSecildiMi, setDosyaSecildiMi] = useState(false);

  const [hataliHeaderVarMi, setHataliHeaderVarMi] = useState(false);
  const [hataliHeaderList, setHataliHeaderList] = useState([]);
  const [headerList, setHeaderList] = useState([]);

  const [kisiSayisi, setKisiSayisi] = useState(0);
  const [yuklenecekKisiListesi, setYuklenecekKisiListesi] = useState([]);
  const [yuklemeBasladiMi, setYuklemeBasladiMi] = useState(false);
  const [hataliKisiList, setHataliKisiList] = useState([]);
  const [basariliKisiList, setBasariliKisiList] = useState([]);

  useEffect(() => {
    if (aktarimIzinVerilenAttributes.length === 0) {
      const config = {
        method: "GET",
        url: `api/persons/attributeList`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios(config)
        .then((response) => {
          setAktarimIzinVerilenAttributes(response.data.personAttributeList);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // eslint-disable-next-line
  }, [selectedKurum]);

  const handleFileChange = (event) => {
    setYuklemeBasladiMi(false);
    setDosyaSecildiMi(false);
    setHataliHeaderVarMi(false);
    setHataliHeaderList([]);
    setKisiSayisi(0);
    setYuklenecekKisiListesi([]);

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      // encoding UTF-8
      const fileContent = e.target.result;

      // check if file is empty
      if (fileContent.length === 0) {
        setHataliHeaderVarMi(true);
        setHataliHeaderList(["Dosya içeriği boş"]);
        return;
      }

      // check header list in aktarimIzinVerilenAttributes
      let headerList = fileContent.split("\n")[0].split(",");
      headerList = headerList.map((header) => header.trim());

      headerList.forEach((header) => {
        if (
          aktarimIzinVerilenAttributes.find(
            (attr) => attr.csvHeaderName === header
          ) === undefined
        ) {
          hataliHeaderList.push(header);
          setHataliHeaderVarMi(true);
        }
      });

      setHeaderList(headerList);

      fileContent.split("\n").forEach((row, index) => {
        if (index === 0) return;
        if (row.trim() === "") return;
        setKisiSayisi((prev) => prev + 1);
      });

      let persons = [];
      fileContent.split("\n").forEach((row, index) => {
        if (index === 0) return;
        if (row.trim() === "") return;
        let person = {};
        row.split(",").forEach((cell, index) => {
          cell = cell.trim();
          cell = cell.replace(/(\r\n|\n|\r)/gm, "");
          person[headerList[index]] = cell;
        });
        console.log(person);
        persons.push(person);
      });

      setYuklenecekKisiListesi(persons);
    };

    setDosyaSecildiMi(true);

    // Read as text with UTF-8 encoding
    reader.readAsText(file, "UTF-8");
  };

  const handleAktar = (e) => {
    e.preventDefault();
    setYuklemeBasladiMi(true);

    const config = (sicilNo, personData) => ({
      method: "PUT",
      url: `api/persons/updateBySicil/${sicilNo}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: personData,
    });

    yuklenecekKisiListesi.forEach((person) => {
      axios(config(person["sicilNo"], person))
        .then((response) => {
          console.log(response);
          setBasariliKisiList((prev) => [...prev, person["sicilNo"]]);
        })
        .catch((error) => {
          console.log(error);
          person["hataMesaji"] = error.response.data.message || "Bilinmeyen hata";
          setHataliKisiList((prev) => [...prev, person["sicilNo"]]);
        });
    });
  };

  return (
    <div>
      <h3>Aktarım - Özellik Aktar</h3>
      <span>
        Özellik Aktar ekranını kullanarak hali hazırda sistemde kayıtlı olan
        personele toplu veri girişi yapılabilir. Örneğin toplu olarak personele
        TC kimlik bilgisi girişi yapılacak ise bu ekran kullanılabilir. Veri
        girişinde kullanılak dosya uzantısı csv olmalıdır. Aktarım işlemi
        sırasında sol sütunda sicil numarası yer almalıdır.
      </span>

      <div hidden={aktarimIzinVerilenAttributes.length === 0}>
        <Table className="mt-3">
          <thead>
            <tr>
              <th>Özellik Adı</th>
              <th>CSV Header </th>
              <th>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {aktarimIzinVerilenAttributes.map((attribute) => (
              <tr key={attribute.id}>
                <td>
                  <span>{attribute.name}</span>
                </td>
                <td>
                  {attribute.csvHeaderName} {attribute.required ? "*" : ""}{" "}
                </td>
                <td>{attribute.desc}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2">
                <span>
                  <b>*</b> İşaretli alanlar zorunludur.
                </span>
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>

      <hr />

      <div className="mt-3">
        <Form>
          <FormGroup>
            <Label for="csvFile">Dosya</Label>
            <Input
              type="file"
              name="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
            />
            <FormText>
              Seçilecek csv dosyası kontrol edilerek aktarım yapılacaktır.
              Desteklenen uzantı <b>CSV</b>
            </FormText>
          </FormGroup>
        </Form>
      </div>

      <div hidden={!dosyaSecildiMi}>
        {hataliHeaderVarMi && (
          <div className="mt-3">
            <span className="text-danger">
              Dosya içeriğinde hatalı başlık bulunmaktadır. <br />
              {hataliHeaderList.length > 0 && (
                <span>Hatalı başlıklar: {hataliHeaderList.join(", ")} </span>
              )}
            </span>
          </div>
        )}

        {!hataliHeaderVarMi && (
          <div className="mt-3">
            <span>Yüklenecek başlıklar: {headerList.join(", ")} </span> <br />
            <span>Kişi sayısı: {kisiSayisi}</span>
          </div>
        )}

        <Button
          color="primary"
          className="mt-3"
          disabled={hataliHeaderVarMi || !dosyaSecildiMi}
          hidden={!dosyaSecildiMi || hataliHeaderVarMi}
          onClick={handleAktar}
        >
          Aktar
        </Button>
      </div>

      <div hidden={!yuklemeBasladiMi}>
        <div className="mt-3">
          <span>Başarılı kişi sayısı: {basariliKisiList.length}</span>{" "}
          <br />
          <span>Hatalı kişi sayısı: {hataliKisiList.length}</span> <br />
          <div>
            <Table>
              <thead>
                <tr>
                  <th>Sicil No</th>
                  <th>Durum</th>
                  <th>Hata Mesajı</th>
                </tr>
              </thead>
              <tbody>
                {yuklenecekKisiListesi.map((person) => (
                  <tr key={person["sicilNo"]}>
                    <td>{person["sicilNo"]}</td>
                    <td>
                      {hataliKisiList.includes(person["sicilNo"])
                        ? "Hatalı"
                        : "Başarılı"}
                    </td>
                    <td>
                      {hataliKisiList.includes(person["sicilNo"])
                        ? person["hataMesaji"]
                        : ""}
                    </td>

                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
