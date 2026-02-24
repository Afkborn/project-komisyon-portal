import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Input,
  InputGroup,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Form,
  FormGroup,
  Label,
  ListGroup,
  ListGroupItem,
  Card,
  CardHeader,
  CardBody,
  Alert,
  InputGroupText,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import Cookies from "universal-cookie";
import AYSNavbar from "../root/AYSNavbar";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaHistory,
  FaInfoCircle,
  FaFilter,
} from "react-icons/fa";

export default function KullaniciYonetimSistemDashboard({ token: propToken }) {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const [token] = useState(propToken || cookies.get("TOKEN"));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

  // Kullanıcı istatistikleri
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    active: 0,
    inactive: 0,
  });

  const [formData, setFormData] = useState({
    sicil: "",
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    roles: [],
    personId: null, // Person referansı
  });

  const [sicilSearchLoading, setSicilSearchLoading] = useState(false);

  // Sürükle-Bırak işlemleri için state'ler
  const [draggingRole, setDraggingRole] = useState(null);

  // Sürükle-Bırak event handlers
  const handleDragStart = (role) => {
    setDraggingRole(role);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetArea) => {
    e.preventDefault();
    if (!draggingRole) return;

    if (targetArea === "selected") {
      // Zaten seçili değilse ekle
      if (!formData.roles.find((r) => r.id === draggingRole.id)) {
        setFormData((prev) => ({
          ...prev,
          roles: [...prev.roles, draggingRole],
        }));
      }
    } else {
      // Seçili listeden kaldır
      setFormData((prev) => ({
        ...prev,
        roles: prev.roles.filter((r) => r.id !== draggingRole.id),
      }));
    }
  };

  useEffect(() => {
    if (!token) {
      alertify.error("Oturum bulunamadı!");
      window.location.href = "/login";
      return;
    }
    getUsers();
    getRoles();
    // eslint-disable-next-line
  }, [token]);

  // İstatistikleri hesapla
  useEffect(() => {
    if (users.length > 0) {
      const admins = users.filter((user) =>
        user.roles.includes("admin")
      ).length;

      setStats({
        total: users.length,
        admins: admins,
        active: users.length, // Aktif/inaktif durumu API'den gelmiyor, varsayılan olarak hepsi aktif
        inactive: 0,
      });
    }
  }, [users]);

  const getUsers = () => {
    if (!token) return;

    axios({
      method: "GET",
      url: "/api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setUsers(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          cookies.remove("TOKEN");
          window.location.href = "/login";
        }
        alertify.error("Kullanıcılar yüklenirken hata oluştu");
        setLoading(false);
      });
  };

  const getRoles = () => {
    axios({
      method: "GET",
      url: "/api/roles",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const roles = response.data.RoleList.map((role, index) => ({
          id: index + 1,
          name: role.name,
          label: role.label || role.name,
        }));
        console.log("Roller yüklendi:", roles);
        setAvailableRoles(roles);
      })
      .catch((error) => {
        console.error("Roller yüklenirken hata:", error);
        alertify.error("Roller yüklenemedi");
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Sicil numarasına göre personel bilgilerini çek
  const handleSicilSearch = async () => {
    if (!formData.sicil.trim()) {
      alertify.warning("Lütfen sicil numarası giriniz");
      return;
    }

    setSicilSearchLoading(true);

    try {
      const response = await axios({
        method: "GET",
        url: `/api/persons/bySicil/${formData.sicil}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const person = response.data.person;

      if (person) {
        // Personel bulundu, bilgilerini doldur
        setFormData((prev) => ({
          ...prev,
          name: person.ad || "",
          surname: person.soyad || "",
          email: person.email || "",
          phoneNumber: person.phoneNumber || "",
          personId: person._id, // Person referansını kaydet
          // Kullanıcı adı otomatik oluştur (ab + sicil)
          username:
            editUser && editUser.username
              ? editUser.username
              : `ab${formData.sicil}`,
        }));
        alertify.success("Personel bilgileri yüklendi");
      } else {
        alertify.warning("Sicil numarası sistemde bulunamadı");
      }
    } catch (error) {
      console.error("Personel arama hatası:", error);
      alertify.error(
        error.response?.data?.message ||
          "Personel bilgileri çekilirken bir hata oluştu"
      );
    } finally {
      setSicilSearchLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editUser ? `/api/users/${editUser._id}` : "/api/users/register";
    const method = editUser ? "PUT" : "POST";

    // FormData'yı kopyala
    const apiData = { ...formData };

    // Password boşsa sil
    if (!apiData.password) {
      delete apiData.password;
    }

    // Sicil alanını API'ye gönderme (isteğe bağlı)
    // Eğer backend sicil alanı desteklemiyorsa silebiliriz

    // Roles array'ini sadece role name'lerden oluşan array'e dönüştür
    apiData.roles = formData.roles.map((role) => role.name);

    // Person referansını ekle
    if (formData.personId) {
      apiData.person = formData.personId;
    }

    axios({
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: apiData,
    })
      .then(() => {
        alertify.success(
          `Kullanıcı başarıyla ${editUser ? "güncellendi" : "eklendi"}`
        );
        setShowAddModal(false);
        getUsers();
        resetForm();
      })
      .catch((error) => {
        alertify.error(error.response?.data?.message || "Bir hata oluştu");
      });
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      sicil: user.sicil || "",
      ...user,
      password: "",
      personId: user.person || null, // User'daki person referansını kullan
      roles: user.roles.map(
        (roleName) =>
          availableRoles.find((r) => r.name === roleName) || {
            id: Math.random(),
            name: roleName,
            label: roleName,
          }
      ),
    });
    setShowAddModal(true);
  };

  const handleDelete = (user) => {
    alertify.confirm(
      "Kullanıcı Silme",
      "Bu kullanıcıyı silmek istediğinize emin misiniz?",
      () => {
        axios({
          method: "DELETE",
          url: `/api/users/${user._id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(() => {
            alertify.success("Kullanıcı başarıyla silindi");
            getUsers();
          })
          .catch((error) => {
            alertify.error(
              error.response?.data?.message || "Silme işlemi başarısız"
            );
          });
      },
      () => {}
    );
  };

  const resetForm = () => {
    setFormData({
      sicil: "",
      username: "",
      password: "",
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      roles: [],
      personId: null,
    });
    setEditUser(null);
  };

  const handleModalClose = () => {
    resetForm();
    setShowAddModal(false);
  };

  // Filtreleme işlevi
  const filteredUsers = users.filter((user) => {
    // Arama terimlerine göre filtrele
    const searchMatch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    // Rol filtresine göre filtrele
    const roleMatch = roleFilter ? user.roles.includes(roleFilter) : true;

    return searchMatch && roleMatch;
  });

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case "admin":
        return "danger";
      case "komisyonuye":
        return "success";
      case "komisyonbaskan":
        return "primary";
      case "komisyonkatip":
        return "info";
      default:
        return "secondary";
    }
  };

  const renderRoleBadges = (userRoles) => {
    return userRoles.map((roleName, index) => (
      <Badge
        key={index}
        color={getRoleBadgeColor(roleName)}
        className="me-1 mb-1"
        pill
      >
        {availableRoles.find((r) => r.name === roleName)?.label || roleName}
      </Badge>
    ));
  };

  return (
    <div className="kys-dashboard">
      <AYSNavbar />
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h3 className="text-primary fw-bold">
              <i className="fas fa-users-cog me-2"></i>
              Kullanıcı Yönetim Paneli
            </h3>
            <p className="text-muted">
              Sistemdeki kullanıcıları görüntüleyebilir, düzenleyebilir ve
              yönetebilirsiniz.
            </p>
          </Col>
        </Row>

        {/* İstatistik Kartları */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-primary p-3 text-white me-3">
                  <i className="fas fa-users fa-2x"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Toplam Kullanıcılar</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-danger p-3 text-white me-3">
                  <i className="fas fa-user-shield fa-2x"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Yöneticiler</h6>
                  <h3 className="mb-0">{stats.admins}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-success p-3 text-white me-3">
                  <i className="fas fa-user-check fa-2x"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">Aktif Kullanıcılar</h6>
                  <h3 className="mb-0">{stats.active}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="shadow-sm border-0 mb-3">
              <CardBody className="d-flex align-items-center">
                <div className="rounded-circle bg-secondary p-3 text-white me-3">
                  <i className="fas fa-user-slash fa-2x"></i>
                </div>
                <div>
                  <h6 className="text-muted mb-1">İnaktif Kullanıcılar</h6>
                  <h3 className="mb-0">{stats.inactive}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-4">
          <CardHeader className="bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Kullanıcı Yönetimi</h5>
            <Button color="success" onClick={() => setShowAddModal(true)}>
              <FaUserPlus className="me-2" /> Kullanıcı Ekle
            </Button>
          </CardHeader>
          <CardBody>
            <Row className="mb-4">
              <Col md={6}>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <FaSearch />
                  </InputGroupText>
                  <Input
                    placeholder="Ad, kullanıcı adı, e-posta veya telefon ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button close onClick={() => setSearchTerm("")} />
                  )}
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroupText className="bg-light">
                    <FaFilter />
                  </InputGroupText>
                  <Input
                    type="select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">Tüm Roller</option>
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.label}
                      </option>
                    ))}
                  </Input>
                </InputGroup>
              </Col>
              <Col md={3} className="text-end">
                <Button color="secondary" outline onClick={getUsers}>
                  <i className="fas fa-sync-alt me-2"></i> Yenile
                </Button>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center p-5">
                <Spinner color="primary" />
                <p className="text-muted mt-3">Kullanıcılar yükleniyor...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <Alert color="info">
                <FaInfoCircle className="me-2" />
                {searchTerm || roleFilter
                  ? "Arama kriterlerine uygun kullanıcı bulunamadı."
                  : "Henüz kullanıcı bulunmamaktadır."}
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle shadow-sm">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">#</th>
                      <th className="border-0">Kullanıcı Adı</th>
                      <th className="border-0">Ad Soyad</th>
                      <th className="border-0">İletişim Bilgileri</th>
                      <th className="border-0">Yetkiler</th>
                      <th className="border-0 text-center">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle bg-primary text-white rounded-circle me-2">
                              {user.name?.charAt(0)}
                              {user.surname?.charAt(0)}
                            </div>
                            <div>
                              <span className="fw-bold">{user.username}</span>
                              {user.roles.includes("admin") && (
                                <Badge color="danger" pill className="ms-2">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {user.name} {user.surname}
                        </td>
                        <td>
                          {user.email && (
                            <div>
                              <i className="fas fa-envelope text-muted me-2"></i>
                              {user.email}
                            </div>
                          )}
                          {user.phoneNumber && (
                            <div>
                              <i className="fas fa-phone text-muted me-2"></i>
                              {user.phoneNumber}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap">
                            {renderRoleBadges(user.roles)}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center">
                            <Button
                              color="primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(user)}
                              title="Düzenle"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              className="me-2"
                              onClick={() => handleDelete(user)}
                              title="Sil"
                            >
                              <FaTrashAlt />
                            </Button>
                            <Button
                              color="info"
                              size="sm"
                              onClick={() =>
                                navigate(`/ays-kys/aktiviteler/${user._id}`)
                              }
                              title="Log Kayıtları"
                            >
                              <FaHistory />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>

      <Modal isOpen={showAddModal} toggle={handleModalClose} size="lg">
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={handleModalClose} className="bg-light">
            <i
              className={`fas fa-${editUser ? "user-edit" : "user-plus"} me-2`}
            ></i>
            {editUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="sicil" className="fw-bold">
                    Sicil Numarası*
                  </Label>
                  <InputGroup>
                    <Input
                      id="sicil"
                      name="sicil"
                      value={formData.sicil}
                      onChange={handleInputChange}
                      disabled={editUser}
                      className={editUser ? "bg-light" : ""}
                      placeholder="Sicil numarası girin"
                      required
                    />
                    <Button
                      color="info"
                      onClick={handleSicilSearch}
                      disabled={editUser || sicilSearchLoading || !formData.sicil}
                      outline
                    >
                      {sicilSearchLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Aranıyor...
                        </>
                      ) : (
                        <>
                          <FaSearch className="me-1" />
                          Ara
                        </>
                      )}
                    </Button>
                  </InputGroup>
                  <small className="text-muted mt-1 d-block">
                    <i className="fas fa-info-circle me-1"></i>
                    Sicil numarası girin ve "Ara" butonuna tıklayın{" "}
                    {formData.personId && (
                      <Badge color="success" className="ms-2">
                        <i className="fas fa-check me-1"></i>
                        Eşleştirildi
                      </Badge>
                    )}
                  </small>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="username" className="fw-bold">
                    Kullanıcı Adı*
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={editUser}
                    className={editUser ? "bg-light" : ""}
                    placeholder="Sicil aranarak otomatik doldurulur"
                    required
                  />
                  <small className="text-muted mt-1 d-block">
                    <i className="fas fa-info-circle me-1"></i>
                    Otomatik olarak ab&lt;Sicil&gt; şeklinde doldurulur
                  </small>
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="password" className="fw-bold">
                    Şifre{!editUser && "*"}
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editUser}
                    placeholder={
                      editUser ? "Değiştirmek için yeni şifre girin" : ""
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}></Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="name" className="fw-bold">
                    Ad*
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Personel bilgilerinden otomatik doldurulur"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="surname" className="fw-bold">
                    Soyad*
                  </Label>
                  <Input
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    required
                    placeholder="Personel bilgilerinden otomatik doldurulur"
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="email" className="fw-bold">
                    Email
                  </Label>
                  <InputGroup>
                    <InputGroupText className="bg-light">
                      <i className="fas fa-envelope"></i>
                    </InputGroupText>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Personel bilgilerinden otomatik doldurulur"
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="phoneNumber" className="fw-bold">
                    Telefon
                  </Label>
                  <InputGroup>
                    <InputGroupText className="bg-light">
                      <i className="fas fa-phone"></i>
                    </InputGroupText>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="05XX XXX XX XX"
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
            </Row>

            <hr />
            <h5 className="mb-4">
              <i className="fas fa-user-tag me-2"></i>
              Kullanıcı Yetkileri
            </h5>

            <Row className="role-selection-area">
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <CardHeader className="bg-light">
                    <h6 className="mb-0">Mevcut Yetkiler</h6>
                    <small className="text-muted">Seçmek için sürükleyin</small>
                  </CardHeader>
                  <CardBody
                    className="role-drop-zone p-3"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "available")}
                    style={{ minHeight: "200px", backgroundColor: "#f8f9fa" }}
                  >
                    <ListGroup>
                      {availableRoles
                        .filter(
                          (role) =>
                            !formData.roles.find((r) => r.id === role.id)
                        )
                        .map((role) => (
                          <ListGroupItem
                            key={role.id}
                            draggable
                            onDragStart={() => handleDragStart(role)}
                            className="my-1 border-0 d-flex align-items-center"
                            style={{
                              cursor: "move",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            <span className="me-2">
                              <i className="fas fa-arrow-right text-primary"></i>
                            </span>
                            <Badge
                              color={getRoleBadgeColor(role.name)}
                              pill
                              className="py-2 px-3"
                            >
                              {role.label}
                            </Badge>
                          </ListGroupItem>
                        ))}
                      {availableRoles.filter(
                        (role) => !formData.roles.find((r) => r.id === role.id)
                      ).length === 0 && (
                        <div className="text-center text-muted p-2">
                          <i className="fas fa-info-circle me-2"></i>
                          Tüm yetkiler seçildi
                        </div>
                      )}
                    </ListGroup>
                  </CardBody>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <CardHeader className="bg-light">
                    <h6 className="mb-0">Seçili Yetkiler</h6>
                    <small className="text-muted">
                      Kaldırmak için sürükleyin
                    </small>
                  </CardHeader>
                  <CardBody
                    className="role-drop-zone p-3"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "selected")}
                    style={{
                      minHeight: "200px",
                      backgroundColor: "#eff8ff",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ListGroup>
                      {formData.roles.map((role) => (
                        <ListGroupItem
                          key={role.id}
                          draggable
                          onDragStart={() => handleDragStart(role)}
                          className="my-1 border-0 d-flex align-items-center"
                          style={{
                            cursor: "move",
                            backgroundColor: "#eff8ff",
                          }}
                        >
                          <Badge
                            color={getRoleBadgeColor(role.name)}
                            pill
                            className="py-2 px-3"
                          >
                            {role.label}
                          </Badge>
                          <span className="ms-2">
                            <i className="fas fa-times text-danger"></i>
                          </span>
                        </ListGroupItem>
                      ))}
                      {formData.roles.length === 0 && (
                        <div className="text-center text-muted p-2">
                          <i className="fas fa-info-circle me-2"></i>
                          Henüz yetki seçilmedi
                        </div>
                      )}
                    </ListGroup>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" color="primary">
              <i
                className={`fas fa-${editUser ? "save" : "user-plus"} me-2`}
              ></i>
              {editUser ? "Güncelle" : "Kaydet"}
            </Button>
            <Button color="secondary" onClick={handleModalClose}>
              <i className="fas fa-times me-2"></i>
              İptal
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* CSS Stilleri */}
      <style jsx="true">{`
        .kys-dashboard .table-responsive {
          border-radius: 8px;
          overflow: hidden;
        }

        .avatar-circle {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .role-selection-area .card {
          transition: all 0.3s ease;
        }

        .role-selection-area .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .role-drop-zone {
          border: 2px dashed transparent;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .role-drop-zone:hover {
          border-color: #0d6efd;
        }
      `}</style>
    </div>
  );
}
