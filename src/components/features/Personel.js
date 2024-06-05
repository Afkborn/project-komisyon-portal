import React, { useState } from "react";
import { FormGroup, Input, Label } from "reactstrap";
import axios from "axios";

export default function Personel({ kurumlar, token }) {
  const [kurum, setKurum] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [tumBirimler, setTumBirimler] = useState([]);
  const [birimler, setBirimler] = useState([]);
  function handleKurumChange(event) {
    if (event.target.value === "Seçiniz") {
      setKurum(null);
      return;
    }
    if (event.target.value === kurum?.name) return;
    let selectedKurum = kurumlar.find(
      (kurum) => kurum.name === event.target.value
    );
    setKurum(selectedKurum);
    getBirimler(selectedKurum.id);
  }

  function handleTypeChange(event) {
    if (event.target.value === "Seçiniz") {
      return;
    }
    let typeId = kurum.types.find(
      (type) => type.name === event.target.value
    ).id;
    setBirimler(
      tumBirimler.filter((birim) => birim.unitType.institutionTypeId === typeId)
    );
  }

  function handldeBirimChange(event) {
    if (event.target.value === "Seçiniz") {
      return;
    }
    let selectedBirim = birimler.find((birim) => birim.name === event.target.value);
    console.log(selectedBirim)
  }

  function getBirimler(typeID) {
    const configuration = {
      method: "GET",
      url: "api/units/institution/" + typeID,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((result) => {
        result.data.unitList.sort((a, b) => {
          if (a.unitType.oncelikSirasi !== b.unitType.oncelikSirasi) {
            return a.unitType.oncelikSirasi - b.unitType.oncelikSirasi;
          }
          return a.series - b.series;
        });
        setTumBirimler(result.data.unitList);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div>
      <h3>Birimler</h3>
      <span>
        Sistemde kayıtlı olan birimler listelenmektedir.
        <br />
        Bu ekranda birim ekleyebilir, olanları güncelleyebilir veya
        silebilirsiniz.
      </span>

      <hr />
      <div className="mt-5">
        <FormGroup>
          <Label for="selectKurum">Kurum</Label>
          <Input
            id="selectKurum"
            onChange={(e) => handleKurumChange(e)}
            name="select"
            type="select"
          >
            <option key={-1}>Seçiniz</option>
            {kurumlar.map((kurum) => (
              <option key={kurum.id}>{kurum.name}</option>
            ))}
          </Input>
        </FormGroup>

        <div hidden={!kurum}>
          <FormGroup>
            <Label for="selectType">Tip</Label>
            <Input
              id="selectType"
              onChange={(e) => handleTypeChange(e)}
              name="select"
              type="select"
            >
              <option key={-1}>Seçiniz</option>
              {kurum &&
                kurum.types.map((type) => (
                  <option key={type.id}>{type.name}</option>
                ))}
            </Input>
          </FormGroup>
        </div>
        <div hidden={!kurum || birimler.length === 0}>
          <FormGroup>
            <Label for="selectBirim">Birim</Label>
            <Input
              id="selectBirim"
              onChange={(e) => handldeBirimChange(e)}
              name="select"
              type="select"
            >
              <option key={-1}>Seçiniz</option>
              {birimler &&
                birimler.map((birim) => (
                  <option key={birim.id}>{birim.name}</option>
                ))}
            </Input>
          </FormGroup>
        </div>
      </div>

      <div className="mt-5" hidden={!kurum}>
        AAA BİRİMLER
      </div>
    </div>
  );
}
