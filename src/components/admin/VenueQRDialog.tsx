import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateQRPdf, getVenueQRUrl } from "@/lib/qr-utils";

interface VenueQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string;
  venueName: string;
  eventName: string;
}

const VenueQRDialog = ({ open, onOpenChange, venueId, venueName, eventName }: VenueQRDialogProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const baseUrl = window.location.origin;
  const qrUrl = getVenueQRUrl(venueId, baseUrl);

  const handleDownloadPdf = async () => {
    if (!qrRef.current) return;
    await generateQRPdf(qrRef.current, venueName, eventName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Código QR</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          <p className="text-center text-muted-foreground text-sm">
            {venueName}
          </p>

          <div
            ref={qrRef}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <QRCodeSVG
              value={qrUrl}
              size={200}
              level="H"
              includeMargin
              className="rounded"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center break-all px-4">
            {qrUrl}
          </p>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
            <Button
              className="flex-1"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VenueQRDialog;
