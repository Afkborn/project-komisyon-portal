import React, { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  Input,
  Label,
  FormText,
  Table,
  Button,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Badge,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import axios from "axios";
import {
  FaFileUpload,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTable,
} from "react-icons/fa";

export default function OzellikAktar({ selectedKurum, token }) {
  const [aktarimIzinVerilenAttributes, setAktarimIzinVerilenAttributes] =
    useState([]);

  const [dosyaSecildiMi, setDosyaSecildiMi] = useState(false);
  const [yuklenenDosyaAdi, setYuklenenDosyaAdi] = useState("");

  const [hataliHeaderVarMi, setHataliHeaderVarMi] = useState(false);
  const [hataliHeaderList, setHataliHeaderList] = useState([]);
  const [headerList, setHeaderList] = useState([]);

  const [kisiSayisi, setKisiSayisi] = useState(0);
  const [yuklenecekKisiListesi, setYuklenecekKisiListesi] = useState([]);
  const [yuklemeBasladiMi, setYuklemeBasladiMi] = useState(false);
  const [hataliKisiList, setHataliKisiList] = useState([]);
  const [basariliKisiList, setBasariliKisiList] = useState([]);
  const [islemDevamEdiyorMu, setIslemDevamEdiyorMu] = useState(false);

  useEffect(() => {
    if (aktarimIzinVerilenAttributes.length === 0) {
      const config = {
        method: "GET",
        url: `/api/persons/attributeList`,
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
    setHataliKisiList([]);
    setBasariliKisiList([]);

    const file = event.target.files[0];
    if (!file) return;

    setYuklenenDosyaAdi(file.name);
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

      const hataliHeaders = [];
      headerList.forEach((header) => {
        if (
          aktarimIzinVerilenAttributes.find(
            (attr) => attr.csvHeaderName === header
          ) === undefined
        ) {
          hataliHeaders.push(header);
          setHataliHeaderVarMi(true);
        }
      });

      setHataliHeaderList(hataliHeaders);
      setHeaderList(headerList);

      let kisiSayac = 0;
      fileContent.split("\n").forEach((row, index) => {
        if (index === 0) return;
        if (row.trim() === "") return;
        kisiSayac++;
      });
      setKisiSayisi(kisiSayac);

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
        persons.push(person);
      });

      setYuklenecekKisiListesi(persons);
      setDosyaSecildiMi(true);
    };

    // Read as text with UTF-8 encoding
    reader.readAsText(file, "UTF-8");
  };

  const handleAktar = async (e) => {
    e.preventDefault();
    setYuklemeBasladiMi(true);
    setIslemDevamEdiyorMu(true);
    setHataliKisiList([]);
    setBasariliKisiList([]);

    const config = (sicilNo, personData) => ({
      method: "PUT",
      url: `/api/persons/updateBySicil/${sicilNo}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: personData,
    });

    // İşlem sayacı
    let tamamlananIslem = 0;
    const toplamIslem = yuklenecekKisiListesi.length;

    // Her bir personel için güncelleme işlemi yapıyoruz
    for (const person of yuklenecekKisiListesi) {
      try {
        await axios(config(person["sicilNo"], person));
        setBasariliKisiList((prev) => [...prev, person]);
      } catch (error) {
        const hataMesaji = error.response?.data?.message || "Bilinmeyen hata";
        person.hataMesaji = hataMesaji;
        setHataliKisiList((prev) => [...prev, person]);
      }

      // İşlem sayacını artır
      tamamlananIslem++;

      // Son işlem tamamlandıysa işlem durumunu güncelle
      if (tamamlananIslem === toplamIslem) {
        setIslemDevamEdiyorMu(false);
      }
    }
  };

  return (
    <div className="ozellik-aktar-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-primary text-white">
          <h3 className="mb-0">
            <FaFileUpload className="me-2" />
            Aktarım - Özellik Aktar
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <div className="d-flex">
              <FaInfoCircle size={24} className="me-3 mt-1" />
              <div>
                <h5 className="alert-heading">Özellik Aktarımı Hakkında</h5>
                <p className="mb-0">
                  Özellik Aktar ekranını kullanarak hali hazırda sistemde
                  kayıtlı olan personele toplu veri girişi yapılabilir. Örneğin
                  toplu olarak personele TC kimlik bilgisi girişi yapılacak ise
                  bu ekran kullanılabilir.
                </p>
                <p className="mb-0 mt-2">
                  <strong>Önemli:</strong> Veri girişinde kullanılacak dosya
                  uzantısı CSV olmalıdır. Aktarım işleminde sicilNo sütunu
                  zorunludur.
                </p>
              </div>
            </div>
          </Alert>

          {aktarimIzinVerilenAttributes.length > 0 && (
            <Card className="border mb-4">
              <CardHeader className="bg-light">
                <h5 className="mb-0">
                  <FaTable className="text-primary me-2" />
                  İzin Verilen Özellikler
                </h5>
              </CardHeader>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <Table hover bordered className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Özellik Adı</th>
                        <th>CSV Header</th>
                        <th>Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aktarimIzinVerilenAttributes.map((attribute) => (
                        <tr key={attribute.id}>
                          <td>
                            <span className="fw-medium">{attribute.name}</span>
                          </td>
                          <td>
                            {attribute.csvHeaderName}{" "}
                            {attribute.required && (
                              <Badge color="danger" pill size="sm">
                                Zorunlu
                              </Badge>
                            )}
                          </td>
                          <td>{attribute.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}

          <Form>
            <FormGroup>
              <Label for="csvFile" className="fw-bold">
                CSV Dosyası Seçin
              </Label>
              <div className="input-group mb-2">
                <Input
                  type="file"
                  name="file"
                  id="csvFile"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="form-control"
                />
                <span className="input-group-text bg-light">CSV</span>
              </div>
              <FormText>
                Desteklenen uzantı: <strong>CSV</strong> - Dosya içeriği UTF-8
                kodlamasında olmalıdır.
              </FormText>
            </FormGroup>
          </Form>

          {dosyaSecildiMi && (
            <div className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="text-primary mb-0">
                        <FaFileUpload className="me-2" />
                        {yuklenenDosyaAdi}
                      </h5>
                      <p className="text-muted mb-0 mt-1">
                        Toplam{" "}
                        <Badge color="info" pill>
                          {kisiSayisi} kişi
                        </Badge>{" "}
                        güncellenecek
                      </p>
                    </div>
                    <div>
                      <Badge
                        color={hataliHeaderVarMi ? "danger" : "success"}
                        className="p-2"
                      >
                        Başlıklar: {hataliHeaderVarMi ? "HATALI! ✗" : "Uygun ✓"}
                      </Badge>
                    </div>
                  </div>

                  {hataliHeaderVarMi && hataliHeaderList.length > 0 && (
                    <Alert color="danger" className="mt-3">
                      <h6 className="alert-heading">
                        <FaExclamationTriangle className="me-2" />
                        Hatalı Başlıklar
                      </h6>
                      <p>
                        Aşağıdaki başlık(lar) izin verilen başlıklar listesinde
                        bulunmamaktadır:
                      </p>
                      <ul className="mb-0">
                        {hataliHeaderList.map((header, index) => (
                          <li key={index}>
                            <code>{header}</code>
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {!hataliHeaderVarMi && (
                    <div className="mt-3">
                      <p className="mb-3">
                        <strong>Yüklenecek başlıklar:</strong>{" "}
                        {headerList.map((header, index) => (
                          <Badge color="secondary" className="me-1" key={index}>
                            {header}
                          </Badge>
                        ))}
                      </p>

                      <Button
                        color="primary"
                        size="lg"
                        onClick={handleAktar}
                        disabled={islemDevamEdiyorMu}
                      >
                        {islemDevamEdiyorMu ? (
                          <>
                            <Spinner size="sm" className="me-2" /> İşlem
                            Yapılıyor...
                          </>
                        ) : (
                          <>
                            <FaFileUpload className="me-2" /> Aktarımı Başlat
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {islemDevamEdiyorMu && (
            <div className="text-center my-5">
              <Spinner
                color="primary"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">
                Personel özellikleri güncelleniyor, lütfen bekleyin...
              </p>
            </div>
          )}

          {yuklemeBasladiMi && !islemDevamEdiyorMu && (
            <Row className="mt-4">
              {hataliKisiList.length > 0 && (
                <Col md="12" className="mb-4">
                  <Card className="border-danger">
                    <CardHeader className="bg-danger text-white">
                      <h5 className="mb-0">
                        <FaExclamationTriangle className="me-2" />
                        Güncellemesi Başarısız Olan Kayıtlar (
                        {hataliKisiList.length} kişi)
                      </h5>
                    </CardHeader>
                    <CardBody>
                      <div className="table-responsive">
                        <Table striped hover bordered className="mb-0">
                          <thead>
                            <tr>
                              <th>Sicil No</th>
                              {hataliKisiList.length > 0 &&
                                Object.keys(hataliKisiList[0])
                                  .filter(
                                    (key) =>
                                      key !== "sicilNo" && key !== "hataMesaji"
                                  )
                                  .map((key) => <th key={key}>{key}</th>)}
                              <th>Hata Mesajı</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hataliKisiList.map((person, index) => (
                              <tr key={index}>
                                <td>{person.sicilNo}</td>
                                {Object.entries(person)
                                  .filter(
                                    ([key]) =>
                                      key !== "sicilNo" && key !== "hataMesaji"
                                  )
                                  .map(([key, value]) => (
                                    <td key={key}>{value}</td>
                                  ))}
                                <td className="text-danger">
                                  {person.hataMesaji}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              )}

              {basariliKisiList.length > 0 && (
                <Col md="12">
                  <Card className="border-success">
                    <CardHeader className="bg-success text-white">
                      <h5 className="mb-0">
                        <FaCheck className="me-2" />
                        Güncellemesi Başarılı Olan Kayıtlar (
                        {basariliKisiList.length} kişi)
                      </h5>
                    </CardHeader>
                    <CardBody>
                      <div className="table-responsive">
                        <Table striped hover bordered className="mb-0">
                          <thead>
                            <tr>
                              <th>Sicil No</th>
                              {Object.keys(basariliKisiList[0])
                                .filter((key) => key !== "sicilNo")
                                .map((key) => (
                                  <th key={key}>{key}</th>
                                ))}
                            </tr>
                          </thead>
                          <tbody>
                            {basariliKisiList.map((person, index) => (
                              <tr key={index}>
                                <td>{person.sicilNo}</td>
                                {Object.entries(person)
                                  .filter(([key]) => key !== "sicilNo")
                                  .map(([key, value]) => (
                                    <td key={key}>{value}</td>
                                  ))}
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
