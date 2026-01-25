'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadAreaProps {
  images: File[];
  setImages: (images: File[]) => void;
  maxImages?: number;
}

export const ImageUploadArea = ({ images, setImages, maxImages = 3 }: ImageUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    const combinedFiles = [...images, ...validFiles];
    
    if (combinedFiles.length > maxImages) {
      // Allow only up to maxImages
      setImages(combinedFiles.slice(0, maxImages));
    } else {
      setImages(combinedFiles);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      addFiles(newFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300 ml-1">
          Evidence (Images)
        </label>
        <span className="text-xs text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl transition-all duration-200 p-6 text-center
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept="image/*"
        />

        {images.length === 0 ? (
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="p-3 rounded-full bg-white/5">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-200">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG up to 5MB
              </p>
            </div>
            <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2"
                onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                }}
            >
                Add Images
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
                {images.map((file, index) => (
                <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10"
                >
                    <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    />
                    <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                    <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[10px] text-gray-300 truncate">{file.name}</p>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
            
            {images.length < maxImages && (
                 <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all gap-2"
                >
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500">Add More</span>
                </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
