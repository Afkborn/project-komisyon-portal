import React, { useState, useEffect } from "react";
import {
  Table,
  FormGroup,
  Input,
  Label,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
  Badge,
} from "reactstrap";
import BirimEkleModal from "./BirimEkleModal";
import BirimSilModal from "./BirimSilModal";
import axios from "axios";
import updateSvg from "../../assets/edit.svg";
import copSepeti from "../../assets/delete.svg";

export default function Birimler({ kurumlar, token }) {
  const [kurum, setKurum] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [birimler, setBirimler] = useState([]);
  const [showBirimEkleModal, setShowBirimEkleModal] = useState(false);
  const [showBirimSilModal, setShowBirimSilModal] = useState(false);
  const [deleteSelectedBirim, setDeleteSelectedBirim] = useState(null);

  const birimEkleToggle = () => setShowBirimEkleModal(!showBirimEkleModal);
  const birimSilToggle = () => setShowBirimSilModal(!showBirimSilModal);

  const clikableStyle = {
    cursor: "pointer",
  };

  function handleKurumChange(event) {
    if (event.target.value === "Seçiniz") {
      setKurum(null);
      return;
    }
    if (event.target.value === kurum?.name) return;
    // birimleri temizliyoruz çünkü seçili kurum değişiyor.
    setBirimler([]);
    setKurum(kurumlar.find((kurum) => kurum.name === event.target.value));
  }

  function handleNavLinkClick(type) {
    if (selectedTypeId === type.id) return;

    setSelectedTypeId(type.id);
  }

  function handleButtonAddBirim() {
    if (kurum === null) return alert("Lütfen önce bir kurum seçiniz");
    setShowBirimEkleModal(true);
  }

  function getBirimler() {
    const configuration = {
      method: "GET",
      url: "api/units/institution/" + kurum.id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios(configuration)
      .then((result) => {
        result.data.unitList.sort((a, b) => {
          // sort by unit type priority

          if (a.unitType.oncelikSirasi !== b.unitType.oncelikSirasi) {
            return a.unitType.oncelikSirasi - b.unitType.oncelikSirasi;
          }

          return a.series - b.series;
        });
        setBirimler(result.data.unitList);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleBirimDelete(birim) {
    setDeleteSelectedBirim(birim);
    setShowBirimSilModal(true);
  }

  function renderMahkemeBirim(birim) {
    return (
      <tr key={birim._id}>
        <td>{birim.unitType.name}</td>
        <td>{birim.unitType.unitType}</td>
        <td>{birim.series === 0 ? "-" : birim.series}</td>
        <td>{birim.name}</td>
        <td>
          {birim.status ? (
            <Badge color="success">Aktif</Badge>
          ) : (
            <Badge color="danger">Pasif</Badge>
          )}
        </td>
        <td>{birim.minClertCount}</td>
        <td>{birim.delegationType}</td>
        <td>
          <img
            hidden={true}
            src={updateSvg}
            style={clikableStyle}
            alt="update"
            onClick={() => {
              //handleBirimUpdate(birim);
            }}
          />

          <img
            className="ms-2"
            src={copSepeti}
            style={clikableStyle}
            alt="delete"
            onClick={() => {
              handleBirimDelete(birim);
            }}
          />
        </td>
      </tr>
    );
  }
  function renderSavcilikVeDiger(birim) {
    return (
      <tr className={birim.status ? "" : "table-danger"} key={birim.id}>
        <td>{birim.unitType.name}</td>
        <td>{birim.name}</td>
        <td>{birim.status ? "Aktif" : "Pasif"}</td>
      </tr>
    );
  }

  function renderTabPane(type) {
    if (selectedTypeId === 0) {
      return (
        <div>
          <div className="mt-2">
            Mahkemeye özgü filtrelemeri koyalım buraya{" "}
          </div>
          <TabPane tabId={type.id} key={type.id} className="mt-2">
            <Row>
              <Col sm="12">
                <Table hover>
                  <thead>
                    <tr key="tableHead">
                      <th>Birim Tipi</th>
                      <th>Birim Alan</th>
                      <th>Sıra</th>
                      <th>Adı</th>
                      <th>Durum</th>
                      <th>Gerekli Katip S.</th>
                      <th>Heyet Drm</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {birimler.map((birim) => {
                      if (birim.unitType.institutionTypeId === 0) {
                        return renderMahkemeBirim(birim);
                      }
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </TabPane>
        </div>
      );
    } else {
      // SAVCILIK VE DİĞER RENDDERİ
      return (
        <TabPane tabId={type.id} key={type.id}>
          <Row>
            <Col sm="12">
              <Table hover>
                <thead>
                  <tr>
                    <th>Birim Tipi</th>
                    <th>Adı</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {birimler.map((birim) => {
                    if (birim.unitType.institutionTypeId === selectedTypeId) {
                      return renderSavcilikVeDiger(birim);
                    }
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </TabPane>
      );
    }
  }

  useEffect(() => {
    if (kurum) {
      if (birimler.length === 0) {
        getBirimler();
      }
    }
  }, [kurum, selectedTypeId]);

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

      <div className="mt-5" hidden={!kurum}>
        {/* hidden={birimler.length === 0} */}
        <Nav tabs>
          {kurum &&
            kurum.types.map((type) => (
              <NavItem key={type.id}>
                <NavLink
                  className={selectedTypeId === type.id ? "active" : ""}
                  onClick={(e) => {
                    handleNavLinkClick(type);
                  }}
                >
                  {type.name}
                </NavLink>
              </NavItem>
            ))}
        </Nav>
        <TabContent activeTab={selectedTypeId}>
          {kurum &&
            kurum.types.map((type) => {
              if (type.id === selectedTypeId) {
                console.log("selectedTypeId", selectedTypeId, "type", type.id);
                return renderTabPane(type);
              }
            })}
        </TabContent>
      </div>
      <BirimEkleModal
        modal={showBirimEkleModal}
        toggle={birimEkleToggle}
        kurum={kurum}
        token={token}
      />
      <BirimSilModal
        modal={showBirimSilModal}
        toggle={birimSilToggle}
        birim={deleteSelectedBirim}
        token={token}
      />
    </div>
  );
}
