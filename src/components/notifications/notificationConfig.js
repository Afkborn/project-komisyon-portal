/**
 * Bildirim kaynakları konfigürasyonu
 * Ileride yeni endpointler eklemek için bu dosyaya değişiklik yapman yeterli
 */

export const NOTIFICATION_SOURCES = {
  BINOT: {
    id: "binot",
    label: "BiNot",
    icon: "fas fa-sticky-note",
    endpoints: {
      list: "/api/biNot/notifications/list",
      read: "/api/biNot/notifications/read",
    },
    color: "primary",
    enabled: true, // Kolayca aktif/deaktif edebilmek için
  },
  // Gelecekte eklenecek kaynaklar:
  // TASKS: { ... },
  // SCHEDULE: { ... },
  // etc.
};

/**
 * Tüm aktif kaynakları döndür
 */
export const getActiveSources = () => {
  return Object.values(NOTIFICATION_SOURCES).filter((source) => source.enabled);
};
