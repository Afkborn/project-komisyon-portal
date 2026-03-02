import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import alertify from "alertifyjs";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import AddNoteModal from "./AddNoteModal";
import EditNoteModal from "./EditNoteModal";
import NoteCard from "./NoteCard";

const defaultFilters = {
  q: "",
  isCompleted: "",
  hasReminder: "",
  priority: "",
  reminderTarget: "",
  createdAtStart: "",
  createdAtEnd: "",
  reminderDateStart: "",
  reminderDateEnd: "",
};

const defaultSort = {
  sortBy: "createdAt",
  sortOrder: "desc",
};

const normalizeDateFilter = (value, endOfDay = false) => {
  if (!value) return undefined;
  return endOfDay ? `${value}T23:59:59.999` : `${value}T00:00:00.000`;
};

const toBooleanParam = (value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

export default function NoteList({ token, selectedUnit, defaultBirimId, refreshKey = 0 }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [sortState, setSortState] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const toggleAddModal = () => setAddModalOpen((v) => !v);
  const toggleEditModal = () => setEditModalOpen((v) => !v);

  const queryParams = useMemo(() => {
    if (!selectedUnit) return null;

    const isPersonal = selectedUnit.key === "personal";

    const params = {
      page,
      limit,
      ...sortState,
      q: appliedFilters.q?.trim() || undefined,
      isCompleted: toBooleanParam(appliedFilters.isCompleted),
      hasReminder: toBooleanParam(appliedFilters.hasReminder),
      priority: appliedFilters.priority || undefined,
      reminderTarget: appliedFilters.reminderTarget || undefined,
      createdAtStart: normalizeDateFilter(appliedFilters.createdAtStart),
      createdAtEnd: normalizeDateFilter(appliedFilters.createdAtEnd, true),
      reminderDateStart: normalizeDateFilter(appliedFilters.reminderDateStart),
      reminderDateEnd: normalizeDateFilter(appliedFilters.reminderDateEnd, true),
    };

    if (isPersonal) {
      params.isPrivate = true;
    } else {
      params.birimId = selectedUnit.id;
    }

    return params;
  }, [appliedFilters, limit, page, selectedUnit, sortState]);

  const fetchNotes = useCallback(() => {
    if (!selectedUnit) return;

    setLoading(true);

    const configuration = {
      method: "GET",
      url: "/api/binot/list",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: queryParams,
    };

    axios(configuration)
      .then((res) => {
        const list = res.data?.list || res.data?.noteList || [];
        setNotes(Array.isArray(list) ? list : []);
        setTotalCount(Number(res.data?.totalCount || list.length || 0));
        setPageCount(Number(res.data?.pageCount || 1));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alertify.error("Notlar getirilirken hata oluştu");
        setLoading(false);
      });
  }, [queryParams, selectedUnit, token]);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [selectedUnit?.key, selectedUnit?.id]);

  const handleFilterDraftChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters({ ...draftFilters });
  };

  const clearFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const handleSortByChange = (e) => {
    const value = e.target.value;
    setPage(1);
    setSortState((prev) => ({
      ...prev,
      sortBy: value,
    }));
  };

  const handleSortOrderChange = (e) => {
    const value = e.target.value;
    setPage(1);
    setSortState((prev) => ({
      ...prev,
      sortOrder: value,
    }));
  };

  const handleLimitChange = (e) => {
    const value = Number(e.target.value) || 50;
    setLimit(value);
    setPage(1);
  };

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
    })
      .then(() => {
        fetchNotes();
      })
      .catch((err) => {
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

  const handleDelete = (note) => {
    if (!window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      return;
    }

    axios({
      method: "DELETE",
      url: `/api/biNot/${note._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        fetchNotes();
        alertify.success("Not silindi");
      })
      .catch((err) => {
        console.error(err);
        alertify.error(err.response?.data?.message || "Not silinemedi");
      });
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (payload) => {
    if (!editingNote) return;

    setSaving(true);

    axios({
      method: "PUT",
      url: `/api/biNot/${editingNote._id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    })
      .then(() => {
        fetchNotes();
        alertify.success("Not güncellendi");
        setSaving(false);
        setEditModalOpen(false);
        setEditingNote(null);
      })
      .catch((err) => {
        console.error(err);
        alertify.error(err.response?.data?.message || "Not güncellenemedi");
        setSaving(false);
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
          <small className="text-muted">
            Toplam: {totalCount} not | Sayfa: {page}/{pageCount}
          </small>
        </div>

        <div className="d-flex gap-2">
          <Button color="secondary" outline onClick={() => setShowFilters((prev) => !prev)}>
            <i className={`fas ${showFilters ? "fa-eye-slash" : "fa-filter"} me-2`}></i>
            {showFilters ? "Filtreleri Gizle" : "Filtreleri Göster"}
          </Button>
          <Button color="success" onClick={toggleAddModal}>
            <i className="fas fa-plus me-2"></i>
            Yeni Not
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {showFilters && (
        <Row className="g-3 mb-3">
          <Col md={4}>
            <FormGroup>
              <Label for="filter-q" className="fw-bold">Arama</Label>
              <Input
                id="filter-q"
                name="q"
                value={draftFilters.q}
                onChange={handleFilterDraftChange}
                placeholder="Başlık / içerik / dosya no"
              />
            </FormGroup>
          </Col>

          <Col md={2}>
            <FormGroup>
              <Label for="filter-isCompleted" className="fw-bold">Durum</Label>
              <Input
                id="filter-isCompleted"
                name="isCompleted"
                type="select"
                value={draftFilters.isCompleted}
                onChange={handleFilterDraftChange}
              >
                <option value="">Tümü</option>
                <option value="false">Devam Eden</option>
                <option value="true">Tamamlanan</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={2}>
            <FormGroup>
              <Label for="filter-hasReminder" className="fw-bold">Anımsatıcı</Label>
              <Input
                id="filter-hasReminder"
                name="hasReminder"
                type="select"
                value={draftFilters.hasReminder}
                onChange={handleFilterDraftChange}
              >
                <option value="">Tümü</option>
                <option value="true">Var</option>
                <option value="false">Yok</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={2}>
            <FormGroup>
              <Label for="filter-priority" className="fw-bold">Öncelik</Label>
              <Input
                id="filter-priority"
                name="priority"
                type="select"
                value={draftFilters.priority}
                onChange={handleFilterDraftChange}
              >
                <option value="">Tümü</option>
                <option value="Acil">Acil</option>
                <option value="Yüksek">Yüksek</option>
                <option value="Normal">Normal</option>
                <option value="Düşük">Düşük</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={2}>
            <FormGroup>
              <Label for="filter-reminderTarget" className="fw-bold">Uyarı Hedefi</Label>
              <Input
                id="filter-reminderTarget"
                name="reminderTarget"
                type="select"
                value={draftFilters.reminderTarget}
                onChange={handleFilterDraftChange}
              >
                <option value="">Tümü</option>
                <option value="SELF">Ben</option>
                <option value="UNIT">Birim</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={3}>
            <FormGroup>
              <Label for="filter-createdAtStart" className="fw-bold">Oluşturma Başlangıç</Label>
              <Input
                id="filter-createdAtStart"
                name="createdAtStart"
                type="date"
                value={draftFilters.createdAtStart}
                onChange={handleFilterDraftChange}
              />
            </FormGroup>
          </Col>

          <Col md={3}>
            <FormGroup>
              <Label for="filter-createdAtEnd" className="fw-bold">Oluşturma Bitiş</Label>
              <Input
                id="filter-createdAtEnd"
                name="createdAtEnd"
                type="date"
                value={draftFilters.createdAtEnd}
                onChange={handleFilterDraftChange}
              />
            </FormGroup>
          </Col>

          <Col md={3}>
            <FormGroup>
              <Label for="filter-reminderDateStart" className="fw-bold">Hatırlatma Başlangıç</Label>
              <Input
                id="filter-reminderDateStart"
                name="reminderDateStart"
                type="date"
                value={draftFilters.reminderDateStart}
                onChange={handleFilterDraftChange}
              />
            </FormGroup>
          </Col>

          <Col md={3}>
            <FormGroup>
              <Label for="filter-reminderDateEnd" className="fw-bold">Hatırlatma Bitiş</Label>
              <Input
                id="filter-reminderDateEnd"
                name="reminderDateEnd"
                type="date"
                value={draftFilters.reminderDateEnd}
                onChange={handleFilterDraftChange}
              />
            </FormGroup>
          </Col>

          <Col md={3}>
            <FormGroup>
              <Label for="sortBy" className="fw-bold">Sıralama Alanı</Label>
              <Input id="sortBy" type="select" value={sortState.sortBy} onChange={handleSortByChange}>
                <option value="createdAt">Oluşturulma</option>
                <option value="updatedAt">Güncellenme</option>
                <option value="reminderDate">Hatırlatma Tarihi</option>
                <option value="priority">Öncelik</option>
                <option value="isCompleted">Tamamlanma</option>
                <option value="title">Başlık</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={2}>
            <FormGroup>
              <Label for="sortOrder" className="fw-bold">Yön</Label>
              <Input id="sortOrder" type="select" value={sortState.sortOrder} onChange={handleSortOrderChange}>
                <option value="desc">Azalan</option>
                <option value="asc">Artan</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={2}>
            <FormGroup>
              <Label for="limit" className="fw-bold">Sayfa Boyutu</Label>
              <Input id="limit" type="select" value={limit} onChange={handleLimitChange}>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md={5} className="d-flex align-items-end gap-2">
            <Button color="primary" onClick={applyFilters}>
              <i className="fas fa-filter me-2"></i>
              Filtrele
            </Button>
            <Button color="light" className="border" onClick={clearFilters}>
              <i className="fas fa-eraser me-2"></i>
              Temizle
            </Button>
          </Col>
        </Row>
        )}

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
              <NoteCard
                key={note._id}
                note={note}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Bu sayfada: {notes.length} kayıt
              </small>
              <div className="d-flex gap-2">
                <Button
                  color="secondary"
                  outline
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  <i className="fas fa-chevron-left me-1"></i>
                  Önceki
                </Button>
                <Button
                  color="secondary"
                  outline
                  disabled={page >= pageCount || loading}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
                >
                  Sonraki
                  <i className="fas fa-chevron-right ms-1"></i>
                </Button>
              </div>
            </div>
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

        <EditNoteModal
          isOpen={editModalOpen}
          toggle={toggleEditModal}
          note={editingNote}
          onSave={handleSaveEdit}
          saving={saving}
        />
      </CardBody>
    </Card>
  );
}
