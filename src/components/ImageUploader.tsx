import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Trash2,
  ArrowRight,
  Car,
} from 'lucide-react';
import { SAMPLE_CARS, SampleCar } from '../data/sampleCars';
import { validateImageFile, convertFileToBase64 } from '../services/vehicleService';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string, file?: File) => void;
  onStartAnalysis: (imageDataUrl: string) => void;
  onOpenCamera: () => void;
  isAnalyzing: boolean;
  analysisStage?: string;
  selectedImageDataUrl: string | null;
  onClearImage: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onStartAnalysis,
  onOpenCamera,
  isAnalyzing,
  analysisStage,
  selectedImageDataUrl,
  onClearImage,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setValidationError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid image file.');
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      onImageSelected(base64, file);
    } catch (err) {
      console.error(err);
      setValidationError('Failed to read image file. Please try another image.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleCar) => {
    setValidationError(null);
    try {
      // Fetch image and convert to base64 data URL
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const base64 = await convertFileToBase64(
        new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' })
      );
      onImageSelected(base64);
    } catch (err) {
      console.warn('Direct fetch failed, falling back to direct URL', err);
      onImageSelected(sample.imageUrl);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Zone or Preview Zone */}
      {!selectedImageDataUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 border-2 border-dashed ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-950/20 shadow-2xl shadow-cyan-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto flex flex-col items-center">
            {/* Upload Icon Circle */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 shadow-lg shadow-cyan-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              Drop car photo here or browse
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              Detect vehicles, identify make & model, exterior colour, and 2D bounding box localization with AI.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-semibold text-xs tracking-wide uppercase shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Choose Image</span>
              </button>

              <button
                type="button"
                onClick={onOpenCamera}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-98 text-slate-200 hover:text-white font-semibold text-xs tracking-wide uppercase border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Use Camera</span>
              </button>
            </div>

            {/* File format info */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-6">
              <span>Supports JPG, JPEG, PNG, WebP</span>
              <span>·</span>
              <span>Max 20MB</span>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview with Confirmation & Actions */
        <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-6">
          {/* Image Preview Box */}
          <div className="relative w-full md:w-80 aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 shadow-lg">
            <img
              src={selectedImageDataUrl}
              alt="Selected car preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
              Preview Ready
            </div>
          </div>

          {/* Action Panel */}
          <div className="flex-1 w-full space-y-4 text-left">
            <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
                <FileCheck className="w-4 h-4" />
                <span>Image Loaded & Verified</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Ready to Analyze Vehicle
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Our vision model will detect vehicle bounding boxes, predict make & model, estimate exterior paint color, and return confidence scores.
              </p>
            </div>

            {/* Processing indicator */}
            {isAnalyzing && (
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-cyan-200">
                    {analysisStage || 'Analyzing car with AI computer vision...'}
                  </p>
                  <p className="text-[11px] text-cyan-300/70">
                    Running multi-task fine-grained classification & localization
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => onStartAnalysis(selectedImageDataUrl)}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wide uppercase shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 active:scale-98"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyse Car</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold tracking-wide border border-slate-700 transition-colors disabled:opacity-50"
              >
                <span>Change Image</span>
              </button>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={onClearImage}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 text-xs font-semibold tracking-wide border border-slate-700 hover:border-rose-800 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-3 text-left">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-100">Image Validation Error</p>
            <p className="text-rose-200/90 mt-0.5 leading-relaxed">{validationError}</p>
          </div>
        </div>
      )}

      {/* Curated Sample Gallery for Quick Testing */}
      <div className="pt-2 text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Or Try A Sample Car Photo
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any model to load & test
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {SAMPLE_CARS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              disabled={isAnalyzing}
              className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/60 transition-all p-2 text-left flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-500/10 disabled:opacity-50"
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 mb-2 relative">
                <img
                  src={sample.thumbnailUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-1 left-1.5 text-[9px] font-mono text-cyan-300 bg-black/60 px-1 py-0.5 rounded">
                  {sample.category}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {sample.name}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 font-mono">
                  {sample.expectedMake}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
