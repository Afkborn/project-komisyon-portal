function getIzinType(type) {
  switch (type) {
    case "YILLIK_IZIN":
      return "Yıllık İzin";
    case "RAPOR_IZIN":
      return "Raporlu İzin";
    case "UCRETSIZ_IZIN":
      return "Ücretsiz İzin";
    case "MAZERET_IZIN":
      return "Mazeret İzin";
    case "DOGUM_IZIN":
      return "Doğum İzni";
    case "OLUM_IZIN":
      return "Ölüm İzni";
    case "DIGER_IZIN":
      return "Diğer";
    default:
      return "Bilinmeyen";
  }
}

module.exports = {
  getIzinType,
};
