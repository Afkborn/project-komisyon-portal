import React, { useState } from "react";
import { Table, FormGroup, Input, Label, Button } from "reactstrap";
import BirimEkleModal from "./BirimEkleModal";

export default function Birimler({ kurumlar }) {
  const [kurum, setKurum] = useState(null);
  const [birim, setBirim] = useState({
    _id: null,
    institutionID: null,
    institutionName: null,
    type: null,
    name: null,
    createdDate: null,
    mahkemeDurum: null,
  });
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  function handleChange(event) {
    if (event.target.value === "Seçiniz") {
      setKurum(null);
      return;
    }
    setKurum(kurumlar.find((kurum) => kurum.name === event.target.value));
  }

  function handleButtonAddBirim() {
    if (kurum === null) return alert("Lütfen önce bir kurum seçiniz");
    setModal(true);
  }

  function handleAddBirim() {
    alert("Birim eklendi");
  }

  return (
    <div>
      <h3>Birimler</h3>
      <span>
        Sistemde kayıtlı olan birimler listelenmektedir.
        <br />
      </span>

      <hr />
      <div className="mt-5">
        <FormGroup>
          <Label for="selectKurum">Kurum</Label>
          <Input
            id="selectKurum"
            onChange={(e) => handleChange(e)}
            name="select"
            type="select"
          >
            <option key={-1}>Seçiniz</option>
            {kurumlar.map((kurum) => (
              <option key={kurum.id}>{kurum.name}</option>
            ))}
          </Input>
        </FormGroup>
        <div>
          <Button
            className="float-end"
            onClick={(e) => {
              handleButtonAddBirim(e);
            }}
            color="success"
          >
            Birim Ekle{" "}
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <Table hover>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>@fat</td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>Larry</td>
              <td>the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <BirimEkleModal
        modal={modal}
        toggle={toggle}
        handleAddBirim={handleAddBirim}
        kurum={kurum}
        birim = {birim}
        setBirim={setBirim}
      />
    </div>
  );
}
