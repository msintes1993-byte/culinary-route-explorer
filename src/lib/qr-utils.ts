import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateQRPdf = async (
  qrElement: HTMLElement,
  venueName: string,
  eventName: string
): Promise<void> => {
  const canvas = await html2canvas(qrElement, {
    backgroundColor: "#ffffff",
    scale: 2,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // A4 dimensions: 210mm x 297mm
  const pageWidth = 210;
  const pageHeight = 297;
  
  // QR size (centered, 120mm x 120mm)
  const qrSize = 120;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 60;

  // Add title
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text(eventName, pageWidth / 2, 30, { align: "center" });

  // Add venue name
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "normal");
  pdf.text(venueName, pageWidth / 2, 45, { align: "center" });

  // Add QR code
  pdf.addImage(imgData, "PNG", qrX, qrY, qrSize, qrSize);

  // Add instructions
  pdf.setFontSize(14);
  pdf.text("Escanea para votar", pageWidth / 2, qrY + qrSize + 20, { align: "center" });

  pdf.save(`QR-${venueName.replace(/\s+/g, "-")}.pdf`);
};

export const getVenueQRUrl = (venueId: string, baseUrl: string): string => {
  return `${baseUrl}/votar/${venueId}`;
};
