import React, { useState, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Pagination,
  PaginationItem,
  PaginationLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilePdf,
  FaPrint,
} from "react-icons/fa";

const DataTable = ({
  data,
  columns,
  onDetailClick,
  tableName = "Tablo",
  generatePdf,
  printTable,
  initialPageSize = 30,
  tableClassName = "",
  striped = true,
  customRowClassName = null,
  disableExternalSort = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Modal durumları - değişti
  const [pdfConfirmOpen, setPdfConfirmOpen] = useState(false);
  const [printConfirmOpen, setPrintConfirmOpen] = useState(false);

  // Modal togglers - değişti
  const togglePdfConfirm = () => setPdfConfirmOpen(!pdfConfirmOpen);
  const togglePrintConfirm = () => setPrintConfirmOpen(!printConfirmOpen);

  // Sayfa boyutu değiştiğinde ilk sayfaya dön
  const handlePageSizeChange = (newSize) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  // Pagination kontrolü
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Sıralama fonksiyonu
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sıralama ve filtreleme işlemleri
  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data];

    // Arama filtreleme
    if (searchTerm) {
      processedData = processedData.filter((item) =>
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sıralama - disableExternalSort false ise sırala
    if (sortConfig.key && !disableExternalSort) {
      processedData.sort((a, b) => {
        // İlgili kolonu bul
        const column = columns.find((col) => col.key === sortConfig.key);

        // Değerleri al (render fonksiyonu varsa onu kullan)
        let aValue = column.render ? column.render(a) : a[sortConfig.key];
        let bValue = column.render ? column.render(b) : b[sortConfig.key];

        // String olarak kullanmak için text çıkarıyoruz render fonksiyonu varsa
        if (
          column.render &&
          typeof aValue !== "string" &&
          typeof aValue !== "number"
        ) {
          // React elementi olabilir, text içeriğini almaya çalışalım
          aValue =
            column.key === "fullName"
              ? `${a.ad || ""} ${a.soyad || ""}`
              : a[sortConfig.key]?.toString() || "";

          bValue =
            column.key === "fullName"
              ? `${b.ad || ""} ${b.soyad || ""}`
              : b[sortConfig.key]?.toString() || "";
        }

        // Sıralama yönüne göre karşılaştır
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return processedData;
  }, [data, searchTerm, sortConfig, columns, disableExternalSort]);

  // Pagination için veriyi böl
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  // PDF oluşturma işlemi - basitleştirildi
  const handlePdfExport = () => {
    if (generatePdf) {
      // Önce modalı kapat
      setPdfConfirmOpen(false);
      // Sadece görünen verileri PDF'e aktar
      generatePdf(
        document,
        tableName,
        tableName,
        "detayTD",
        columns.length > 5
      );
    }
  };

  // Yazdırma işlemi - basitleştirildi
  const handlePrint = () => {
    if (printTable) {
      // Önce modalı kapat
      setPrintConfirmOpen(false);
      // Sadece görünen verileri yazdır
      printTable(document, tableName, tableName, "detayTD", columns.length > 5);
    }
  };

  // Sıralama ikonu render
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Pagination render
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i} active={i === currentPage}>
          <PaginationLink onClick={() => handlePageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="d-flex justify-content-center mt-3">
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink first onClick={() => handlePageChange(1)} />
        </PaginationItem>
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink
            previous
            onClick={() => handlePageChange(currentPage - 1)}
          />
        </PaginationItem>
        {pages}
        <PaginationItem disabled={currentPage === totalPages}>
          <PaginationLink
            next
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </PaginationItem>
        <PaginationItem disabled={currentPage === totalPages}>
          <PaginationLink last onClick={() => handlePageChange(totalPages)} />
        </PaginationItem>
      </Pagination>
    );
  };

  // PDF Onay Modalı (seçenekleri kaldırıldı, sadece bilgilendirme içeriyor)
  const pdfConfirmContent = (
    <Modal isOpen={pdfConfirmOpen} toggle={togglePdfConfirm}>
      <ModalHeader toggle={togglePdfConfirm}>PDF Dışa Aktarma</ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-start mb-3">
          <div className="text-danger me-3">
            <i className="fas fa-info-circle fa-2x"></i>
          </div>
          <div>
            <h5>PDF'e Aktarma Bilgisi</h5>
            <p className="mb-0">
              Bu işlem sadece tabloda şu anda görünen {paginatedData.length}{" "}
              kaydı PDF'e aktaracak.
              {filteredAndSortedData.length > paginatedData.length && (
                <span className="text-muted d-block mt-2">
                  Not: Filtrelenmiş toplam {filteredAndSortedData.length} kayıt
                  var, ancak yalnızca bu sayfada görüntülenen kayıtlar PDF'e
                  aktarılacak.
                </span>
              )}
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handlePdfExport}>
          <FaFilePdf className="me-2" /> PDF Oluştur
        </Button>
        <Button color="secondary" onClick={togglePdfConfirm}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );

  // Yazdırma Onay Modalı (seçenekleri kaldırıldı, sadece bilgilendirme içeriyor)
  const printConfirmContent = (
    <Modal isOpen={printConfirmOpen} toggle={togglePrintConfirm}>
      <ModalHeader toggle={togglePrintConfirm}>Yazdırma</ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-start mb-3">
          <div className="text-danger me-3">
            <i className="fas fa-info-circle fa-2x"></i>
          </div>
          <div>
            <h5>Yazdırma Bilgisi</h5>
            <p className="mb-0">
              Bu işlem sadece tabloda şu anda görünen {paginatedData.length}{" "}
              kaydı yazdıracak.
              {filteredAndSortedData.length > paginatedData.length && (
                <span className="text-muted d-block mt-2">
                  Not: Filtrelenmiş toplam {filteredAndSortedData.length} kayıt
                  var, ancak yalnızca bu sayfada görüntülenen kayıtlar
                  yazdırılacak.
                </span>
              )}
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handlePrint}>
          <FaPrint className="me-2" /> Yazdır
        </Button>
        <Button color="secondary" onClick={togglePrintConfirm}>
          İptal
        </Button>
      </ModalFooter>
    </Modal>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-3 align-items-center">
          <Input
            type="search"
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px" }}
          />
          <div className="d-flex align-items-center">
            <span className="me-2">Sayfa başına:</span>
            <Input
              type="select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              style={{ width: "100px" }}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="1000">1000</option>
            </Input>
          </div>
        </div>
        <div>
          <span className="me-3">
            Toplam: {filteredAndSortedData.length} kayıt
            {filteredAndSortedData.length > pageSize &&
              ` (Sayfa ${currentPage}/${totalPages})`}
          </span>
          {generatePdf && (
            <Button color="danger" className="ms-2" onClick={togglePdfConfirm}>
              <FaFilePdf className="me-1" /> PDF'e Aktar
            </Button>
          )}
          {printTable && (
            <Button
              color="danger"
              className="ms-2"
              onClick={togglePrintConfirm}
            >
              <FaPrint className="me-1" /> Yazdır
            </Button>
          )}
        </div>
      </div>

      <Table
        hover={true}
        responsive={true}
        striped={striped}
        id={tableName}
        className={tableClassName}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                style={{ cursor: "pointer" }}
              >
                {column.header} {renderSortIcon(column.key)}
              </th>
            ))}
            {onDetailClick && <th id="detayTD">İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr
              key={item._id || index}
              className={customRowClassName ? customRowClassName(item) : ""}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {onDetailClick && (
                <td id="detayTD">
                  <Button color="info" onClick={() => onDetailClick(item)}>
                    Detay
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {totalPages > 1 && renderPagination()}

      {/* PDF ve Yazdırma Modalları - güncellendi */}
      {pdfConfirmContent}
      {printConfirmContent}
    </div>
  );
};

export default DataTable;
