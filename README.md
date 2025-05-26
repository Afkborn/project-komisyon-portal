Adliye Yönetim Sistemi

Bu proje, Eskişehir Adliyesi personelinin işlemlerini kolaylaştırmak ve hızlandırmak amacıyla geliştirilmiş bir web uygulamasıdır.

## Proje Hakkında

Adliye Yönetim Sistemi, adliye bünyesindeki çeşitli birimlerin yönetimini ve personel işlemlerini tek bir platform üzerinden gerçekleştirmeyi amaçlar. Sistem, komisyon portalı, santral portalı, SEGBİS rehberi ve kullanıcı yönetim modüllerini içermektedir.


## Amaç

- Adliye personeline iş süreçlerinde destek olmak
- Belge ve dosya yönetimini kolaylaştırmak
- İşlemleri hızlandırmak ve verimliliği artırmak
- Verilerin güvenli bir şekilde saklanmasını sağlamak

## Kullanılan Teknolojiler

- **Frontend**: React.js
- **UI Framework**: Bootstrap ve Reactstrap 
- **Routing**: React Router Dom 
- **HTTP İstekleri**: Axios 
- **Kimlik Doğrulama**: JWT  ve Universal Cookie 
- **Bildirimler**: Alertifyjs 
- **İkonlar**: React-icons  ve FontAwesome
- **Veri Görselleştirme**: React Minimal Pie Chart 
- **QR Kod Oluşturma**: React QR Code
- **Dosya İşlemleri**: XLSX (v0.18.5) ve HTML2PDF.js

## Özellikler

- Rol tabanlı erişim sistemi (admin, komisyon üyesi, santral memur vb.)
- Eskişehir Ekspress Asayiş Haberleri entegrasyonu
- SEGBİS (Ses ve Görüntü Bilişim Sistemi) rehberi
- Kullanıcı aktivite takibi
- Personel raporlama sistemi
- QR kod desteği

## Kurulum
Projeyi yerel ortamınızda çalıştırmak için ek olarak backend API'ye ihtiyacınız vardır. Backend API'nin nasıl kurulacağına dair bilgi için lütfen ilgili dokümantasyona bakın.

Projeyi yerel ortamınızda çalıştırmak için:

```bash
# Proje dizinine gidin
cd project-komisyon-portal

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

## Dağıtım

Uygulama dağıtım için hazırlanabilir:

```bash
npm run build
```
Bu komut, statik dosyaları build klasörüne oluşturur. Bu dosyalar herhangi bir web sunucusuna yerleştirilebilir.

## Modüller

- **EPSİS**: Komisyon başkanı, üyeleri, müdürü ve katipleri için geliştirilmiş personel bilgileri yönetim arayüzü. EPSİS sayesinde personel bilgileri, görev atamaları ve raporlamalar yapılabilir.
- **SEGBİS Rehber**: Adliyeler arası görüntülü iletişim sistemi rehberi (ON DEVELOPMENT STAGE)
- **Kullanıcı Yönetim Sistemi**: Sistem kullanıcılarının yönetimi (ON DEVELOPMENT STAGE)
- **Santral Portal**: Dahili numaraların ve personel bilgilerinin yönetimi (ON DEVELOPMENT STAGE)


## Lisans

Bu proje Eskişehir Adliyesi için özel olarak geliştirilmiştir.