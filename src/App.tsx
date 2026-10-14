/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { CameraCapture } from './components/CameraCapture';
import { ResultsDashboard } from './components/ResultsDashboard';
import { InfoModals } from './components/InfoModals';
import { Footer } from './components/Footer';
import { VehicleAnalysisResult } from './types/vehicle';
import { analyzeVehicleImage } from './services/vehicleService';
import {
  Car,
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  ScanEye,
  Shield,
  Layers,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<VehicleAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'how-it-works' | 'about';
  }>({
    isOpen: false,
    type: 'how-it-works',
  });

  const handleImageSelected = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleStartAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStage('Preprocessing vehicle image...');

    try {
      const result = await analyzeVehicleImage(imageDataUrl, {
        minConfidence: 0.3,
        onProgress: (stage) => setAnalysisStage(stage),
      });

      setAnalysisResult(result);
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to analyze vehicle image.';
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  const handleCameraCapture = (capturedDataUrl: string) => {
    setIsCameraOpen(false);
    setSelectedImage(capturedDataUrl);
    setAnalysisResult(null);
    setErrorMessage(null);
    // Automatically trigger analysis for camera captures
    handleStartAnalysis(capturedDataUrl);
  };

  const handleResetAll = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setIsAnalyzing(false);
    setIsCameraOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Navigation */}
      <Navbar
        onOpenHowItWorks={() => setModalState({ isOpen: true, type: 'how-it-works' })}
        onOpenAbout={() => setModalState({ isOpen: true, type: 'about' })}
        onReset={handleResetAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
        {/* Hero Section: Rendered when no results are shown yet */}
        {!analysisResult && (
          <section className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            {/* Domain Feature Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-medium">AI Automotive Computer Vision</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono">Fine-Grained Classification</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Know Every Car <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">at a Glance.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Upload any car photograph or use your camera to detect vehicles in the scene, identify their exact make and model, estimate exterior paint colour, and localize with 2D bounding boxes.
            </p>

            {/* Quick feature highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Maruti, Tata, Hyundai, Mahindra & Global Makes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Multi-Car Localization
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Specular-Isolated Paint Swatch
              </span>
            </div>
          </section>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="w-full max-w-3xl mb-8 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-rose-100 text-sm">Processing Error</h4>
              <p className="mt-1 leading-relaxed text-rose-200/90">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Workspace: Upload / Live Camera / Results */}
        <div className="w-full">
          {analysisResult ? (
            <ResultsDashboard
              result={analysisResult}
              imageUrl={selectedImage!}
              onReset={handleResetAll}
              onChangeImage={() => {
                setAnalysisResult(null);
              }}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              <ImageUploader
                onImageSelected={handleImageSelected}
                onStartAnalysis={handleStartAnalysis}
                onOpenCamera={() => setIsCameraOpen(true)}
                isAnalyzing={isAnalyzing}
                analysisStage={analysisStage}
                selectedImageDataUrl={selectedImage}
                onClearImage={handleClearImage}
              />
            </div>
          )}
        </div>
      </main>

      {/* Camera Capture Modal / Screen */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Information / Architecture Modals */}
      <InfoModals
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />

      {/* Footer */}
      <Footer
        onOpenHowItWorks={() => setModalState({ isOpen: true, type: 'how-it-works' })}
        onOpenAbout={() => setModalState({ isOpen: true, type: 'about' })}
      />
    </div>
  );
}
