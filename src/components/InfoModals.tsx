import React from 'react';
import { X, CheckCircle2, ShieldCheck, Cpu, Eye, Palette, AlertTriangle, Layers } from 'lucide-react';

interface InfoModalsProps {
  isOpen: boolean;
  type: 'how-it-works' | 'about';
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-left text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {type === 'how-it-works' ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Cpu className="w-4 h-4" />
              <span>Multi-Stage AI Vision Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
              How AutoVision AI Recognizes Vehicles
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              Our recognition pipeline separates vehicle detection, localized coordinate extraction, fine-grained make/model identification, and paint analysis into verifiable stages.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    STAGE 01
                  </span>
                  <span>Vehicle Detection & 2D Bounding Boxes</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-1">
                  The vision model scans the whole scene to identify all passenger cars, SUVs, sedans, hatchbacks, and MUVs, producing normalized coordinates [ymin, xmin, ymax, xmax] on a 0–1000 scale.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-blue-300 font-bold mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                    STAGE 02
                  </span>
                  <span>Fine-Grained Make & Model Classification</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-1">
                  Specialized visual cues—including radiator grille motifs, LED DRL light signatures, badging, wheel geometry, and greenhouse contours—are classified to determine manufacturer, model, and generation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-indigo-300 font-bold mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                    STAGE 03
                  </span>
                  <span>Specular-Filtered Exterior Paint Estimation</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-1">
                  The model isolates body panels (hood, doors, fenders) while algorithmically filtering out road reflections, tinted glass, shadows, and plastic claddings to determine paint name, finish, and hexadecimal swatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    STAGE 04
                  </span>
                  <span>Honest Uncertainty & Alternative Ranking</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-1">
                  When a vehicle is obscured, distant, or backlit, AutoVision flags an honest uncertainty notice and ranks plausible alternative models rather than hallucinating false certainty.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy & Architecture Specifications</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
              Privacy, Security & Capabilities
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="font-bold text-white mb-1">Zero Image Retention</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Uploaded photographs and camera snapshots are transmitted securely via in-memory base64 payloads to the server-side AI vision engine. No user images or private metadata are stored in persistent databases.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="font-bold text-white mb-1">Indian & Global Vehicle Coverage</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Trained to identify popular Indian automotive manufacturers including Maruti Suzuki, Tata Motors, Mahindra, Hyundai India, Toyota Bharat, Kia India, Honda, and Skoda/Volkswagen, alongside global luxury brands (BMW, Mercedes-Benz, Audi).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="font-bold text-white mb-1">Server-Side API Security</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  All computer vision inference is executed on secure backend routes with strict payload limits (20MB) and MIME-type validation. Secret API keys are never exposed to browser clients.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="font-bold text-white mb-1">AI Output Disclaimer</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Predictions represent AI vision estimates based on visible external styling cues. Extremely modified cars, heavy disguise wraps, or severe occlusions may reduce identification accuracy.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
