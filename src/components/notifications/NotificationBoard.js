import React, { useEffect, useState, useCallback } from "react";
import {
  Badge,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  Spinner,
  Alert,
} from "reactstrap";
import axios from "axios";
import { NOTIFICATION_SOURCES, getActiveSources } from "./notificationConfig";
import "./NotificationBoard.css";

export default function NotificationBoard({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /**
   * Tek bir kaynaktan bildirimleri getir
   */
  const fetchNotificationsFromSource = useCallback(
    async (source) => {
      try {
        const response = await axios({
          method: "GET",
          url: source.endpoints.list,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const notifications = response.data?.notifications || [];

        // Her bildirime kaynak bilgisi ekle
        return notifications.map((notif) => ({
          ...notif,
          source: source.id,
          sourceLabel: source.label,
          sourceIcon: source.icon,
          sourceColor: source.color,
        }));
      } catch (error) {
        console.error(`Bildirim getme hatası (${source.label}):`, error);
        return [];
      }
    },
    [token]
  );

  /**
   * Tüm kaynaklardan bildirimleri getir ve birleştir
   */
  const fetchAllNotifications = useCallback(async () => {
    setLoading(true);

    const activeSources = getActiveSources();

    try {
      const results = await Promise.all(
        activeSources.map((source) => fetchNotificationsFromSource(source))
      );

      // Tüm bildirimleri birleştir ve tarihe göre sırala (en yeni önce)
      const allNotifications = results
        .flat()
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Bildirimler getirilirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchNotificationsFromSource]);

  /**
   * Component acılınca bildirimleri getir
   */
  useEffect(() => {
    if (token) {
      fetchAllNotifications();
    }
  }, [token, fetchAllNotifications]);

  /**
   * Bildirimi okundu olarak işaretle
   */
  const markAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      const source = NOTIFICATION_SOURCES[
        Object.keys(NOTIFICATION_SOURCES).find(
          (key) => NOTIFICATION_SOURCES[key].id === notification.source
        )
      ];

      if (!source) return;

      await axios({
        method: "PATCH",
        url: `${source.endpoints.read}/${notification._id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // UI'de güncelleştir
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (error) {
      console.error("Bildirim okundu işareti konulamadı:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification);
  };

  return (
    <UncontrolledDropdown className="notification-dropdown">
      <DropdownToggle
        className="notification-button"
        color="light"
        caret={false}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <Badge color="danger" pill className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </DropdownToggle>

      <DropdownMenu right className="notification-menu">
        <div className="notification-header">
          <h6 className="mb-0">
            <i className="fas fa-bell me-2"></i>
            Bildirimler
          </h6>
          {unreadCount > 0 && (
            <Badge color="primary" pill>
              {unreadCount} yeni
            </Badge>
          )}
        </div>

        <div className="notification-body">
          {loading && (
            <div className="text-center p-3">
              <Spinner size="sm" color="primary" />
              <p className="text-muted small mt-2">Yükleniyor...</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <Alert color="info" className="mb-0">
              <i className="fas fa-info-circle me-2"></i>
              Bildirim bulunmamaktadır
            </Alert>
          )}

          {!loading && notifications.length > 0 && (
            <div className="notification-items">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <div className="notification-content">
                    <div className="notification-title">
                      <i
                        className={`${notification.sourceIcon} me-2`}
                        style={{
                          color: `var(--bs-${notification.sourceColor})`,
                        }}
                      ></i>
                      <strong>{notification.title || notification.sourceLabel}</strong>
                      {!notification.isRead && (
                        <span className="ms-2 notification-dot"></span>
                      )}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-source">
                      <small>{notification.sourceLabel}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notification-footer">
          <Button
            color="link"
            size="sm"
            className="w-100"
            onClick={fetchAllNotifications}
          >
            <i className="fas fa-sync me-1"></i>
            Yenile
          </Button>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}
