import React, { useState } from 'react';
import { VehicleAnalysisResult } from '../types/vehicle';
import { InteractiveCanvas } from './InteractiveCanvas';
import { VehicleCard } from './VehicleCard';
import {
  Download,
  RotateCcw,
  Sliders,
  AlertCircle,
  FileJson,
  Check,
  Share2,
} from 'lucide-react';

interface ResultsDashboardProps {
  result: VehicleAnalysisResult;
  imageUrl: string;
  onReset: () => void;
  onChangeImage: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  imageUrl,
  onReset,
  onChangeImage,
}) => {
  const [minConfidence, setMinConfidence] = useState<number>(0.3);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    result.vehicles.length > 0 ? result.vehicles[0].id : null
  );
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Filter vehicles according to the configurable threshold
  const displayedVehicles = result.vehicles.filter(
    (v) => (v.detectionConfidence ?? 1) >= minConfidence
  );

  // Download results as JSON file
  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autovision-analysis-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Action & Summary Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">Analysis Complete</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{new Date(result.processedAt).toLocaleTimeString()}</span>
            {result.modelUsed && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-cyan-300 font-mono text-[11px]">{result.modelUsed}</span>
              </>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {result.hasVehicles && displayedVehicles.length > 0
              ? `Identified ${displayedVehicles.length} Vehicle${displayedVehicles.length === 1 ? '' : 's'}`
              : 'No Motor Vehicles Detected'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {result.summary}
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onChangeImage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <span>Change Image</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Analyse Another</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copy Results JSON to Clipboard"
          >
            {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <FileJson className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Threshold Filter Bar */}
      {result.vehicles.length > 0 && (
        <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Detection Confidence Filter:</span>
            <span className="font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              ≥ {Math.round(minConfidence * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-[11px] text-slate-500 font-mono">30%</span>
            <input
              type="range"
              min="0.3"
              max="0.9"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-[11px] text-slate-500 font-mono">90%</span>
          </div>
        </div>
      )}

      {/* When no vehicles are found */}
      {(!result.hasVehicles || displayedVehicles.length === 0) && (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {result.vehicles.length > 0
              ? 'No Vehicles Match Current Filter'
              : 'No Motor Vehicles Detected'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {result.vehicles.length > 0
              ? 'Try lowering the detection confidence threshold slider above to view lower-confidence detections.'
              : 'Our computer vision pipeline did not locate identifiable passenger cars or motor vehicles in this image. Please upload a clear photo focusing on an automobile.'}
          </p>
          <div className="flex gap-3">
            {result.vehicles.length > 0 ? (
              <button
                onClick={() => setMinConfidence(0.3)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Reset Threshold to 30%
              </button>
            ) : (
              <button
                onClick={onChangeImage}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 transition-opacity"
              >
                Upload Another Photo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Results Grid: Left Overlay, Right Cards */}
      {displayedVehicles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Canvas */}
          <div className="lg:col-span-7 xl:col-span-7 sticky top-20">
            <InteractiveCanvas
              imageUrl={imageUrl}
              vehicles={displayedVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
              minConfidence={minConfidence}
            />
          </div>

          {/* Right Column: Vehicle Cards List */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Vehicle Breakdown ({displayedVehicles.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Click box or card to inspect
              </span>
            </div>

            <div className="space-y-4">
              {displayedVehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id || index}
                  vehicle={vehicle}
                  index={index}
                  isSelected={selectedVehicleId === vehicle.id}
                  onSelect={() => setSelectedVehicleId(vehicle.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
