export function printDocument(
    document,
    elementIDName,
    deleteID = null,
    rotate = false
  ) {
    const element = document.getElementById(elementIDName);
  
    // Elementin klonunu oluştur
    let tempElement = element.cloneNode(true);
    if (deleteID) {
      let detayTDs = tempElement.querySelectorAll(`#${deleteID}`);
      detayTDs.forEach((td) => {
        td.remove();
      });
    }
  
    // Yazdırma stilini ayarla
    const printStyles = `
      <style>
        @page {
          margin: 1in; /* Kenar boşlukları */
          size: ${rotate ? "landscape" : "portrait"}; /* Sayfa yönü */
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          margin: 0;
          background-color: #f9f9f9; /* Hafif bir arka plan rengi */
        }
        h1, h2, h3, h4 {
          text-align: center;
          color: #555;
          font-weight: 600;
        }
        p, span {
          line-height: 1.5;
          font-size: 12pt;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        table, th, td {
          border: 1px solid #ccc;
        }
        th {
          background-color: #f4f4f4;
          font-weight: bold;
          text-align: center;
          padding: 8px;
        }
        td {
          text-align: left;
          padding: 8px;
        }
        .centered {
          text-align: center;
          margin: 20px 0;
        }
        .highlight {
          background-color: #ffeeba;
          font-weight: bold;
          color: #856404;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10pt;
          color: #777;
        }
      </style>
    `;
  
    // Yeni bir pencere veya iframe'de içeriği yazdır
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Yazdır</title>
          ${printStyles}
        </head>
        <body>
          ${tempElement.outerHTML}
          <div class="footer">Bu belge otomatik olarak oluşturulmuştur. </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  
    // Yazdırma ekranını aç
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }
  