import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollRestoration Component
 * 
 * Bu component, kullanıcı sayfalar arası geçiş yaparken scroll pozisyonunu
 * otomatik olarak yönetir. Geri/ileri butonları ile gezinirken kullanıcı
 * kaldığı yere döner.
 * 
 * Kullanım: App.js veya Dashboard component'lerinde bir kez ekleyin.
 * Örnek: <ScrollRestoration />
 */
export default function ScrollRestoration() {
  const location = useLocation();

  // Scroll pozisyonunu kaydet (sayfa değişmeden önce)
  useEffect(() => {
    console.log("🎯 Scroll listener ekleniyor...");
    
    // Scroll container'ı bul - main-content div'i scroll ediyor
    const scrollContainer = document.querySelector(".main-content");
    
    if (!scrollContainer) {
      console.warn("⚠️ .main-content elementi bulunamadı!");
      return;
    }
    
    console.log("✅ Scroll container bulundu:", scrollContainer);
    
    const handleScroll = () => {
      const scrollData = JSON.parse(sessionStorage.getItem("scrollPositions") || "{}");
      const currentPath = window.location.pathname;
      const scrollPos = scrollContainer.scrollTop; // window.scrollY yerine container.scrollTop
      
      scrollData[currentPath] = scrollPos;
      sessionStorage.setItem("scrollPositions", JSON.stringify(scrollData));
      
      // Debug için (geliştirme sırasında görmek için)
      console.log(`💾 Scroll kaydedildi: ${currentPath} = ${scrollPos}px`);
    };

    // Scroll dinleyiciyi main-content'e ekle (window yerine)
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      console.log("🚫 Scroll listener kaldırılıyor...");
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Pathname değiştiğinde scroll pozisyonunu geri yükle
  useEffect(() => {
    const scrollData = JSON.parse(sessionStorage.getItem("scrollPositions") || "{}");
    const savedPosition = scrollData[location.pathname];

    // Debug için (geliştirme sırasında görmek için)
    console.log(`🔍 Sayfa: ${location.pathname}, Kaydedilmiş: ${savedPosition}px`);

    // Scroll container'ı bul
    const scrollContainer = document.querySelector(".main-content");
    
    if (!scrollContainer) {
      console.warn("⚠️ .main-content elementi bulunamadı!");
      return;
    }

    if (savedPosition !== undefined && savedPosition > 0) {
      // requestAnimationFrame kullanarak rendering tamamlandığından emin ol
      requestAnimationFrame(() => {
        // Birden fazla denemeyle içeriğin yüklenmesini bekle
        const scrollAttempts = [0, 50, 150, 300, 500, 800, 1200];
        
        scrollAttempts.forEach((delay, index) => {
          setTimeout(() => {
            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const targetScroll = Math.min(savedPosition, maxScroll);
            
            if (targetScroll > 0 && scrollContainer.scrollTop !== targetScroll) {
              // Smooth scroll sadece ilk 2 denemeden sonra
              if (index < 2) {
                scrollContainer.scrollTop = targetScroll;
              } else {
                scrollContainer.scrollTo({
                  top: targetScroll,
                  behavior: "smooth"
                });
              }
              
              // Debug için (geliştirme sırasında görmek için)
              console.log(`📜 Scroll geri yüklendi (${delay}ms): ${targetScroll}px`);
            }
          }, delay);
        });
      });
    } else {
      // Yeni sayfa - en üste git
      scrollContainer.scrollTop = 0;
    }
  }, [location.pathname]);

  return null;
}
