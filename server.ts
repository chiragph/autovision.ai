import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

let gemini38CooldownUntil = 0;

const vehicleDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    vehiclesDetectedCount: {
      type: Type.INTEGER,
      description: 'Total number of motor vehicles (cars, SUVs, sedans, hatchbacks, trucks, vans) detected',
    },
    hasVehicles: {
      type: Type.BOOLEAN,
      description: 'Whether any vehicles are found in the image',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise summary of vehicle detection and identification in the image',
    },
    vehicles: {
      type: Type.ARRAY,
      description: 'List of detected vehicles with bounding boxes and classification',
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'Unique vehicle ID e.g. vehicle-1',
          },
          box2d: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: 'Normalized bounding box coordinates [ymin, xmin, ymax, xmax] from 0 to 1000',
          },
          detectionConfidence: {
            type: Type.NUMBER,
            description: 'Confidence in vehicle localization detection between 0.0 and 1.0',
          },
          make: {
            type: Type.STRING,
            description: 'Automobile manufacturer (e.g. Maruti Suzuki, Tata Motors, Hyundai, Mahindra, Toyota, Honda, Kia, BMW, Mercedes-Benz, Volkswagen, Audi, etc.) or "Unknown"',
          },
          model: {
            type: Type.STRING,
            description: 'Vehicle model (e.g. Creta, Nexon, Swift, Scorpio-N, Fortuner, Seltos, Thar, Baleno, Punch, City, Innova Hycross, 3 Series, C-Class, etc.) or "Unable to identify confidently"',
          },
          generationOrYear: {
            type: Type.STRING,
            description: 'Estimated model generation or year span if distinguishable, e.g. "2020–2024 Facelift" or "N/A"',
          },
          bodyType: {
            type: Type.STRING,
            description: 'Body classification: SUV, Compact SUV, Sedan, Hatchback, MUV/MPV, Coupe, Pickup, Van, Convertible, Other',
          },
          viewAngle: {
            type: Type.STRING,
            description: 'Camera view angle: Front 3/4, Rear 3/4, Front, Rear, Side Profile, Top-down',
          },
          identificationConfidence: {
            type: Type.NUMBER,
            description: 'Confidence score for make and model identification between 0.0 and 1.0',
          },
          isIdentifiedConfidently: {
            type: Type.BOOLEAN,
            description: 'True if make and model are identified with high certainty, false if obscured, generic, or uncertain',
          },
          uncertaintyReason: {
            type: Type.STRING,
            description: 'Honest explanation if identification is uncertain or low confidence (e.g. obscured emblem, extreme angle, heavy motion blur, generic silhouette)',
          },
          alternativeCandidates: {
            type: Type.ARRAY,
            description: 'Top plausible alternative makes and models if uncertainty exists',
            items: {
              type: Type.OBJECT,
              properties: {
                make: { type: Type.STRING },
                model: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['make', 'model', 'confidence'],
            },
          },
          exteriorColor: {
            type: Type.OBJECT,
            properties: {
              colorName: {
                type: Type.STRING,
                description: 'Dominant exterior body paint color: White, Black, Silver, Grey, Red, Blue, Green, Brown, Beige, Yellow, Orange, Dual-tone, or Other',
              },
              hexEstimate: {
                type: Type.STRING,
                description: 'Representative CSS 6-digit hex color swatch for the body paint, e.g. #FFFFFF, #B81D24, #1E3A8A',
              },
              finish: {
                type: Type.STRING,
                description: 'Paint finish: Metallic, Pearl, Glossy, Matte, Dual-tone with black roof',
              },
              colorConfidence: {
                type: Type.NUMBER,
                description: 'Confidence in exterior body color estimation between 0.0 and 1.0',
              },
              colorNotes: {
                type: Type.STRING,
                description: 'Notes on paintwork assessment, filtering out road reflections, tinted glass, shadows, and plastic claddings',
              },
            },
            required: ['colorName', 'hexEstimate', 'colorConfidence'],
          },
          distinctiveFeatures: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 4 distinctive visual cues: headlight/DRL styling, grille pattern, badging, wheel design, body creases, roof rails',
          },
        },
        required: [
          'id',
          'box2d',
          'detectionConfidence',
          'make',
          'model',
          'bodyType',
          'identificationConfidence',
          'isIdentifiedConfidently',
          'exteriorColor',
        ],
      },
    },
  },
  required: ['vehiclesDetectedCount', 'hasVehicles', 'summary', 'vehicles'],
};

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Increase payload limit for base64 car photos
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'AutoVision AI',
      timestamp: new Date().toISOString(),
      apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Vehicle Analysis Endpoint
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          error: 'Gemini API key is not configured on the server. Please check your environment configuration.',
        });
      }

      const { image, mimeType = 'image/jpeg', minConfidence = 0.3 } = req.body;

      if (!image || typeof image !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing required "image" data (must be a base64 string or data URL).',
        });
      }

      // Extract raw base64 data if prefixed with data:image/...;base64,
      let base64Data = image;
      let detectedMimeType = mimeType;

      const dataUrlMatch = image.match(/^data:([^;]+);base64,(.+)$/);
      if (dataUrlMatch) {
        detectedMimeType = dataUrlMatch[1];
        base64Data = dataUrlMatch[2];
      }

      // Check allowed image MIME types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(detectedMimeType.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Unsupported image format (${detectedMimeType}). Supported formats are JPG, PNG, and WebP.`,
        });
      }

      // Validate base64 buffer size
      const imageBuffer = Buffer.from(base64Data, 'base64');
      if (imageBuffer.length > 20 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: 'Image file size exceeds the 20MB limit. Please provide a smaller image.',
        });
      }

      if (imageBuffer.length < 500) {
        return res.status(400).json({
          success: false,
          error: 'The image payload is invalid or corrupted.',
        });
      }

      const prompt = `You are AutoVision AI, an advanced automotive computer vision and fine-grained vehicle recognition engine.
Analyze this image thoroughly to detect all motor vehicles (passenger cars, SUVs, sedans, hatchbacks, MUVs/MPVs, pickup trucks, vans, crossovers).

TASKS:
1. DETECT & LOCATE:
   - For every vehicle in the image, determine its 2D bounding box as [ymin, xmin, ymax, xmax] on a normalized integer scale of 0 to 1000.
   - Assign a detectionConfidence (0.0 to 1.0).
   - If there are multiple vehicles, detect and localize each vehicle separately.

2. FINE-GRAINED MAKE & MODEL RECOGNITION:
   - Identify the vehicle manufacturer (make) with high precision (e.g. Maruti Suzuki, Tata Motors, Hyundai, Mahindra, Toyota, Honda, Kia, BMW, Mercedes-Benz, Volkswagen, Audi, Skoda, MG, Nissan, Renault, Ford, etc.).
   - Identify the specific model name (e.g. Creta, Nexon, Swift, Scorpio-N, Fortuner, Seltos, Thar, Punch, Baleno, Grand Vitara, City, Innova Hycross, XUV700, 3 Series, C-Class, etc.).
   - Pay special attention to Indian automotive market models as well as global vehicles.
   - Estimate generation or facelift year span if visible cues support it.
   - If vehicle badge or styling is partially hidden or ambiguous, set isIdentifiedConfidently = false, provide an uncertaintyReason, and list 2-3 plausible alternativeCandidates with respective confidence scores.
   - If the vehicle is completely unrecognizable (e.g. heavily blocked or distant silhouette), set make to "Unknown" and model to "Unable to identify confidently". NEVER fabricate fake vehicle identities.

3. EXTERIOR COLOUR ANALYSIS:
   - Analyze the exterior painted body panels (doors, hood, quarter panels, front bumper), strictly ignoring road asphalt, glass windows, black plastic claddings/fenders, tires, and reflections of the sky or streetlights.
   - Categorize colorName into: White, Black, Silver, Grey, Red, Blue, Green, Brown, Beige, Yellow, Orange, Dual-tone, or Other.
   - Provide a representative 6-digit hex code for a visual color swatch (e.g. #FFFFFF, #1F2937, #B81D24, #1E40AF, #94A3B8).
   - Estimate paint finish (Metallic, Pearl, Glossy, Matte, Dual-tone).
   - Provide colorConfidence and brief notes accounting for lighting or shadows.

4. VISUAL FEATURES & BODY TYPE:
   - Identify body type (SUV, Compact SUV, Sedan, Hatchback, MUV/MPV, Coupe, Pickup, Van).
   - Note view angle (Front 3/4, Rear 3/4, Front, Rear, Side Profile).
   - Note 2-4 distinctive styling cues (e.g. DRL light bar, signature grille, split headlamps, floating roof design).

If NO motor vehicles are present in the image (e.g. only people, animals, buildings, or furniture), set hasVehicles = false, vehiclesDetectedCount = 0, vehicles = [], and provide a clear explanatory summary.`;

      let response;
      let modelUsed = 'gemini-3.8-flash';

      // Circuit-breaker: if gemini-3.8-flash had a 503 recently, try gemini-3.1-flash-lite first
      const is38CoolingDown = Date.now() < gemini38CooldownUntil;
      const modelsToTry = is38CoolingDown
        ? ['gemini-3.1-flash-lite', 'gemini-3.8-flash']
        : ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

      let lastError: unknown = null;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: detectedMimeType,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: vehicleDetectionSchema,
              temperature: 0.1,
            },
          });
          if (response && response.text) {
            modelUsed = modelName;
            break;
          }
        } catch (callErr: unknown) {
          lastError = callErr;
          const errMsg = (callErr as Error)?.message || '';
          if (modelName === 'gemini-3.8-flash' && (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE'))) {
            // Cool down gemini-3.8-flash for 60 seconds
            gemini38CooldownUntil = Date.now() + 60_000;
            console.log('Gemini 3.8 Flash is experiencing 503 high demand; activating 60s cooldown, falling back to gemini-3.1-flash-lite.');
          } else {
            console.warn(`Model ${modelName} error:`, errMsg.slice(0, 100));
          }
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('No response returned from AI vision models.');
      }

      const rawText = response.text?.trim() || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', rawText);
        return res.status(502).json({
          success: false,
          error: 'Failed to parse AI vision output from the engine.',
        });
      }

      // Filter vehicles based on minimum confidence threshold if requested
      const threshold = typeof minConfidence === 'number' ? minConfidence : 0.3;
      const filteredVehicles = Array.isArray(parsedData.vehicles)
        ? parsedData.vehicles.filter((v: { detectionConfidence?: number }) => (v.detectionConfidence ?? 1) >= threshold)
        : [];

      return res.json({
        success: true,
        modelUsed,
        vehiclesDetectedCount: filteredVehicles.length,
        hasVehicles: filteredVehicles.length > 0,
        summary: parsedData.summary || (filteredVehicles.length > 0 ? `Detected ${filteredVehicles.length} vehicle(s).` : 'No vehicles detected.'),
        vehicles: filteredVehicles,
        allVehiclesCount: parsedData.vehicles?.length || 0,
        processedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      console.error('Error during vehicle analysis:', err);
      let errorMessage = 'Unknown server error during vehicle analysis.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error?.message) {
            errorMessage = parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE'
              ? 'The AI vision service is currently experiencing high global demand. Please retry in a few moments.'
              : parsed.error.message;
          } else {
            errorMessage = err.message;
          }
        } catch {
          errorMessage = err.message;
        }
      }
      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // Serve static files in production or hook up Vite middlewares in development
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
        watch: isHmrDisabled ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoVision AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
