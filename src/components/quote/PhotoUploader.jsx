import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';

export default function PhotoUploader({ photos, onPhotosChange, label }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      onPhotosChange([...photos, ...urls]);
    } catch (err) {
      alert('Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium">{label}</label>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            className="pointer-events-none"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Add Photos
              </>
            )}
          </Button>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="text-sm text-slate-500 text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">
          No photos added yet
        </div>
      )}
    </div>
  );
}