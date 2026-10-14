import React, { useState, useRef, useEffect } from 'react';
import { DetectedVehicle } from '../types/vehicle';
import { Eye, Tag, Maximize2, ShieldAlert } from 'lucide-react';

interface InteractiveCanvasProps {
  imageUrl: string;
  vehicles: DetectedVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  minConfidence?: number;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  imageUrl,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  minConfidence = 0.3,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [imageBounds, setImageBounds] = useState<{
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  }>({ width: 0, height: 0, offsetX: 0, offsetY: 0 });

  // Update rendered dimensions of the image inside the container
  const updateLayout = () => {
    if (!containerRef.current || !imageRef.current) return;
    const container = containerRef.current;
    const img = imageRef.current;

    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    const natWidth = img.naturalWidth || 1;
    const natHeight = img.naturalHeight || 1;

    const imgAspect = natWidth / natHeight;
    const containerAspect = cWidth / cHeight;

    let renderWidth = cWidth;
    let renderHeight = cHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspect > imgAspect) {
      // Container is wider than image
      renderHeight = cHeight;
      renderWidth = cHeight * imgAspect;
      offsetX = (cWidth - renderWidth) / 2;
    } else {
      // Container is taller than image
      renderWidth = cWidth;
      renderHeight = cWidth / imgAspect;
      offsetY = (cHeight - renderHeight) / 2;
    }

    setImageBounds({
      width: renderWidth,
      height: renderHeight,
      offsetX,
      offsetY,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return (
    <div className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top canvas controls bar */}
      <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">Vehicle Detection Overlay</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono">
            {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} localized
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              showLabels
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[620px] bg-slate-950 flex items-center justify-center overflow-hidden select-none"
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Analyzed vehicle"
          onLoad={updateLayout}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Bounding Box Overlays */}
        {imageBounds.width > 0 && (
          <div
            className="absolute pointer-events-auto"
            style={{
              width: `${imageBounds.width}px`,
              height: `${imageBounds.height}px`,
              left: `${imageBounds.offsetX}px`,
              top: `${imageBounds.offsetY}px`,
            }}
          >
            {vehicles.map((v, index) => {
              let [ymin, xmin, ymax, xmax] = v.box2d;
              if (Math.max(ymin, xmin, ymax, xmax) <= 1.0) {
                ymin *= 1000;
                xmin *= 1000;
                ymax *= 1000;
                xmax *= 1000;
              }

              const top = (ymin / 1000) * imageBounds.height;
              const left = (xmin / 1000) * imageBounds.width;
              const width = Math.max(8, ((xmax - xmin) / 1000) * imageBounds.width);
              const height = Math.max(8, ((ymax - ymin) / 1000) * imageBounds.height);

              const isSelected = selectedVehicleId === v.id;
              const isHovered = hoveredVehicleId === v.id;
              const active = isSelected || isHovered;

              const confidencePercent = Math.round(v.identificationConfidence * 100);

              return (
                <div
                  key={v.id || index}
                  onClick={() => onSelectVehicle(v.id)}
                  onMouseEnter={() => setHoveredVehicleId(v.id)}
                  onMouseLeave={() => setHoveredVehicleId(null)}
                  style={{
                    top: `${top}px`,
                    left: `${left}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  className={`absolute cursor-pointer transition-all duration-150 group ${
                    active
                      ? 'border-2 border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.35)] z-20'
                      : 'border-2 border-blue-500/70 hover:border-cyan-300 bg-blue-500/5 hover:bg-cyan-500/10 z-10'
                  }`}
                >
                  {/* Corner Accent Markers */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-300" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-300" />
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-300" />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-300" />

                  {/* Header Badge on Bounding Box */}
                  {showLabels && (
                    <div
                      className={`absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-md transition-all ${
                        active
                          ? 'bg-cyan-500 text-slate-950 scale-105 z-30'
                          : 'bg-slate-900/90 text-white border border-slate-700/80'
                      }`}
                    >
                      {/* Color indicator pip */}
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: v.exteriorColor.hexEstimate || '#94A3B8' }}
                      />
                      <span className="font-bold">
                        {v.make !== 'Unknown' ? `${v.make} ${v.model}` : 'Unidentified Vehicle'}
                      </span>
                      <span className="font-mono text-[10px] opacity-80">
                        {confidencePercent}%
                      </span>
                      {!v.isIdentifiedConfidently && (
                        <ShieldAlert className="w-3 h-3 text-amber-300 shrink-0" />
                      )}
                    </div>
                  )}

                  {/* Detection Index Tag */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 font-mono text-[9px] text-white/80 pointer-events-none">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick vehicle selector pills below the canvas */}
      {vehicles.length > 1 && (
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">Select Car:</span>
          {vehicles.map((v, idx) => {
            const isSelected = selectedVehicleId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full border border-black/30"
                  style={{ backgroundColor: v.exteriorColor.hexEstimate || '#94A3B8' }}
                />
                <span>
                  #{idx + 1} {v.make !== 'Unknown' ? `${v.make} ${v.model}` : 'Vehicle'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
