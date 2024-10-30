import React from "react";
import Aktiviteler from "../Welcome/Aktiviteler";
export default function PersonelHareketleri({
  user,
  token,
  showPersonelDetay,
  showBirimPersonelListe,
}) {
  return (
    <div>
      {" "}
      <div>
        <h3>Personel Hareketler</h3>
        <span>
          Bu rapor ile tüm kurumlara ait <b>önemli personel hareketlerini </b>{" "}
          görüntüleyebilirsiniz.
        </span>
        <div className="mt-3">
          <div>
            <Aktiviteler
              token={token}
              user={user}
              showPersonelDetay={showPersonelDetay}
              showBirimPersonelListe={showBirimPersonelListe}
              personelHareketleri={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
