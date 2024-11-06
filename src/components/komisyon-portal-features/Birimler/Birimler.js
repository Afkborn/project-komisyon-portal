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
  Tooltip,
} from "reactstrap";
import BirimEkleModal from "./BirimEkleModal";
import BirimSilModal from "./BirimSilModal";
import BirimGuncelleModal from "./BirimGuncelleModal";
import axios from "axios";
import updateSvg from "../../../assets/edit.svg";
import copSepeti from "../../../assets/delete.svg";
import { GET_UNITS_BY_INSTITUTİON } from "../../constants/AxiosConfiguration";

export default function Birimler({ token, selectedKurum }) {
  const [selectedFilterOption, setSelectedFilterOption] = useState("Ceza");

  const handleRadioFilterChange = (e) => {
    setSelectedFilterOption(e.target.value);
    if (e.target.value === "Ceza") {
      setBirimlerFiltered(
        birimler.filter((birim) => birim.unitType.unitType === "Ceza")
      );
    } else {
      setBirimlerFiltered(
        birimler.filter((birim) => birim.unitType.unitType === "Hukuk")
      );
    }
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    if (searchValue === "") {
      setBirimlerFiltered(
        birimler.filter(
          (birim) => birim.unitType.unitType === selectedFilterOption
        )
      );
    } else {
      setBirimlerFiltered(
        birimler.filter(
          (birim) =>
            birim.unitType.unitType === selectedFilterOption &&
            birim.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  };

  const [kurum, setKurum] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [birimler, setBirimler] = useState([]);
  const [birimlerFiltered, setBirimlerFiltered] = useState([]);

  const [showBirimEkleModal, setShowBirimEkleModal] = useState(false);
  const birimEkleToggle = () => setShowBirimEkleModal(!showBirimEkleModal);

  const [showBirimSilModal, setShowBirimSilModal] = useState(false);
  const [deleteSelectedBirim, setDeleteSelectedBirim] = useState(null);
  const birimSilToggle = () => setShowBirimSilModal(!showBirimSilModal);

  const [showBirimGuncelleModal, setShowBirimGuncelleModal] = useState(false);
  const [updateSelectedBirim, setUpdateSelectedBirim] = useState(null);
  const birimGuncelleToggle = () =>
    setShowBirimGuncelleModal(!showBirimGuncelleModal);

  const clikableStyle = {
    cursor: "pointer",
  };

  // function handleKurumChange(event) {
  //   if (event.target.value === "Seçiniz") {
  //     setKurum(null);
  //     return;
  //   }
  //   if (event.target.value === kurum?.name) return;
  //   // birimleri temizliyoruz çünkü seçili kurum değişiyor.
  //   setBirimler([]);
  //   setKurum(kurumlar.find((kurum) => kurum.name === event.target.value));
  // }

  function handleNavLinkClick(type) {
    if (selectedTypeId === type.id) return;
    setSelectedTypeId(type.id);
  }

  function handleButtonAddBirim() {
    if (kurum === null) return alert("Lütfen önce bir kurum seçiniz");
    setShowBirimEkleModal(true);
  }

  function getBirimler() {
    axios(GET_UNITS_BY_INSTITUTİON(kurum.id, token))
      .then((result) => {
        result.data.unitList.sort((a, b) => {
          // sort by unit type priority
          if (a.unitType.oncelikSirasi !== b.unitType.oncelikSirasi) {
            return a.unitType.oncelikSirasi - b.unitType.oncelikSirasi;
          }

          return a.series - b.series;
        });
        setBirimler(result.data.unitList);
        setBirimlerFiltered(
          result.data.unitList.filter(
            (birim) => birim.unitType.unitType === selectedFilterOption
          )
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleBirimDelete(birim) {
    setDeleteSelectedBirim(birim);
    setShowBirimSilModal(true);
  }

  function handleBirimUpdate(birim, isMahkeme = true) {
    // birim içinde isMahkeme adında bir property oluştur
    // ve bu property true ise mahkeme birimi false ise savcilik ve genel birim olacak
    // bu propertyi kullanarak birim güncelleme işlemlerini
    // ayırmamız gerekiyor
    const updatedBirim = { ...birim, isMahkeme };

    setUpdateSelectedBirim(updatedBirim); // güncellenmiş birimi set ediyoruz
    setShowBirimGuncelleModal(true);
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
            id="update"
            src={updateSvg}
            style={clikableStyle}
            alt="update"
            onClick={() => {
              handleBirimUpdate(birim);
            }}
          />
          <Tooltip
            placement="right"
            isOpen={tooltipOpen}
            target="update"
            toggle={toolTipToogle}
          >
            Birim Güncelle
          </Tooltip>

          <img
            id="delete"
            className="ms-2"
            src={copSepeti}
            style={clikableStyle}
            alt="delete"
            onClick={() => {
              handleBirimDelete(birim);
            }}
          />
          <Tooltip
            placement="right"
            isOpen={tooltipOpenDelete}
            target="delete"
            toggle={toolTipToogleDelete}
          >
            Birim Sil
          </Tooltip>
        </td>
      </tr>
    );
  }

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toolTipToogle = () => setTooltipOpen(!tooltipOpen);


  const [tooltipOpenDelete, setTooltipOpenDelete] = useState(false);
  const toolTipToogleDelete = () => setTooltipOpenDelete(!tooltipOpenDelete);

  function renderSavcilikVeGenel(birim) {
    return (
      <tr className={birim.status ? "" : "table-danger"} key={birim.id}>
        <td>{birim.unitType.name}</td>
        <td>{birim.name}</td>
        <td>
          {birim.status ? (
            <Badge color="success">Aktif</Badge>
          ) : (
            <Badge color="danger">Pasif</Badge>
          )}
        </td>
        <td>
          <img
            id="update"
            src={updateSvg}
            style={clikableStyle}
            alt="update"
            onClick={() => {
              handleBirimUpdate(birim, false);
            }}
          />
          <Tooltip
            placement="right"
            isOpen={tooltipOpen}
            target="update"
            toggle={toolTipToogle}
          >
            Birim Güncelle
          </Tooltip>

          <img
            id="delete"
            className="ms-2"
            src={copSepeti}
            style={clikableStyle}
            alt="delete"
            onClick={() => {
              handleBirimDelete(birim);
            }}
          />
          <Tooltip
            placement="right"
            isOpen={tooltipOpenDelete}
            target="delete"
            toggle={toolTipToogleDelete}
          >
            Birim Sil
          </Tooltip>
        </td>
      </tr>
    );
  }

  function renderTabPane(type) {
    if (selectedTypeId === 0) {
      return (
        <div>
          <div className="m-3">
            <FormGroup>
              <Label for="radioCeza">Birim Alan: </Label>{" "}
              <Input
                className="ms-2"
                type="radio"
                name="radio"
                id="radioCeza"
                value="Ceza"
                checked={selectedFilterOption === "Ceza"}
                onChange={handleRadioFilterChange}
              />
              <Label for="radioCeza">Ceza</Label>{" "}
              <Input
                className="ms-2"
                type="radio"
                name="radio"
                id="radioHukuk"
                value="Hukuk"
                checked={selectedFilterOption === "Hukuk"}
                onChange={handleRadioFilterChange}
              />
              <Label for="radioHukuk">Hukuk</Label>
            </FormGroup>
            <FormGroup>
              <Label for="search">Arama</Label>
              <Input
                type="text"
                name="search"
                onChange={(e) => {
                  handleSearchChange(e);
                }}
                id="search"
              />
            </FormGroup>
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
                    {birimlerFiltered.map((birim) =>
                      birim.unitType.institutionTypeId === 0
                        ? renderMahkemeBirim(birim)
                        : null
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </TabPane>
        </div>
      );
    } else if (selectedTypeId === 1) {
      // SAVCILIK RENDER
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {birimler.map((birim) =>
                    birim.unitType.institutionTypeId === selectedTypeId
                      ? renderSavcilikVeGenel(birim)
                      : null
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </TabPane>
      );
    } else {
      //  GENEL RENDER
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
                  {birimler.map((birim) =>
                    birim.unitType.institutionTypeId === selectedTypeId
                      ? renderSavcilikVeGenel(birim)
                      : null
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </TabPane>
      );
    }
  }

  useEffect(() => {
    if (selectedKurum) {
      setKurum(selectedKurum);
    }
    if (kurum) {
      if (birimler.length === 0) {
        getBirimler();
      }
    }
    // eslint-disable-next-line
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
      <div>
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

      <div hidden={!kurum}>
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
            kurum.types.map((type) =>
              type.id === selectedTypeId ? renderTabPane(type) : null
            )}
        </TabContent>
      </div>
      <BirimEkleModal
        modal={showBirimEkleModal}
        toggle={birimEkleToggle}
        kurum={kurum}
        token={token}
        getBirimler={getBirimler}
      />
      <BirimSilModal
        modal={showBirimSilModal}
        toggle={birimSilToggle}
        birim={deleteSelectedBirim}
        token={token}
        getBirimler={getBirimler}
      />
      <BirimGuncelleModal
        modal={showBirimGuncelleModal}
        toggle={birimGuncelleToggle}
        birim={updateSelectedBirim}
        token={token}
        getBirimler={getBirimler}
      />
    </div>
  );
}
