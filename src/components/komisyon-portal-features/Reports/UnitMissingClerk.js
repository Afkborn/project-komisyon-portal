import React, { useState, useEffect } from "react";
import { Button, Badge, Spinner, Label, FormGroup, Input } from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

import { generatePdf } from "../../actions/PdfActions";
import { printDocument } from "../../actions/PrintActions";


export default function UnitMissingClerk({ token, selectedKurum }) {
  const [aramaYapilacakBirimler, setAramaYapilacakBirimler] = useState([]);
  const [eksikKatibiOlanBirimler, setEksikKatibiOlanBirimler] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getEksikKatipAramasiYapilacakBirimler = () => {
    setIsLoading(true);

    const configuration = {
      method: "GET",
      url:
        "api/reports/eksikKatipAramasiYapilacakBirimler?institutionId=" +
        selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setAramaYapilacakBirimler(
          response.data.eksikKatipKontrolEdilecekBirimler
        );

        if (response.data.eksikKatipKontrolEdilecekBirimler.length === 0) {
          alertify.error("Rapor için birim bulunamadı.");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        console.log(errorMessage);
        alertify.error(errorMessage);
      });
  };

  useEffect(() => {
    if (token) {
      getEksikKatipAramasiYapilacakBirimler();
    }
    // eslint-disable-next-line
  }, [token]);

  const handleGetRapor = (e) => {
    setIsLoading(true);

    setEksikKatibiOlanBirimler([]);
    let configuration = {
      method: "GET",
      url:
        "api/reports/eksikKatibiOlanBirimler?institutionId=" + selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setEksikKatibiOlanBirimler(response.data.eksikKatipOlanBirimler);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <h3>Rapor - Eksik Katibi Olan Birimler</h3>
      <span>
        Bu rapor ile birlikte eksik katibi olan birimler listelenebilir.
      </span>

      <hr />
      <div className="mt-3">
        <FormGroup>
          <Label for="kontrolEdilecekBirimListesi">
            Kontrol Edilecek Birim Listesi
          </Label>
          <Input
            id="kontrolEdilecekBirimListesi"
            multiple
            name="selectMulti"
            type="select"
            disabled
          >
            {aramaYapilacakBirimler.map((birim) => (
              <option key={birim.id} value={birim.id}>
                {birim.birimAdi}
              </option>
            ))}
          </Input>
        </FormGroup>

        <Button
          disabled={aramaYapilacakBirimler.length === 0}
          className="m-3"
          size="lg"
          color="danger"
          id="getRapor"
          onClick={(e) => handleGetRapor(e)}
        >
          Rapor Getir
        </Button>

        {isLoading && (
          <div>
            <Spinner color="primary" />{" "}
            <span>yükleniyor...</span>
          </div>
        )}

        {eksikKatibiOlanBirimler.length > 0 && (
          <div>
            <table className="table" id="unitMissingClerkTable">
              <thead>
                <tr>
                  <th>Birim Adı</th>
                  <th>Gereken Katip Sayısı</th>
                  <th>Mevcut Katip Sayısı</th>
                  <th>Eksik Katip Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {eksikKatibiOlanBirimler.map((birim) => (
                  <tr key={birim._id}>
                    <td>{birim.birimAdi}</td>
                    <td>{birim.gerekenKatipSayisi}</td>
                    <td>{birim.mevcutKatipSayisi}</td>
                    <td>
                      <Badge
                        color={
                          birim.eksikKatipSayisi > 0 ? "danger" : "success"
                        }
                      >
                        {birim.eksikKatipSayisi}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              disabled
              className="m-3"
              size="lg"
              id="exportExcel"
              color="danger"
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
                  "unitMissingClerkTable",
                  "Eksik Katibi Olan Birimler Listesi",
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
                printDocument(document, "unitMissingClerkTable", "detayTD");
              }}
            >
              Yazdır
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
