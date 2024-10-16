import html2pdf from "html2pdf.js";

export function generatePdf(
  document,
  elementIDName,
  fileName,
  deleteID = null
) {
  const element = document.getElementById(elementIDName);

  let tempElement = element.cloneNode(true);
  if (deleteID) {
    let detayTDs = tempElement.querySelectorAll(`#${deleteID}`);
    detayTDs.forEach((td) => {
      td.remove();
    });
  }

  const options = {
    margin: 0.5,
    filename: `${fileName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 1,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: {
      unit: "in",
      format: "letter",
      orientation: "portrait",
    },
  };

  if (deleteID) {
    html2pdf().from(tempElement).set(options).save();
  } else {
    html2pdf().from(element).set(options).save();
  }
}
