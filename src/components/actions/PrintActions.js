/**
 * Belirtilen element ID'sine sahip HTML içeriğini yazdırır
 * @param {Document} document - Document nesnesi
 * @param {string} elementIDName - Yazdırılacak elementin ID'si
 * @param {string|null} deleteID - Yazdırmada gizlenecek ID
 * @param {boolean} rotate - Yatay mı dikey mi yazdırılacak
 * @param {Object} options - Ek yazdırma seçenekleri
 */
export function printDocument(
  document,
  elementIDName,
  deleteID = null,
  rotate = false,
  options = {}
) {
  // Element kontrolü
  const element = document.getElementById(elementIDName);
  if (!element) {
    console.error(`Element with ID "${elementIDName}" not found`);
    return;
  }

  // Elementin klonunu oluştur
  let tempElement = element.cloneNode(true);

  // İstenmeyen öğeleri kaldır
  if (deleteID) {
    let elementsToRemove = tempElement.querySelectorAll(
      `#${deleteID}, .no-print`
    );
    elementsToRemove.forEach((el) => el.remove());
  }

  // Başlık oluştur
  const title = options.title || elementIDName;
  const headerHtml = `
    <div class="print-header">
      <h1>${title}</h1>
      <div class="print-date">
        Yazdırma Tarihi: ${new Date().toLocaleDateString(
          "tr-TR"
        )} ${new Date().toLocaleTimeString("tr-TR")}
      </div>
    </div>
  `;

  // Alt bilgi oluştur
  const footerHtml = `
    <div class="print-footer">
      <p>Bu belge EPSİS tarafından oluşturulmuştur.</p>
      <p>© ${new Date().getFullYear()} Eskişehir Adliyesi - Bilgehan KALAY</p>
    </div>
  `;

  // Yazdırma stilini ayarla
  const printStyles = `
    <style>
      @page {
        margin: 20mm 15mm; /* Kenar boşlukları */
        size: ${rotate ? "landscape" : "portrait"}; /* Sayfa yönü */
      }
      
      body {
        font-family: 'Arial', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: white;
      }
      
      /* Başlık stilleri */
      .print-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #dc3545;
      }
      
      .print-header h1 {
        margin: 0 0 10px 0;
        font-size: 24pt;
        color: #dc3545;
      }
      
      .print-date {
        font-size: 10pt;
        color: #666;
        font-style: italic;
      }
      
      /* Tablo stilleri */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      thead {
        background-color: #f8f9fa;
        display: table-header-group;
      }
      
      th {
        border-bottom: 2px solid #dee2e6;
        padding: 10px;
        font-weight: bold;
        text-align: left;
        color: #333;
      }
      
      td {
        border-bottom: 1px solid #dee2e6;
        padding: 8px;
      }
      
      tr:nth-child(even) {
        background-color: #f2f2f2;
      }
      
      /* Badge stilleri */
      .badge {
        display: inline-block;
        padding: 3px 6px;
        border-radius: 10px;
        font-size: 9pt;
        font-weight: bold;
        text-align: center;
        margin-right: 4px;
      }
      
      .badge-danger, .bg-danger {
        background-color: #dc3545 !important;
        color: white;
      }
      
      .badge-warning, .bg-warning {
        background-color: #ffc107 !important;
        color: #212529;
      }
      
      .badge-info, .bg-info {
        background-color: #17a2b8 !important;
        color: white;
      }
      
      .badge-success, .bg-success {
        background-color: #28a745 !important;
        color: white;
      }
      
      .badge-light, .bg-light {
        background-color: #f8f9fa !important;
        color: #212529;
        border: 1px solid #dee2e6;
      }
      
      .badge-pill {
        border-radius: 10rem;
      }
      
      /* Altbilgi stilleri */
      .print-footer {
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid #dee2e6;
        text-align: center;
        font-size: 9pt;
        color: #666;
      }
      
      .print-footer p {
        margin: 5px 0;
      }
      
      /* Sayfa numarası gösterimi */
      @media print {
        .page-number:after {
          content: counter(page);
        }
      }
      
      /* Özel stiller */
      ${options.css || ""}
    </style>
  `;

  // İçeriği yazdırmak için yeni bir pencere aç
  const printWindow = window.open("", "_blank", "width=1000,height=800");
  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Yazdır</title>
        ${printStyles}
      </head>
      <body>
        ${headerHtml}
        <div class="print-content">
          ${tempElement.outerHTML}
        </div>
        ${footerHtml}
        <script>
          // Sayfa yüklendiğinde yazdırma iletişim kutusunu göster
          window.onload = function() {
            setTimeout(() => {
              window.print();
              // Yazdırma iletişim kutusu kapatıldığında pencereyi kapat
              setTimeout(() => window.close(), 100);
            }, 500);
          };
          
          // Tablolardaki satır yüksekliklerini kontrol et
          const tables = document.querySelectorAll('table');
          tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              // Satır çok uzunsa sayfa sonunda kesilmesini önle
              if (row.offsetHeight > 80) {
                row.style.pageBreakInside = 'avoid';
              }
            });
          });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Bir tabloyu özelleştirilmiş formatta yazdırır
 * @param {Document} document - Document nesnesi
 * @param {string} elementIDName - Yazdırılacak tablo element ID'si
 * @param {string} title - Rapor başlığı
 * @param {Array} excludeColumns - Yazdırılmayacak sütunlar
 */
export function printTable(
  document,
  elementIDName,
  title,
  excludeColumns = []
) {
  const table = document.getElementById(elementIDName);
  if (!table) {
    console.error(`Table with ID "${elementIDName}" not found`);
    return;
  }

  // Tablodan veri ve sütun bilgilerini al
  const headers = [];
  const rows = [];

  // Başlıkları topla
  Array.from(table.querySelectorAll("thead th")).forEach((th, index) => {
    const headerText = th.textContent.trim();
    if (
      !excludeColumns.includes(headerText) &&
      !excludeColumns.includes(index)
    ) {
      headers.push({
        index,
        text: headerText,
      });
    }
  });

  // Satırları topla
  Array.from(table.querySelectorAll("tbody tr")).forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll("td"));
    const row = [];

    headers.forEach((header) => {
      if (cells[header.index]) {
        row.push(cells[header.index].innerHTML);
      } else {
        row.push("");
      }
    });

    rows.push(row);
  });

  // HTML tablosu oluştur
  let tableHTML = '<table border="1">';

  // Başlıklar
  tableHTML += "<thead><tr>";
  headers.forEach((header) => {
    tableHTML += `<th>${header.text}</th>`;
  });
  tableHTML += "</tr></thead>";

  // Satırlar
  tableHTML += "<tbody>";
  rows.forEach((row) => {
    tableHTML += "<tr>";
    row.forEach((cell) => {
      tableHTML += `<td>${cell}</td>`;
    });
    tableHTML += "</tr>";
  });
  tableHTML += "</tbody></table>";

  // Özel seçeneklerle yazdır
  const options = {
    title: title || "Tablo Yazdır",
    css: `
      @media print {
        table { 
          page-break-inside: auto;
        }
        tr, td, th { 
          page-break-inside: avoid; 
        }
        thead { 
          display: table-header-group; 
        }
        tfoot { 
          display: table-footer-group; 
        }
      }
    `,
  };

  // Tabloyu içeren div oluştur
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = tableHTML;
  tempDiv.id = "temp-print-table";
  document.body.appendChild(tempDiv);

  // Yazdır ve sonra geçici div'i kaldır
  printDocument(
    document,
    "temp-print-table",
    null,
    headers.length > 5,
    options
  );
  setTimeout(() => {
    document.body.removeChild(tempDiv);
  }, 1000);
}
