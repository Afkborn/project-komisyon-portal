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
  Spinner,
  Badge,
  Row,
  Col,
} from "reactstrap";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  FaFileUpload,
  FaCheck,
  FaExclamationTriangle,
  FaFileExcel,
  FaInfoCircle,
} from "react-icons/fa";

export default function PersonelAktar({ selectedKurum, token, unvanlar }) {
  const [dosyaSecildiMi, setDosyaSecildiMi] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [unitsNames, setUnitsNames] = useState([]);

  const [basariliSayisi, setBasariliSayisi] = useState(0);
  const [basariliListe, setBasariliListe] = useState([]);
  const [hataliListe, setHataliListe] = useState([]);
  const [aktarimBasladiMi, setAktarimBasladiMi] = useState(false);
  const [islemDevamEdiyorMu, setIslemDevamEdiyorMu] = useState(false);
  const [yuklenenDosyaAdi, setYuklenenDosyaAdi] = useState("");

  const izinVerilenHeaderler = [
    "Sıra No",
    "SICIL_NO",
    "ADSOYAD",
    "S_UNVAN_ACIKLAMA",
    "S_BRM_BOLUMAD",
    "KURUMA_BSL_TRH",
  ];

  useEffect(() => {
    if (unitsNames.length === 0 && selectedKurum) {
      fetchUnitsNames();
    }
    // eslint-disable-next-line
  }, [selectedKurum]);

  const fetchUnitsNames = async () => {
    const config = {
      method: "GET",
      url: `/api/units/institution/${selectedKurum.id}/name`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      let response = await axios(config);
      setUnitsNames(response.data.unitList);
    } catch (error) {
      console.log("Birimler getirilemedi");
    }
  };

  const personelObjesiOlustur = (personel) => {
    // SICIL_NO intergera çevir
    try {
      personel.SICIL_NO = parseInt(personel.SICIL_NO);
    } catch (error) {
      throw new Error("SICIL_NO sayısal olmalıdır.");
    }

    // adSoyad'ı boşluklara göre ayıralım,  eğer adSoyad 3 kelimeden fazla ise son kelimeyi soyad olarak kabul edelim, geri kalanı ad olarak kabul edelim
    let adSoyad = personel.ADSOYAD.split(" ");
    if (adSoyad.length < 2) {
      throw new Error("ADSOYAD en az 2 kelime olmalıdır.");
    }

    let ad = adSoyad.slice(0, adSoyad.length - 1).join(" ");
    let soyad = adSoyad[adSoyad.length - 1];
    if (ad === "" || soyad === "") {
      throw new Error("ADSOYAD boş olamaz.");
    }

    // bu hepsinin başındaki ESKİŞEHİR yazdığı için.
    // bölüm'ü boşluğa böl, ilkinden sonrasını al
    let bolum = (personel.S_BRM_BOLUMAD = personel.S_BRM_BOLUMAD.split(" ")
      .slice(1)
      .join(" "));

    // GUN/AY/YIL formatını YIL-AY-GUN formatına çevir
    let tarihler = personel.KURUMA_BSL_TRH.split("/");
    let tarih = `${tarihler[2]}-${tarihler[1]}-${tarihler[0]}`;

    return {
      siraNo: personel["Sıra No"],
      sicilNo: personel.SICIL_NO,
      ad: ad,
      soyad: soyad,
      unvan: personel.S_UNVAN_ACIKLAMA,
      bolum: bolum,
      kurumaBaslamaTarihi: tarih,
    };
  };

  const headerlarDogruMu = () => {
    return izinVerilenHeaderler.every((header) => headers.includes(header));
  };

  const handleFileChange = (event) => {
    setHataliListe([]);
    setBasariliListe([]);
    setBasariliSayisi(0);
    setDosyaSecildiMi(false);
    setAktarimBasladiMi(false);

    const file = event.target.files[0];
    if (!file) return;

    setYuklenenDosyaAdi(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false }); // raw: false, tarih formatını otomatik olarak çözer
      const processedData = jsonData.map((row) => {
        // headerları al
        setHeaders(Object.keys(row));

        Object.keys(row).forEach((key) => {
          if (
            typeof row[key] === "string" &&
            /\d{4}-\d{2}-\d{2}/.test(row[key])
          ) {
            row[key] = new Date(row[key]).toLocaleDateString(); // Tarihi uygun formata çevir
          }
        });
        return row;
      });
      setExcelData(processedData);
      setDosyaSecildiMi(true);
    };
    reader.readAsBinaryString(file);
  };

  const handleAktarimBaslat = async () => {
    setHataliListe([]);
    setBasariliListe([]);
    setBasariliSayisi(0);
    setIslemDevamEdiyorMu(true);

    if (!headerlarDogruMu()) {
      alert("Excel dosyasındaki sütunlar uygun değil.");
      setIslemDevamEdiyorMu(false);
      return;
    }

    // Aktarım sayacı ve toplam işlem
    let tamamlananIslem = 0;
    const toplamIslem = excelData.length;

    for (const row of excelData) {
      try {
        let personel = personelObjesiOlustur(row);

        let unvan = unvanlar.find((u) => u.name === personel.unvan);
        if (!unvan) {
          throw new Error("Hatalı Unvan");
        }

        let birim = unitsNames.find((u) => u.name === personel.bolum);
        if (!birim) {
          throw new Error("Hatalı Birim");
        }
        let bugunYYYYMMDD = new Date().toISOString().split("T")[0];
        const config = {
          method: "POST",
          url: "/api/persons/",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            sicil: personel.sicilNo,
            ad: personel.ad,
            soyad: personel.soyad,
            kind: unvan.kind,
            titleID: unvan._id,
            goreveBaslamaTarihi: personel.kurumaBaslamaTarihi,
            birimID: birim._id,
            birimeBaslamaTarihi: bugunYYYYMMDD,
          },
        };

        try {
          await axios(config);
          setBasariliSayisi((prev) => prev + 1);
          setBasariliListe((prev) => [...prev, row]);
        } catch (error) {
          let errorCode = error.response?.data?.code;
          if (errorCode === 11000) {
            row["Hata"] = "Bu kayıt zaten mevcut.";
          } else {
            row["Hata"] = error.message || "Bilinmeyen hata";
          }
          setHataliListe((prev) => [...prev, row]);
        }
      } catch (error) {
        row["Hata"] = error.message;
        setHataliListe((prev) => [...prev, row]);
      }

      // İşlem sayacını artır
      tamamlananIslem++;

      // Son işlem tamamlandıysa
      if (tamamlananIslem === toplamIslem) {
        setIslemDevamEdiyorMu(false);
        setAktarimBasladiMi(true);
      }
    }
  };

  return (
    <div className="personel-aktar-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-primary text-white">
          <h3 className="mb-0">
            <FaFileUpload className="me-2" />
            Aktarım - Personel Aktar
          </h3>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <div className="d-flex">
              <FaInfoCircle size={24} className="me-3 mt-1" />
              <div>
                <h5 className="alert-heading">Aktarım Bilgisi</h5>
                <p>
                  Aktarım ekranını kullanarak UYAP üzerinden aldığınız excel
                  dosyası ile personel aktarımı yapabilirsiniz.
                  <br />
                  Aktarım yapılacak excel dosyasında{" "}
                  <strong>
                    SICIL_NO, ADSOYAD, S_UNVAN_ACIKLAMA, S_BRM_BOLUMAD ve
                    KURUMA_BSL_TRH{" "}
                  </strong>
                  sütunları bulunmalıdır.
                </p>
              </div>
            </div>
          </Alert>

          <Card className="border mb-4">
            <CardHeader className="bg-light">
              <h5 className="mb-0">
                <FaExclamationTriangle className="text-warning me-2" />
                Olası Hatalar ve Çözümleri
              </h5>
            </CardHeader>
            <CardBody>
              <h6>Aktarım yapılacak excel dosyasında:</h6>
              <ul className="mb-4">
                <li>Eksik sütunlar varsa hata alınır.</li>
                <li>SICIL_NO sütunu boş olan personeller hata alır.</li>
                <li>SICIL_NO sütunu sayısal olmayan personeller hata alır.</li>
                <li>
                  S_UNVAN_ACIKLAMA da bulunan ünvan sistemde kayıtlı ünvan ismi
                  ile <strong>birebir uyuşmaz</strong> ise hata alınır. (Örn: "
                  <strong>M</strong>üdür" yerine "<strong>m</strong>üdür"
                  yazılmışsa)
                </li>
                <li>
                  S_BRM_BOLUMAD da bulunan bölüm ismi sistemde kayıtlı bölüm ile{" "}
                  <strong>birebir uyuşmaz</strong> ise hata alınır. (Örn: "
                  <strong>2.</strong> Ağır Ceza Mahkemesi" yerine "2 Ağır Ceza
                  Mahkemesi" yazılmışsa)
                </li>
              </ul>

              <Alert color="warning">
                <strong>Önemli Not:</strong> Örneğin bölüm kısmının başında il
                ismi olacaktır, Örn: "Eskişehir 2. Ağır Ceza Mahkemesi". Bu "2.
                Ağır Ceza Mahkemesi" şeklinde değerlendirilir ve ona göre birim
                aranır. Eğer sistemde "2. Ağır Ceza Mahkemesi" şeklinde bir
                birim yoksa hata alınır.
              </Alert>
            </CardBody>
          </Card>

          <Form>
            <FormGroup>
              <Label for="excelFile" className="fw-bold">
                Excel Dosyası Seçin
              </Label>
              <div className="input-group mb-2">
                <Input
                  type="file"
                  name="file"
                  id="excelFile"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  className="form-control"
                />
                <span className="input-group-text bg-light">
                  <FaFileExcel className="text-success" />
                </span>
              </div>
              <FormText>Desteklenen uzantı türleri: .xls, .xlsx</FormText>
            </FormGroup>
          </Form>

          {dosyaSecildiMi && (
            <div className="mt-4">
              <Card className="border-0 shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="text-primary mb-0">
                        <FaFileExcel className="me-2" />
                        {yuklenenDosyaAdi}
                      </h5>
                      <p className="text-muted mb-0 mt-1">
                        Yüklenen excel dosyasında toplam{" "}
                        <Badge color="info" pill>
                          {excelData.length} kişi
                        </Badge>{" "}
                        bulunmaktadır.
                      </p>
                    </div>
                    <div>
                      <Badge
                        color={headerlarDogruMu() ? "success" : "danger"}
                        className="p-2"
                      >
                        Excel başlıkları:{" "}
                        {headerlarDogruMu() ? "Uygun ✓" : "HATALI! ✗"}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    color="primary"
                    size="lg"
                    className="mt-3"
                    disabled={
                      !headerlarDogruMu() ||
                      aktarimBasladiMi ||
                      islemDevamEdiyorMu
                    }
                    onClick={handleAktarimBaslat}
                  >
                    {islemDevamEdiyorMu ? (
                      <>
                        <Spinner size="sm" className="me-2" /> Aktarım Devam
                        Ediyor...
                      </>
                    ) : (
                      <>
                        <FaFileUpload className="me-2" /> Aktarımı Başlat
                      </>
                    )}
                  </Button>
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
                Personel aktarımı yapılıyor, lütfen bekleyin...
              </p>
            </div>
          )}

          {aktarimBasladiMi && !islemDevamEdiyorMu && (
            <Row className="mt-4">
              {hataliListe.length > 0 && (
                <Col md="12" className="mb-4">
                  <Card className="border-danger">
                    <CardHeader className="bg-danger text-white">
                      <h5 className="mb-0">
                        <FaExclamationTriangle className="me-2" />
                        Aktarımı Başarısız Olan Kayıtlar ({
                          hataliListe.length
                        }{" "}
                        kişi)
                      </h5>
                    </CardHeader>
                    <CardBody>
                      <div className="table-responsive">
                        <Table striped hover bordered className="mb-0">
                          <thead>
                            <tr>
                              {hataliListe.length > 0 &&
                                Object.keys(hataliListe[0]).map((key) => (
                                  <th key={key}>{key}</th>
                                ))}
                            </tr>
                          </thead>
                          <tbody>
                            {hataliListe.map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, index) => (
                                  <td key={index}>{value}</td>
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

              {basariliListe.length > 0 && (
                <Col md="12">
                  <Card className="border-success">
                    <CardHeader className="bg-success text-white">
                      <h5 className="mb-0">
                        <FaCheck className="me-2" />
                        Aktarımı Başarılı Olan Kayıtlar ({basariliSayisi} kişi)
                      </h5>
                    </CardHeader>
                    <CardBody>
                      <div className="table-responsive">
                        <Table striped hover bordered className="mb-0">
                          <thead>
                            <tr>
                              {basariliListe.length > 0 &&
                                Object.keys(basariliListe[0]).map((key) => (
                                  <th key={key}>{key}</th>
                                ))}
                            </tr>
                          </thead>
                          <tbody>
                            {basariliListe.map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, index) => (
                                  <td key={index}>{value}</td>
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
