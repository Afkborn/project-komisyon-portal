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
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import Cookies from "universal-cookie"; // Cookie yönetimi için import ekleyelim
import AYSNavbar from "../root/AYSNavbar";
import { useNavigate } from 'react-router-dom';

export default function KullaniciYonetimSistemDashboard({ token: propToken }) {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const [token] = useState(propToken || cookies.get("TOKEN")); // Props'dan gelen token yoksa cookie'den al

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]); // Sabit array yerine state

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    roles: [], // role yerine roles array olarak
  });

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
    getRoles(); // Yeni fonksiyon çağrısı
    // eslint-disable-next-line
  }, [token]);

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

  // Yeni fonksiyon: Rolleri API'den çek
  const getRoles = () => {
    axios({
      method: "GET",
      url: "/api/roles",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        // API'den gelen rolleri state'e kaydet
        const roles = response.data.RoleList.map((role, index) => ({
          id: index + 1,
          name: role.name,
          label: role.label || role.name, // label yoksa name'i kullan
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

    // Roles array'ini sadece role name'lerden oluşan array'e dönüştür
    apiData.roles = formData.roles.map((role) => role.name);

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

  // handleEdit fonksiyonunu güncelle
  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      ...user,
      password: "",
      // Mevcut rolleri availableRoles ile eşleştir
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
      username: "",
      password: "",
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      roles: [],
    });
    setEditUser(null);
  };

  const handleModalClose = () => {
    resetForm();
    setShowAddModal(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case "admin":
        return "danger";
      case "komisyonuye":
        return "success";
      case "komisyonbaskan":
        return "success";
      case "komisyonkatip":
        return "success";
      default:
        return "secondary";
    }
  };

  // Tablo içinde rollerin gösterimi için yeni helper fonksiyon
  const renderRoleBadges = (userRoles) => {
    return userRoles.map((roleName, index) => (
      <Badge key={index} color={getRoleBadgeColor(roleName)} className="me-1">
        {availableRoles.find((r) => r.name === roleName)?.label || roleName}
      </Badge>
    ));
  };

  return (
    <div>
      <AYSNavbar />
      <Container fluid>
        <Row className="mb-4 align-items-center">
          <Col>
            <h3>Kullanıcı Yönetim Paneli</h3>
            <span>
              Sistemdeki kullanıcıları görüntüleyebilir, düzenleyebilir ve
              silebilirsiniz.
            </span>
          </Col>
          <Col xs="auto">
            <Button color="success" onClick={() => setShowAddModal(true)}>
              + Kullanıcı Ekle
            </Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md="4">
            <InputGroup>
              <Input
                placeholder="Ad, kullanıcı adı, cep telefonu veya email ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center p-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Kullanıcı Adı</th>
                <th>Ad Soyad</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Yetkiler</th> {/* Çoğul olarak güncellendi */}
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.name} {user.surname}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || "-"}</td>
                  <td>{renderRoleBadges(user.roles)}</td>
                  <td>
                    <Button
                      color="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDelete(user)}
                    >
                      Sil
                    </Button>
                    <Button
                      color="info"
                      size="sm"
                      onClick={() => navigate(`/ays-kys/aktiviteler/${user._id}`)}
                    >
                      Log
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Modal isOpen={showAddModal} toggle={handleModalClose} size="lg">
          <Form onSubmit={handleSubmit}>
            <ModalHeader toggle={handleModalClose}>
              {editUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="username">Kullanıcı Adı*</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={editUser}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="password">Şifre{!editUser && "*"}</Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editUser}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="name">Ad*</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="surname">Soyad*</Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="phoneNumber">Telefon</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col md={6}>
                  <h5>Mevcut Yetkiler</h5>
                  <div
                    className="role-drop-zone p-3 border rounded"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "available")}
                    style={{ minHeight: "200px" }}
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
                            className="my-1"
                            style={{ cursor: "move" }}
                          >
                            <Badge
                              color={getRoleBadgeColor(role.name)}
                              // className="me-2"
                            >
                              {role.label}
                            </Badge>
                          </ListGroupItem>
                        ))}
                    </ListGroup>
                  </div>
                </Col>
                <Col md={6}>
                  <h5>Seçili Yetkiler</h5>
                  <div
                    className="role-drop-zone p-3 border rounded"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "selected")}
                    style={{ minHeight: "200px" }}
                  >
                    <ListGroup>
                      {formData.roles.map((role) => (
                        <ListGroupItem
                          key={role.id}
                          draggable
                          onDragStart={() => handleDragStart(role)}
                          className="my-1"
                          style={{ cursor: "move" }}
                        >
                          <Badge
                            color={getRoleBadgeColor(role.name)}
                            className="me-2"
                          >
                            {role.label}
                          </Badge>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </div>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" color="primary">
                {editUser ? "Güncelle" : "Kaydet"}
              </Button>
              <Button color="secondary" onClick={handleModalClose}>
                İptal
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </Container>
    </div>
  );
}
