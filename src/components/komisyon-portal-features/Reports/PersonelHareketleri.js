import React from "react";
import { Card, CardHeader, CardBody, Alert, Badge } from "reactstrap";
import Aktiviteler from "../Welcome/Aktiviteler";

export default function PersonelHareketleri({
  user,
  token,
  showPersonelDetay,
  showBirimPersonelListe,
}) {
  return (
    <div className="personel-hareketleri-container">
      <Card className="shadow-sm border-0 mb-4">
        <CardHeader className="bg-danger text-white">
          <h3 className="mb-0">
            <i className="fas fa-exchange-alt me-2"></i>
            Personel Hareketleri Raporu
          </h3>
        </CardHeader>

        <CardBody>
          <Alert color="info" className="d-flex align-items-center mb-4">
            <i className="fas fa-info-circle me-3 fs-4"></i>
            <div>
              <p className="mb-0">
                Bu rapor ile tüm kurumlara ait{" "}
                <strong>önemli personel hareketlerini</strong>{" "}
                görüntüleyebilirsiniz. Personel yer değişiklikleri, atamalar,
                görevlendirmeler ve diğer personel hareketleri burada
                listelenir.
              </p>
              <div className="mt-2">
                <Badge color="primary" pill className="me-2">
                  Atamalar
                </Badge>
                <Badge color="warning" pill className="me-2">
                  Görevlendirmeler
                </Badge>
                <Badge color="success" pill className="me-2">
                  İşe Başlayanlar
                </Badge>
                <Badge color="danger" pill className="me-2">
                  İşten Ayrılanlar
                </Badge>
                <Badge color="info" pill className="me-2">
                  Nakiller
                </Badge>
                <Badge color="secondary" pill>
                  Diğer Hareketler
                </Badge>
              </div>
            </div>
          </Alert>

          <div className="personel-hareketleri-content">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-light">
                <div className="d-flex align-items-center">
                  <h5 className="mb-0 flex-grow-1">
                    <i className="fas fa-history me-2 text-primary"></i>
                    Son Personel Hareketleri
                  </h5>
                  <Badge color="danger" pill className="px-3 py-2">
                    Canlı Veriler
                  </Badge>
                </div>
              </CardHeader>

              <div className="aktiviteler-wrapper">
                <Aktiviteler
                  token={token}
                  user={user}
                  showPersonelDetay={showPersonelDetay}
                  showBirimPersonelListe={showBirimPersonelListe}
                  personelHareketleri={true}
                />
              </div>
            </Card>
          </div>
        </CardBody>
      </Card>

      <style jsx>{`
        .aktiviteler-wrapper {
          border-radius: 0 0 0.25rem 0.25rem;
        }
        .personel-hareketleri-container {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
