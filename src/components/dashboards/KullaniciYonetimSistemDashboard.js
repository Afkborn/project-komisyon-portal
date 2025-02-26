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
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
import Cookies from "universal-cookie"; // Cookie yönetimi için import ekleyelim

export default function KullaniciYonetimSistemDashboard({ token: propToken }) {
  const cookies = new Cookies();
  const [token] = useState(propToken || cookies.get("TOKEN")); // Props'dan gelen token yoksa cookie'den al

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    role: "user",
  });

  useEffect(() => {
    if (!token) {
      alertify.error("Oturum bulunamadı!");
      window.location.href = "/login";
      return;
    }
    getUsers();
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

    // eğer formData'da password boşsa sil
    if (!formData.password) {
      delete formData.password;
    }

    axios({
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: formData,
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
      username: user.username,
      password: "",
      name: user.name,
      surname: user.surname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
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
      role: "user",
    });
    setEditUser(null);
  };

  const handleModalClose = () => {
    resetForm();
    setShowAddModal(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "danger";
      case "user":
        return "primary";
      default:
        return "secondary";
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Adliye Yönetim Sistemi - Kullanıcı Yönetim</h2>
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
              placeholder="Ad, kullanıcı adı veya email ile ara..."
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
              <th>Yetki</th>
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
                <td>
                  <Badge color={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </td>
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
                    onClick={() => handleDelete(user)}
                  >
                    Sil
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
                  <Label for="email">Email*</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
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

            <FormGroup>
              <Label for="role">Yetki*</Label>
              <Input
                type="select"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Yönetici</option>
              </Input>
            </FormGroup>
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
  );
}
