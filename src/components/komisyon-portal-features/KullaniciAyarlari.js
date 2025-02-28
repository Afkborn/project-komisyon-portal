import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Alert,
  Row,
  Col,
  Badge,
  FormFeedback,
  FormText,
  InputGroup,
  InputGroupText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import alertify from "alertifyjs";

export default function KullaniciAyarlari({ token, getUser }) {
  const cookies = new Cookies();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Form verisi
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [updateUser, setUpdateUser] = useState({
    email: "",
    phoneNumber: "",
  });

  // Form hataları/doğrulaması
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Hata ve başarı mesajları için zaman aşımı
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccess({});
    }, 5000);

    return () => clearTimeout(timer);
  }, [success]);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    getUserDetails();
    // eslint-disable-next-line
  }, []);

  const getUserDetails = () => {
    setLoading(true);

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
          email: response.data.user.email || "",
          phoneNumber: response.data.user.phoneNumber || "",
        });
      })
      .catch((error) => {
        console.error("Kullanıcı bilgileri alınamadı:", error);
        alertify.error("Kullanıcı bilgileri alınamadı");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Form input değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Varsa hatayı temizle
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Şifre değişimi için form doğrulama
  const validatePassword = () => {
    const newErrors = {};

    if (!password) newErrors.password = "Mevcut şifre gereklidir";
    if (!newPassword) newErrors.newPassword = "Yeni şifre gereklidir";
    if (!newPassword2) newErrors.newPassword2 = "Şifre tekrarı gereklidir";

    if (newPassword && newPassword2 && newPassword !== newPassword2) {
      newErrors.newPassword2 = "Şifreler eşleşmiyor";
    }

    // Şifre karmaşıklığı kontrolü
    if (newPassword && newPassword.length < 6) {
      newErrors.newPassword = "Şifre en az 6 karakter olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // İletişim bilgilerini güncelleme için form doğrulama
  const validateContactInfo = () => {
    const newErrors = {};

    // E-posta doğrulama
    if (updateUser.email && !/^\S+@\S+\.\S+$/.test(updateUser.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    // Telefon doğrulama (Opsiyonel)
    if (
      updateUser.phoneNumber &&
      !/^\+?[0-9\s-]{10,15}$/.test(updateUser.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Geçerli bir telefon numarası giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Şifre değiştirme
  const changeUserPassword = () => {
    if (!validatePassword()) return;

    setLoading(true);

    const configuration = {
      method: "PUT",
      url: "/api/users/password",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        oldPassword: password,
        newPassword: newPassword,
      },
    };

    axios(configuration)
      .then(() => {
        setSuccess({ password: "Şifre başarıyla değiştirildi" });
        setPasswordChanged(true);
        setPassword("");
        setNewPassword("");
        setNewPassword2("");

        // 3 saniye sonra kullanıcıyı çıkış yaparak yönlendireceğiz
        setTimeout(() => {
          alertify.success(
            "Güvenlik nedeniyle yeniden giriş yapmanız gerekiyor"
          );
          cookies.remove("TOKEN");
          window.location.href = "/login";
        }, 3000);
      })
      .catch((error) => {
        let errorMessage =
          error.response?.data?.message || "Şifre değiştirilemedi";

        if (errorMessage.includes("incorrect")) {
          setErrors({ password: "Mevcut şifre hatalı" });
        } else {
          alertify.error(errorMessage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Kullanıcı silme
  const deleteUser = () => {
    if (!password) {
      setErrors({ deletePassword: "Şifre gereklidir" });
      return;
    }

    setLoading(true);

    const configuration = {
      method: "DELETE",
      url: "/api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        password: password,
      },
    };

    axios(configuration)
      .then(() => {
        alertify.success("Hesabınız başarıyla silindi");
        cookies.remove("TOKEN");
        window.location.href = "/login";
      })
      .catch((error) => {
        let errorMessage =
          error.response?.data?.message || "İşlem gerçekleştirilemedi";

        if (errorMessage.includes("password")) {
          setErrors({ deletePassword: "Şifre hatalı" });
        } else {
          alertify.error(errorMessage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // İletişim bilgilerini güncelleme
  const updateUserDetail = (e) => {
    e.preventDefault();

    if (!validateContactInfo()) return;

    setLoading(true);

    const configuration = {
      method: "PUT",
      url: "/api/users",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        email: updateUser.email,
        phoneNumber: updateUser.phoneNumber,
      },
    };

    axios(configuration)
      .then(() => {
        setSuccess({ contactInfo: "Bilgileriniz başarıyla güncellendi" });
        getUser(); // Ana uygulamada kullanıcı bilgilerini güncelle
      })
      .catch((error) => {
        let errorMessage =
          error.response?.data?.message || "Bilgiler güncellenemedi";
        alertify.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  // Yükleme durumu
  if (loading && !userData) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Spinner color="danger" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Kullanıcı bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı bulunamadı
  if (!userData) {
    return (
      <Alert color="danger" className="my-4">
        <i className="fas fa-exclamation-circle me-2"></i>
        Kullanıcı bilgileri yüklenemedi. Lütfen sayfayı yenileyin.
      </Alert>
    );
  }

  return (
    <div className="user-settings-container">
      <Card className="shadow-sm border-0 mb-4">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-user-cog me-2"></i>
            Hesap Ayarları
          </h3>
        </CardHeader>

        <CardBody>
          <Alert color="info" className="d-flex align-items-center mb-4">
            <i className="fas fa-info-circle me-3 fs-4"></i>
            <div>
              Bu sayfada hesap bilgilerinizi düzenleyebilir, şifrenizi
              değiştirebilir veya hesabınızı kaldırabilirsiniz.
            </div>
          </Alert>

          <Row>
            <Col lg={6}>
              {/* Profil Bilgileri Kartı */}
              <Card className="shadow-sm mb-4">
                <CardHeader className="bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-id-card me-2 text-primary"></i>
                    Profil Bilgileri
                  </h5>
                </CardHeader>

                <CardBody>
                  <Form>
                    <Row className="mb-3">
                      <Col md={12}>
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="rounded-circle d-flex justify-content-center align-items-center me-3"
                            style={{
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              width: "60px",
                              height: "60px",
                              fontSize: "24px",
                              fontWeight: "bold",
                            }}
                          >
                            {userData.name?.charAt(0)}
                            {userData.surname?.charAt(0)}
                          </div>
                          <div>
                            <h5 className="mb-0">
                              {userData.name} {userData.surname}
                            </h5>
                            <div className="text-muted small">
                              {userData.username}
                            </div>
                            <div className="mt-1">
                              {userData.roles?.map((role) => (
                                <Badge
                                  key={role}
                                  color="danger"
                                  pill
                                  className="me-1 px-2 py-1"
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <FormGroup className="mb-3">
                          <Label for="name" className="fw-bold">
                            <i className="fas fa-user me-1 text-primary"></i> Ad
                            Soyad
                          </Label>
                          <Input
                            type="text"
                            name="name"
                            id="name"
                            value={`${userData.name} ${userData.surname}`}
                            disabled
                            className="bg-light"
                          />
                          <FormText>
                            Ad soyad bilginiz sistem tarafından yönetilir
                          </FormText>
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="username" className="fw-bold">
                            <i className="fas fa-at me-1 text-primary"></i>{" "}
                            Kullanıcı Adı
                          </Label>
                          <Input
                            type="text"
                            name="username"
                            id="username"
                            value={userData.username}
                            disabled
                            className="bg-light"
                          />
                          <FormText>Kullanıcı adınız değiştirilemez</FormText>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>

              {/* İletişim Bilgileri Kartı */}
              <Card className="shadow-sm mb-4">
                <CardHeader className="bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-address-book me-2 text-primary"></i>
                    İletişim Bilgileri
                  </h5>
                </CardHeader>

                <CardBody>
                  {success.contactInfo && (
                    <Alert
                      color="success"
                      className="d-flex align-items-center mb-3"
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      {success.contactInfo}
                    </Alert>
                  )}

                  <Form onSubmit={updateUserDetail}>
                    <FormGroup className="mb-3">
                      <Label for="email" className="fw-bold">
                        <i className="fas fa-envelope me-1 text-primary"></i>{" "}
                        E-posta Adresi
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="fas fa-envelope"></i>
                        </InputGroupText>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="E-posta adresinizi girin"
                          value={updateUser.email || ""}
                          onChange={handleChange}
                          invalid={!!errors.email}
                          autoComplete="email"
                        />
                        <FormFeedback>{errors.email}</FormFeedback>
                      </InputGroup>
                    </FormGroup>

                    <FormGroup className="mb-4">
                      <Label for="phoneNumber" className="fw-bold">
                        <i className="fas fa-phone me-1 text-primary"></i>{" "}
                        Telefon Numarası
                      </Label>
                      <InputGroup>
                        <InputGroupText>
                          <i className="fas fa-phone"></i>
                        </InputGroupText>
                        <Input
                          type="tel"
                          name="phoneNumber"
                          id="phoneNumber"
                          placeholder="Telefon numaranızı girin"
                          value={updateUser.phoneNumber || ""}
                          onChange={handleChange}
                          invalid={!!errors.phoneNumber}
                          autoComplete="tel"
                        />
                        <FormFeedback>{errors.phoneNumber}</FormFeedback>
                      </InputGroup>
                    </FormGroup>

                    <Button
                      type="submit"
                      color="primary"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-1" />{" "}
                          Güncelleniyor...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i> Bilgileri
                          Güncelle
                        </>
                      )}
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              {/* Şifre Değiştirme Kartı */}
              <Card className="shadow-sm mb-4">
                <CardHeader className="bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Şifre Değiştirme
                  </h5>
                </CardHeader>

                <CardBody>
                  {passwordChanged ? (
                    <Alert color="success">
                      <i className="fas fa-check-circle me-2"></i>
                      Şifreniz başarıyla değiştirildi! Güvenlik nedeniyle
                      yeniden giriş yapmanız gerekiyor.
                      <div className="mt-2">
                        <Spinner size="sm" className="me-1" />{" "}
                        Yönlendiriliyor...
                      </div>
                    </Alert>
                  ) : (
                    <>
                      {success.password && (
                        <Alert color="success">
                          <i className="fas fa-check-circle me-2"></i>
                          {success.password}
                        </Alert>
                      )}

                      <Form>
                        <FormGroup className="mb-3">
                          <Label for="password" className="fw-bold">
                            <i className="fas fa-key me-1 text-primary"></i>{" "}
                            Mevcut Şifre
                          </Label>
                          <InputGroup>
                            <InputGroupText>
                              <i className="fas fa-lock"></i>
                            </InputGroupText>
                            <Input
                              type="password"
                              name="password"
                              id="password"
                              placeholder="Mevcut şifrenizi girin"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              invalid={!!errors.password}
                              autoComplete="current-password"
                            />
                            <FormFeedback>{errors.password}</FormFeedback>
                          </InputGroup>
                        </FormGroup>

                        <FormGroup className="mb-3">
                          <Label for="newPassword" className="fw-bold">
                            <i className="fas fa-key me-1 text-primary"></i>{" "}
                            Yeni Şifre
                          </Label>
                          <InputGroup>
                            <InputGroupText>
                              <i className="fas fa-lock"></i>
                            </InputGroupText>
                            <Input
                              type="password"
                              name="newPassword"
                              id="newPassword"
                              placeholder="Yeni şifrenizi girin"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              invalid={!!errors.newPassword}
                              autoComplete="new-password"
                            />
                            <FormFeedback>{errors.newPassword}</FormFeedback>
                          </InputGroup>
                          <FormText>
                            En az 6 karakter uzunluğunda olmalı
                          </FormText>
                        </FormGroup>

                        <FormGroup className="mb-4">
                          <Label for="newPassword2" className="fw-bold">
                            <i className="fas fa-key me-1 text-primary"></i>{" "}
                            Yeni Şifre (Tekrar)
                          </Label>
                          <InputGroup>
                            <InputGroupText>
                              <i className="fas fa-lock"></i>
                            </InputGroupText>
                            <Input
                              type="password"
                              name="newPassword2"
                              id="newPassword2"
                              placeholder="Yeni şifrenizi tekrar girin"
                              value={newPassword2}
                              onChange={(e) => setNewPassword2(e.target.value)}
                              invalid={!!errors.newPassword2}
                              autoComplete="new-password"
                            />
                            <FormFeedback>{errors.newPassword2}</FormFeedback>
                          </InputGroup>
                        </FormGroup>

                        <Button
                          color="success"
                          className="w-100"
                          onClick={changeUserPassword}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" className="me-1" />{" "}
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-key me-1"></i> Şifreyi
                              Değiştir
                            </>
                          )}
                        </Button>
                      </Form>
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Tehlikeli Bölge */}
              <Card className="border-danger shadow-sm">
                <CardHeader className="bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Tehlikeli Bölge
                  </h5>
                </CardHeader>

                <CardBody>
                  <Alert color="warning">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <strong>Dikkat!</strong> Hesap silme işlemi geri alınamaz.
                    Tüm verileriniz ve ayarlarınız kalıcı olarak silinecektir.
                  </Alert>

                  <Button
                    color="danger"
                    outline
                    block
                    className="mt-2"
                    onClick={toggleDeleteModal}
                  >
                    <i className="fas fa-user-slash me-1"></i> Hesabımı Sil
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Hesap Silme Modal */}
      <Modal isOpen={deleteModal} toggle={toggleDeleteModal} centered>
        <ModalHeader
          toggle={toggleDeleteModal}
          className="bg-danger text-white"
        >
          <i className="fas fa-exclamation-triangle me-2"></i>
          Hesap Silme
        </ModalHeader>
        <ModalBody>
          <div className="text-center mb-4">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#dc3545",
                color: "white",
              }}
            >
              <i className="fas fa-user-slash fa-3x"></i>
            </div>
            <h5>Hesabınızı silmek istediğinize emin misiniz?</h5>
            <p className="text-muted">Bu işlem geri alınamaz!</p>
          </div>

          <Alert color="danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            Hesabınızı silmeniz halinde, tüm verileriniz ve ayarlarınız kalıcı
            olarak sistemden kaldırılacaktır.
          </Alert>

          <FormGroup className="mt-3">
            <Label for="confirmPassword" className="fw-bold">
              <i className="fas fa-lock me-1"></i> Güvenlik için şifrenizi
              girin:
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={!!errors.deletePassword}
            />
            <FormFeedback>{errors.deletePassword}</FormFeedback>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleDeleteModal}>
            <i className="fas fa-times me-1"></i> Vazgeç
          </Button>
          <Button color="danger" onClick={deleteUser} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-1" /> İşleniyor...
              </>
            ) : (
              <>
                <i className="fas fa-trash-alt me-1"></i> Hesabımı Sil
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Stil */}
      <style jsx="true">{`
        .user-settings-container {
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
