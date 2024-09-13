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
import * as XLSX from "xlsx";
import axios from "axios";
export default function PersonelAktar({ selectedKurum, token, unvanlar }) {
  const [dosyaSecildiMi, setDosyaSecildiMi] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [unitsNames, setUnitsNames] = useState([]);
  const [yuklenecekPersonelListesi, setYuklenecekPersonelListesi] = useState(
    []
  );
  const [hataliListe, setHataliListe] = useState([]);
  const [aktarimBasladiMi, setAktarimBasladiMi] = useState(false);
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
  }, [selectedKurum]);

  const fetchUnitsNames = async () => {
    const config = {
      method: "GET",
      url: `api/units/institution/${selectedKurum.id}/name`,
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
    setDosyaSecildiMi(false);
    setAktarimBasladiMi(false);

    const file = event.target.files[0];
    if (!file) return;

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
    };
    setDosyaSecildiMi(true);
    reader.readAsBinaryString(file);
  };

  const handleAktarimBaslat = async () => {
    setHataliListe([]);

    if (!headerlarDogruMu()) {
      alert("Excel dosyasındaki sütunlar uygun değil.");
      return;
    }

    excelData.forEach((row) => {
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
          url: "api/persons/",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            sicil: personel.sicilNo,
            ad: personel.ad,
            soyad: personel.soyad,
            kind: unvan.kind,
            goreveBaslamaTarihi: personel.kurumaBaslamaTarihi,
            birimID: birim._id,
            birimeBaslamaTarihi: bugunYYYYMMDD,
          },
        };

        axios(config)
          .then(() => {
            console.log("Personel başarıyla eklendi.");
          })
          .catch((error) => {
            let errorCode = error.response.data.code;
            if (errorCode === 11000) {
              row["Hata"] = "Bu kayıt zaten mevcut.";
            } else {
              row["Hata"] = error.message;
            }
            setHataliListe((prev) => [...prev, row]);
          });
      } catch (error) {
        console.log("Hatalı Personel: ", row);
        row["Hata"] = error.message;
        setHataliListe((prev) => [...prev, row]);
      }
    });

    setAktarimBasladiMi(true);
  };

  return (
    <div>
      <h3>Aktarım - Personel Aktar</h3>
      <span>
        Aktarım ekranını kullanarak UYAP üzerinden aldığınız excel dosyası ile
        personel aktarımı yapabilirsiniz. <br />
        Aktarım yapılacak excel dosyasında{" "}
        <b>
          {" "}
          SICIL_NO, ADSOYAD, S_UNVAN_ACIKLAMA, S_BRM_BOLUMAD ve KURUMA_BSL_TRH{" "}
        </b>
        sütunları bulunmalıdır. <br />
        Aktarım işlemi sırasında personel bilgileri kontrol edilir ve eğer
        sistemde kayıtlı olan bir personel ise güncelleme yapılır, eğer sistemde
        kayıtlı olmayan bir personel ise yeni personel olarak eklenir. Aktarım
        işlemi sırasında hata alan personeller hata listesine eklenir ve işlem
        sonunda hata listesi indirilebilir.
      </span>
      <div className="mt-2">
        {" "}
        <span>
          <h5>Olası hatalar</h5>
          <h6>Aktarım yapılacak excel dosyasında;</h6>
          <li>eksik sütunlar varsa hata alınır.</li>
          <li>SICIL_NO sütunu boş olan personeller hata alır.</li>
          <li>SICIL_NO sütunu sayısal olmayan personeller hata alır.</li>
          <li>
            S_UNVAN_ACIKLAMA da bulunan ünvan sistemde kayıtlı ünvan ismi ile{" "}
            <b> birebir uyuşmaz </b>ise hata alınır. (Örn: "<b>M</b>üdür" yerine
            "<b>m</b>üdür" yazılmışsa)
          </li>
          <li>
            S_BRM_BOLUMAD da bulunan bölüm ismi sistemde kayıtlı bölüm ile{" "}
            <b> birebir uyuşmaz </b> ise hata alınır. (Örn: "<b>2.</b> Ağır Ceza
            Mahkemesi" yerine "2 Ağır Ceza Mahkemesi" yazılmışsa)
          </li>

          <h5>Önemli Not</h5>
          <li>
            Örneğin bölüm kısmının başında il ismi olacaktır, Örn: "Eskişehir 2.
            Ağır Ceza Mahkemesi". Bu "2. Ağır Ceza Mahkemesi" şeklinde
            değerlendirilir ve ona göre birim aranır. Eğer sistemde "2. Ağır
            Ceza Mahkemesi" şeklinde bir birim yoksa hata alınır.
          </li>
        </span>
      </div>
      <hr />

      <div className="mt-3">
        <Form>
          <FormGroup>
            <Label for="excelFile">Dosya</Label>
            <Input
              type="file"
              name="file"
              id="excelFile"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
            />
            <FormText>
              Seçilecek excel dosyasının sütunları kontrol edilerek aktarım
              yapılacaktır. Desteklenen uzantı türleri: .xls, .xlsx
            </FormText>
          </FormGroup>
        </Form>
      </div>

      <div hidden={!dosyaSecildiMi}>
        <h6>
          Yüklenen excel dosyasında toplam{" "}
          <b> {excelData.length} kişi bulunmakta. </b>
        </h6>

        <h6>Excel başlıkları {headerlarDogruMu() ? "uygun." : "HATALI!"}</h6>

        <div>
          <Button
            color="success"
            disabled={!headerlarDogruMu() || aktarimBasladiMi}
            onClick={(e) => {
              handleAktarimBaslat();
            }}
          >
            Aktarımı Başlat
          </Button>
        </div>

        <div hidden={hataliListe == 0} className="mt-2">
          <h5>Aktarımı başarısız olan {hataliListe.length} kişi</h5>
          <Table striped size="sm">
            <thead>
              <tr>
                {hataliListe.length > 0 &&
                  Object.keys(hataliListe[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {hataliListe.length > 0 &&
                hataliListe.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, index) => (
                      <td key={index}>{value}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
