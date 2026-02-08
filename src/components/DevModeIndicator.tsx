import { Bug } from "lucide-react";
import { useDevMode } from "@/hooks/useDevMode";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DevModeIndicator = () => {
  const { isDevMode, toggleDevMode } = useDevMode();

  if (!isDevMode) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleDevMode}
          className="fixed top-2 right-2 z-50"
        >
          <Badge 
            variant="outline" 
            className="bg-accent/20 border-accent text-accent-foreground gap-1 cursor-pointer hover:bg-accent/30 transition-colors"
          >
            <Bug className="h-3 w-3" />
            DEV
          </Badge>
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Modo Desarrollador activo</p>
        <p className="text-xs text-muted-foreground">Ctrl + Shift + D para desactivar</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default DevModeIndicator;
