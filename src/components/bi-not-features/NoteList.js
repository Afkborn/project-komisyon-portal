import React, { useEffect, useState } from "react";
import axios from "axios";
import alertify from "alertifyjs";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "reactstrap";
import AddNoteModal from "./AddNoteModal";
import NoteCard from "./NoteCard";

export default function NoteList({ token, selectedUnit, defaultBirimId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const toggleAddModal = () => setAddModalOpen((v) => !v);

  const fetchNotes = () => {
    if (!selectedUnit) return;

    setLoading(true);

    const isPersonal = selectedUnit.key === "personal";

    const configuration = {
      method: "GET",
      url: "/api/binot/list",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: isPersonal
        ? { isPrivate: true }
        : { birimId: selectedUnit.id },
    };

    axios(configuration)
      .then((res) => {
        const list = res.data?.list || res.data?.noteList || [];
        setNotes(Array.isArray(list) ? list : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alertify.error("Notlar getirilirken hata oluştu");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit?.key, selectedUnit?.id]);

  const handleAddNote = (payload) => {
    setSaving(true);

    const configuration = {
      method: "POST",
      url: "/api/binot/add",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    };

    axios(configuration)
      .then(() => {
        alertify.success("Not eklendi");
        setSaving(false);
        setAddModalOpen(false);
        fetchNotes();
      })
      .catch((err) => {
        console.error(err);
        alertify.error(err.response?.data?.message || "Not eklenemedi");
        setSaving(false);
      });
  };

  const handleComplete = (note) => {
    // UI hemen güncellensin
    setNotes((prev) =>
      prev.map((n) =>
        n._id === note._id ? { ...n, isCompleted: true } : n,
      ),
    );

    axios({
      method: "PUT",
      url: `/api/binot/${note._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        isCompleted: true,
      },
    }).catch((err) => {
      console.error(err);
      alertify.error("Not tamamlandı işaretlenemedi");
      // Geri al
      setNotes((prev) =>
        prev.map((n) =>
          n._id === note._id
            ? { ...n, isCompleted: false }
            : n,
        ),
      );
    });
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-light d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            <i className="fas fa-sticky-note me-2"></i>
            {selectedUnit?.label || "Notlar"}
          </h5>
          <small className="text-muted">Toplam: {notes.length} not</small>
        </div>

        <Button color="success" onClick={toggleAddModal}>
          <i className="fas fa-plus me-2"></i>
          Yeni Not
        </Button>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center p-5">
            <Spinner color="primary" />
            <p className="text-muted mt-3">Notlar yükleniyor...</p>
          </div>
        ) : notes.length === 0 ? (
          <Alert color="info">
            <i className="fas fa-info-circle me-2"></i>
            Bu alanda henüz not yok.
          </Alert>
        ) : (
          <div>
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} onComplete={handleComplete} />
            ))}
          </div>
        )}

        <AddNoteModal
          isOpen={addModalOpen}
          toggle={toggleAddModal}
          selectedUnit={selectedUnit}
          defaultBirimId={defaultBirimId}
          onSave={handleAddNote}
          saving={saving}
        />
      </CardBody>
    </Card>
  );
}
