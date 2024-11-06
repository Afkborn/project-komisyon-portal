import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import alertify from "alertifyjs";
import axios from "axios";

export default function PersonelIzinEkleModal({
  modal,
  toggle,
  personel,
  token,
  refreshPersonel,
}) {
  const [izin, setIzin] = useState({
    reason: "",
    startDate: "",
    endDate: "",
    comment: "",
    dayCount: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedIzin = { ...izin, [name]: value };

    if (name === "startDate" || name === "endDate") {
      const startDate = new Date(updatedIzin.startDate);
      const endDate = new Date(updatedIzin.endDate);
      if (updatedIzin.startDate && updatedIzin.endDate) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        updatedIzin.dayCount = diffDays;
      } else {
        updatedIzin.dayCount = "";
      }
    }

    setIzin(updatedIzin);
  };

  useEffect(() => {}, [izin, setIzin]);

  const checkInputs = () => {
    if (
      izin.reason === "" ||
      izin.startDate === "" ||
      izin.endDate === "" ||
      izin.comment === ""
    ) {
      alertify.error("Lütfen tüm alanları doldurunuz.");
      return false;
    }
    return true;
  };

  const handleUpdate = () => {
    if (!checkInputs()) {
      return;
    }
    const configuration = {
      method: "POST",
      url: "api/leaves/" + personel._id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        startDate: izin.startDate,
        endDate: izin.endDate,
        reason: izin.reason,
        comment: izin.comment,
        dayCount: izin.dayCount,
      },
    };
    axios(configuration)
      .then((result) => {
        alertify.success("İzin eklendi.");
        refreshPersonel();
        handleCancel();
      })
      .catch((error) => {
        console.log(error);
        alertify.error("İzin eklenirken bir hata oluştu.");
      });
  };

  const handleCancel = () => {
    setIzin({
      reason: "",
      startDate: "",
      endDate: "",
      comment: "",
      dayCount: 0,
    });
    toggle();
  };

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Personel İzin Ekle</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="reason">İzin Tipi</Label>
            <Input
              type="select"
              name="reason"
              onChange={handleInputChange}
              id="reason"
            >
              <option>Seçiniz</option>
              
              <option value={"YILLIK_IZIN"}>Yıllık İzin</option>
              <option value={"RAPOR_IZIN"}>Raporlu İzin</option>
              <option value={"UCRETSIZ_IZIN"}>Ücretsiz İzin</option>
              <option value={"MAZERET_IZIN"}>Mazeret İzin</option>
              <option value={"DOGUM_IZIN"}>Doğum İzni</option>
              <option value={"OLUM_IZIN"}>Ölüm İzni</option>
              <option value={"EVLENME_IZIN"}>Evlenme İzni</option>
              <option value={"REFAKAT_IZIN"}>Refakat İzni</option>
              <option value={"DIGER_IZIN"}>Diğer</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="startDate">İzin Başlangıç Tarihi</Label>
            <Input
              type="date"
              name="startDate"
              id="startDate"
              placeholder="İzin Başlangıç Tarihi"
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="endDate">İzin Bitiş Tarihi</Label>
            <Input
              type="date"
              name="endDate"
              id="endDate"
              placeholder="İzin Bitiş Tarihi"
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="izinSure">İzin Süresi</Label>
            <Input
              type="text"
              name="izinSure"
              id="izinSure"
              placeholder="İzin Süresi"
              onChange={handleInputChange}
              value={izin.dayCount}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <Label for="comment">İzin Açıklama</Label>
            <Input
              type="textarea"
              name="comment"
              id="comment"
              placeholder="İzin Açıklama"
              onChange={handleInputChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleUpdate}>
          Ekle
        </Button>{" "}
        <Button color="secondary" onClick={handleCancel}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
