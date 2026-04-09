import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload = ({ images, onChange, maxImages = 5 }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxImages - images.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onChange([...images, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label className="mb-2 block">Property Images (max {maxImages})</Label>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
