import React from 'react';
import { DetectedVehicle } from '../types/vehicle';
import {
  Car,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: DetectedVehicle;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  index,
  isSelected,
  onSelect,
}) => {
  const detectConfPercent = Math.round((vehicle.detectionConfidence || 0) * 100);
  const idConfPercent = Math.round((vehicle.identificationConfidence || 0) * 100);
  const colorConfPercent = Math.round((vehicle.exteriorColor?.colorConfidence || 0) * 100);

  const isLowConfidence = !vehicle.isIdentifiedConfidently || idConfPercent < 60;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl transition-all duration-200 cursor-pointer p-5 border text-left ${
        isSelected
          ? 'bg-slate-900 border-cyan-500/80 shadow-[0_0_24px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/30'
          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header with Index & Make/Model */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          {/* Unboxed clean metadata kicker */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span className="text-cyan-400 font-bold">Vehicle #{index + 1}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{vehicle.bodyType || 'Automobile'}</span>
            {vehicle.viewAngle && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{vehicle.viewAngle}</span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">
            {vehicle.make !== 'Unknown' ? vehicle.make : 'Unidentified Manufacturer'}
            <span className="text-cyan-300 ml-1.5 font-semibold">
              {vehicle.model !== 'Unable to identify confidently' ? vehicle.model : ''}
            </span>
          </h3>

          {vehicle.generationOrYear && vehicle.generationOrYear !== 'N/A' && (
            <p className="text-xs text-slate-400 mt-0.5">
              Generation / Span: <span className="text-slate-200 font-medium">{vehicle.generationOrYear}</span>
            </p>
          )}
        </div>

        {/* Identification Status Indicator */}
        <div className="shrink-0 flex flex-col items-end">
          {vehicle.isIdentifiedConfidently ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Match</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Uncertain Identity</span>
            </div>
          )}
          <span className="text-[11px] font-mono text-slate-400 mt-0.5">
            {idConfPercent}% Model Match
          </span>
        </div>
      </div>

      {/* Cropped Preview + Core Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
        {/* Cropped vehicle image if available */}
        {vehicle.croppedImageDataUrl && (
          <div className="sm:col-span-5 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 aspect-[16/10] sm:aspect-auto sm:h-36 flex items-center justify-center group">
            <img
              src={vehicle.croppedImageDataUrl}
              alt={`${vehicle.make} ${vehicle.model} crop`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-slate-300/90 bg-black/60 px-1.5 py-0.5 rounded">
              Cropped Region
            </span>
          </div>
        )}

        {/* Exterior Paint Spec Box */}
        <div className={`${vehicle.croppedImageDataUrl ? 'sm:col-span-7' : 'sm:col-span-12'} p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Exterior Colour
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {colorConfPercent}% confidence
            </span>
          </div>

          <div className="flex items-center gap-3 my-1">
            {/* Real color swatch circle with shadow */}
            <div
              className="w-8 h-8 rounded-lg border-2 border-slate-700 shadow-inner shrink-0"
              style={{ backgroundColor: vehicle.exteriorColor.hexEstimate || '#94A3B8' }}
              title={`Swatch: ${vehicle.exteriorColor.hexEstimate}`}
            />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{vehicle.exteriorColor.colorName}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  {vehicle.exteriorColor.hexEstimate}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {vehicle.exteriorColor.finish || 'Standard Paint'} Finish
              </p>
            </div>
          </div>

          {vehicle.exteriorColor.colorNotes && (
            <p className="text-[11px] text-slate-400/90 leading-tight border-t border-slate-800/60 pt-2 mt-2">
              {vehicle.exteriorColor.colorNotes}
            </p>
          )}
        </div>
      </div>

      {/* Confidence Metrics Bars */}
      <div className="space-y-2 mb-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Vehicle Detection Confidence</span>
            <span className="font-mono text-white font-medium">{detectConfPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${detectConfPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Make & Model Classification</span>
            <span className="font-mono text-white font-medium">{idConfPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                idConfPercent >= 75 ? 'bg-cyan-400' : idConfPercent >= 50 ? 'bg-amber-400' : 'bg-rose-400'
              }`}
              style={{ width: `${idConfPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Distinctive Features */}
      {vehicle.distinctiveFeatures && vehicle.distinctiveFeatures.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Distinctive Visual Cues</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc marker:text-cyan-400">
            {vehicle.distinctiveFeatures.map((feat, idx) => (
              <li key={idx} className="leading-relaxed">
                {feat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uncertainty Notice / Alternative Candidates */}
      {isLowConfidence && (
        <div className="mt-3 p-3 rounded-xl bg-amber-950/25 border border-amber-800/40 text-xs">
          <div className="flex items-start gap-2 text-amber-300 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>Identification Notice</span>
          </div>
          <p className="text-amber-200/80 leading-relaxed text-[11px] mb-2">
            {vehicle.uncertaintyReason ||
              'Confidence is reduced due to lighting reflections, viewing angle, or obscured badging. Multiple candidate vehicles match this profile.'}
          </p>

          {/* Alternative Candidates */}
          {vehicle.alternativeCandidates && vehicle.alternativeCandidates.length > 0 && (
            <div className="border-t border-amber-800/30 pt-2 mt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400/90 block mb-1">
                Plausible Alternatives:
              </span>
              <div className="space-y-1">
                {vehicle.alternativeCandidates.map((alt, altIdx) => (
                  <div
                    key={altIdx}
                    className="flex items-center justify-between text-[11px] text-slate-300"
                  >
                    <span>{alt.make} {alt.model}</span>
                    <span className="font-mono text-amber-300">
                      {Math.round(alt.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
