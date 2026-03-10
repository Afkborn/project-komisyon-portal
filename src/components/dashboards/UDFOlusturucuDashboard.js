import React, { useMemo, useRef, useState } from "react";
import AYSNavbar from "../root/AYSNavbar";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
  Spinner,
} from "reactstrap";
import alertify from "alertifyjs";
import * as XLSX from "xlsx";
import JSZip from "jszip";

const START_ROW_INDEX = 11;

const contentXmlTemplate = ({
  esasNo,
  davaliAdi,
  durusmaSaati,
  siraNo,
}) => `<?xml version="1.0" encoding="UTF-8"?>
<udf>
  <meta>
    <siraNo>${siraNo}</siraNo>
    <esasNo>${esasNo}</esasNo>
  </meta>
  <durusma>
    <davaliAdi>${davaliAdi}</davaliAdi>
    <durusmaSaati>${durusmaSaati}</durusmaSaati>
  </durusma>
</udf>`;

const sanitizeFileName = (value) =>
  String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeCellText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

export default function UDFOlusturucuDashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const fileInputRef = useRef(null);

  const canUseFileSystemAccess = useMemo(
    () => typeof window !== "undefined" && "showDirectoryPicker" in window,
    [],
  );

  const parseExcelFile = async (file) => {
    setIsReading(true);
    setLastResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("Excel dosyasında sayfa bulunamadı.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: "",
      });

      const extracted = [];

      for (
        let rowIndex = START_ROW_INDEX;
        rowIndex < rows.length;
        rowIndex += 1
      ) {
        const row = rows[rowIndex];
        if (!Array.isArray(row) || row.length === 0) continue;

        try {
          const siraNoRaw = row[1];
          const esasNo = normalizeCellText(row[2]);
          const davaliAdi = normalizeCellText(row[6]);
          const durusmaSaati = normalizeCellText(row[19]);

          const siraNo = Number.parseInt(String(siraNoRaw).trim(), 10);

          if (Number.isNaN(siraNo)) {
            throw new Error("Sıra no geçersiz");
          }

          if (!esasNo || !davaliAdi) {
            throw new Error("Esas no veya davalı adı boş");
          }

          extracted.push({
            siraNo,
            esasNo,
            davaliAdi,
            durusmaSaati,
          });
        } catch (rowError) {
          continue;
        }
      }

      setParsedRows(extracted);
      alertify.success(
        `Excel okundu. ${extracted.length} geçerli esas bulundu.`,
      );
    } catch (error) {
      console.error(error);
      setParsedRows([]);
      alertify.error(error.message || "Excel okunurken bir hata oluştu.");
    } finally {
      setIsReading(false);
    }
  };

  const handleFilePicked = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xls")) {
      alertify.error("Lütfen .xls uzantılı bir UYAP listesi yükleyin.");
      return;
    }

    setSelectedFile(file);
    await parseExcelFile(file);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer?.files?.[0];
    await handleFilePicked(file);
  };

  const createUdfBlob = async (row) => {
    const zip = new JSZip();
    const content = contentXmlTemplate(row);
    zip.file("content.xml", content);
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
    });
    return blob;
  };

  const saveAllUdfFiles = async () => {
    if (!canUseFileSystemAccess) {
      alertify.error("Tarayıcınız File System Access API desteklemiyor.");
      return;
    }

    if (parsedRows.length === 0) {
      alertify.warning("Önce geçerli bir Excel dosyası yüklemelisiniz.");
      return;
    }

    setIsCreating(true);
    setLastResult(null);

    let successCount = 0;
    let skippedCount = 0;

    try {
      const directoryHandle = await window.showDirectoryPicker();

      for (const row of parsedRows) {
        try {
          const blob = await createUdfBlob(row);

          const esasPart = sanitizeFileName(row.esasNo);
          const davaliPart = sanitizeFileName(row.davaliAdi);
          const fileName = `${esasPart}_${davaliPart || "DAVALI"}.udf`;

          const fileHandle = await directoryHandle.getFileHandle(fileName, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          successCount += 1;
        } catch (rowWriteError) {
          skippedCount += 1;
        }
      }

      setLastResult({
        successCount,
        skippedCount,
      });

      if (successCount > 0) {
        alertify.success(
          `${successCount} adet UDF dosyası başarıyla oluşturuldu.`,
        );
      } else {
        alertify.error("Hiçbir UDF dosyası oluşturulamadı.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(error);
        alertify.error("Klasör seçimi/yazma sırasında hata oluştu.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <AYSNavbar />
      <Container fluid className="p-4">
        <Card className="shadow-sm border-0">
          <CardHeader className="bg-danger text-white">
            <h4 className="mb-0">
              <i className="fas fa-file-archive me-2"></i>
              UDF Oluşturucu
            </h4>
          </CardHeader>

          <CardBody>
            <Alert color="info" className="mb-4">
              UYAP duruşma listesi Excel dosyasını yükleyin, sistem her geçerli
              esas için ayrı bir <strong>.udf</strong> dosyası oluştursun.
            </Alert>

            <div
              role="button"
              tabIndex={0}
              className={`border rounded-3 p-5 text-center ${
                isDragging
                  ? "border-danger bg-light"
                  : "border-secondary-subtle"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-file-excel fa-2x text-success mb-3"></i>
              <h6 className="mb-2">Excel Dosyasını Sürükleyip Bırakın</h6>
              <p className="text-muted mb-0">
                veya tıklayarak .xls dosyası seçin
              </p>
            </div>

            <Input
              innerRef={fileInputRef}
              type="file"
              accept=".xls"
              className="d-none"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                await handleFilePicked(file);
                e.target.value = "";
              }}
            />

            <Row className="mt-4 g-3 align-items-center">
              <Col md={8}>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <Badge color="dark" pill className="px-3 py-2">
                    Dosya: {selectedFile ? selectedFile.name : "Seçilmedi"}
                  </Badge>
                  <Badge color="danger" pill className="px-3 py-2">
                    Geçerli Esas: {parsedRows.length}
                  </Badge>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <Button
                  color="danger"
                  onClick={saveAllUdfFiles}
                  disabled={isReading || isCreating || parsedRows.length === 0}
                >
                  {isCreating ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-folder-open me-2"></i>
                      Hedef Klasör Seç ve Oluştur
                    </>
                  )}
                </Button>
              </Col>
            </Row>

            {isReading && (
              <div className="mt-3 text-muted">
                <Spinner size="sm" className="me-2" />
                Excel dosyası okunuyor...
              </div>
            )}

            {!canUseFileSystemAccess && (
              <Alert color="warning" className="mt-4 mb-0">
                Tarayıcınız klasöre doğrudan yazmayı desteklemiyor. Bu özellik
                için güncel Chromium tabanlı bir tarayıcı kullanın.
              </Alert>
            )}

            {lastResult && (
              <Alert
                color={lastResult.successCount > 0 ? "success" : "danger"}
                className="mt-4 mb-0"
              >
                <div>
                  <strong>İşlem tamamlandı.</strong> Başarılı:{" "}
                  {lastResult.successCount}
                  {" | "}Atlanan: {lastResult.skippedCount}
                </div>
              </Alert>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
