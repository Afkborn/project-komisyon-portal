import React, { useState, useEffect } from "react";
import { FormGroup, Input, Label, Badge, Spinner } from "reactstrap";
import axios from "axios";

export default function PersonelListe({
  selectedKurum,
  token,
  showPersonelDetay,
  unvanlar,
}) {
  const [personeller, setPersoneller] = useState([]);
  const [filteredPersoneller, setFilteredPersoneller] = useState([]);
  const [loadSpinner, setLoadSpinner] = useState(false);

  useEffect(() => {
    if (selectedKurum)
      if (personeller.length === 0) getPersoneller(selectedKurum.id);
    // eslint-disable-next-line
  }, [selectedKurum]);

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
        // sort personList by unvan oncelikSirasi
        personList.sort(
          (a, b) => a.title.oncelikSirasi - b.title.oncelikSirasi
        );
        setPersoneller(personList);
        setFilteredPersoneller(personList);
      })
      .catch((error) => {
        setLoadSpinner(false);
        console.log(error);
      });
  };

  const handleUnvanChange = (e) => {
    if (e.target.value === "0") {
      setFilteredPersoneller(personeller);
    } else {
      let tempPersoneller = personeller.filter(
        (personel) => personel.title.kind === e.target.value
      );
      setFilteredPersoneller(tempPersoneller);
    }
  };

  return (
    <div>
      <h3>Tüm Personel Listesi (Kurum Bazlı)</h3>
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
              <option key={unvan.kind} value={unvan.kind}>
                {unvan.name}
              </option>
            ))}
          </Input>
        </FormGroup>
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
                <th>Birim</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersoneller.map((personel) => (
                <tr key={personel._id}>
                  <td>{personel.sicil}</td>
                  <td>{personel.ad + " " + personel.soyad}</td>
                  <td>{personel.title.name}</td>
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
