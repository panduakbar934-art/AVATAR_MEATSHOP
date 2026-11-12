import React, { useState, useEffect } from 'react';
import { getImage } from '../utils/imageStorage';
import { Package } from 'lucide-react';

interface ProductImageProps {
  image: string;
  imageId?: string | null;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  image,
  imageId,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [src, setSrc] = useState<string>(image);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (imageId) {
      getImage(imageId).then((localUrl) => {
        if (isMounted) {
          if (localUrl) {
            setSrc(localUrl);
            setHasError(false);
          } else {
            setSrc(image);
          }
        }
      });
    } else {
      setSrc(image);
      setHasError(false);
    }

    return () => {
      isMounted = false;
    };
  }, [image, imageId]);

  if (hasError || !src) {
    return (
      <div className={`bg-stone-100 flex flex-col items-center justify-center text-stone-400 p-4 ${className}`}>
        <Package className="w-8 h-8 mb-1 opacity-50" />
        <span className="text-[10px] text-stone-500 font-medium">Foto Produk</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
