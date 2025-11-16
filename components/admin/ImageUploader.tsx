'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  maxSize?: number; // in MB
}

export function ImageUploader({
  onUpload,
  currentImage,
  label = 'Upload Image',
  aspectRatio = 'video',
  maxSize = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>

      <div
        className={`relative ${aspectRatioClasses[aspectRatio]} w-full overflow-hidden rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-orange-400 hover:bg-orange-50`}
      >
        {preview ? (
          // Preview image
          <div className="relative h-full w-full group">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />

            {/* Overlay with remove button */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
                <button
                  onClick={handleClick}
                  disabled={uploading}
                  className="p-2 bg-white rounded-lg hover:bg-neutral-100 transition-colors"
                  title="Change image"
                >
                  <Upload className="w-5 h-5 text-neutral-700" />
                </button>
                <button
                  onClick={handleRemove}
                  disabled={uploading}
                  className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove image"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          // Upload button
          <button
            onClick={handleClick}
            disabled={uploading}
            className="h-full w-full flex flex-col items-center justify-center gap-3 p-6 cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                <p className="text-sm text-neutral-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-neutral-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    PNG, JPG, GIF, WebP up to {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Help text */}
      {!error && !uploading && (
        <p className="text-xs text-neutral-500">
          Recommended: {aspectRatio === 'video' ? '1200x675' : aspectRatio === 'square' ? '1000x1000' : '2100x900'} pixels
        </p>
      )}
    </div>
  );
}
