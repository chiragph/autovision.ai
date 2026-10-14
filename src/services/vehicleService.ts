import { DetectedVehicle, VehicleAnalysisResult } from '../types/vehicle';
import { cropVehicleFromImage } from './imageCropper';

export interface AnalyzeOptions {
  minConfidence?: number;
  onProgress?: (stage: string) => void;
}

export async function analyzeVehicleImage(
  imageDataUrl: string,
  options: AnalyzeOptions = {}
): Promise<VehicleAnalysisResult> {
  const { minConfidence = 0.3, onProgress } = options;

  onProgress?.('Sending image to AI Vision engine...');

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageDataUrl,
      minConfidence,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Server responded with HTTP error status ${response.status}`
    );
  }

  const result: VehicleAnalysisResult = await response.json();

  if (!result.hasVehicles || !result.vehicles || result.vehicles.length === 0) {
    return result;
  }

  onProgress?.('Extracting vehicle crops and visual metrics...');

  // Enrich each vehicle with a client-side cropped preview
  const enrichedVehicles: DetectedVehicle[] = await Promise.all(
    result.vehicles.map(async (vehicle) => {
      try {
        const cropData = await cropVehicleFromImage(imageDataUrl, vehicle.box2d);
        return {
          ...vehicle,
          croppedImageDataUrl: cropData || undefined,
        };
      } catch (e) {
        console.warn(`Could not crop vehicle ${vehicle.id}:`, e);
        return vehicle;
      }
    })
  );

  return {
    ...result,
    vehicles: enrichedVehicles,
  };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a JPG, JPEG, PNG, or WebP image.',
    };
  }

  const maxSizeInBytes = 20 * 1024 * 1024; // 20 MB
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed file size is 20MB.`,
    };
  }

  return { valid: true };
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
