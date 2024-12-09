'use client';

import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { TEMPLATES } from './config/templates';

export default function Home() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  useEffect(() => {
    if (sourceImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(sourceImage);
    } else {
      setImagePreview(null);
    }
  }, [sourceImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      setSourceImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!sourceImage || !selectedTemplate) return;

    const formData = new FormData();
    formData.append('sourceImage', sourceImage);
    formData.append('templateId', selectedTemplate.toString());

    try {
      const response = await fetch('/api/face-swap', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Create Your Custom Poster</h1>
        
        {/* Upload Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Upload Your Photo</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              {imagePreview ? (
                <div className="mb-4">
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded"
                    />
                    <button 
                      onClick={() => {
                        setSourceImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-green-600">✓ {sourceImage?.name}</p>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Drag and drop your photo here or click to browse</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                {sourceImage ? 'Change Photo' : 'Choose Photo'}
              </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG. Maximum file size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Choose Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(template => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="relative aspect-w-3 aspect-h-4 mb-3">
                  <img 
                    src={template.targetImage} 
                    alt={template.name}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-gray-600">${template.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!sourceImage || !selectedTemplate}
            className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors ${
              sourceImage && selectedTemplate
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Poster
          </button>
        </div>
      </div>
    </main>
  );
}