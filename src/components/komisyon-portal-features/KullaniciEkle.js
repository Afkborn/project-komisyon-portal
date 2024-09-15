import React, { useState } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";
export default function KullaniciEkle({ user, token }) {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    name: "",
    surname: "",
    password: "",
    phoneNumber: "",
    role: "komisyonkatibi",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    const configuration = {
      method: "POST",
      url: "/api/users/register",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: newUser,
    };

    axios(configuration)
      .then((response) => {
        console.log(response);
        alertify.success("Kullanıcı başarıyla eklendi");
      })
      .catch((error) => {
        console.log(error);
        let errorCode = error.response.data.error.code || "";
        if (errorCode === 11000) {
          alertify.error("Bu kullanıcı adı zaten kullanımda.");
          return;
        }
        let errorMessage =
          error.response.data.message ||
          "Kullanıcı eklenirken bir hata oluştu.";
        alertify.error(errorMessage);
      });
  };

  return (
    <div>
      <h3>Kullanıcı Ekle</h3>

      <span>
        Yeni bir kullanıcı eklemeye hazır mısınız? Bu ekran sadece yöneticiler
        tarafından görüntülenebilir ve kullanıcı ekleme işlemleri buradan
        gerçekleştirilir.
        <br />
        Burada eklenen kullanıcı sisteme giriş yapabilir ve yetkilendirme
        işlemleri gerçekleştirilebilir.
      </span>
      <div>
        <Form>
          <FormGroup>
            <Label for="username">Kullanıcı Adı *</Label>
            <Input
              type="text"
              name="username"
              id="username"
              placeholder="Kullanıcı Adı"
              value={newUser.username}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="name">Ad * </Label>
            <Input
              type="text"
              name="name"
              id="name"
              placeholder="Ad"
              onChange={handleChange}
            />

            <Label for="surname">Soyad *</Label>
            <Input
              type="text"
              name="surname"
              id="surname"
              placeholder="Soyad"
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="password">Şifre * </Label>
            <Input
              type="text"
              name="password"
              id="password"
              placeholder="Şifre"
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="phoneNumber">Telefon Numarası</Label>
            <Input
              type="text"
              name="phoneNumber"
              id="phoneNumber"
              placeholder="Telefon Numarası"
              value={user.phoneNumber}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="role">Rol</Label>
            <Input type="select" name="role" id="role" onChange={handleChange}>
              <option value={"komisyonkatibi"}>Komisyon Katibi</option>
              <option value={"santralmemuru"}>Santral Memuru</option>
            </Input>
          </FormGroup>

          <hr />
          <span>
            {" "}
            <b>*</b> Zorunlu Alanlar
          </span>
          <hr />

          <Button onClick={handleSubmit}>Kullanıcı Ekle</Button>
        </Form>
      </div>
    </div>
  );
}
