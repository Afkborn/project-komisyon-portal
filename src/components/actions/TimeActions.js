function renderDate_GGAAYYYY(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
}

function calculateGorevSuresi(date) {
  //  0 Yıl 2 Ay 3 Gün
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const yil = Math.floor(diff / 31536000000);
  const ay = Math.floor((diff % 31536000000) / 2628000000);
  const gun = Math.floor(((diff % 31536000000) % 2628000000) / 86400000);
  return `${yil} Yıl ${ay} Ay ${gun} Gün`;
}

function calculateBirimGorevSuresi(date) {
  // 380 GÜN
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const gun = Math.floor(diff / 86400000);
  return `${gun} Gün`;
}

function calculateKalanGorevSuresi(date) {
  // örneğin date 31/10/2024
  // dönmesi gereken data  13 Gün
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const gun = Math.floor(diff / 86400000);
  return `${gun} Gün`;
}


module.exports = {
  renderDate_GGAAYYYY,
  calculateGorevSuresi,
  calculateBirimGorevSuresi,
  calculateKalanGorevSuresi,
};
