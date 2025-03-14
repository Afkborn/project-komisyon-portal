import html2pdf from "html2pdf.js";

export function generatePdf(
  document,
  elementIDName,
  fileName,
  deleteID = null,
  rotate = false,
  customStyles = {},
) {
  const element = document.getElementById(elementIDName);
  if (!element) {
    console.error(`Element with ID "${elementIDName}" not found`);
    return;
  }

  // Clonlanan element üzerinde çalışacağız
  let tempElement = element.cloneNode(true);

  // İstenilen öğeleri kaldıralım
  if (deleteID) {
    // console.log("İSTENİLMEYEN ÖGE ID: ", deleteID);
    let elementsToRemove = tempElement.querySelectorAll(
      `#${deleteID}, .no-print`
    );
    let silinenElemanSayisi = elementsToRemove.length;
    elementsToRemove.forEach((el) => {
      el.remove();
    } );
    console.log("SİLİNEN ELEMAN SAYISI: ", silinenElemanSayisi);

  }

  // Debug log ekleyelim
  console.log(`PDF oluşturuluyor: ${fileName}`);
  console.log(`Element içeriği:`, tempElement.innerHTML.substring(0, 200) + '...');
  console.log(`Toplam tablo satır sayısı:`, tempElement.querySelectorAll('tr').length);

  // PDF için özel stil elemanı oluştur
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead {
      background-color: #f8f9fa;
    }
    th {
      border-bottom: 2px solid #dee2e6;
      padding: 10px;
      font-weight: bold;
      text-align: left;
    }
    td {
      border-bottom: 1px solid #dee2e6;
      padding: 8px;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    h1, h2, h3, h4 {
      color: #dc3545; /* danger rengi */
    }
    .badge {
      display: inline-block;
      padding: 3px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: bold;
      color: white;
      text-align: center;
    }
    .badge-danger {
      background-color: #dc3545;
    }
    .badge-warning {
      background-color: #ffc107;
      color: #212529;
    }
    .badge-info {
      background-color: #17a2b8;
    }
    .badge-success {
      background-color: #28a745;
    }
    .badge-light {
      background-color: #f8f9fa;
      color: #212529;
      border: 1px solid #dee2e6;
    }
    /* Başlık ve altbilgi stilleri */
    .pdf-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #dc3545;
      padding-bottom: 10px;
    }
    .pdf-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 10px;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
      padding-top: 10px;
    }
    /* Özel stiller */
    ${customStyles.css || ""}
  `;

  // PDF başlığı ekle
  const headerDiv = document.createElement("div");
  headerDiv.className = "pdf-header";
  const headerTitle = document.createElement("h2");
  headerTitle.textContent = fileName || "Rapor";
  const headerDate = document.createElement("div");
  const now = new Date();
  headerDate.textContent = `Oluşturulma Tarihi: ${now.toLocaleDateString(
    "tr-TR"
  )} ${now.toLocaleTimeString("tr-TR")}`;
  headerDiv.appendChild(headerTitle);
  headerDiv.appendChild(headerDate);

  // PDF alt bilgisi ekle
  const footerDiv = document.createElement("div");
  footerDiv.className = "pdf-footer";
  footerDiv.innerHTML = `
    <p>Bu rapor otomatik olarak EPSİS tarafından oluşturulmuştur.</p>
    <p>© ${new Date().getFullYear()} Eskişehir Adliyesi @ Bilgehan KALAY</p>
  `; 

  // Başlık, stil ve içeriği birleştir
  const containerDiv = document.createElement("div");
  containerDiv.className = "pdf-container";
  containerDiv.appendChild(styleElement);
  containerDiv.appendChild(headerDiv);
  containerDiv.appendChild(tempElement);
  containerDiv.appendChild(footerDiv);

  // PDF oluşturma seçenekleri
  const options = {
    margin: [15, 10], // [üst-alt, sol-sağ] kenar boşlukları (mm)
    filename: `${fileName}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 2, // Daha yüksek çözünürlük için
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm",
      format: rotate ? "a4" : "a4",
      orientation: rotate ? "landscape" : "portrait",
      compress: true,
      precision: 16,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  // PDF'i oluştur
  return html2pdf()
    .from(containerDiv)
    .set(options)
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      // Sayfa numaraları ekle
      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(
          `Sayfa ${i} / ${totalPages}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 5,
          { align: "center" }
        );
      }

      // PDF'i kaydet
      pdf.save(`${fileName}.pdf`);
    });
}

// Bir tablodan doğrudan PDF oluşturmak için özel fonksiyon
export function generateTablePdf(table, title, excludeColumns = []) {
  // Tablodan veri ve sütun bilgilerini al
  const headers = [];
  const data = [];

  // Sütun başlıkları
  Array.from(table.querySelectorAll("thead th")).forEach((th) => {
    if (!excludeColumns.includes(th.textContent.trim())) {
      headers.push(th.textContent.trim());
    }
  });

  // Tablo verileri
  Array.from(table.querySelectorAll("tbody tr")).forEach((tr) => {
    const rowData = [];
    Array.from(tr.querySelectorAll("td")).forEach((td, index) => {
      if (!excludeColumns.includes(headers[index])) {
        rowData.push(td.textContent.trim());
      }
    });
    data.push(rowData);
  });

  // PDF oluştur
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: headers.length > 5 ? "landscape" : "portrait",
  });

  // Başlık ekle
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Tarih ekle
  doc.setFontSize(11);
  doc.text(
    `Oluşturulma Tarihi: ${new Date().toLocaleDateString("tr-TR")}`,
    14,
    30
  );

  // Tablo ekle
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 35,
    headStyles: {
      fillColor: [220, 53, 69], // Bootstrap danger rengi
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250], // Bootstrap light rengi
    },
    margin: { top: 35 },
    styles: {
      font: "helvetica",
      overflow: "linebreak",
    },
    didDrawPage: function (data) {
      // Sayfa numarası
      doc.setFontSize(8);
      doc.text(
        `Sayfa ${doc.internal.getNumberOfPages()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );

      // Alt bilgi
      doc.setFontSize(8);
      doc.text(
        "© Eskişehir Adliyesi EPSİS",
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    },
  });

  // PDF'i kaydet
  doc.save(`${title}.pdf`);
}
