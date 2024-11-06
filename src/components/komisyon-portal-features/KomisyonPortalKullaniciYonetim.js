import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Table,
} from "reactstrap";
import axios from "axios";
import alertify from "alertifyjs";

export default function KomisyonPortalKullaniciYonetim({ user, token }) {
  // Kullanıcı Listesi
  const [userList, setUserList] = useState([]);

  // Yeni Kullanıcı
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    name: "",
    surname: "",
    password: "",
    phoneNumber: "",
    role: "",
  });

  // Ortak
  const [accordionOpen, setAccordionOpen] = useState("1");

  useEffect(() => {
    if (userList.length === 0) getUsers();

    // eslint-disable-next-line
  }, [userList, newUser]);

  const getUsers = () => {
    let configuration = {
      method: "GET",
      url: "/api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        setUserList(response.data.users);
      })
      .catch((error) => {
        let errorMessage = error.response.data.message || "Bir hata oluştu.";
        alertify.error(errorMessage);
      });
  };

  const accordionToggle = (id) => {
    if (accordionOpen === id) {
      setAccordionOpen();
    } else {
      setAccordionOpen(id);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role") {
      if (value === "") {
        return;
      }
    }

    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddUserButton = (e) => {
    if (
      newUser.username === "" ||
      newUser.name === "" ||
      newUser.surname === "" ||
      newUser.password === "" ||
      newUser.role === ""
    ) {
      alertify.error("Lütfen tüm alanları doldurunuz.");
      return;
    }

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
        // console.log(response);
        alert("Kullanıcı başarıyla eklendi.");
        setAccordionOpen("1");
        getUsers();
      })
      .catch((error) => {
        // console.log(error);
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

  const handleDeleteButton = (userId) => {
    alertify.confirm(
      "Kullanıcı Silme",
      "Kullanıcıyı silmek istediğinize emin misiniz?",
      () => deleteUser(userId),
      () => {}
    );
  };

  const deleteUser = (userId) => {
    const configuration = {
      method: "DELETE",
      url: "/api/users/" + userId,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((response) => {
        console.log(response);
        alertify.success("Kullanıcı başarıyla silindi");
        getUsers();
      })
      .catch((error) => {
        console.log(error);
        let errorMessage =
          error.response.data.message ||
          "Kullanıcı silinirken bir hata oluştu.";
        alertify.error(errorMessage);
      });
  };

  return (
    <div>
      <h3>Portal Kullanıcı Yönetim </h3>

      <span>
        Bu ekranı kullanarak portal kullanıcılarını yönetebilirsiniz. Merak etme
        bu ekran sadece yöneticiler tarafından görüntülenebilir.
        <br />
        Burada eklenen kullanıcı sisteme giriş yapabilir ve yetkilendirme
        işlemleri gerçekleştirilebilir.
      </span>
      <div>
        <Accordion
          open={accordionOpen}
          toggle={accordionToggle}
          className="mt-2"
        >
          {/* Kullanıcılar */}
          <AccordionItem>
            <AccordionHeader targetId="1">Kullanıcılar</AccordionHeader>
            <AccordionBody accordionId="1">
              <Table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Kullanıcı Adı</th>
                    <th>Ad</th>
                    <th>Soyad</th>
                    <th>Rol</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((user, index) => (
                    <tr key={user._id}>
                      <th scope="row">{index + 1}</th>
                      <td>{user.username}</td>
                      <td>{user.name}</td>
                      <td>{user.surname}</td>
                      <td>{user.role}</td>
                      <td>
                        <Button
                          onClick={(e) => handleDeleteButton(user._id)}
                          size="sm"
                          color="danger"
                        >
                          Sil
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </AccordionBody>
          </AccordionItem>

          {/* Yeni Kullanıcı Ekle */}
          <AccordionItem>
            <AccordionHeader targetId="2">Yeni Kullanıcı Ekle</AccordionHeader>
            <AccordionBody accordionId="2">
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
                    value={newUser.phoneNumber}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="role">Rol * </Label>
                  <Input
                    type="select"
                    name="role"
                    id="role"
                    onChange={handleChange}
                  >
                    <option value={""}>Seçiniz</option>
                    <option value={"komisyonbaskan"}>Komisyon Başkanı</option>
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

                <Button onClick={handleAddUserButton}>Kullanıcı Ekle</Button>
              </Form>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
