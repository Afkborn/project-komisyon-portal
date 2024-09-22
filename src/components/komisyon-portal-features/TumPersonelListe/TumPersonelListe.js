import React, { useState, useEffect } from "react";
import { FormGroup, Input, Label, Badge, Spinner } from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
export default function TumPersonelListe({
  selectedKurum,
  token,
  showPersonelDetay,
  unvanlar,
}) {
  const [personeller, setPersoneller] = useState([]);
  const [filteredPersoneller, setFilteredPersoneller] = useState([]);
  const [isTemporaryChecked, setIsTemporaryChecked] = useState(false);
  const [hasDescriptionChecked, setHasDescriptionChecked] = useState(false);
  const [isDurusmaKatibiChecked, setIsDurusmaKatibiChecked] = useState(false);
  const [selectedUnvan, setSelectedUnvan] = useState(undefined);

  const [loadSpinner, setLoadSpinner] = useState(false);

  useEffect(() => {
    if (selectedKurum)
      if (personeller.length === 0) getPersoneller(selectedKurum.id);

    let tempPersoneller = personeller;

    if (selectedUnvan === undefined) {
      tempPersoneller = personeller;
    }

    if (isTemporaryChecked) {
      tempPersoneller = tempPersoneller.filter(
        (personel) => personel.isTemporary === true
      );
    }

    if (hasDescriptionChecked) {
      tempPersoneller = tempPersoneller.filter(
        (personel) =>
          personel.description !== "" &&
          personel.description !== null &&
          personel.description !== undefined
      );
    }

    // duruşma katibi filtresi
    if (isDurusmaKatibiChecked) {
      tempPersoneller = tempPersoneller.filter(
        (personel) => personel.durusmaKatibiMi === true
      );
    }

    if (selectedUnvan && selectedUnvan.name !== "0") {
      tempPersoneller = tempPersoneller.filter(
        (personel) => personel.title.name === selectedUnvan.name
      );
    }

    setFilteredPersoneller(tempPersoneller);
    // eslint-disable-next-line
  }, [
    selectedKurum,
    isTemporaryChecked,
    hasDescriptionChecked,
    personeller,
    isDurusmaKatibiChecked,
    selectedUnvan,
  ]);

  const getPersoneller = () => {
    console.log("getPersoneller");
    setLoadSpinner(true);
    let configuration = {
      method: "GET",
      url: "/api/persons?institutionId=" + selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setLoadSpinner(false);
        let personList = response.data.personList;

        // CHATGPT abim sort işini çok güzel yapıyor, o olmasa bunları yazmaya üşenirim :D
        // Sort by title.oncelikSirasi, then birimID.oncelikSirasi, and finally birimID.series
        personList.sort((a, b) => {
          // İlk olarak title.oncelikSirasi'na göre sıralama
          const titleComparison = a.title.oncelikSirasi - b.title.oncelikSirasi;
          if (titleComparison !== 0) {
            return titleComparison; // Eğer fark varsa bu değeri döner
          }

          // Eğer title.oncelikSirasi eşitse, birimID.oncelikSirasi'na göre sıralama
          const birimOncelikComparison =
            a.birimID.oncelikSirasi - b.birimID.oncelikSirasi;
          if (birimOncelikComparison !== 0) {
            return birimOncelikComparison; // Eğer fark varsa bu değeri döner
          }

          // Eğer hem title.oncelikSirasi hem de birimID.oncelikSirasi eşitse, birimID.series'e göre sıralama
          return a.birimID.series - b.birimID.series;
        });
        setPersoneller(personList);
        setFilteredPersoneller(personList);
      })
      .catch((error) => {
        setLoadSpinner(false);
        console.log(error);
        alertify.error("Bir hata oluştu");
      });
  };

  const handleUnvanChange = (e) => {
    let selectedUnvan = unvanlar.find((unvan) => unvan.name === e.target.value);
    setSelectedUnvan(selectedUnvan);
  };

  const handleDurusmaKatibiChange = (e) => {
    setIsDurusmaKatibiChecked(e.target.checked);
  };

  const handleGeciciPersonelChange = (e) => {
    setIsTemporaryChecked(e.target.checked);
  };

  const handleAciklamaliPersonelChange = (e) => {
    setHasDescriptionChecked(e.target.checked);
  };

  return (
    <div>
      <h3>Tüm Personel Listesi</h3>
      <span>
        Seçili olan kuruma kayıtlı olan tüm personeller listelenmektedir.
        Personeller ünvan seçilerek filtreleme yapılabilir.
        <br />
      </span>
      <hr />

      <div className="">
        <FormGroup>
          <Label for="selectUnvan">Ünvan</Label>
          <Input
            type="select"
            name="selectUnvan"
            id="selectUnvan"
            onChange={handleUnvanChange}
          >
            <option value="0">Tümü</option>
            {unvanlar.map((unvan) => (
              <option key={unvan.name} value={unvan.name}>
                {unvan.name}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label check>
            <Input onClick={handleGeciciPersonelChange} type="checkbox" />
            Geçici Personelleri Göster
          </Label>
        </FormGroup>
        <FormGroup>
          <Label check>
            <Input onClick={handleAciklamaliPersonelChange} type="checkbox" />
            Açıklaması Olanları Göster
          </Label>
        </FormGroup>
        {selectedUnvan && selectedUnvan.kind === "zabitkatibi" && (
          <FormGroup>
            <Label check>
              <Input onClick={handleDurusmaKatibiChange} type="checkbox" />
              Duruşma Katiplerini Göster
            </Label>
          </FormGroup>
        )}
      </div>
      <hr />
      <div>
        {loadSpinner && <Spinner color="primary" />}
        {personeller.length === 0 && !loadSpinner && (
          <span>Personel bulunamadı.</span>
        )}

        {personeller.length > 0 && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Sicil No</th>
                <th>Ad Soyad</th>
                <th>Ünvan</th>
                <th>Açıklama</th>
                <th>Birim</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersoneller.map((personel) => (
                <tr key={personel._id}>
                  <td>{personel.sicil}</td>
                  <td>{personel.ad + " " + personel.soyad}</td>
                  <td>
                    <Badge color="danger">{personel.title.name}</Badge>{" "}
                    {personel.durusmaKatibiMi && (
                      <Badge color="warning" className="ml-1">
                        Duruşma
                      </Badge>
                    )}
                  </td>
                  <td>
                    {personel.description}{" "}
                    {personel.level && (
                      <Badge color="success">Lvl. {personel.level}</Badge>
                    )}
                    {personel.isTemporary && (
                      <Badge color="info" className="ml-1">
                        Geçici
                      </Badge>
                    )}
                  </td>
                  <td>{personel.birimID.name}</td>
                  <td>
                    <Badge
                      color="info"
                      size="sm"
                      onClick={() => showPersonelDetay(personel)}
                    >
                      Detay
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
