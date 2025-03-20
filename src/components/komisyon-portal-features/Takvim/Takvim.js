import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  ButtonGroup,
  Badge,
  Tooltip,
} from "reactstrap";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaUser,
  FaGavel,
  FaUsers,
} from "react-icons/fa";

export default function Takvim() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [tooltipOpen, setTooltipOpen] = useState({});

  // Tooltip toggle fonksiyonu
  const toggleTooltip = (id) => {
    setTooltipOpen({
      ...tooltipOpen,
      [id]: !tooltipOpen[id],
    });
  };

  // Örnek resmi tatil günleri (Backend'den gelecek)
  const resmiTatiller = [
    {
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      title: "Resmi Tatil",
    },
    {
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      title: "Resmi Tatil",
    },
  ];

  // Örnek nöbetçi personel (Backend'den gelecek)
  const nobetciPersoneller = {
    sulhCeza: [
      {
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        hakim: {
          ad: "Ahmet",
          soyad: "Yılmaz",
          unvan: "Hakim",
          sicil: "12345",
        },
        katip: {
          ad: "Ayşe",
          soyad: "Demir",
          unvan: "Katip",
          sicil: "22345",
        },
        mubasir: {
          ad: "Mehmet",
          soyad: "Kaya",
          unvan: "Mübaşir",
          sicil: "32345",
        },
      },
      {
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
        hakim: {
          ad: "Fatih",
          soyad: "Öztürk",
          unvan: "Hakim",
          sicil: "12346",
        },
        katip: {
          ad: "Zeynep",
          soyad: "Çelik",
          unvan: "Katip",
          sicil: "22346",
        },
        mubasir: {
          ad: "Ali",
          soyad: "Yıldız",
          unvan: "Mübaşir",
          sicil: "32346",
        },
      },
    ],
    heyet: [
      {
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        baskan: {
          ad: "Hasan",
          soyad: "Şahin",
          unvan: "Başkan",
          sicil: "41234",
        },
        uye1: {
          ad: "Elif",
          soyad: "Yücel",
          unvan: "Üye",
          sicil: "42345",
        },
        uye2: {
          ad: "Mustafa",
          soyad: "Aydın",
          unvan: "Üye",
          sicil: "43456",
        },
        katip: {
          ad: "Selin",
          soyad: "Arslan",
          unvan: "Katip",
          sicil: "44567",
        },
        mubasir: {
          ad: "İbrahim",
          soyad: "Koç",
          unvan: "Mübaşir",
          sicil: "45678",
        },
      },
      {
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 23),
        baskan: {
          ad: "Kemal",
          soyad: "Özdemir",
          unvan: "Başkan",
          sicil: "51234",
        },
        uye1: {
          ad: "Gül",
          soyad: "Kara",
          unvan: "Üye",
          sicil: "52345",
        },
        uye2: {
          ad: "Osman",
          soyad: "Güneş",
          unvan: "Üye",
          sicil: "53456",
        },
        katip: {
          ad: "Derya",
          soyad: "Yalçın",
          unvan: "Katip",
          sicil: "54567",
        },
        mubasir: {
          ad: "Emre",
          soyad: "Doğan",
          unvan: "Mübaşir",
          sicil: "55678",
        },
      },
    ],
  };

  // Ay adları
  const monthNames = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  // Hafta başlıkları
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  // Önceki aya geç
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Sonraki aya geç
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Bugüne git
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Ayın ilk gününü alır
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Ayın gün sayısını alır
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Belirli bir gün hafta sonu mu kontrol eder
  const isWeekend = (dayOfWeek) => {
    // 6: Cumartesi, 0: Pazar (JavaScript'te)
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Belirli bir gün resmi tatil mi kontrol eder
  const isHoliday = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return resmiTatiller.some(
      (tatil) =>
        tatil.date.getDate() === date.getDate() &&
        tatil.date.getMonth() === date.getMonth() &&
        tatil.date.getFullYear() === date.getFullYear()
    );
  };

  // Belirli bir günde sulh ceza nöbetçi personeli var mı kontrol eder
  const getSulhCezaNobeti = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return nobetciPersoneller.sulhCeza.find(
      (nobet) =>
        nobet.date.getDate() === date.getDate() &&
        nobet.date.getMonth() === date.getMonth() &&
        nobet.date.getFullYear() === date.getFullYear()
    );
  };

  // Belirli bir günde heyet nöbetçi personeli var mı kontrol eder
  const getHeyetNobeti = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return nobetciPersoneller.heyet.find(
      (nobet) =>
        nobet.date.getDate() === date.getDate() &&
        nobet.date.getMonth() === date.getMonth() &&
        nobet.date.getFullYear() === date.getFullYear()
    );
  };

  // Takvim günlerini oluştur
  const renderCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const today = new Date();

    // Pazar günü 0 olarak başlar, Pazartesi 1 olacak şekilde ayarla
    let firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    // Her haftayı ayrı bir satır olarak tutacak dizi
    const weeks = [];
    let days = [];

    // Önceki ayın günleri için boşluk bırak
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<td key={`empty-${i}`} className="calendar-day empty"></td>);
    }

    // Ayın günlerini ekle
    for (let day = 1; day <= daysInMonth; day++) {
      // Günün haftanın hangi günü olduğunu hesapla
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayOfWeek = date.getDay();

      const isToday =
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      const weekend = isWeekend(dayOfWeek);
      const holiday = isHoliday(day);
      const sulhCezaNobeti = getSulhCezaNobeti(day);
      const heyetNobeti = getHeyetNobeti(day);

      // Bu gün için benzersiz tooltip ID'leri oluştur
      const sulhCezaTooltipId = `sulhCeza${day}`;
      const heyetTooltipId = `heyet${day}`;

      days.push(
        <td
          key={`day-${day}`}
          className={`calendar-day ${isToday ? "today" : ""} ${
            weekend ? "weekend" : ""
          } ${holiday ? "holiday" : ""}`}
        >
          <div className="day-container">
            <div className={`day-number ${isToday ? "today-number" : ""}`}>
              {day}
            </div>

            {holiday && <div className="holiday-badge">Resmi Tatil</div>}

            {sulhCezaNobeti && (
              <>
                <div
                  className="nobetci-sulhceza"
                  id={sulhCezaTooltipId}
                  onClick={() => toggleTooltip(sulhCezaTooltipId)}
                >
                  <FaGavel className="me-1" />
                  <span>Sulh Ceza Nöbeti</span>
                </div>
                <Tooltip
                  isOpen={tooltipOpen[sulhCezaTooltipId]}
                  target={sulhCezaTooltipId}
                  toggle={() => toggleTooltip(sulhCezaTooltipId)}
                  placement="top"
                >
                  <div className="nobet-tooltip">
                    <h6>Sulh Ceza Nöbeti</h6>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Hakim:</span>
                      <span className="personel-ad">
                        {sulhCezaNobeti.hakim.ad} {sulhCezaNobeti.hakim.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({sulhCezaNobeti.hakim.sicil})
                      </span>
                    </div>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Katip:</span>
                      <span className="personel-ad">
                        {sulhCezaNobeti.katip.ad} {sulhCezaNobeti.katip.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({sulhCezaNobeti.katip.sicil})
                      </span>
                    </div>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Mübaşir:</span>
                      <span className="personel-ad">
                        {sulhCezaNobeti.mubasir.ad}{" "}
                        {sulhCezaNobeti.mubasir.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({sulhCezaNobeti.mubasir.sicil})
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </>
            )}

            {heyetNobeti && (
              <>
                <div
                  className="nobetci-heyet"
                  id={heyetTooltipId}
                  onClick={() => toggleTooltip(heyetTooltipId)}
                >
                  <FaUsers className="me-1" />
                  <span>Heyet Nöbeti</span>
                </div>
                <Tooltip
                  isOpen={tooltipOpen[heyetTooltipId]}
                  target={heyetTooltipId}
                  toggle={() => toggleTooltip(heyetTooltipId)}
                  placement="top"
                >
                  <div className="nobet-tooltip">
                    <h6>Heyet Nöbeti</h6>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Başkan:</span>
                      <span className="personel-ad">
                        {heyetNobeti.baskan.ad} {heyetNobeti.baskan.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({heyetNobeti.baskan.sicil})
                      </span>
                    </div>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Üye 1:</span>
                      <span className="personel-ad">
                        {heyetNobeti.uye1.ad} {heyetNobeti.uye1.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({heyetNobeti.uye1.sicil})
                      </span>
                    </div>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Üye 2:</span>
                      <span className="personel-ad">
                        {heyetNobeti.uye2.ad} {heyetNobeti.uye2.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({heyetNobeti.uye2.sicil})
                      </span>
                    </div>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Katip:</span>
                      <span className="personel-ad">
                        {heyetNobeti.katip.ad} {heyetNobeti.katip.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({heyetNobeti.katip.sicil})
                      </span>
                    </div>
                    <div className="nobet-personel">
                      <span className="personel-unvan">Mübaşir:</span>
                      <span className="personel-ad">
                        {heyetNobeti.mubasir.ad} {heyetNobeti.mubasir.soyad}
                      </span>
                      <span className="personel-sicil">
                        ({heyetNobeti.mubasir.sicil})
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </>
            )}
          </div>
        </td>
      );

      // Cumartesi gününe geldiğimizde (veya ayın son günü olduğunda) yeni bir hafta başlat
      if ((firstDayIndex + day) % 7 === 0 || day === daysInMonth) {
        // Eğer son haftada tamamlanmamış günler varsa boş hücrelerle doldur
        if (day === daysInMonth && (firstDayIndex + day) % 7 !== 0) {
          const remainingCells = 7 - ((firstDayIndex + day) % 7);
          for (let i = 0; i < remainingCells; i++) {
            days.push(
              <td key={`empty-end-${i}`} className="calendar-day empty"></td>
            );
          }
        }

        // Tamamlanan haftayı weeks dizisine ekle
        weeks.push(
          <tr key={`week-${Math.floor((firstDayIndex + day) / 7)}`}>{days}</tr>
        );
        days = []; // Yeni hafta için günleri sıfırla
      }
    }

    return weeks;
  };

  return (
    <div className="takvim-container">
      <Card className="shadow-sm">
        <CardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Nöbetçi Personel Takvimi (VERİLER ÖRNEKTİR, TEST AMAÇLIDIR)
          </h3>
          {/* <div>
            <ButtonGroup>
              <Button
                color="light"
                active={currentView === "month"}
                onClick={() => setCurrentView("month")}
              >
                Ay
              </Button>
              <Button
                color="light"
                active={currentView === "week"}
                onClick={() => setCurrentView("week")}
              >
                Hafta
              </Button>
              <Button
                color="light"
                active={currentView === "day"}
                onClick={() => setCurrentView("day")}
              >
                Gün
              </Button>
            </ButtonGroup>
          </div> */}
        </CardHeader>
        <CardBody>
          <div className="calendar-header d-flex justify-content-between align-items-center mb-3">
            <div className="calendar-nav">
              <Button
                color="secondary"
                outline
                className="me-2"
                onClick={goToPreviousMonth}
              >
                <FaChevronLeft />
              </Button>
              <Button color="primary" className="me-2" onClick={goToToday}>
                Bugün
              </Button>
              <Button color="secondary" outline onClick={goToNextMonth}>
                <FaChevronRight />
              </Button>
            </div>
            <h4 className="calendar-title mb-0">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <div className="calendar-legend">
              <Badge color="danger" pill className="me-2">
                Resmi Tatil
              </Badge>
              <Badge color="warning" pill className="me-2">
                <FaGavel className="me-1" /> Sulh Ceza
              </Badge>
              <Badge color="info" pill>
                <FaUsers className="me-1" /> Heyet
              </Badge>
            </div>
          </div>

          <div className="calendar-container">
            <table className="calendar-table">
              <thead>
                <tr>
                  {weekDays.map((day, index) => (
                    <th
                      key={`weekday-${index}`}
                      className={`weekday-header ${
                        index >= 5 ? "weekend-header" : ""
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderCalendarDays()}</tbody>
            </table>
          </div>

          <div className="calendar-info mt-4">
            <div className="d-flex align-items-center text-muted">
              <FaInfoCircle className="me-2" />
              <small>
                Nöbetçi personel detayları için ilgili nöbet türüne
                tıklayabilirsiniz.
              </small>
            </div>
          </div>
        </CardBody>
      </Card>

      <style jsx>{`
        .calendar-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 3px;
          table-layout: fixed;
        }

        .weekday-header {
          padding: 10px;
          background-color: #f8f9fa;
          text-align: center;
          font-weight: 600;
          color: #6c757d;
          border-radius: 5px;
        }

        .weekend-header {
          background-color: #ffe6e6;
          color: #dc3545;
        }

        .calendar-day {
          height: 120px;
          padding: 8px;
          vertical-align: top;
          border: 1px solid #e9ecef;
          border-radius: 5px;
          transition: background-color 0.2s ease;
        }

        .weekend {
          background-color: #fff5f5;
        }

        .holiday {
          background-color: #ffebeb;
        }

        .calendar-day:hover {
          background-color: #f8f9fa;
          cursor: pointer;
        }

        .calendar-day.today {
          background-color: #e8f4ff;
          border: 1px solid #0d6efd;
        }

        .day-number {
          font-weight: 600;
          position: relative;
          display: inline-block;
          margin-bottom: 5px;
        }

        .today-number {
          background-color: #0d6efd;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .holiday-badge {
          font-size: 0.7rem;
          background-color: #dc3545;
          color: white;
          padding: 2px 5px;
          border-radius: 3px;
          margin-top: 2px;
          display: inline-block;
        }

        .nobetci-sulhceza,
        .nobetci-heyet {
          font-size: 0.75rem;
          margin-top: 5px;
          padding: 3px 5px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nobetci-sulhceza {
          background-color: #fff8e6;
          border-left: 3px solid #ffc107;
          color: #b58105;
        }

        .nobetci-heyet {
          background-color: #e6f7ff;
          border-left: 3px solid #17a2b8;
          color: #138496;
        }

        .nobetci-sulhceza:hover {
          background-color: #ffeeba;
        }

        .nobetci-heyet:hover {
          background-color: #b8e7f3;
        }

        .day-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .empty {
          background-color: #f9f9f9;
          cursor: default;
        }

        .nobet-tooltip {
          text-align: left;
          min-width: 220px;
        }

        .nobet-tooltip h6 {
          margin-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding-bottom: 5px;
          font-weight: bold;
        }

        .nobet-personel {
          margin-bottom: 3px;
          font-size: 0.9rem;
          display: flex;
          flex-wrap: wrap;
        }

        .personel-unvan {
          width: 60px;
          font-weight: bold;
        }

        .personel-ad {
          margin-right: 5px;
        }

        .personel-sicil {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          white-space: nowrap;
        }

        .calendar-legend {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
