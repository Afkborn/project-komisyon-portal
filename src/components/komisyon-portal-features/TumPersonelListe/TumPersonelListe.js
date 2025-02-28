import React, { useState, useEffect } from "react";
import { FormGroup, Input, Label, Badge, Spinner, Button } from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import DataTable from "../../common/DataTable";

export default function TumPersonelListe({
  selectedKurum,
  token,
  showPersonelDetay,
  unvanlar,
}) {
  const [personeller, setPersoneller] = useState([]);
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [selectedUnvan, setSelectedUnvan] = useState(undefined);
  const [isDurusmaKatibiChecked, setIsDurusmaKatibiChecked] = useState(false);

  const columns = [
    { key: "sicil", header: "Sicil No" },
    {
      key: "fullName",
      header: "Ad Soyad",
      render: (item) => `${item.ad} ${item.soyad}`,
    },
    {
      key: "unvan",
      header: "Ünvan",
      render: (item) => (
        <div>
          <Badge color="danger">{item.title.name}</Badge>{" "}
          {item.durusmaKatibiMi && <Badge color="warning">Duruşma</Badge>}
        </div>
      ),
    },
    {
      key: "description",
      header: "Açıklama",
      render: (item) => (
        <div>
          {item.description}{" "}
          {item.level && <Badge color="success">Lvl. {item.level}</Badge>}
          {item.isTemporary && (
            <Badge color="info" className="ms-1">
              Geçici
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "birim",
      header: "Birim",
      render: (item) => item.birimID.name,
    },
  ];

  useEffect(() => {
    if (selectedKurum && personeller.length === 0) {
      getPersoneller();
    }
    // eslint-disable-next-line
  }, [selectedKurum]);

  const getPersoneller = () => {
    setLoadSpinner(true);
    const configuration = {
      method: "GET",
      url: "/api/persons?institutionId=" + selectedKurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        // Sort by title.oncelikSirasi, then birimID.oncelikSirasi, and finally birimID.series
        const sortedPersonel = response.data.personList.sort((a, b) => {
          const titleComparison = a.title.oncelikSirasi - b.title.oncelikSirasi;
          if (titleComparison !== 0) return titleComparison;

          const birimOncelikComparison =
            a.birimID.oncelikSirasi - b.birimID.oncelikSirasi;
          if (birimOncelikComparison !== 0) return birimOncelikComparison;

          return a.birimID.series - b.birimID.series;
        });

        setPersoneller(sortedPersonel);
        setLoadSpinner(false);
      })
      .catch((error) => {
        console.log(error);
        alertify.error("Personel listesi alınırken bir hata oluştu");
        setLoadSpinner(false);
      });
  };

  const handleUnvanChange = (e) => {
    setSelectedUnvan(
      e.target.value === "0"
        ? undefined
        : unvanlar.find((u) => u.name === e.target.value)
    );
  };

  const getFilteredData = () => {
    let filtered = [...personeller];

    if (selectedUnvan && selectedUnvan.name !== "0") {
      filtered = filtered.filter((p) => p.title.name === selectedUnvan.name);
    }

    if (isDurusmaKatibiChecked) {
      filtered = filtered.filter((p) => p.durusmaKatibiMi === true);
    }

    return filtered;
  };

  return (
    <div>
      <h3>Tüm Personel Listesi</h3>
      <span>
        Seçili olan kuruma kayıtlı olan tüm personeller listelenmektedir.
        Personeller ünvan seçilerek filtreleme yapılabilir.
      </span>
      <hr />

      <div className="mb-3">
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

        {selectedUnvan && selectedUnvan.kind === "zabitkatibi" && (
          <FormGroup>
            <Label check>
              <Input
                type="checkbox"
                onChange={(e) => setIsDurusmaKatibiChecked(e.target.checked)}
              />{" "}
              Duruşma Katiplerini Göster
            </Label>
          </FormGroup>
        )}
      </div>

      {loadSpinner ? (
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      ) : personeller.length === 0 ? (
        <div className="alert alert-info">Personel bulunamadı.</div>
      ) : (
        <DataTable
          data={getFilteredData()}
          columns={columns}
          onDetailClick={showPersonelDetay}
          tableName="tumPersonelTable"
          initialPageSize={50}
        />
      )}
    </div>
  );
}
