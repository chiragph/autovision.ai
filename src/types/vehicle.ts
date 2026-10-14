export interface VehicleBoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface ExteriorColorInfo {
  colorName: string;
  hexEstimate: string;
  finish?: string;
  colorConfidence: number;
  colorNotes?: string;
}

export interface AlternativeCandidate {
  make: string;
  model: string;
  confidence: number;
}

export interface DetectedVehicle {
  id: string;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  detectionConfidence: number;
  make: string;
  model: string;
  generationOrYear?: string;
  bodyType: string;
  viewAngle?: string;
  identificationConfidence: number;
  isIdentifiedConfidently: boolean;
  uncertaintyReason?: string;
  alternativeCandidates?: AlternativeCandidate[];
  exteriorColor: ExteriorColorInfo;
  distinctiveFeatures?: string[];
  croppedImageDataUrl?: string;
}

export interface VehicleAnalysisResult {
  vehiclesDetectedCount: number;
  hasVehicles: boolean;
  summary: string;
  vehicles: DetectedVehicle[];
  processedAt: string;
  imageDimensions?: { width: number; height: number };
  modelUsed?: string;
}
