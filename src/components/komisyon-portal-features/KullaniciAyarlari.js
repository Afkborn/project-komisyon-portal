import React, { useState, useEffect } from "react";
import { Button, Form, FormGroup, Label, Input, Spinner } from "reactstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import alertify from "alertifyjs";

export default function KullaniciAyarlari({ token, getUser }) {
  const cookies = new Cookies();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [updateUser, setUpdateUser] = useState({
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    getUserDetails();
    // eslint-disable-next-line
  }, []);

  const getUserDetails = () => {
    const configuration = {
      method: "GET",
      url: "/api/users/details",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setUserData(response.data.user);
        setUpdateUser({
          email: response.data.user.email,
          phoneNumber: response.data.user.phoneNumber,
        });
        setLoading(false);
      })
      .catch((error) => {
        alertify.error("Kullanıcı bilgileri alınamadı");
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validatePassword = () => {
    if (password === "") {
      alert("Mevcut şifre boş olamaz");
      return false;
    }
    if (newPassword === "") {
      alert("Yeni şifre boş olamaz");
      return false;
    }
    if (newPassword2 === "") {
      alert("Yeni şifre tekrar boş olamaz");
      return false;
    }
    if (newPassword !== newPassword2) {
      alert("Yeni şifreler uyuşmuyor");
      return false;
    }

    return true;
  };

  const changeUserPassword = () => {
    if (!validatePassword()) {
      return;
    }
    const configuration = {
      method: "PUT",
      url: "api/users/password",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        oldPassword: password,
        newPassword: newPassword,
      },
    };

    axios(configuration)
      .then((response) => {
        alert("Şifre başarıyla değiştirildi, lütfen tekrar giriş yapınız");
        cookies.remove("TOKEN");
        window.location.reload();
      })
      .catch((error) => {
        alert("Şifre değiştirilemedi");
      });
  };

  const deleteUser = () => {
    const configuration = {
      method: "DELETE",
      url: "api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        password: password,
      },
    };

    axios(configuration)
      .then((response) => {
        alert("Kullanıcı başarıyla silindi, lütfen tekrar giriş yapınız");
        cookies.remove("TOKEN");
        window.location.reload();
      })
      .catch((error) => {
        let errorMessage =
          error.response.data.message ||
          "Kullanıcı silinirken bir hata oluştu.";
        alert(errorMessage);
      });
  };

  const updateUserDetail = (e) => {
    e.preventDefault();
    const configuration = {
      method: "PUT",
      url: "api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        email: updateUser.email,
        phoneNumber: updateUser.phoneNumber,
      },
    };
    axios(configuration)
      .then((response) => {
        alertify.success("Bilgiler başarıyla güncellendi");
        getUser();
      })
      .catch((error) => {
        alertify.error("Bilgiler güncellenemedi");
      });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <Spinner color="danger" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="alert alert-danger">
        Kullanıcı bilgileri yüklenemedi. Lütfen sayfayı yenileyin.
      </div>
    );
  }

  return (
    <div>
      <div className="mt-5">
        <Form>
          <h3>Hesap Bilgileri</h3>
          <FormGroup>
            <Label for="name">Ad Soyad</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={`${userData.name} ${userData.surname}`}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <Label for="name">Yetki</Label>
            <Input
              type="text"
              name="role"
              id="role"
              placeholder="Rol"
              value={userData.role}
              disabled
            />
          </FormGroup>

          <FormGroup>
            <Label for="username">Username</Label>
            <Input
              type="text"
              name="username"
              id="username"
              placeholder="Kullanıcı Adı"
              value={userData.username}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={updateUser.email}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="phoneNumber">Telefon</Label>
            <Input
              type="text"
              name="phoneNumber"
              id="phoneNumber"
              placeholder="Telefon"
              value={updateUser.phoneNumber}
              onChange={handleChange}
            />
          </FormGroup>

          <Button onClick={updateUserDetail} color="success">
            Bilgileri Güncelle
          </Button>
        </Form>
        <hr></hr>
        <Form className="mt-5">
          <h3>Şifre Değiştir</h3>
          <FormGroup>
            <Label for="password">Mevcut Şifre</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Şifre"
              onChange={(e) => setPassword(e.target.value)}
            />

            <Label for="newPassword">Yeni Şifre</Label>
            <Input
              type="password"
              name="newPassword"
              id="newPassword"
              placeholder="Yeni Şifre"
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Label for="newPassword2">Yeni Şifre Tekrar</Label>
            <Input
              type="password"
              name="newPassword2"
              id="newPassword2"
              placeholder="Yeni Şifre Tekrar"
              onChange={(e) => setNewPassword2(e.target.value)}
            />
          </FormGroup>
          <Button onClick={changeUserPassword} color="success">
            Şifre Değiştir
          </Button>
        </Form>
        <hr></hr>
        <Form className="mt-5">
          <h3>Kullanıcı Sil</h3>
          <FormGroup>
            <Label for="password">Mevcut Şifre</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Şifre"
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          <Button onClick={deleteUser} color="danger">
            Kullanıcı SİL
          </Button>
        </Form>
      </div>
    </div>
  );
}
