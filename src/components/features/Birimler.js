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
} from "reactstrap";
import BirimEkleModal from "./BirimEkleModal";
import axios from "axios";

export default function Birimler({ kurumlar, token }) {
  const [kurum, setKurum] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [birimler, setBirimler] = useState([]);
  const [showBirimEkleModal, setShowBirimEkleModal] = useState(false);
  const toggle = () => setShowBirimEkleModal(!showBirimEkleModal);

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

  function renderTabPane(type) {
    if (type.id === 0) {
      // MAHKEME RENDERİ
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
                      <th>Katip S</th>
                      <th>Heyet Drm</th>
                      <th>#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {birimler.map((birim) => (
                      <tr
                        className={birim.status ? "" : "table-danger"}
                        key={birim._id}
                        hidden={
                          selectedTypeId != birim.unitType.institutionTypeId
                        }
                      >
                        <td>{birim.unitType.name}</td>
                        <td>{birim.unitType.unitType}</td>
                        <td>{birim.series === 0 ? "-" : birim.series}</td>
                        <td>{birim.name}</td>
                        <td>{birim.status ? "Aktif" : "Pasif"}</td>
                        <td>{birim.minClertCount}</td>
                        <td>{birim.clerks.length}</td>
                        <td>{birim.delegationType}</td>
                        <td>
                          <Button
                            size="sm"
                            color="info"
                            onClick={() => {
                              // handleBirimUpdate(birim);
                            }}
                          >
                            Updt.
                          </Button>
                          <Button
                            className="ms-2"
                            size="sm"
                            color="danger"
                            onClick={() => {
                              // handleBirimDelete(birim);
                            }}
                          >
                            Del.
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                    <th>Katip Sayısı</th>
                  </tr>
                </thead>
                <tbody>
                  {birimler.map((birim) => (
                    <tr
                      className={birim.status ? "" : "table-danger"}
                      key={birim.id}
                      hidden={
                        selectedTypeId != birim.unitType.institutionTypeId
                      }
                    >
                      <td>{birim.unitType.name}</td>
                      <td>{birim.name}</td>
                      <td>{birim.status ? "Aktif" : "Pasif"}</td>
                      <td>{birim.clerks.length}</td>
                    </tr>
                  ))}
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
              return renderTabPane(type);
            })}
        </TabContent>
      </div>
      <BirimEkleModal
        modal={showBirimEkleModal}
        toggle={toggle}
        kurum={kurum}
        token={token}
      />
    </div>
  );
}
