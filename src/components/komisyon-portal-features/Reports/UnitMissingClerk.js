import React, { useState, useEffect } from "react";
import { Button, Badge, Spinner, Label, FormGroup, Input } from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

import { generatePdf } from "../../actions/PdfActions";

export default function UnitMissingClerk({ token, selectedKurum }) {
  const [aramaYapilacakBirimler, setAramaYapilacakBirimler] = useState([]);
  const [eksikKatibiOlanBirimler, setEksikKatibiOlanBirimler] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getEksikKatipAramasiYapilacakBirimler = () => {
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
      })
      .catch((error) => {
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        console.log(errorMessage);
        alertify.error(errorMessage);
      });
  };

  useEffect(() => {
    if (!token) return;
    if (aramaYapilacakBirimler.length === 0) {
      getEksikKatipAramasiYapilacakBirimler();
    }
    // eslint-disable-next-line
  }, [token, aramaYapilacakBirimler]);

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
          id="getRapor"
          onClick={(e) => handleGetRapor(e)}
        >
          Rapor Getir
        </Button>

        {aramaYapilacakBirimler.length === 0 && (
          <div>
            <Spinner color="primary" />
            <span>Rapor için birimler yükleniyor...</span>
          </div>
        )}

        {isLoading && (
          <div>
            <Spinner color="primary" />{" "}
            <span>Rapor yükleniyor, bu işlem biraz zaman alabilir.</span>
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
                  "unitMissingClerkTable",
                  "Eksik Katibi Olan Birimler Listesi.pdf",
                  "detayTD"
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
