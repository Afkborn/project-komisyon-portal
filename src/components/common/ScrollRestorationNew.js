import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollData = JSON.parse(sessionStorage.getItem("scrollPositions") || "{}");
      const currentPath = window.location.pathname;
      const scrollContainer = document.querySelector(".main-content");
      
      if (!scrollContainer) return;
      
      const scrollPos = scrollContainer.scrollTop;
      scrollData[currentPath] = scrollPos;
      sessionStorage.setItem("scrollPositions", JSON.stringify(scrollData));
      
      console.log("Scroll kaydedildi:", currentPath, "=", scrollPos, "px");
    };

    let timeoutId;
    
    // RAF + timeout ile bekle ki içerik tam render olsun
    const rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        const scrollContainer = document.querySelector(".main-content");
        
        if (!scrollContainer) {
          console.warn("main-content elementi bulunamadi!");
          return;
        }
        
        console.log("Scroll listener ekleniyor...");
        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        console.log("Scroll listener eklendi!");
      }, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      const scrollContainer = document.querySelector(".main-content");
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollData = JSON.parse(sessionStorage.getItem("scrollPositions") || "{}");
      const currentPath = window.location.pathname;
      const scrollContainer = document.querySelector(".main-content");
      
      if (!scrollContainer) return;
      
      const scrollPos = scrollContainer.scrollTop;
      scrollData[currentPath] = scrollPos;
      sessionStorage.setItem("scrollPositions", JSON.stringify(scrollData));
      
      console.log("Scroll kaydedildi:", currentPath, "=", scrollPos, "px");
    };

    // Eski listener'ları kaldır
    const scrollContainer = document.querySelector(".main-content");
    if (scrollContainer) {
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
      console.log("Scroll listener RE-attached (pathname degisti)");
    }

    const scrollData = JSON.parse(sessionStorage.getItem("scrollPositions") || "{}");
    const savedPosition = scrollData[location.pathname];
    
    console.log("Sayfa degisti:", location.pathname, "Kaydedilmis pozisyon:", savedPosition, "px");
    
    if (!scrollContainer) {
      console.warn("main-content elementi bulunamadi!");
      return;
    }

    if (savedPosition !== undefined && savedPosition > 0) {
      console.log("Scroll pozisyonu geri yuklenecek:", savedPosition, "px");
      requestAnimationFrame(() => {
        const scrollAttempts = [0, 50, 150, 300, 500, 800, 1200];
        
        scrollAttempts.forEach((delay, index) => {
          setTimeout(() => {
            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const targetScroll = Math.min(savedPosition, maxScroll);
            
            if (targetScroll > 0 && scrollContainer.scrollTop !== targetScroll) {
              if (index < 2) {
                scrollContainer.scrollTop = targetScroll;
              } else {
                scrollContainer.scrollTo({
                  top: targetScroll,
                  behavior: "smooth"
                });
              }
              console.log("Scroll geri yuklendi (" + delay + "ms):", targetScroll, "px");
            }
          }, delay);
        });
      });
    } else {
      console.log("Yeni sayfa - en uste git");
      scrollContainer.scrollTop = 0;
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [location.pathname]);

  return null;
}
