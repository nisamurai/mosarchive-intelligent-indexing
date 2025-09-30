import React, { useState } from 'react';
import { Image, AlertCircle } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  className?: string;
  maxHeight?: number;
  maxWidth?: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  file, 
  className = '', 
  maxHeight = 200, 
  maxWidth = 300 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    } else {
      setHasError(true);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [file]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border rounded-lg ${className}`} 
           style={{ minHeight: maxHeight, minWidth: maxWidth }}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Загрузка изображения...</p>
        </div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border rounded-lg ${className}`} 
           style={{ minHeight: maxHeight, minWidth: maxWidth }}>
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Ошибка загрузки изображения</p>
          <p className="text-xs text-gray-400 mt-1">{file.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden bg-gray-50 ${className}`} 
         style={{ minHeight: maxHeight, minWidth: maxWidth }}>
      <img
        src={imageUrl}
        alt={file.name}
        className="w-full h-full object-contain"
        style={{ 
          maxHeight: maxHeight, 
          maxWidth: maxWidth,
          objectFit: 'contain'
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default ImagePreview;
