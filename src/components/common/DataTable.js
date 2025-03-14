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

        // Özel koşul: Eğer kolon adı 'tarih' veya 'vaadeTarihi' gibi tarih içeren alanlar ise zorla "date" tipi olarak işle
        const isDateColumn = column.key.toLowerCase().includes("tarih");

        // Veri tipini belirle (önce özel koşullar, sonra column.dataType, en son otomatik belirle)
        const dataType = isDateColumn
          ? "date"
          : column.dataType || determineDataType(a[sortConfig.key]);

        // console.log("Sıralanan sütun:", column.key);
        // console.log("Veri tipi:", dataType);

        // Değerleri al (render fonksiyonu varsa onu kullan)
        let aValue = column.render ? column.render(a) : a[sortConfig.key];
        let bValue = column.render ? column.render(b) : b[sortConfig.key];

        // console.log("A Değeri:", aValue);
        // console.log("B Değeri:", bValue);

        // Bazı örnekler yazdır
        // if (typeof aValue === "string" && aValue.includes("Yıl")) {
        //   console.log("Tarih içeren değer bulundu:", aValue);
        // }

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

        // Veri tipine göre karşılaştırma yap
        switch (dataType) {
          case "date":
            // Tarih karşılaştırma - özellikle "d/M/yyyy (açıklama)" formatına uygun
            // console.log("Tarih olarak işleniyor:", aValue);
            const dateA = parseDate(aValue);
            const dateB = parseDate(bValue);
            // console.log("Parse edilmiş tarihler:", dateA, dateB);

            if (dateA && dateB) {
              return sortConfig.direction === "asc"
                ? dateA - dateB
                : dateB - dateA;
            }
            break;

          case "number":
            // Sayısal değer karşılaştırma
            const numA = parseFloat(aValue);
            const numB = parseFloat(bValue);

            if (!isNaN(numA) && !isNaN(numB)) {
              return sortConfig.direction === "asc" ? numA - numB : numB - numA;
            }
            break;

          case "string":
          default:
            // String karşılaştırma - Türkçe desteğiyle
            if (typeof aValue === "string" && typeof bValue === "string") {
              return sortConfig.direction === "asc"
                ? aValue.localeCompare(bValue, "tr-TR")
                : bValue.localeCompare(aValue, "tr-TR");
            }

            // Genel karşılaştırma
            if (aValue < bValue) {
              return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === "asc" ? 1 : -1;
            }
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

// Tarih ayrıştırma yardımcı fonksiyonu
const parseDate = (value) => {
  // console.log("parseDate çağrıldı:", value);

  if (!value) return null;

  // String değilse ve Date objesi ise doğrudan kullan
  if (value instanceof Date) return value;

  // String değer için
  if (typeof value === "string") {
    try {
      // Tarih kısmını çıkarma (ilk tarih deseni eşleşmesini bul)
      const dateMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1; // JavaScript'te aylar 0-11 arası
        const year = parseInt(dateMatch[3], 10);
        // console.log("Ayıklanan tarih bileşenleri:", day, month + 1, year);
        return new Date(year, month, day);
      }

      // Türkçe tarih formatı kontrolü - daha fazla detaylı
      if (
        value.includes("Yıl") ||
        value.includes("Ay") ||
        value.includes("Gün")
      ) {
        // Örnek: "22/1/2025 (0 Yıl 1 Ay 21 Gün)" formatı
        // Parantez öncesinden tarih kısmını çıkaralım
        const dateMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]) - 1;
          const year = parseInt(dateMatch[3]);
          // console.log("Tarih parçaları:", day, month, year);
          return new Date(year, month, day);
        }
      }

      // Önce parantez içeren formatı temizle: "13/3/2025 (Gecikti)" gibi
      let cleanValue = value;
      const parenthesisIndex = value.indexOf("(");
      if (parenthesisIndex !== -1) {
        cleanValue = value.substring(0, parenthesisIndex).trim();
        // console.log("Temizlenmiş değer:", cleanValue);
      }

      // Olası tarih formatlarını kontrol et

      // ISO formatı (2023-12-31T12:00:00.000Z)
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(cleanValue)) {
        return new Date(cleanValue);
      }

      // Türk formatı (d/M/yyyy veya dd/MM/yyyy) - günün 1 veya 2 basamaklı olabilir, ayın 1 veya 2 basamaklı olabilir
      const turkishDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const turkishMatch = cleanValue.match(turkishDateRegex);
      if (turkishMatch) {
        // match[1]=gün, match[2]=ay, match[3]=yıl
        const day = parseInt(turkishMatch[1], 10);
        const month = parseInt(turkishMatch[2], 10) - 1; // JavaScript'te aylar 0-11 arası
        const year = parseInt(turkishMatch[3], 10);
        return new Date(year, month, day);
      }

      // Tarih formatı (31.12.2023, 31/12/2023, 31-12-2023)
      const dateFormats = [
        /(\d{2})\.(\d{2})\.(\d{4})/, // 31.12.2023
        /(\d{2})-(\d{2})-(\d{4})/, // 31-12-2023
      ];

      for (const format of dateFormats) {
        const match = cleanValue.match(format);
        if (match) {
          // match[1]=gün, match[2]=ay, match[3]=yıl
          return new Date(match[3], match[2] - 1, match[1]);
        }
      }

      // Amerika formatı (2023-12-31, 2023/12/31)
      const usaFormats = [
        /(\d{4})-(\d{2})-(\d{2})/, // 2023-12-31
        /(\d{4})\/(\d{2})\/(\d{2})/, // 2023/12/31
      ];

      for (const format of usaFormats) {
        const match = cleanValue.match(format);
        if (match) {
          // match[1]=yıl, match[2]=ay, match[3]=gün
          return new Date(match[1], match[2] - 1, match[3]);
        }
      }
    } catch (error) {
      console.error("Tarih parse hatası:", error, value);
      return null;
    }
  }

  // Son çare olarak Date.parse kullan
  try {
    const timestamp = Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  } catch (e) {
    return null;
  }
};

// Veri tipini belirleme yardımcı fonksiyonu
const determineDataType = (value) => {
  if (value === null || value === undefined) return "string";

  // console.log("determineDataType için değer:", value);

  // Date objesi kontrolü
  if (value instanceof Date) return "date";

  // String değer kontrolü
  if (typeof value === "string") {
    // console.log("String değer kontrol ediliyor:", value);

    // İlk önce tarih paternleri için kontrol et
    // Tarih formatını denetleyen regex ifadeleri
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/, // 13/3/2025, 25/10/2025
      /\d{1,2}\/\d{1,2}\/\d{4} \(.*\)/, // 13/3/2025 (Parantez içi)
      /\d{1,2}\/\d{1,2}\/\d{4} \(\d+ (Yıl|Ay|Gün)\)/, // 25/10/2025 (225 Gün)
      /\d{1,2}\/\d{1,2}\/\d{4} \(\d+ Yıl \d+ Ay \d+ Gün\)/, // 22/1/2025 (0 Yıl 1 Ay 21 Gün)
    ];

    // Herhangi bir tarih paterni eşleşirse "date" olarak kabul et
    for (const pattern of datePatterns) {
      if (pattern.test(value)) {
        // console.log("Tarih paterni tespit edildi:", value);
        return "date";
      }
    }

    // Temel kelime kontrolü
    if (
      value.includes("Yıl") ||
      value.includes("Ay") ||
      value.includes("Gün")
    ) {
      // console.log("Tarih anahtar kelimeleri içeriyor:", value);
      return "date";
    }

    // Sayı kontrolü - sadece sayı ve nokta içeren string
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      // console.log("Sayı tespit edildi:", value);
      return "number";
    }

    return "string";
  }

  // Sayı kontrolü
  if (typeof value === "number") return "number";

  return "string";
};

export default DataTable;
