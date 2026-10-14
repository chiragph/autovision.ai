import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Sparkles } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Check available devices
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Initialize camera stream
  useEffect(() => {
    let isCancelled = false;

    const startCamera = async () => {
      setIsLoading(true);
      setError(null);

      // Stop previous tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported by your current browser. Please upload an image file instead.');
        setIsLoading(false);
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsLoading(false);
      } catch (err: unknown) {
        if (isCancelled) return;
        setIsLoading(false);
        const errorObj = err as { name?: string; message?: string };
        if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
          setError('Camera permission was denied. Please allow camera access in your browser site permissions or use the upload photo option.');
        } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
          setError('No camera device was detected on your system. Please connect a camera or upload a car image.');
        } else if (errorObj.name === 'NotReadableError' || errorObj.name === 'TrackStartError') {
          setError('The camera is currently in use by another application. Please close other camera apps and try again.');
        } else {
          setError(errorObj.message || 'Unable to access camera feed.');
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  // Handle capture
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Clean up stream before passing
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      onCapture(dataUrl);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Flash overlay effect on snap */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150" />
      )}

      {/* Top Header Controls */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide uppercase font-mono">
            Live Vehicle Scanner
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasMultipleCameras && (
            <button
              onClick={toggleCameraFacing}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
              title="Switch Front/Rear Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
            title="Close Camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative flex-1 max-w-4xl w-full mx-auto my-4 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl">
        {isLoading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 z-20">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-300 font-medium">Starting camera sensor...</p>
          </div>
        )}

        {error ? (
          <div className="p-6 max-w-md text-center flex flex-col items-center gap-3 z-20">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">Camera Unavailable</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Return to File Upload
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-contain max-h-[75vh]"
            />

            {/* Target Reticle Overlay for Vehicle Positioning */}
            <div className="absolute inset-8 sm:inset-16 pointer-events-none border border-cyan-400/30 rounded-2xl flex flex-col justify-between p-4">
              {/* Corner brackets */}
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              </div>
              <div className="text-center">
                <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded border border-cyan-500/20">
                  Align Vehicle within Reticle
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Capture Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-center gap-4 py-2 z-10">
        {!error && (
          <button
            onClick={handleCapture}
            disabled={isLoading}
            className="group relative flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span>Capture & Recognize Vehicle</span>
          </button>
        )}
      </div>
    </div>
  );
};
