import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const StarRating = ({ value, onChange, size = "lg", disabled = false }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={cn(
              "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110 active:scale-95"
            )}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                isFilled
                  ? "fill-secondary text-secondary"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
