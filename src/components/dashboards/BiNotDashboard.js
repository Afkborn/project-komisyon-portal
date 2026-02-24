import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Alert, Spinner } from "reactstrap";
import Cookies from "universal-cookie";
import axios from "axios";
import alertify from "alertifyjs";
import AYSNavbar from "../root/AYSNavbar";
import { GET_USER_DETAILS } from "../constants/AxiosConfiguration";

import BirimSidebar from "../bi-not-features/BirimSidebar";
import NoteList from "../bi-not-features/NoteList";

const normalizeUnit = (unit, kind) => {
  if (!unit) return null;

  if (typeof unit === "string") {
    return {
      key: `${kind}:${unit}`,
      id: unit,
      label: unit,
      kind,
    };
  }

  const id = unit._id || unit.id;
  if (!id) return null;

  return {
    key: `${kind}:${id}`,
    id,
    label: unit.name || unit.label || unit.title || id,
    kind,
  };
};

export default function BiNotDashboard() {
  const cookies = new Cookies();
  const token = cookies.get("TOKEN");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [person, setPerson] = useState(null);

  const [selectedUnit, setSelectedUnit] = useState({
    key: "personal",
    id: null,
    label: "Şahsi Notlarım",
    kind: "Şahsi",
    iconClass: "fas fa-user",
  });

  useEffect(() => {
    if (!token) {
      alertify.error("Oturum bulunamadı!");
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    axios(GET_USER_DETAILS(token))
      .then((res) => {
        const fetchedUser = res.data?.user || null;
        setUser(fetchedUser);

        const userPerson = fetchedUser?.person || null;
        // user.person populate geldiyse direkt kullan
        if (userPerson && typeof userPerson === "object") {
          setPerson(userPerson);
        } else if (typeof userPerson === "string") {
          // sadece id geldiyse person detayı çekmeyi dene (endpoint yoksa sessizce geç)
          axios({
            method: "GET",
            url: `/api/persons/byId/${userPerson}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((pRes) => {
              setPerson(pRes.data?.person || null);
            })
            .catch(() => {
              setPerson(null);
            });
        } else {
          setPerson(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alertify.error("Kullanıcı bilgileri alınamadı");
        setLoading(false);
      });
  }, [token]);

  const units = useMemo(() => {
    const base = [
      {
        key: "personal",
        id: null,
        label: "Şahsi Notlarım",
        kind: "Şahsi",
        iconClass: "fas fa-user",
      },
    ];

    if (!person) return base;

    const normalized = [
      normalizeUnit(person?.birimID, "Birim"),
      normalizeUnit(person?.ikinciBirimID, "2. Birim"),
      normalizeUnit(person?.temporaryBirimID, "Geçici"),
    ].filter(Boolean);

    const uniqueById = new Map();
    for (const u of normalized) {
      uniqueById.set(u.id, u);
    }

    return [...base, ...Array.from(uniqueById.values())];
  }, [person]);

  // Seçili birim listede yoksa (örn. user değişti) şahsiye dön
  useEffect(() => {
    if (!units.find((u) => u.key === selectedUnit.key)) {
      setSelectedUnit(units[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  return (
    <div className="binot-dashboard">
      <AYSNavbar />
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h3 className="text-primary fw-bold">
              <i className="fas fa-sticky-note me-2"></i>
              BiNot
            </h3>
            <p className="text-muted mb-0">
              Birim bazlı veya şahsi notlarınızı görüntüleyebilir ve
              yönetebilirsiniz.
            </p>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center p-5">
            <Spinner color="primary" />
            <p className="text-muted mt-3">Yükleniyor...</p>
          </div>
        ) : !user ? (
          <Alert color="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Kullanıcı bilgisi bulunamadı.
          </Alert>
        ) : (
          <Row className="g-4">
            <Col md={3}>
              <BirimSidebar
                units={units}
                selectedKey={selectedUnit.key}
                onSelect={setSelectedUnit}
              />
            </Col>
            <Col md={9}>
              <NoteList token={token} selectedUnit={selectedUnit} />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
