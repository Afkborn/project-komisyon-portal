import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Badge,
  FormGroup,
  Label,
  InputGroup,
  InputGroupText,
  Row,
  Col,
  Tooltip,
} from "reactstrap";
import {
  DELETE_titles,
  POST_titles,
  PUT_titles,
} from "../constants/AxiosConfiguration";
import alertify from "alertifyjs";

export default function Unvanlar({ unvanlar, token, updateUnvanlar }) {
  const [newUnvanName, setNewUnvanName] = useState("");
  const [newUnvanOncelikSira, setNewUnvanOncelikSira] = useState("");
  const [showUnvanEkleModal, setShowUnvanEkleModal] = useState(false);
  const [showUnvanSilModal, setShowUnvanSilModal] = useState(false);
  const [showUnvanGuncelleModal, setShowUnvanGuncelleModal] = useState(false);
  const [deleteSelectedUnvan, setDeleteSelectedUnvan] = useState(null);
  const [updateSelectedUnvan, setUpdateSelectedUnvan] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState({});
  const [tooltips, setTooltips] = useState([]);

  // Unvanlar değiştiğinde tooltip ID'lerini güncelle
  useEffect(() => {
    // Unvanlar yüklendiğinde sabit unvanların tooltipleri için ID'leri oluştur
    const fixedUnvanIds = unvanlar
      .filter((unvan) => !unvan.deletable)
      .map((unvan) => `tooltip-${unvan._id}`);
    setTooltips(fixedUnvanIds);
  }, [unvanlar]);

  const unvanEkleToggle = () => setShowUnvanEkleModal(!showUnvanEkleModal);
  const unvanSilToggle = () => setShowUnvanSilModal(!showUnvanSilModal);
  const unvanGuncelleToggle = () =>
    setShowUnvanGuncelleModal(!showUnvanGuncelleModal);

  const toggleTooltip = (id) => {
    setTooltipOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  function strToEng(str) {
    return str
      .replace("İ", "I")
      .replace("ı", "i")
      .replace("Ğ", "G")
      .replace("ğ", "g")
      .replace("Ü", "U")
      .replace("ü", "u")
      .replace("Ş", "S")
      .replace("ş", "s")
      .replace("Ö", "O")
      .replace("ö", "o")
      .replace("Ç", "C")
      .replace("ç", "c")
      .replace(/\s/g, "")
      .toLowerCase();
  }

  function handleButtonEditUnvan(unvan) {
    setUpdateSelectedUnvan(unvan);
    unvanGuncelleToggle();
  }

  function handleButtonDeleteUnvan(unvan) {
    setDeleteSelectedUnvan(unvan);
    unvanSilToggle();
  }

  function handleDelete() {
    axios(DELETE_titles(deleteSelectedUnvan._id, token))
      .then(() => {
        alertify.success("Ünvan başarıyla silindi.");
        unvanSilToggle();
        updateUnvanlar();
      })
      .catch((error) => {
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        console.error(errorMessage);
        alertify.error(errorMessage);
      });
  }

  function handleAdd() {
    if (newUnvanName === "") {
      alert("Ünvan adı boş olamaz.");
      return;
    }
    if (
      newUnvanOncelikSira === "" ||
      newUnvanOncelikSira < 1 ||
      newUnvanOncelikSira > 150
    ) {
      alert("Ünvan öncelik sırası 1-150 arasında olmalıdır.");
      return;
    }

    axios(
      POST_titles(
        newUnvanName,
        strToEng(newUnvanName),
        token,
        newUnvanOncelikSira
      )
    )
      .then(() => {
        alertify.success(`Ünvan ${newUnvanName} başarıyla eklendi.`);
        unvanEkleToggle();
        updateUnvanlar();
      })
      .catch((error) => {
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        console.error(errorMessage);
        alertify.error(errorMessage);
      });
  }

  function handleUpdate() {
    if (
      updateSelectedUnvan.oncelikSirasi === "" ||
      updateSelectedUnvan.oncelikSirasi < 1 ||
      updateSelectedUnvan.oncelikSirasi > 150
    ) {
      alert("Ünvan öncelik sırası 1-150 arasında olmalıdır.");
      return;
    }

    if (updateSelectedUnvan.name === "") {
      alert("Ünvan adı boş olamaz.");
      return;
    }
    let kind = "";
    if (updateSelectedUnvan.deletable === false) {
      kind = updateSelectedUnvan.kind;
    } else {
      kind = strToEng(updateSelectedUnvan.name);
    }
    console.log(updateSelectedUnvan);
    axios(
      PUT_titles(
        updateSelectedUnvan._id,
        updateSelectedUnvan.name,
        kind,
        updateSelectedUnvan.oncelikSirasi,
        token,
        updateSelectedUnvan.deletable
      )
    )
      .then(() => {
        alertify.success(
          `Ünvan ${updateSelectedUnvan.name} başarıyla güncellendi.`
        );
        unvanGuncelleToggle();
        updateUnvanlar();
      })
      .catch((error) => {
        let errorMessage =
          error.response.data.message ||
          "Ünvan güncellenirken bir hata oluştu.";
        console.error(errorMessage);
        alertify.error(errorMessage);
      });
  }

  const sortedUnvanlar = [...unvanlar].sort(
    (a, b) => a.oncelikSirasi - b.oncelikSirasi
  );

  return (
    <div className="unvanlar-container">
      <Card className="mb-4 shadow-sm">
        <CardHeader className="bg-danger text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">
            <i className="fas fa-user-tie me-2"></i>
            Ünvanlar
          </h3>
          <Button
            color="light"
            size="sm"
            onClick={unvanEkleToggle}
            className="d-flex align-items-center"
          >
            <i className="fas fa-plus-circle me-1"></i> Yeni Ünvan Ekle
          </Button>
        </CardHeader>
        <CardBody>
          <Alert color="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <div>
              <p className="mb-2">
                Sistemde kayıtlı olan ünvanlar listelenmektedir.
              </p>
              <ul className="mb-0">
                <li>
                  Bu ekranda yeni ünvan ekleyebilir, olanları güncelleyebilir
                  veya silebilirsiniz.
                </li>
                <li>
                  Sabit ünvanlar için{" "}
                  <strong>silme işlemi yapamazsınız.</strong>
                </li>
                <li>
                  Ünvanlar tüm kurumlar için geçerli olup, kurum bazında ünvan
                  tanımlaması yapılamaz.
                </li>
                <li>
                  Ünvanlarda bulunan öncelik sırası, personel listesi ekranında
                  sıralama yaparken kullanılır. Öncelik sırası küçük olan
                  ünvanlar listede üstte gösterilir (1-150 arasında).
                </li>
              </ul>
            </div>
          </Alert>

          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="table-responsive">
                <Table hover striped className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th width="5%">#</th>
                      <th width="50%">Ünvan Adı</th>
                      <th width="15%" className="text-center">
                        Öncelik Sırası
                      </th>
                      <th width="15%" className="text-center">
                        Durum
                      </th>
                      <th width="15%" className="text-center">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUnvanlar.map((unvan, index) => {
                      const tooltipId = `tooltip-${unvan._id}`;
                      return (
                        <tr key={unvan._id}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{unvan.name}</strong>
                            {unvan.kind && (
                              <Badge
                                color="light"
                                className="text-secondary border ms-2"
                              >
                                {unvan.kind}
                              </Badge>
                            )}
                          </td>
                          <td className="text-center">
                            <Badge color="info" pill>
                              {unvan.oncelikSirasi}
                            </Badge>
                          </td>
                          <td className="text-center">
                            {unvan.deletable ? (
                              <Badge color="success" pill>
                                Düzenlenebilir
                              </Badge>
                            ) : (
                              <span id={tooltipId}>
                                <Badge color="secondary" pill>
                                  Sabit
                                </Badge>
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                size="sm"
                                color="warning"
                                onClick={() => handleButtonEditUnvan(unvan)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                disabled={!unvan.deletable}
                                onClick={() => handleButtonDeleteUnvan(unvan)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>

          {/* Tooltip'leri ayrıca render et */}
          {tooltips.map((id) => (
            <Tooltip
              key={id}
              placement="top"
              isOpen={tooltipOpen[id] || false}
              target={id}
              toggle={() => toggleTooltip(id)}
            >
              Bu ünvan sistem tarafından sabitlenmiştir ve silinemez
            </Tooltip>
          ))}
        </CardBody>
      </Card>

      <Modal isOpen={showUnvanSilModal} toggle={unvanSilToggle}>
        <ModalHeader toggle={unvanSilToggle} className="bg-danger text-white">
          <i className="fas fa-trash me-2"></i>
          Ünvan Sil
        </ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Bu işlem geri alınamaz! Silmek istediğinize emin misiniz?
          </Alert>

          <div className="mt-3">
            <h5>Silinecek Ünvan:</h5>
            <Card className="bg-light">
              <CardBody>
                <h5>{deleteSelectedUnvan && deleteSelectedUnvan.name}</h5>
                <Badge color="info" pill>
                  Öncelik Sırası:{" "}
                  {deleteSelectedUnvan && deleteSelectedUnvan.oncelikSirasi}
                </Badge>
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            <i className="fas fa-trash me-1"></i> Sil
          </Button>{" "}
          <Button color="secondary" onClick={unvanSilToggle}>
            <i className="fas fa-times me-1"></i> İptal
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showUnvanEkleModal} toggle={unvanEkleToggle}>
        <ModalHeader toggle={unvanEkleToggle} className="bg-success text-white">
          <i className="fas fa-plus-circle me-2"></i>
          Yeni Ünvan Ekle
        </ModalHeader>
        <ModalBody>
          <FormGroup className="mb-3">
            <Label for="unvanName" className="form-label">
              Ünvan Adı:
            </Label>
            <Input
              id="unvanName"
              type="text"
              className="form-control"
              placeholder="Ünvan adını giriniz"
              onChange={(e) => {
                setNewUnvanName(e.target.value);
              }}
            />
          </FormGroup>

          <FormGroup>
            <Label for="unvanPriority" className="form-label">
              Ünvan Öncelik Sırası:
            </Label>
            <InputGroup>
              <Input
                id="unvanPriority"
                type="number"
                min={1}
                max={150}
                placeholder="1-150 arası değer giriniz"
                onChange={(e) => {
                  setNewUnvanOncelikSira(e.target.value);
                }}
              />
              <InputGroupText>
                <i className="fas fa-sort-numeric-down"></i>
              </InputGroupText>
            </InputGroup>
            <small className="text-muted">
              Değer aralığı: 1-150 (Küçük değer daha yüksek öncelik anlamına
              gelir)
            </small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleAdd}>
            <i className="fas fa-plus me-1"></i> Ekle
          </Button>{" "}
          <Button color="secondary" onClick={unvanEkleToggle}>
            <i className="fas fa-times me-1"></i> İptal
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showUnvanGuncelleModal} toggle={unvanGuncelleToggle}>
        <ModalHeader toggle={unvanGuncelleToggle} className="bg-warning">
          <i className="fas fa-edit me-2"></i>
          Ünvan Güncelle
        </ModalHeader>
        <ModalBody>
          <FormGroup className="mb-3">
            <Label for="updateUnvanName" className="form-label">
              Ünvan Adı:
            </Label>
            <Input
              id="updateUnvanName"
              type="text"
              className="form-control"
              defaultValue={updateSelectedUnvan && updateSelectedUnvan.name}
              onChange={(e) => {
                setUpdateSelectedUnvan({
                  ...updateSelectedUnvan,
                  name: e.target.value,
                });
              }}
            />
          </FormGroup>

          <FormGroup>
            <Label for="updateUnvanPriority" className="form-label">
              Ünvan Öncelik Sırası:
            </Label>
            <InputGroup>
              <Input
                id="updateUnvanPriority"
                type="number"
                min={1}
                max={150}
                defaultValue={
                  updateSelectedUnvan && updateSelectedUnvan.oncelikSirasi
                }
                onChange={(e) => {
                  setUpdateSelectedUnvan({
                    ...updateSelectedUnvan,
                    oncelikSirasi: e.target.value,
                  });
                }}
              />
              <InputGroupText>
                <i className="fas fa-sort-numeric-down"></i>
              </InputGroupText>
            </InputGroup>
            <small className="text-muted">
              Personel Listesi ekranında sıralama yaparken ünvanın öncelik
              sırasına göre sıralama yapılır. Küçük değer daha yüksek öncelik
              anlamına gelir.
            </small>
          </FormGroup>

          {updateSelectedUnvan && !updateSelectedUnvan.deletable && (
            <Alert color="warning" className="mt-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Bu sabit bir ünvandır. Değişiklik yaparken dikkatli olunuz.
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={handleUpdate}>
            <i className="fas fa-save me-1"></i> Güncelle
          </Button>{" "}
          <Button color="secondary" onClick={unvanGuncelleToggle}>
            <i className="fas fa-times me-1"></i> İptal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
