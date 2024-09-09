import React, { useState, useEffect } from "react";

export default function Welcome({ user, token }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStyle = {
    float: "right",
    color: "#007bff",
    fontSize: "20px",
    fontWeight : "bold"
  };

  return (
    <div>
      <span style={timeStyle}>Saat {time.toLocaleTimeString()}</span>
      <h3>Hoşgeldin {user && user.name}!</h3>

      {/* en sağda saat yazsın  */}

      <p>
        Bu uygulama, personel bilgileri üzerinde okuma, ekleme, güncelleme ve
        silme işlemlerini gerçekleştirmek için geliştirilmiştir.
      </p>
      <p>
        Uygulamayı kullanabilmek için menüden ilgili sayfaya giderek
        işlemlerinizi gerçekleştirebilirsiniz.
      </p>
      <hr></hr>

      <div>
        TODO
        <li>Bugunun nöbetci hakim, savcı ve katipleri listelensin.</li>
        <li>İzinde olan hakim savcı ve personel listelensin</li>
      </div>
    </div>
  );
}
