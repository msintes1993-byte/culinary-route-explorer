import { useState } from "react";

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

const ImageWithFallback = ({ src, alt, className = "" }: ImageWithFallbackProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  const handleError = () => {
    setImageFailed(true);
  };

  // If no src or image failed, use placeholder
  const imageSrc = !src || imageFailed ? "/placeholder.svg" : src;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${className}`}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
