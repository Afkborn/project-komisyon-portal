import React, { useState, useEffect } from "react";
import { FormGroup, Input, Label, Badge, Spinner, Button } from "reactstrap";
import axios from "axios";
import PersonelEkleModal from "./PersonelEkleModal";
import {
  renderDate_GGAAYYYY,
  calculateGorevSuresi,
  calculateBirimGorevSuresi,
} from "../../actions/TimeActions";
export default function PersonelListeByBirim({
  unvanlar,
  token,
  selectedKurum,
  showPersonelDetay,
  selectedBirimID,
}) {
  const [kurum, setKurum] = useState(null);
  // const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [tumBirimler, setTumBirimler] = useState([]);
  const [birimler, setBirimler] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBirim, setSelectedBirim] = useState("");

  const [personel, setPersonel] = useState([]);

  const [showPersonelEkleModal, setShowPersonelEkleModal] = useState(false);
  const personelEkleToggle = () =>
    setShowPersonelEkleModal(!showPersonelEkleModal);

  const [showSpinner, setShowSpinner] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBirimler = birimler.filter((birim) => {
    const searchTerms = searchQuery.toLowerCase().split(" ");
    return searchTerms.every((term) => birim.name.toLowerCase().includes(term));
  });

  useEffect(() => {
    if (selectedKurum) {
      setKurum(selectedKurum);
      getBirimler(selectedKurum.id);
    }


    // EN SON DİREKT TIKLANAN ID'yi aldım şimdi onu yüklemem lazım


    // eslint-disable-next-line
  }, [selectedKurum]);

  // function handleKurumChange(event) {
  //   setBirimler([]);
  //   if (event.target.value === "Seçiniz") {
  //     setKurum(null);
  //     return;
  //   }
  //   if (event.target.value === kurum?.name) return;
  //   let selectedKurum = kurumlar.find(
  //     (kurum) => kurum.name === event.target.value
  //   );
  //   setKurum(selectedKurum);
  //   getBirimler(selectedKurum.id);
  // }

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

  function handlePersonDetailButton_Click(person) {
    showPersonelDetay(person);
  }

  function handleBirimChange(event) {
    if (event.target.value === "Seçiniz") {
      return;
    }
    setShowSpinner(true);
    let selectedBirim = birimler.find(
      (birim) => birim.name === event.target.value
    );
    setSelectedBirim(selectedBirim);
    setPersonel([]);
    const configuration = {
      method: "GET",
      url: "api/persons/" + selectedBirim._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((result) => {
        result.data.persons.sort((a, b) => {
          if (a.title === null) {
            return 1;
          }
          if (a.title.oncelikSirasi !== b.title.oncelikSirasi) {
            return a.title.oncelikSirasi - b.title.oncelikSirasi;
          }
          return a.sicil - b.sicil;
        });

        setPersonel(result.data.persons);
        setShowSpinner(false);
      })
      .catch((error) => {
        console.log(error);
        setShowSpinner(false);
      });
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
      <h3>Personel Listesi (Birim Seçerek)</h3>
      <span>
        Sistemde kayıtlı olan personeller listelenmektedir. Personeller birim
        seçilerek görüntülenmektedir. (Seçili kuruma ait birimler gözükecektir.)
        <br />
        Bu ekranda personel ekleyebilir, olanları güncelleyebilir veya
        silebilirsiniz.
      </span>

      <hr />
      <div className="">
        {/* <FormGroup>
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
        </FormGroup> */}

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
            <Label for="searchBirim">Birim Ara</Label>
            <Input
              id="searchBirim"
              onChange={handleSearchChange}
              value={searchQuery}
              placeholder="Birim ara..."
            />

            <Label for="selectBirim">Birim</Label>
            <Input
              id="selectBirim"
              onChange={(e) => handleBirimChange(e)}
              name="select"
              type="select"
              multiple
            >
              {filteredBirimler.map((birim) => (
                <option key={birim.id} value={birim.name}>
                  {birim.name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </div>
      </div>

      <div className="mt-5" hidden={!kurum}>
        {selectedBirim && (
          <div>
            {showSpinner ? (
              <div className="mt-5 center">
                <Spinner type="grow" color="danger" />
              </div>
            ) : (
              <div>
                <div>
                  <h3>{selectedBirim.name} Personel Listesi</h3>
                </div>
                <div>
                  <Button
                    color="success"
                    onClick={personelEkleToggle}
                    className="mt-2"
                  >
                    Personel Ekle
                  </Button>
                </div>

                <div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sicil</th>
                        <th>Ünvan</th>
                        <th>Adı</th>
                        <th>Soyadı</th>
                        <th>Göreve Başlama Tarihi</th>
                        <th>Birimde Geçen Gün</th>
                        <th>Açıklama</th>

                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {personel.map((person) => (
                        <tr key={person._id}>
                          <td>{person.sicil}</td>
                          <td>
                            {person.title ? person.title.name : "BELİRTİLMEMİŞ"}
                          </td>
                          <td>{person.ad}</td>
                          <td>{person.soyad}</td>
                          <td>
                            {renderDate_GGAAYYYY(person.goreveBaslamaTarihi)} (
                            {calculateGorevSuresi(person.goreveBaslamaTarihi)})
                          </td>
                          <td>
                            {renderDate_GGAAYYYY(person.birimeBaslamaTarihi)} (
                            {calculateBirimGorevSuresi(
                              person.birimeBaslamaTarihi
                            )}
                            )
                          </td>
                          <td>
                            {person.description}{" "}
                            {person.level ? (
                              <Badge color="success">Lvl. {person.level}</Badge>
                            ) : (
                              ""
                            )}{" "}
                            {person.isTemporary ? (
                              <Badge color="danger">Geçici Personel</Badge>
                            ) : (
                              ""
                            )}
                          </td>
                          <td>
                            {person.durusmaKatibiMi ? (
                              <Badge color="success">Duruşma Katibi</Badge>
                            ) : (
                              <div></div>
                            )}
                            {person.izindeMi ? (
                              <Badge color="danger">İzinde</Badge>
                            ) : (
                              <div></div>
                            )}
                          </td>

                          <td>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                handlePersonDetailButton_Click(person);
                              }}
                              color="primary"
                            >
                              Detay
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <PersonelEkleModal
        modal={showPersonelEkleModal}
        toggle={personelEkleToggle}
        token={token}
        unvanlar={unvanlar}
        birim={selectedBirim}
        handleBirimChange={handleBirimChange}
        personel={personel}
      />
    </div>
  );
}
