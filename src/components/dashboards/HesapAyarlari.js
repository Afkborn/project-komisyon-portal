import React, { useState, useEffect, useRef } from "react";
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
import AYSNavbar from "../root/AYSNavbar";

export default function HesapAyarlari() {
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

  const [loading, setLoading] = useState(true);
  const [profilePictureLoading, setProfilePictureLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Form verisi
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [updateUser, setUpdateUser] = useState({
    email: "",
    phoneNumber: "",
  });

  // Form hatalari/dogrulamasi
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Hata ve basari mesajlari icin zaman asimi
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccess({});
    }, 5000);

    return () => clearTimeout(timer);
  }, [success]);

  // Kullanici bilgilerini yukle
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
        console.error("Kullanici bilgileri alinamadi:", error);
        alertify.error("Kullanici bilgileri alinamadi");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Form input degisikliklerini isle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Varsa hatayi temizle
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Sifre degisimi icin form dogrulama
  const validatePassword = () => {
    const newErrors = {};

    if (!password) newErrors.password = "Mevcut sifre gereklidir";
    if (!newPassword) newErrors.newPassword = "Yeni sifre gereklidir";
    if (!newPassword2) newErrors.newPassword2 = "Sifre tekrari gereklidir";

    if (newPassword && newPassword2 && newPassword !== newPassword2) {
      newErrors.newPassword2 = "Sifreler eslesmiyor";
    }

    // Sifre karmasikligi kontrolu
    if (newPassword && newPassword.length < 6) {
      newErrors.newPassword = "Sifre en az 6 karakter olmalidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Iletisim bilgilerini guncelleme icin form dogrulama
  const validateContactInfo = () => {
    const newErrors = {};

    // E-posta dogrulama
    if (updateUser.email && !/^\S+@\S+\.\S+$/.test(updateUser.email)) {
      newErrors.email = "Gecerli bir e-posta adresi giriniz";
    }

    // Telefon dogrulama (Opsiyonel)
    if (updateUser.phoneNumber) {
      const normalizedPhone = updateUser.phoneNumber.replace(/\s/g, "");
      if (!/^[1-9][0-9]{9,14}$/.test(normalizedPhone)) {
        newErrors.phoneNumber = "Telefon numarasi 0 ile baslayamaz";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sifre degistirme
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
        setSuccess({ password: "Sifre basariyla degistirildi" });
        setPasswordChanged(true);
        setPassword("");
        setNewPassword("");
        setNewPassword2("");

        // 3 saniye sonra kullaniciyi cikis yaparak yonlendirecegiz
        setTimeout(() => {
          alertify.success(
            "Guvenlik nedeniyle yeniden giris yapmaniz gerekiyor",
          );
          cookies.remove("TOKEN");
          window.location.href = "/login";
        }, 3000);
      })
      .catch((error) => {
        let errorMessage =
          error.response?.data?.message || "Sifre degistirilemedi";

        if (errorMessage.includes("incorrect")) {
          setErrors({ password: "Mevcut sifre hatali" });
        } else {
          alertify.error(errorMessage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Kullanici silme
  const deleteUser = () => {
    if (!password) {
      setErrors({ deletePassword: "Sifre gereklidir" });
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
        alertify.success("Hesabiniz basariyla silindi");
        cookies.remove("TOKEN");
        window.location.href = "/login";
      })
      .catch((error) => {
        let errorMessage =
          error.response?.data?.message || "Islem gerceklestirilemedi";

        if (errorMessage.includes("password")) {
          setErrors({ deletePassword: "Sifre hatali" });
        } else {
          alertify.error(errorMessage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Iletisim bilgilerini guncelleme
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
        setSuccess({ contactInfo: "Bilgileriniz basariyla guncellendi" });
        getUserDetails();
      })
      .catch((error) => {
        let errorMessage =
          error.response?.data?.message || "Bilgiler guncellenemedi";
        alertify.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  const getProfilePictureUrl = () => {
    // Veritabanından gelen ham yolu al
    const dbPath =
      userData?.profilePicture ||
      userData?.profilePictureUrl ||
      userData?.photoUrl ||
      userData?.avatarUrl ||
      userData?.imageUrl ||
      "";

    if (!dbPath) return "";

    // Eğer yol zaten tam bir URL ise (dışarıdan bir link, Google auth vs.) direkt döndür
    if (dbPath.startsWith("http")) {
      return dbPath;
    }

    // Değilse, başına Backend URL'ini ekle
    // REACT_APP_BACKEND_URL yoksa varsayılan olarak localhost:8080 kullan
    const backendUrl =
      process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

    return `${backendUrl}${dbPath}`;
  };

  const hasProfilePicture = Boolean(getProfilePictureUrl());

  const getUserInitials = () => {
    const firstNameInitial = userData?.name?.charAt(0) || "";
    const lastNameInitial = userData?.surname?.charAt(0) || "";
    return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !profilePictureLoading) {
      fileInputRef.current.click();
    }
  };

  const validateProfilePicture = (file) => {
    if (!file) {
      return "Dosya secilemedi";
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Sadece JPG, JPEG veya PNG dosyasi yukleyebilirsiniz";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Dosya boyutu en fazla 5MB olmalidir";
    }

    return null;
  };

  const handleProfilePictureUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    const validationMessage = validateProfilePicture(selectedFile);

    if (validationMessage) {
      alertify.error(validationMessage);
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);

    setProfilePictureLoading(true);

    try {
      const response = await axios({
        method: "PUT",
        url: "/api/users/profile-picture",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: formData,
      });

      if (response?.data?.user) {
        setUserData(response.data.user);
      } else {
        getUserDetails();
      }

      alertify.success("Profil fotografiniz guncellendi");
    } catch (error) {
      console.error("Profil fotografi yukleme hatasi:", error);
      alertify.error(
        error.response?.data?.message ||
          "Bir hata olustu. Fotograf yuklenemedi",
      );
    } finally {
      setProfilePictureLoading(false);
      e.target.value = "";
    }
  };

  const handleProfilePictureDelete = async () => {
    const isConfirmed = window.confirm(
      "Profil fotografinizi kaldirmak istediginize emin misiniz?",
    );

    if (!isConfirmed) return;

    setProfilePictureLoading(true);

    try {
      await axios({
        method: "DELETE",
        url: "/api/users/profile-picture",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserData((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          profilePicture: "",
          profilePictureUrl: "",
          photoUrl: "",
          avatarUrl: "",
          imageUrl: "",
        };
      });

      alertify.success("Profil fotografi kaldirildi");
    } catch (error) {
      console.error("Profil fotografi silme hatasi:", error);
      alertify.error(
        error.response?.data?.message ||
          "Bir hata olustu. Fotograf kaldirilamadi",
      );
    } finally {
      setProfilePictureLoading(false);
    }
  };

  // Yukleme durumu
  if (loading && !userData) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Spinner color="danger" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Kullanici bilgileri yukleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanici bulunamadi
  if (!userData) {
    return (
      <Alert color="danger" className="my-4">
        <i className="fas fa-exclamation-circle me-2"></i>
        Kullanici bilgileri yuklenemedi. Lutfen sayfayi yenileyin.
      </Alert>
    );
  }

  return (
    <div>
      <AYSNavbar />

      <div className="user-settings-container">
        <Card className="shadow-sm border-0 mb-4">
          <CardHeader className="bg-danger text-white">
            <h3 className="mb-0">
              <i className="fas fa-user-cog me-2"></i>
              Hesap Ayarlari
            </h3>
          </CardHeader>

          <CardBody>
            <Alert color="info" className="d-flex align-items-center mb-4">
              <i className="fas fa-info-circle me-3 fs-4"></i>
              <div>
                Bu sayfada hesap bilgilerinizi duzenleyebilir, sifrenizi
                degistirebilir veya hesabinizi kaldirabilirsiniz.
              </div>
            </Alert>

            <Row>
              <Col lg={6}>
                {/* Profil Bilgileri Karti */}
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
                            <div className="me-3 text-center">
                              <div
                                className="rounded-circle d-flex justify-content-center align-items-center overflow-hidden"
                                style={{
                                  backgroundColor: "#dc3545",
                                  color: "#fff",
                                  width: "84px",
                                  height: "84px",
                                  fontSize: "24px",
                                  fontWeight: "bold",
                                }}
                              >
                                {hasProfilePicture ? (
                                  <img
                                    src={getProfilePictureUrl()}
                                    alt="Profil"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  getUserInitials() || (
                                    <i className="fas fa-user"></i>
                                  )
                                )}
                              </div>

                              <div className="d-grid gap-2 mt-2">
                                <Input
                                  type="file"
                                  innerRef={fileInputRef}
                                  accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
                                  onChange={handleProfilePictureUpload}
                                  className="d-none"
                                />

                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={triggerFileInput}
                                  disabled={profilePictureLoading || loading}
                                >
                                  {profilePictureLoading ? (
                                    <>
                                      <Spinner size="sm" className="me-1" />{" "}
                                      Yukleniyor...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-upload me-1"></i>{" "}
                                      Fotografi Degistir
                                    </>
                                  )}
                                </Button>

                                {hasProfilePicture && (
                                  <Button
                                    color="danger"
                                    size="sm"
                                    outline
                                    onClick={handleProfilePictureDelete}
                                    disabled={profilePictureLoading || loading}
                                  >
                                    {profilePictureLoading ? (
                                      <>
                                        <Spinner size="sm" className="me-1" />{" "}
                                        Isleniyor...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-trash me-1"></i>{" "}
                                        Fotografi Kaldir
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
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
                              <FormText className="d-block mt-2">
                                Desteklenen formatlar: JPG, JPEG, PNG (Maks.
                                5MB)
                              </FormText>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <FormGroup className="mb-3">
                            <Label for="name" className="fw-bold">
                              <i className="fas fa-user me-1 text-primary"></i>{" "}
                              Ad Soyad
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
                              Ad soyad bilginiz sistem tarafindan yonetilir
                            </FormText>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="username" className="fw-bold">
                              <i className="fas fa-at me-1 text-primary"></i>{" "}
                              Kullanici Adi
                            </Label>
                            <Input
                              type="text"
                              name="username"
                              id="username"
                              value={userData.username}
                              disabled
                              className="bg-light"
                            />
                            <FormText>Kullanici adiniz degistirilemez</FormText>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>

                {/* Iletisim Bilgileri Karti */}
                <Card className="shadow-sm mb-4">
                  <CardHeader className="bg-white">
                    <h5 className="mb-0">
                      <i className="fas fa-address-book me-2 text-primary"></i>
                      Iletisim Bilgileri
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
                          Telefon Numarasi
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-phone"></i>
                          </InputGroupText>
                          <Input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            placeholder="Telefon numaranizi başında olmadan girin (Örn: 5321234567)"
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
                            Guncelleniyor...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-1"></i> Bilgileri
                            Guncelle
                          </>
                        )}
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>

              <Col lg={6}>
                {/* Sifre Degistirme Karti */}
                <Card className="shadow-sm mb-4">
                  <CardHeader className="bg-white">
                    <h5 className="mb-0">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Sifre Degistirme
                    </h5>
                  </CardHeader>

                  <CardBody>
                    {passwordChanged ? (
                      <Alert color="success">
                        <i className="fas fa-check-circle me-2"></i>
                        Sifreniz basariyla degistirildi! Guvenlik nedeniyle
                        yeniden giris yapmaniz gerekiyor.
                        <div className="mt-2">
                          <Spinner size="sm" className="me-1" />{" "}
                          Yonlendiriliyor...
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
                              Mevcut Sifre
                            </Label>
                            <InputGroup>
                              <InputGroupText>
                                <i className="fas fa-lock"></i>
                              </InputGroupText>
                              <Input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Mevcut sifrenizi girin"
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
                              Yeni Sifre
                            </Label>
                            <InputGroup>
                              <InputGroupText>
                                <i className="fas fa-lock"></i>
                              </InputGroupText>
                              <Input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                placeholder="Yeni sifrenizi girin"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                invalid={!!errors.newPassword}
                                autoComplete="new-password"
                              />
                              <FormFeedback>{errors.newPassword}</FormFeedback>
                            </InputGroup>
                            <FormText>
                              En az 6 karakter uzunlugunda olmali
                            </FormText>
                          </FormGroup>

                          <FormGroup className="mb-4">
                            <Label for="newPassword2" className="fw-bold">
                              <i className="fas fa-key me-1 text-primary"></i>{" "}
                              Yeni Sifre (Tekrar)
                            </Label>
                            <InputGroup>
                              <InputGroupText>
                                <i className="fas fa-lock"></i>
                              </InputGroupText>
                              <Input
                                type="password"
                                name="newPassword2"
                                id="newPassword2"
                                placeholder="Yeni sifrenizi tekrar girin"
                                value={newPassword2}
                                onChange={(e) =>
                                  setNewPassword2(e.target.value)
                                }
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
                                Isleniyor...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-key me-1"></i> Sifreyi
                                Degistir
                              </>
                            )}
                          </Button>
                        </Form>
                      </>
                    )}
                  </CardBody>
                </Card>

                {/* Tehlikeli Bolge */}
                <Card className="border-danger shadow-sm">
                  <CardHeader className="bg-danger text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Tehlikeli Bolge
                    </h5>
                  </CardHeader>

                  <CardBody>
                    <Alert color="warning">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <strong>Dikkat!</strong> Hesap silme islemi geri alinamaz.
                      Tum verileriniz ve ayarlariniz kalici olarak silinecektir.
                    </Alert>

                    <Button
                      color="danger"
                      outline
                      block
                      className="mt-2"
                      onClick={toggleDeleteModal}
                    >
                      <i className="fas fa-user-slash me-1"></i> Hesabimi Sil
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
              <h5>Hesabinizi silmek istediginize emin misiniz?</h5>
              <p className="text-muted">Bu islem geri alinamaz!</p>
            </div>

            <Alert color="danger">
              <i className="fas fa-exclamation-circle me-2"></i>
              Hesabinizi silmeniz halinde, tum verileriniz ve ayarlariniz kalici
              olarak sistemden kaldirilacaktir.
            </Alert>

            <FormGroup className="mt-3">
              <Label for="confirmPassword" className="fw-bold">
                <i className="fas fa-lock me-1"></i> Guvenlik icin sifrenizi
                girin:
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                placeholder="Sifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!errors.deletePassword}
              />
              <FormFeedback>{errors.deletePassword}</FormFeedback>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleDeleteModal}>
              <i className="fas fa-times me-1"></i> Vazgec
            </Button>
            <Button color="danger" onClick={deleteUser} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-1" /> Isleniyor...
                </>
              ) : (
                <>
                  <i className="fas fa-trash-alt me-1"></i> Hesabimi Sil
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
    </div>
  );
}
