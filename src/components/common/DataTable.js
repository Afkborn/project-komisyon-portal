import React, { useState, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const DataTable = ({
  data,
  columns,
  onDetailClick,
  tableName = "Tablo",
  generatePdf,
  printTable,
  initialPageSize = 30, // varsayılan değer
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sayfa boyutu değiştiğinde ilk sayfaya dön
  const handlePageSizeChange = (newSize) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
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

    // Sıralama
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        // İlgili kolonu bul
        const column = columns.find((col) => col.key === sortConfig.key);

        // Değerleri al (render fonksiyonu varsa onu kullan)
        let aValue = column.render ? column.render(a) : a[sortConfig.key];
        let bValue = column.render ? column.render(b) : b[sortConfig.key];

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
  }, [data, searchTerm, sortConfig, columns]);

  // Pagination için veriyi böl
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  // Pagination kontrolü
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
            <Button color="danger" className="ms-2" onClick={generatePdf}>
              PDF'e Aktar
            </Button>
          )}
          {printTable && (
            <Button color="danger" className="ms-2" onClick={printTable}>
              Yazdır
            </Button>
          )}
        </div>
      </div>

      <Table hover responsive striped id={tableName}>
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
            {onDetailClick && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={item._id || index}>
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
    </div>
  );
};

export default DataTable;
